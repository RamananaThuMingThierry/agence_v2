<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\PlatformBookingCreatedMail;
use App\Models\Booking;
use App\Models\PlatformSetting;
use App\Models\Tour;
use App\Services\ActivityLogService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Throwable;

class BookingController extends Controller
{
    public function __construct(private ActivityLogService $activityLogService) {}

    public function publicStore(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'tour_id' => ['required', 'integer', 'exists:tours,id'],
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:255'],
            'message' => ['nullable', 'string'],
            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date', 'after_or_equal:start_date'],
            'number_of_people' => ['required', 'integer', 'min:1'],
        ]);

        $tour = Tour::query()->where('status', 'active')->find($validated['tour_id']);

        if (!$tour) {
            return response()->json(['message' => 'Tour introuvable ou indisponible.'], 404);
        }

        $booking = Booking::query()->create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? null,
            'tour_id' => $tour->id,
            'message' => $validated['message'] ?? null,
            'start_date' => $validated['start_date'],
            'end_date' => $validated['end_date'],
            'number_of_people' => $validated['number_of_people'],
            'total_amount' => (float) $tour->price * (int) $validated['number_of_people'],
            'status' => 'booked',
        ])->fresh(['tour']);

        $platformSetting = PlatformSetting::query()->first();
        $notifications = [
            'email_sent' => false,
            'email_target' => $platformSetting?->email,
            'whatsapp_ready' => false,
            'whatsapp_target' => $platformSetting?->contact,
        ];

        try {
            if ($platformSetting?->email) {
                Mail::to($platformSetting->email)->send(new PlatformBookingCreatedMail($booking, $platformSetting));
                $notifications['email_sent'] = true;
            }
        } catch (Throwable $e) {
            $this->activityLogService->logError(
                $request,
                'public_booking_email_notification_error',
                'Failed to send booking email notification: ' . $e->getMessage(),
                $e,
                null,
                Booking::class,
                $booking->id,
                500,
                ['booking_email' => $booking->email]
            );
        }

        $whatsappUrl = $this->buildWhatsAppUrl($booking, $platformSetting);
        $notifications['whatsapp_ready'] = $whatsappUrl !== null;

        $this->activityLogService->logInfo(
            $request,
            'public_booking_created',
            'Public booking created successfully.',
            null,
            Booking::class,
            $booking->id,
            201,
            [
                'tour_id' => $tour->id,
                'client_email' => $booking->email,
                'email_sent' => $notifications['email_sent'],
                'whatsapp_ready' => $notifications['whatsapp_ready'],
            ]
        );

        return response()->json([
            'data' => $booking,
            'message' => 'Reservation envoyee avec succes.',
            'notifications' => $notifications,
            'whatsapp_url' => $whatsappUrl,
        ], 201);
    }

    public function index(Request $request): JsonResponse
    {
        try {
            $bookings = Booking::query()
                ->with(['tour', 'payments.paymentMethod'])
                ->orderByDesc('created_at')
                ->get();

            return response()->json([
                'data' => $bookings,
            ]);
        } catch (Throwable) {
            return response()->json(['message' => 'Impossible de charger les bookings.'], 500);
        }
    }

    public function show(string $encryptedId): JsonResponse
    {
        $id = decrypt_to_int_or_null($encryptedId);

        if (is_null($id)) {
            return response()->json(['message' => 'ID du booking invalide.'], 400);
        }

        $booking = Booking::query()
            ->with(['tour', 'payments.paymentMethod'])
            ->find($id);

        if (!$booking) {
            return response()->json(['message' => 'Booking introuvable.'], 404);
        }

        return response()->json([
            'data' => $booking,
        ]);
    }

    public function update(Request $request, string $encryptedId): JsonResponse
    {
        $id = decrypt_to_int_or_null($encryptedId);

        if (is_null($id)) {
            return response()->json(['message' => 'ID du booking invalide.'], 400);
        }

        $booking = Booking::query()->find($id);

        if (!$booking) {
            return response()->json(['message' => 'Booking introuvable.'], 404);
        }

        $validated = $request->validate([
            'status' => ['sometimes', 'required', 'in:booked,cancelled,completed'],
            'total_amount' => ['sometimes', 'nullable', 'numeric', 'min:0'],
            'start_date' => ['sometimes', 'required', 'date'],
            'end_date' => ['sometimes', 'required', 'date'],
            'number_of_people' => ['sometimes', 'required', 'integer', 'min:1'],
            'message' => ['sometimes', 'nullable', 'string'],
        ]);

        $booking->update($validated);

        return response()->json([
            'data' => $booking->fresh(['tour', 'payments.paymentMethod']),
        ]);
    }

    public function destroy(string $encryptedId): JsonResponse
    {
        $id = decrypt_to_int_or_null($encryptedId);

        if (is_null($id)) {
            return response()->json(['message' => 'ID du booking invalide.'], 400);
        }

        $booking = Booking::query()->find($id);

        if (!$booking) {
            return response()->json(['message' => 'Booking introuvable.'], 404);
        }

        $booking->delete();

        return response()->json([
            'message' => 'Booking supprime avec succes.',
        ]);
    }

    private function buildWhatsAppUrl(Booking $booking, ?PlatformSetting $platformSetting): ?string
    {
        $phone = preg_replace('/\D+/', '', (string) $platformSetting?->contact);

        if (!$phone) {
            return null;
        }

        $message = implode("\n", [
            'Nouvelle reservation recue',
            'Plateforme: ' . ($platformSetting?->platform_name ?: config('app.name')),
            'Client: ' . $booking->name,
            'Email: ' . $booking->email,
            'Telephone: ' . ($booking->phone ?: '-'),
            'Circuit: ' . ($booking->tour?->title ?: '-'),
            'Date de depart: ' . optional($booking->start_date)->format('d/m/Y'),
            'Date de retour: ' . optional($booking->end_date)->format('d/m/Y'),
            'Nombre de personnes: ' . $booking->number_of_people,
            'Montant estime: ' . number_format((float) $booking->total_amount, 2, ',', ' ') . ' EUR',
            'Message: ' . ($booking->message ?: '-'),
        ]);

        return 'https://wa.me/' . $phone . '?text=' . rawurlencode($message);
    }
}
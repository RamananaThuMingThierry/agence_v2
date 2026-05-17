<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Throwable;

class BookingController extends Controller
{
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
}

<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\BookingPayment;
use App\Models\PaymentMethod;
use App\Services\ActivityLogService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BookingPaymentController extends Controller
{
    public function __construct(private ActivityLogService $activityLogService) {}

    public function store(Request $request, string $encryptedBookingId): JsonResponse
    {
        $booking = $this->resolveBooking($encryptedBookingId);

        if (!$booking) {
            return response()->json(['message' => 'Booking introuvable.'], 404);
        }

        $validated = $this->validatePayload($request);
        $paymentMethod = PaymentMethod::query()->find($validated['payment_method_id']);

        if (!$paymentMethod || !$paymentMethod->is_active) {
            return response()->json(['message' => 'Methode de paiement indisponible.'], 422);
        }

        $payment = $booking->payments()->create($this->buildPaymentAttributes($validated));

        $this->activityLogService->logInfo(
            $request,
            'booking_payment_create',
            'Booking payment created successfully.',
            $request->user(),
            BookingPayment::class,
            $payment->id,
            201,
            ['booking_id' => $booking->id, 'payment_method_id' => $paymentMethod->id]
        );

        return response()->json([
            'data' => $booking->fresh(['tour', 'payments.paymentMethod']),
            'message' => 'Paiement ajoute avec succes.',
        ], 201);
    }

    public function update(Request $request, string $encryptedBookingId, string $encryptedPaymentId): JsonResponse
    {
        $booking = $this->resolveBooking($encryptedBookingId);

        if (!$booking) {
            return response()->json(['message' => 'Booking introuvable.'], 404);
        }

        $payment = $this->resolvePayment($booking, $encryptedPaymentId);

        if (!$payment) {
            return response()->json(['message' => 'Paiement introuvable.'], 404);
        }

        $validated = $this->validatePayload($request);
        $paymentMethod = PaymentMethod::query()->find($validated['payment_method_id']);

        if (!$paymentMethod || !$paymentMethod->is_active) {
            return response()->json(['message' => 'Methode de paiement indisponible.'], 422);
        }

        $payment->update($this->buildPaymentAttributes($validated));

        $this->activityLogService->logInfo(
            $request,
            'booking_payment_update',
            'Booking payment updated successfully.',
            $request->user(),
            BookingPayment::class,
            $payment->id,
            200,
            ['booking_id' => $booking->id, 'payment_method_id' => $paymentMethod->id]
        );

        return response()->json([
            'data' => $booking->fresh(['tour', 'payments.paymentMethod']),
            'message' => 'Paiement mis a jour avec succes.',
        ]);
    }

    public function destroy(Request $request, string $encryptedBookingId, string $encryptedPaymentId): JsonResponse
    {
        $booking = $this->resolveBooking($encryptedBookingId);

        if (!$booking) {
            return response()->json(['message' => 'Booking introuvable.'], 404);
        }

        $payment = $this->resolvePayment($booking, $encryptedPaymentId);

        if (!$payment) {
            return response()->json(['message' => 'Paiement introuvable.'], 404);
        }

        $paymentId = $payment->id;
        $payment->delete();

        $this->activityLogService->logWarning(
            $request,
            'booking_payment_delete',
            'Booking payment deleted successfully.',
            $request->user(),
            BookingPayment::class,
            $paymentId,
            200,
            ['booking_id' => $booking->id]
        );

        return response()->json([
            'data' => $booking->fresh(['tour', 'payments.paymentMethod']),
            'message' => 'Paiement supprime avec succes.',
        ]);
    }

    private function resolveBooking(string $encryptedBookingId): ?Booking
    {
        $bookingId = decrypt_to_int_or_null($encryptedBookingId);

        if (is_null($bookingId)) {
            return null;
        }

        return Booking::query()->find($bookingId);
    }

    private function resolvePayment(Booking $booking, string $encryptedPaymentId): ?BookingPayment
    {
        $paymentId = decrypt_to_int_or_null($encryptedPaymentId);

        if (is_null($paymentId)) {
            return null;
        }

        return $booking->payments()->find($paymentId);
    }

    private function validatePayload(Request $request): array
    {
        return $request->validate([
            'payment_method_id' => ['required', 'integer', 'exists:payment_methods,id'],
            'amount' => ['required', 'numeric', 'min:0'],
            'payment_type' => ['required', 'in:deposit,installment,balance,adjustment'],
            'status' => ['required', 'in:pending,completed,failed'],
            'due_date' => ['nullable', 'date'],
            'paid_at' => ['nullable', 'date'],
            'reference' => ['nullable', 'string', 'max:255'],
            'note' => ['nullable', 'string'],
            'sort_order' => ['nullable', 'integer', 'min:1'],
        ]);
    }

    private function buildPaymentAttributes(array $validated): array
    {
        $status = $validated['status'];
        $paidAt = $validated['paid_at'] ?? null;

        if ($status === 'completed' && !$paidAt) {
            $paidAt = now();
        }

        if ($status !== 'completed') {
            $paidAt = null;
        }

        return [
            'payment_method_id' => $validated['payment_method_id'],
            'amount' => $validated['amount'],
            'payment_type' => $validated['payment_type'],
            'status' => $status,
            'due_date' => $validated['due_date'] ?? null,
            'paid_at' => $paidAt,
            'reference' => $validated['reference'] ?? null,
            'note' => $validated['note'] ?? null,
            'sort_order' => $validated['sort_order'] ?? 1,
        ];
    }
}

<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PaymentMethod;
use App\Traits\HasFileUpload;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Throwable;

class PaymentMethodController extends Controller
{
    use HasFileUpload;

    public function index(Request $request): JsonResponse
    {
        try {
            $paymentMethods = PaymentMethod::query()
                ->orderBy('name')
                ->orderByDesc('id')
                ->get();

            return response()->json([
                'data' => $paymentMethods,
            ]);
        } catch (Throwable) {
            return response()->json(['message' => 'Impossible de charger les methodes de paiement.'], 500);
        }
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'code' => ['required', 'string', 'max:255', 'unique:payment_methods,code'],
            'image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:4096'],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        if ($request->hasFile('image')) {
            $validated['image'] = $this->uploadFile($request, 'image', 'uploads/payment-methods');
        }

        $paymentMethod = PaymentMethod::query()->create([
            'name' => $validated['name'],
            'code' => $validated['code'],
            'image' => $validated['image'] ?? null,
            'is_active' => $validated['is_active'] ?? true,
        ]);

        return response()->json([
            'data' => $paymentMethod,
        ], 201);
    }

    public function update(Request $request, string $encryptedId): JsonResponse
    {
        $id = decrypt_to_int_or_null($encryptedId);

        if (is_null($id)) {
            return response()->json(['message' => 'ID de methode de paiement invalide.'], 400);
        }

        $paymentMethod = PaymentMethod::query()->find($id);

        if (!$paymentMethod) {
            return response()->json(['message' => 'Methode de paiement introuvable.'], 404);
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'code' => ['required', 'string', 'max:255', 'unique:payment_methods,code,' . $paymentMethod->id],
            'image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:4096'],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        if ($request->hasFile('image')) {
            $validated['image'] = $this->uploadFile($request, 'image', 'uploads/payment-methods', $paymentMethod->image);
        }

        $paymentMethod->update([
            'name' => $validated['name'],
            'code' => $validated['code'],
            'image' => $validated['image'] ?? $paymentMethod->image,
            'is_active' => $validated['is_active'] ?? $paymentMethod->is_active,
        ]);

        return response()->json([
            'data' => $paymentMethod->fresh(),
        ]);
    }

    public function destroy(string $encryptedId): JsonResponse
    {
        $id = decrypt_to_int_or_null($encryptedId);

        if (is_null($id)) {
            return response()->json(['message' => 'ID de methode de paiement invalide.'], 400);
        }

        $paymentMethod = PaymentMethod::query()->find($id);

        if (!$paymentMethod) {
            return response()->json(['message' => 'Methode de paiement introuvable.'], 404);
        }

        $this->deleteFile($paymentMethod->image, 'uploads/payment-methods');
        $paymentMethod->delete();

        return response()->json(['message' => 'Methode de paiement supprimee avec succes.']);
    }
}

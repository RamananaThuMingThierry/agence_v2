<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ContactForm;
use Illuminate\Http\JsonResponse;

class ContactFormController extends Controller
{
    public function index(): JsonResponse
    {
        $contactForms = ContactForm::query()
            ->latest('id')
            ->get();

        return response()->json([
            'data' => $contactForms,
        ]);
    }

    public function show(string $encryptedId): JsonResponse
    {
        $id = decrypt_to_int_or_null($encryptedId);

        if (is_null($id)) {
            return response()->json(['message' => 'ID du formulaire de contact invalide.'], 400);
        }

        $contactForm = ContactForm::query()->find($id);

        if (!$contactForm) {
            return response()->json(['message' => 'Formulaire de contact introuvable.'], 404);
        }

        return response()->json([
            'data' => $contactForm,
        ]);
    }

    public function destroy(string $encryptedId): JsonResponse
    {
        $id = decrypt_to_int_or_null($encryptedId);

        if (is_null($id)) {
            return response()->json(['message' => 'ID du formulaire de contact invalide.'], 400);
        }

        $contactForm = ContactForm::query()->find($id);

        if (!$contactForm) {
            return response()->json(['message' => 'Formulaire de contact introuvable.'], 404);
        }

        $contactForm->delete();

        return response()->json([
            'message' => 'Formulaire de contact supprime avec succes.',
        ]);
    }
}

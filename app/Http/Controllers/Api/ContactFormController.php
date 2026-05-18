<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\PlatformContactFormCreatedMail;
use App\Models\ContactForm;
use App\Models\PlatformSetting;
use App\Services\ActivityLogService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Throwable;

class ContactFormController extends Controller
{
    public function __construct(private ActivityLogService $activityLogService) {}

    public function publicStore(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'subject' => ['nullable', 'string', 'max:255'],
            'email' => ['required', 'string', 'max:255'],
            'message' => ['required', 'string'],
        ]);

        $contactForm = ContactForm::query()->create([
            'name' => $validated['name'],
            'subject' => $validated['subject'] ?? null,
            'email' => $validated['email'],
            'message' => $validated['message'],
        ]);

        $platformSetting = PlatformSetting::query()->first();
        $notifications = [
            'email_sent' => false,
            'email_target' => $platformSetting?->email,
            'whatsapp_ready' => false,
            'whatsapp_target' => $platformSetting?->contact,
        ];

        try {
            if ($platformSetting?->email) {
                Mail::to($platformSetting->email)->send(new PlatformContactFormCreatedMail($contactForm, $platformSetting));
                $notifications['email_sent'] = true;
            }
        } catch (Throwable $e) {
            $this->activityLogService->logError(
                $request,
                'public_contact_form_email_notification_error',
                'Failed to send contact form email notification: ' . $e->getMessage(),
                $e,
                null,
                ContactForm::class,
                $contactForm->id,
                500,
                ['contact_form_email' => $contactForm->email]
            );
        }

        $whatsappUrl = $this->buildWhatsAppUrl($contactForm, $platformSetting);
        $notifications['whatsapp_ready'] = $whatsappUrl !== null;

        $this->activityLogService->logInfo(
            $request,
            'public_contact_form_created',
            'Public contact form created successfully.',
            null,
            ContactForm::class,
            $contactForm->id,
            201,
            [
                'client_email' => $contactForm->email,
                'email_sent' => $notifications['email_sent'],
                'whatsapp_ready' => $notifications['whatsapp_ready'],
            ]
        );

        return response()->json([
            'data' => $contactForm,
            'message' => 'Demande envoyee avec succes.',
            'notifications' => $notifications,
            'whatsapp_url' => $whatsappUrl,
        ], 201);
    }

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

    private function buildWhatsAppUrl(ContactForm $contactForm, ?PlatformSetting $platformSetting): ?string
    {
        $phone = preg_replace('/\D+/', '', (string) $platformSetting?->contact);

        if (!$phone) {
            return null;
        }

        $message = implode("\n", [
            'Nouveau formulaire de contact recu',
            'Plateforme: ' . ($platformSetting?->platform_name ?: config('app.name')),
            'Client: ' . $contactForm->name,
            'Email / Contact: ' . $contactForm->email,
            'Sujet: ' . ($contactForm->subject ?: '-'),
            'Message: ' . ($contactForm->message ?: '-'),
        ]);

        return 'https://wa.me/' . $phone . '?text=' . rawurlencode($message);
    }
}

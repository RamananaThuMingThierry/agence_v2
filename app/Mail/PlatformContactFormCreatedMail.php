<?php

namespace App\Mail;

use App\Models\ContactForm;
use App\Models\PlatformSetting;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class PlatformContactFormCreatedMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public ContactForm $contactForm,
        public ?PlatformSetting $platformSetting = null
    ) {}

    public function build(): self
    {
        return $this
            ->subject('Nouvelle demande de contact - ' . ($this->contactForm->subject ?: 'Site public'))
            ->view('emails.contact-forms.platform-created');
    }
}

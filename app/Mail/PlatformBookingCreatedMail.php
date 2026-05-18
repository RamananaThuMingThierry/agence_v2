<?php

namespace App\Mail;

use App\Models\Booking;
use App\Models\PlatformSetting;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class PlatformBookingCreatedMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Booking $booking,
        public ?PlatformSetting $platformSetting = null
    ) {}

    public function build(): self
    {
        return $this
            ->subject('Nouvelle reservation - ' . ($this->booking->tour?->title ?: 'Circuit'))
            ->view('emails.bookings.platform-created');
    }
}
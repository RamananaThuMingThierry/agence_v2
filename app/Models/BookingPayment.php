<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Crypt;

class BookingPayment extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'booking_id',
        'payment_method_id',
        'amount',
        'payment_type',
        'status',
        'due_date',
        'paid_at',
        'reference',
        'note',
        'sort_order',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'due_date' => 'date',
        'paid_at' => 'datetime',
    ];

    protected $appends = [
        'encrypted_id',
    ];

    protected $hidden = [
        'id',
    ];

    protected function encryptedId(): Attribute
    {
        return Attribute::get(fn () => Crypt::encryptString((string) $this->id));
    }

    public function booking()
    {
        return $this->belongsTo(Booking::class);
    }

    public function paymentMethod()
    {
        return $this->belongsTo(PaymentMethod::class);
    }
}

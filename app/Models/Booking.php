<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Crypt;

class Booking extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'email',
        'phone',
        'image',
        'tour_id',
        'message',
        'start_date',
        'end_date',
        'number_of_people',
        'status',
        'total_amount',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'total_amount' => 'decimal:2',
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

    public function tour()
    {
        return $this->belongsTo(Tour::class);
    }

    public function payments()
    {
        return $this->hasMany(BookingPayment::class);
    }
}

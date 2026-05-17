<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Crypt;

class Testimonial extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'image',
        'message',
        'rating',
        'status',
    ];

    protected $casts = [
        'rating' => 'integer',
    ];

    protected $appends = [
        'encrypted_id',
    ];

    protected function encryptedId(): Attribute
    {
        return Attribute::get(fn () => Crypt::encryptString((string) $this->id));
    }
}

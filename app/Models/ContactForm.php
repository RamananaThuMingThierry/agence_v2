<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Crypt;

class ContactForm extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'subject',
        'email',
        'message',
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
}

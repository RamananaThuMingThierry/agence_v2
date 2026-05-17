<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Crypt;

class TourImage extends Model
{
    use HasFactory;

    protected $fillable = [
        'tour_id',
        'image_url',
        'is_cover',
        'caption',
    ];

    protected $casts = [
        'is_cover' => 'boolean',
    ];

    protected $appends = [
        'encrypted_id',
    ];

    public function tour(): BelongsTo
    {
        return $this->belongsTo(Tour::class);
    }

    protected function encryptedId(): Attribute
    {
        return Attribute::get(fn () => Crypt::encryptString((string) $this->id));
    }
}

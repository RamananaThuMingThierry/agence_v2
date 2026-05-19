<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Crypt;

class Tour extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'title',
        'description',
        'slug',
        'price',
        'duration',
        'category',
        'start_location',
        'end_location',
        'status',
    ];

    protected $casts = [
        'price' => 'decimal:2',
    ];

    protected $appends = [
        'encrypted_id',
    ];

    public function images(): HasMany
    {
        return $this->hasMany(TourImage::class)->orderByDesc('is_cover')->orderBy('id');
    }

    public function programs(): HasMany
    {
        return $this->hasMany(TourProgram::class)->orderBy('day_number')->orderBy('id');
    }

    public function inclusions(): HasMany
    {
        return $this->hasMany(TourInclusion::class)->orderBy('id');
    }

    public function exclusions(): HasMany
    {
        return $this->hasMany(TourExclusion::class)->orderBy('id');
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(TourReview::class)->orderByDesc('created_at')->orderByDesc('id');
    }

    public function videos(): HasMany
    {
        return $this->hasMany(PlatformVideo::class, 'tour_id')->orderBy('order')->orderByDesc('id');
    }

    protected function encryptedId(): Attribute
    {
        return Attribute::get(fn () => Crypt::encryptString((string) $this->id));
    }
}

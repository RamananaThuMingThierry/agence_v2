<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Crypt;

class Slide extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'slides';

    protected $fillable = [
        'title',
        'subtitle',
        'image',
        'description',
        'order',
    ];

    protected $dates = [
        'deleted_at',
    ];

    protected $casts = [
        'order' => 'integer',
        'deleted_at' => 'datetime',
    ];

    protected $appends = ['encrypted_id'];

    public function getEncryptedIdAttribute()
    {
        return Crypt::encryptString($this->id);
    }
}

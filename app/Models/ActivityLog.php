<?php

namespace App\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Crypt;

class ActivityLog extends Model
{
    use HasFactory;

    public $table = 'activity_logs';

    protected $fillable = [
        'user_id',
        'action',
        'color',
        'entity_type',
        'entity_id',
        'method',
        'route',
        'status_code',
        'message',
        'metadata',
    ];

    public $appends = ['encrypted_id'];

    protected $casts = [
        'metadata' => 'array',
    ];

    public function getEncryptedIdAttribute(): string
    {
        return Crypt::encryptString($this->id);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function entity()
    {
        return $this->morphTo(null, 'entity_type', 'entity_id');
    }
}

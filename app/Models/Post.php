<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Post extends Model
{
    use HasFactory, SoftDeletes; // 2. Tambahkan HasFactory di sini

    protected $guarded = ['id'];

    protected $casts = [
        'is_featured' => 'boolean',
        'published_at' => 'datetime',
        'scheduled_at' => 'datetime',
    ];

    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'author_id');
    }

    public function comments(): HasMany
    {
        return $this->hasMany(PostComment::class);
    }

    public function movie(): BelongsTo
    {
        return $this->belongsTo(Movie::class);
    }

    // Relasi many-to-many lewat tabel post_likes
    public function likes(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'post_likes')->withPivot('created_at');
    }

    // Relasi many-to-many lewat tabel post_saves
    public function savedBy(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'post_saves')->withPivot('created_at');
    }
}

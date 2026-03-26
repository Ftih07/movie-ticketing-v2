<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PostComment extends Model
{
    use SoftDeletes;

    protected $guarded = ['id'];

    protected $casts = [
        'is_approved' => 'boolean',
    ];

    // --- TAMBAHKAN MESIN OTOMATIS INI ---
    protected static function booted()
    {
        // 1. Saat admin menggeser toggle di Filament
        static::updated(function (PostComment $comment) {
            // Cek apakah 'is_approved' baru saja diubah menjadi FALSE (Off)
            if ($comment->wasChanged('is_approved') && $comment->is_approved === false) {
                // Matikan (false-kan) semua komentar balasan di bawahnya secara massal!
                $comment->replies()->update(['is_approved' => false]);
            }
        });

        // 2. Saat admin menghapus (Delete) komentar utama
        static::deleted(function (PostComment $comment) {
            // Hapus juga semua komentar balasan di bawahnya biar nggak jadi "sampah" di database
            $comment->replies()->delete();
        });
    }
    // -----------------------------------

    public function post(): BelongsTo
    {
        return $this->belongsTo(Post::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // Relasi ke komentar induknya
    public function parent(): BelongsTo
    {
        return $this->belongsTo(PostComment::class, 'parent_id');
    }

    // Relasi untuk mengambil semua balasan dari komentar ini
    public function replies(): HasMany
    {
        return $this->hasMany(PostComment::class, 'parent_id');
    }
}

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

    // --- TAMBAHKAN MESIN LAZY UPDATE DI SINI ---
    protected static function booted()
    {
        // 1. Berjalan diam-diam saat ditarik dari database (Menunggu Waktu)
        static::retrieved(function (Post $post) {
            // Kalau waktunya udah lewat, terbitkan!
            if ($post->scheduled_at && $post->scheduled_at <= now() && $post->status !== 'published') {
                $post->updateQuietly([
                    'status' => 'published',
                    'published_at' => $post->scheduled_at, // Catat waktu rilisnya
                    'scheduled_at' => null // Hapus jadwalnya karena udah beres
                ]);
            }
        });

        // 2. Pengaman berlapis pas admin nge-save form
        static::saving(function (Post $post) {

            // --- 1. JIKA ADMIN NGISI JADWAL (Ada isian scheduled_at) ---
            if ($post->scheduled_at) {
                // Kalau jadwalnya masih besok/lusa
                if ($post->scheduled_at > now()) {
                    $post->status = 'archived'; // Tahan dulu
                    $post->published_at = null; // Kosongin tanggal publish-nya
                }
                // Kalau jadwalnya hari ini / udah lewat
                else {
                    $post->status = 'published';
                    $post->published_at = $post->scheduled_at; // Pindah dari jadwal ke publish
                    $post->scheduled_at = null; // Hapus jadwalnya
                }
            }

            // --- 2. JIKA PUBLISH LANGSUNG (Tanpa ngisi jadwal) ---
            // Ini yang ngebunuh bug 1 Januari 1970!
            if ($post->status === 'published' && empty($post->published_at)) {
                $post->published_at = now(); // Langsung cap pakai jam dan detik INI JUGA
            }

            // --- 3. JIKA DITARIK KE DRAFT/ARSIP ---
            // Biar kalau admin nge-draft ulang, tanggal tayangnya keriset jadi kosong
            if (in_array($post->status, ['draft', 'archived']) && empty($post->scheduled_at)) {
                $post->published_at = null;
            }
        });
    }
    // ------------------------------------------

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

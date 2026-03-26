<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Promo extends Model
{
    protected $fillable = [
        'code',
        'name',
        'description',
        'discount_type',
        'discount_value',
        'max_discount',
        'start_date',
        'end_date',
        'quota',
        'is_active'
    ];

    protected $casts = [
        'start_date' => 'datetime',
        'end_date' => 'datetime',
        'is_active' => 'boolean',
    ];

    public function rules(): HasMany
    {
        return $this->hasMany(PromoRule::class);
    }

    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class);
    }

    /**
     * Trik Lazy Update pakai Event 'retrieved'
     * Berjalan diam-diam setiap kali data Promo ditarik dari Database
     */
    protected static function booted()
    {
        static::retrieved(function (Promo $promo) {
            $now = now();

            // Cek kondisi realita saat ini
            $isExpired = $promo->end_date < $now;
            $isQuotaEmpty = $promo->quota !== null && $promo->quota <= 0;

            // Promo SEHARUSNYA aktif kalau dia BELUM expired DAN kuotanya MASIH ada
            $shouldBeActive = !$isExpired && !$isQuotaEmpty;

            // Kalau status di database beda dengan seharusnya, baru kita update diam-diam!
            // (Jadi kalau di db mati (0) tapi harusnya nyala (1), dia otomatis nyala)
            // (Kalau di db nyala (1) tapi harusnya mati (0), dia otomatis mati)
            if ($promo->is_active !== $shouldBeActive) {
                $promo->updateQuietly(['is_active' => $shouldBeActive]);
            }
        });

        // (Opsional) Biar pas admin nyimpen form edit, statusnya juga langsung dikoreksi
        static::saving(function (Promo $promo) {
            $now = now();
            $isExpired = $promo->end_date < $now;
            $isQuotaEmpty = $promo->quota !== null && $promo->quota <= 0;

            $promo->is_active = !$isExpired && !$isQuotaEmpty;
        });
    }

    public function isValid(): bool
    {
        $now = now();

        if (!$this->is_active) {
            return false;
        }

        if (!$now->between($this->start_date, $this->end_date)) {
            return false;
        }

        if ($this->quota !== null && $this->quota <= 0) {
            return false;
        }

        return true;
    }
}

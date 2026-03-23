<?php

namespace App\Models;

use App\Services\PromoService;
use Illuminate\Database\Eloquent\Model;

class Booking extends Model
{
    protected $guarded = ['id'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
    public function showtime()
    {
        return $this->belongsTo(Showtime::class);
    }
    public function tickets()
    {
        return $this->hasMany(Ticket::class);
    }
    public function bookingProducts()
    {
        return $this->hasMany(BookingProduct::class);
    }
    public function promo()
    {
        return $this->belongsTo(Promo::class);
    }
    public function pointTransactions()
    {
        return $this->hasMany(PointTransaction::class);
    }
    protected static function booted()
    {
        // Event 'updated' ini otomatis jalan setiap kali data booking di-save (diubah)
        static::updated(function (Booking $booking) {

            // Cek apakah statusnya BARU SAJA berubah menjadi 'paid'
            if ($booking->isDirty('status') && $booking->status === 'paid') {

                // --- (NEW) LOGIKA KURANGI KUOTA PROMO ---
                if ($booking->promo_id) {
                    $promo = $booking->promo;
                    // Cek kalau promonya punya limit kuota (nggak null) dan kuotanya masih > 0
                    if ($promo && $promo->quota !== null && $promo->quota > 0) {
                        $promo->decrement('quota'); // Otomatis ngurangin 1 di database
                    }
                }
                // ----------------------------------------

                // Panggil PromoService buat jalanin mutasi poin FIFO
                $promoService = app(PromoService::class);
                $promoService->applyPointTransactions($booking);
            }
        });
    }
}

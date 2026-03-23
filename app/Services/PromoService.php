<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\PointTransaction;
use App\Models\Promo;

class PromoService
{
    /**
     * Kalkulasi total diskon dan poin
     */
    public function calculate(float $subtotal, int $ticketQty, ?string $promoCode, bool $usePoints, $user): array
    {
        $discountAmount = 0;
        $pointsDiscount = 0;
        $promoId = null;

        $bestPromoId = null;
        $maxDiscountAmount = 0;

        // --- 1. CEK PROMO MANUAL (YANG DI-INPUT USER) ---
        if ($promoCode) {
            $manualPromo = Promo::where('code', $promoCode)
                ->where('is_active', true)
                ->where('start_date', '<=', now())
                ->where('end_date', '>=', now())
                // --- (NEW) Cek kuota ---
                ->where(function ($query) {
                    $query->whereNull('quota')->orWhere('quota', '>', 0);
                })
                ->with('rules')
                ->first();

            if ($manualPromo) {
                // Panggil method helper evaluatePromo
                $check = $this->evaluatePromo($manualPromo, $subtotal, $ticketQty);
                if ($check['isValid']) {
                    $maxDiscountAmount = $check['discountAmount'];
                    $bestPromoId = $manualPromo->id;
                } else {
                    return ['error' => 'Syarat promo ' . $promoCode . ' tidak terpenuhi.'];
                }
            } else {
                return ['error' => 'Promo tidak valid atau sudah expired.'];
            }
        }

        // --- 2. CEK PROMO AUTO-APPLY (TANPA KODE) ---
        // Ini yang bikin "Diskon Sultan" bisa jalan otomatis
        $autoPromos = Promo::whereNull('code')
            ->where('is_active', true)
            ->where('start_date', '<=', now())
            ->where('end_date', '>=', now())
            // --- (NEW) Cek kuota ---
            ->where(function ($query) {
                $query->whereNull('quota')->orWhere('quota', '>', 0);
            })
            // --
            ->with('rules')
            ->get();

        foreach ($autoPromos as $autoPromo) {
            $check = $this->evaluatePromo($autoPromo, $subtotal, $ticketQty);

            // Kalau promo auto ini valid dan diskonnya lebih gede dari promo manual, pakai ini.
            if ($check['isValid'] && $check['discountAmount'] > $maxDiscountAmount) {
                $maxDiscountAmount = $check['discountAmount'];
                $bestPromoId = $autoPromo->id;
            }
        }

        // --- SET HASIL DISKON TERBAIK ---
        $discountAmount = $maxDiscountAmount;
        $promoId = $bestPromoId;

        // --- 3. KALKULASI PENGGUNAAN POIN ---
        $pointsUsed = 0;
        if ($usePoints && $user->point_balance > 0) {
            $remainingAmount = $subtotal - $discountAmount;
            $maxPointsNeeded = ceil($remainingAmount / 1000);
            $pointsUsed = min($user->point_balance, $maxPointsNeeded);
            $pointsDiscount = $pointsUsed * 1000;

            if ($pointsDiscount > $remainingAmount) {
                $pointsDiscount = $remainingAmount;
            }
        }

        // --- 4. KALKULASI GRAND TOTAL & POIN EARNED ---
        $totalAmount = max(0, $subtotal - $discountAmount - $pointsDiscount);
        $pointsEarned = floor($totalAmount / 50000);

        return [
            'subtotal' => $subtotal,
            'promo_id' => $promoId,
            'discount_amount' => $discountAmount,
            'points_used' => $pointsUsed,
            'points_discount' => $pointsDiscount,
            'total_amount' => $totalAmount,
            'points_earned' => $pointsEarned
        ];
    }

    /**
     * HELPER FUNCTION: Untuk mengevaluasi rules dan menghitung nominal diskon
     * (Semua logika pengecekan rule termasuk specific_day ada di sini)
     */
    private function evaluatePromo(Promo $promo, float $subtotal, int $ticketQty): array
    {
        $isValid = true;
        foreach ($promo->rules as $rule) {
            // Cek Minimal Belanja
            if ($rule->rule_type === 'min_purchase_amount' && $subtotal < $rule->rule_value) {
                $isValid = false;
            }
            // Cek Minimal Jumlah Tiket
            if ($rule->rule_type === 'min_ticket_qty' && $ticketQty < $rule->rule_value) {
                $isValid = false;
            }
            // Cek Hari Tertentu (specific_day)
            if ($rule->rule_type === 'specific_day') {
                $today = now()->format('l');
                if (strtolower($today) !== strtolower($rule->rule_value)) {
                    $isValid = false;
                }
            }
        }

        $discountAmount = 0;
        if ($isValid) {
            if ($promo->discount_type === 'fixed') {
                $discountAmount = $promo->discount_value;
            } elseif ($promo->discount_type === 'percentage') {
                $calc = ($promo->discount_value / 100) * $subtotal;
                $discountAmount = $promo->max_discount ? min($calc, $promo->max_discount) : $calc;
            }
        }

        return [
            'isValid' => $isValid,
            'discountAmount' => $discountAmount
        ];
    }

    /**
     * Terapkan Mutasi Poin (Dipanggil HANYA saat status booking PAID)
     */
    public function applyPointTransactions(Booking $booking)
    {
        // Pastikan relasi user ter-load
        $user = $booking->user;

        // 1. LOGIC FIFO: Jika user menggunakan poin (Redeem)
        if ($booking->points_used > 0) {
            $pointsToDeduct = $booking->points_used;

            // Ambil transaksi poin yang masih aktif (balance > 0) diurutkan dari yang paling dekat expired
            $activePointTransactions = PointTransaction::where('user_id', $user->id)
                ->where('type', 'earned')
                ->where('balance', '>', 0)
                ->where('expired_at', '>', now())
                ->orderBy('expired_at', 'asc') // FIFO: Yang paling cepat basi dipakai duluan
                ->get();

            foreach ($activePointTransactions as $pt) {
                if ($pointsToDeduct <= 0) break; // Selesai kalau poin yang dibutuhin udah kepotong semua

                if ($pt->balance >= $pointsToDeduct) {
                    // Saldo di transaksi ini cukup buat nutup sisa potongan
                    $pt->decrement('balance', $pointsToDeduct);
                    $pointsToDeduct = 0;
                } else {
                    // Saldo di transaksi ini kurang, habisin saldo ini, lalu lanjut ke transaksi berikutnya
                    $pointsToDeduct -= $pt->balance;
                    $pt->update(['balance' => 0]);
                }
            }

            // Catat history pemakaian poin
            PointTransaction::create([
                'user_id' => $user->id,
                'booking_id' => $booking->id,
                'type' => 'redeemed',
                'amount' => $booking->points_used,
                'balance' => 0, // Tipe redeemed nggak punya balance
                'expired_at' => null
            ]);

            // Kurangi saldo utama user
            $user->decrement('point_balance', $booking->points_used);
        }

        // 2. Jika user mendapatkan poin baru (Earned) dari transaksi ini
        if ($booking->points_earned > 0) {
            PointTransaction::create([
                'user_id' => $user->id,
                'booking_id' => $booking->id,
                'type' => 'earned',
                'amount' => $booking->points_earned,
                'balance' => $booking->points_earned, // Saldo awal utuh
                'expired_at' => now()->addMonths(6) // Asumsi expired dalam 6 bulan
            ]);

            // Tambah saldo utama user
            $user->increment('point_balance', $booking->points_earned);
        }
    }
}

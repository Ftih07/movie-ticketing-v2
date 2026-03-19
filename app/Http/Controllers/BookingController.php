<?php

namespace App\Http\Controllers;

use App\Models\Showtime;
use App\Models\Booking;
use App\Models\Ticket;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Str;

class BookingController extends Controller
{
    // 1. Nampilin UI Milih Kursi
    public function show(Showtime $showtime)
    {
        $showtime->load(['movie', 'studio']);

        // Ambil kursi yang udah dibayar atau lagi proses pending
        $bookedSeats = Ticket::whereHas('booking', function ($query) use ($showtime) {
            $query->where('showtime_id', $showtime->id)
                ->whereIn('status', ['paid', 'pending']);
        })->pluck('seat_code');

        return Inertia::render('Booking/SeatSelection', [
            'showtime' => $showtime,
            'bookedSeats' => $bookedSeats,
            'midtransClientKey' => env('MIDTRANS_CLIENT_KEY')
        ]);
    }

    // 2. Proses Checkout & Minta Snap Token Midtrans
    public function checkout(Request $request, Showtime $showtime)
    {
        $request->validate(['seats' => 'required|array']);

        $user = auth()->user();
        $totalAmount = count($request->seats) * $showtime->price;
        $bookingCode = 'MVX-' . date('Ymd') . '-' . strtoupper(Str::random(5));

        // Buat data Booking (Invoice)
        $booking = Booking::create([
            'user_id' => $user->id,
            'showtime_id' => $showtime->id,
            'booking_code' => $bookingCode,
            'total_amount' => $totalAmount,
            'status' => 'pending',
        ]);

        // Buat data Tiket per kursi
        foreach ($request->seats as $seat) {
            Ticket::create([
                'booking_id' => $booking->id,
                'seat_code' => $seat,
                'ticket_code' => 'TKT-' . strtoupper(Str::random(8)),
            ]);
        }

        // --- KONFIGURASI MIDTRANS ---
        \Midtrans\Config::$serverKey = env('MIDTRANS_SERVER_KEY');
        \Midtrans\Config::$isProduction = env('MIDTRANS_IS_PRODUCTION', false);
        \Midtrans\Config::$isSanitized = true;
        \Midtrans\Config::$is3ds = true;

        $params = [
            'transaction_details' => [
                'order_id' => $booking->booking_code,
                'gross_amount' => $booking->total_amount,
            ],
            'customer_details' => [
                'first_name' => $user->name,
                'email' => $user->email,
            ],
        ];

        // Dapatkan Token dari Midtrans
        $snapToken = \Midtrans\Snap::getSnapToken($params);
        $booking->update(['snap_token' => $snapToken]);

        // Kembalikan token ke React biar bisa buka pop-up
        return response()->json(['snap_token' => $snapToken]);
    }
}

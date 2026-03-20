<?php

namespace App\Http\Controllers;

use App\Models\Showtime;
use App\Models\Booking;
use App\Models\Ticket;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Str;
use Carbon\Carbon; // Pastikan import Carbon

class BookingController extends Controller
{
    // 1. Nampilin UI Milih Kursi
    public function show(Showtime $showtime)
    {
        // --- VALIDASI WAKTU TAYANG ---
        // Gabungkan tanggal dan jam selesai film
        $endTime = Carbon::parse($showtime->show_date . ' ' . $showtime->end_time);

        // Kalau sekarang sudah melewati end_time, tendang balik ke page movies
        if (now()->greaterThan($endTime)) {
            return redirect()->route('movies.index')
                ->with('error', 'Maaf, jadwal tayang film ini sudah berakhir.');
        }

        $showtime->load(['movie', 'studio']);

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

    // 2. Proses Checkout
    public function checkout(Request $request, Showtime $showtime)
    {
        // --- VALIDASI DOUBLE CHECK (Cegah user nembak API langsung) ---
        $endTime = Carbon::parse($showtime->show_date . ' ' . $showtime->end_time);

        if (now()->greaterThan($endTime)) {
            return response()->json([
                'message' => 'Jadwal tayang sudah berakhir. Transaksi tidak dapat dilanjutkan.'
            ], 422); // Error 422: Unprocessable Entity
        }

        $request->validate(['seats' => 'required|array']);

        $user = auth()->user();
        $totalAmount = count($request->seats) * $showtime->price;
        $bookingCode = 'MVX-' . date('Ymd') . '-' . strtoupper(Str::random(5));

        $booking = Booking::create([
            'user_id' => $user->id,
            'showtime_id' => $showtime->id,
            'booking_code' => $bookingCode,
            'total_amount' => $totalAmount,
            'status' => 'pending',
        ]);

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

        $snapToken = \Midtrans\Snap::getSnapToken($params);
        $booking->update(['snap_token' => $snapToken]);

        return response()->json(['snap_token' => $snapToken]);
    }
}

<?php

namespace App\Http\Controllers;

use App\Models\Showtime;
use App\Models\Booking;
use App\Models\BookingProduct;
use App\Models\ProductCategory;
use App\Models\Ticket;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Str;
use Carbon\Carbon;
use App\Services\PromoService;

class BookingController extends Controller
{
    // 1. Nampilin UI Milih Kursi
    public function show(Showtime $showtime)
    {
        // --- VALIDASI WAKTU TAYANG ---
        $endTime = Carbon::parse($showtime->show_date . ' ' . $showtime->end_time);

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

    // 2. Nampilin UI Milih Snack
    public function snackSelection(Request $request, Showtime $showtime)
    {
        $endTime = Carbon::parse($showtime->show_date . ' ' . $showtime->end_time);
        if (now()->greaterThan($endTime)) {
            return redirect()->route('movies.index')
                ->with('error', 'Maaf, jadwal tayang film ini sudah berakhir.');
        }

        $selectedSeats = $request->input('seats', []);

        if (empty($selectedSeats)) {
            return redirect()->route('booking.show', $showtime->id)
                ->with('error', 'Pilih kursi terlebih dahulu.');
        }

        $showtime->load(['movie', 'studio']);
        $categories = ProductCategory::with('products')->get();

        // (NEW) Ambil daftar promo yang lagi aktif buat ditampilin di modal
        $activePromos = \App\Models\Promo::where('is_active', true)
            ->where('start_date', '<=', now())
            ->where('end_date', '>=', now())
            ->whereNotNull('code') // Cuma ambil promo yang butuh input kode
            ->where(function ($query) {
                $query->whereNull('quota')->orWhere('quota', '>', 0);
            })
            ->get();

        return Inertia::render('Booking/SnackSelection', [
            'showtime' => $showtime,
            'selectedSeats' => $selectedSeats,
            'categories' => $categories,
            'activePromos' => $activePromos, // (NEW) Lempar ke frontend
            'midtransClientKey' => env('MIDTRANS_CLIENT_KEY')
        ]);
    }

    // (NEW) Method untuk preview kalkulasi harga real-time di frontend
    public function calculateCheckout(Request $request, Showtime $showtime, PromoService $promoService)
    {
        $request->validate([
            'seats' => 'required|array',
            'snacks' => 'nullable|array',
            'promo_code' => 'nullable|string',
            'use_points' => 'boolean'
        ]);

        $user = auth()->user();
        $seatsTotal = count($request->seats) * $showtime->price;

        $snacksTotal = 0;
        if ($request->snacks) {
            foreach ($request->snacks as $snack) {
                $snacksTotal += ($snack['price'] * $snack['quantity']);
            }
        }

        $subtotal = $seatsTotal + $snacksTotal;

        $calcResult = $promoService->calculate(
            $subtotal,
            count($request->seats),
            $request->promo_code,
            $request->use_points ?? false,
            $user
        );

        if (isset($calcResult['error'])) {
            return response()->json(['message' => $calcResult['error']], 422);
        }

        return response()->json($calcResult);
    }

    // 3. Proses Checkout utama
    public function checkout(Request $request, Showtime $showtime, PromoService $promoService)
    {
        $endTime = \Carbon\Carbon::parse($showtime->show_date . ' ' . $showtime->end_time);
        if (now()->greaterThan($endTime)) {
            return response()->json(['message' => 'Jadwal tayang sudah berakhir. Transaksi tidak dapat dilanjutkan.'], 422);
        }

        $request->validate([
            'seats' => 'required|array',
            'snacks' => 'nullable|array',
            'promo_code' => 'nullable|string',
            'use_points' => 'boolean'
        ]);

        // --- VALIDASI KAPASITAS STUDIO ---
        $studioCapacity = $showtime->studio->capacity;
        $requestedSeatsCount = count($request->seats);

        $bookedTicketsCount = Ticket::whereHas('booking', function ($query) use ($showtime) {
            $query->where('showtime_id', $showtime->id)
                ->whereIn('status', ['paid', 'pending']);
        })->count();

        if (($bookedTicketsCount + $requestedSeatsCount) > $studioCapacity) {
            return response()->json([
                'message' => 'Maaf, sisa kapasitas studio tidak mencukupi untuk jumlah kursi yang kamu pilih.'
            ], 422);
        }

        $user = auth()->user();

        // Hitung Total Harga
        $seatsTotal = count($request->seats) * $showtime->price;
        $snacksTotal = 0;

        if ($request->snacks) {
            foreach ($request->snacks as $snack) {
                $snacksTotal += ($snack['price'] * $snack['quantity']);
            }
        }

        $subtotal = $seatsTotal + $snacksTotal;

        // --- PANGGIL SERVICE PROMO & POIN ---
        $calcResult = $promoService->calculate(
            $subtotal,
            count($request->seats),
            $request->promo_code,
            $request->use_points ?? false,
            $user
        );

        if (isset($calcResult['error'])) {
            return response()->json(['message' => $calcResult['error']], 422);
        }

        $bookingCode = 'MVX-' . date('Ymd') . '-' . strtoupper(Str::random(5));

        $booking = Booking::create([
            'user_id' => $user->id,
            'showtime_id' => $showtime->id,
            'promo_id' => $calcResult['promo_id'],
            'booking_code' => $bookingCode,
            'subtotal_amount' => $calcResult['subtotal'],
            'discount_amount' => $calcResult['discount_amount'],
            'points_used' => $calcResult['points_used'],
            'points_discount_amount' => $calcResult['points_discount'],
            'points_earned' => $calcResult['points_earned'],
            'total_amount' => $calcResult['total_amount'],
            'status' => 'pending',
        ]);

        foreach ($request->seats as $seat) {
            Ticket::create([
                'booking_id' => $booking->id,
                'seat_code' => $seat,
                'ticket_code' => 'TKT-' . strtoupper(Str::random(8)),
            ]);
        }

        if ($request->snacks) {
            foreach ($request->snacks as $snack) {
                BookingProduct::create([
                    'booking_id' => $booking->id,
                    'product_id' => $snack['id'],
                    'quantity' => $snack['quantity'],
                    'price' => $snack['price'],
                    'status' => 'unclaimed',
                ]);
            }
        }

        // --- KONFIGURASI MIDTRANS ---
        \Midtrans\Config::$serverKey = env('MIDTRANS_SERVER_KEY');
        \Midtrans\Config::$isProduction = env('MIDTRANS_IS_PRODUCTION', false);
        \Midtrans\Config::$isSanitized = true;
        \Midtrans\Config::$is3ds = true;

        // BYPASS JIKA TOTAL RP 0
        if ($calcResult['total_amount'] <= 0) {
            // Ubah status ke paid, Model Booking otomatis akan menjalankan PromoService->applyPointTransactions() lewat event 'updated'
            $booking->update(['status' => 'paid']);
            return response()->json(['redirect' => route('history.index')]);
        }

        $params = [
            'transaction_details' => [
                'order_id' => $booking->booking_code,
                'gross_amount' => $booking->total_amount,
            ],
            'customer_details' => [
                'first_name' => $user->name,
                'email' => $user->email,
            ],
            'callbacks' => [
                'finish' => 'http://localhost:8000/history'
            ]
        ];

        $snapToken = \Midtrans\Snap::getSnapToken($params);
        $booking->update(['snap_token' => $snapToken]);

        return response()->json(['snap_token' => $snapToken]);
    }

    // ==========================================
    // LOGIC BELI SNACK MENYUSUL (DARI HISTORY)
    // ==========================================

    // 1. Nampilin Halaman Katalog Snack
    public function addSnackSusulan(Booking $booking)
    {
        // Pastikan tiket miliknya, statusnya LUNAS, dan film belum tayang
        $endTime = \Carbon\Carbon::parse($booking->showtime->show_date . ' ' . $booking->showtime->end_time);

        if ($booking->user_id !== auth()->id() || $booking->status !== 'paid' || now()->greaterThan($endTime)) {
            return redirect()->route('history.index')->with('error', 'Tidak dapat menambah pesanan untuk tiket ini.');
        }

        $categories = ProductCategory::with('products')->get();
        $booking->load('showtime.movie');

        // Kita bisa pakai halaman SnackSelection yang sama, cuma di-passing data berbeda
        // Tapi biar rapi, mending kamu duplikat file SnackSelection.tsx jadi AddSnackSusulan.tsx
        return Inertia::render('Booking/AddSnackSusulan', [
            'booking' => $booking,
            'categories' => $categories,
            'midtransClientKey' => env('MIDTRANS_CLIENT_KEY')
        ]);
    }

    // 2. Bikin Transaksi Midtrans Khusus Snack
    public function checkoutSnackSusulan(Request $request, Booking $booking)
    {
        $request->validate(['snacks' => 'required|array']);

        $totalAmount = 0;
        foreach ($request->snacks as $snack) {
            $totalAmount += ($snack['price'] * $snack['quantity']);
        }

        // Bikin Order ID unik KHUSUS buat bayar snack ini di Midtrans
        $snackOrderId = 'SNCK-' . $booking->id . '-' . time();

        \Midtrans\Config::$serverKey = env('MIDTRANS_SERVER_KEY');
        \Midtrans\Config::$isProduction = env('MIDTRANS_IS_PRODUCTION', false);
        \Midtrans\Config::$isSanitized = true;
        \Midtrans\Config::$is3ds = true;

        $params = [
            'transaction_details' => [
                'order_id' => $snackOrderId,
                'gross_amount' => $totalAmount,
            ],
            'customer_details' => [
                'first_name' => auth()->user()->name,
                'email' => auth()->user()->email,
            ],
            // PENTING: Pake jurus 1 buat bypass redirect Midtrans
            'callbacks' => [
                'finish' => 'http://localhost:8000/history'
            ]
        ];

        $snapToken = \Midtrans\Snap::getSnapToken($params);

        return response()->json(['snap_token' => $snapToken]);
    }

    // 3. Simpan ke Database JIKA Pembayaran Sukses
    public function saveSnackSusulan(Request $request, Booking $booking)
    {
        $request->validate(['snacks' => 'required|array']);

        foreach ($request->snacks as $snack) {
            BookingProduct::create([
                'booking_id' => $booking->id,
                'product_id' => $snack['id'],
                'quantity' => $snack['quantity'],
                'price' => $snack['price'],
                'status' => 'unclaimed', // Siap diambil di bioskop
            ]);
        }

        // Opsional: Update Grand Total di tabel Booking biar riwayat pengeluarannya akurat
        $totalSnack = collect($request->snacks)->sum(fn($s) => $s['price'] * $s['quantity']);
        $booking->increment('total_amount', $totalSnack);
        $booking->increment('subtotal_amount', $totalSnack); // <--- TAMBAHIN BARIS INI

        return response()->json(['message' => 'Berhasil ditambahkan']);
    }
}

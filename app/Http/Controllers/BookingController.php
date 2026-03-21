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

    // 2. Nampilin UI Milih Snack (NEW)
    public function snackSelection(Request $request, Showtime $showtime)
    {
        // Validasi waktu tayang sama kayak di show()
        $endTime = Carbon::parse($showtime->show_date . ' ' . $showtime->end_time);
        if (now()->greaterThan($endTime)) {
            return redirect()->route('movies.index')
                ->with('error', 'Maaf, jadwal tayang film ini sudah berakhir.');
        }

        // Ambil data kursi yang dilempar dari frontend (Inertia)
        $selectedSeats = $request->input('seats', []);

        // Kalau user iseng nembak URL ini tapi blm milih kursi, tendang balik
        if (empty($selectedSeats)) {
            return redirect()->route('booking.show', $showtime->id)
                ->with('error', 'Pilih kursi terlebih dahulu.');
        }

        $showtime->load(['movie', 'studio']);
        // Ambil kategori dan produk buat ditampilkan di UI
        $categories = ProductCategory::with('products')->get();

        return Inertia::render('Booking/SnackSelection', [
            'showtime' => $showtime,
            'selectedSeats' => $selectedSeats,
            'categories' => $categories,
            'midtransClientKey' => env('MIDTRANS_CLIENT_KEY')
        ]);
    }

    // 3. Proses Checkout (UPDATED)
    public function checkout(Request $request, Showtime $showtime)
    {
        $endTime = Carbon::parse($showtime->show_date . ' ' . $showtime->end_time);

        if (now()->greaterThan($endTime)) {
            return response()->json([
                'message' => 'Jadwal tayang sudah berakhir. Transaksi tidak dapat dilanjutkan.'
            ], 422);
        }

        // Tambahin validasi snacks
        $request->validate([
            'seats' => 'required|array',
            'snacks' => 'nullable|array',
        ]);

        // --- VALIDASI KAPASITAS STUDIO (NEW) ---
        $studioCapacity = $showtime->studio->capacity;
        $requestedSeatsCount = count($request->seats);

        // Hitung tiket yang udah laku di jadwal tayang ini
        $bookedTicketsCount = Ticket::whereHas('booking', function ($query) use ($showtime) {
            $query->where('showtime_id', $showtime->id)
                ->whereIn('status', ['paid', 'pending']);
        })->count();

        // Kalau sisa kursi nggak cukup buat pesanan yang baru
        if (($bookedTicketsCount + $requestedSeatsCount) > $studioCapacity) {
            return response()->json([
                'message' => 'Maaf, sisa kapasitas studio tidak mencukupi untuk jumlah kursi yang kamu pilih.'
            ], 422);
        }
        // ----------------------------------------

        $user = auth()->user();

        // Hitung total harga TIKET
        $seatsTotal = count($request->seats) * $showtime->price;

        // Hitung total harga SNACK
        $snacksTotal = 0;
        if ($request->snacks) {
            foreach ($request->snacks as $snack) {
                // Asumsinya dari frontend ngirim array: [{id: 1, quantity: 2, price: 50000}]
                $snacksTotal += ($snack['price'] * $snack['quantity']);
            }
        }

        // GABUNGKAN TOTAL
        $totalAmount = $seatsTotal + $snacksTotal;
        $bookingCode = 'MVX-' . date('Ymd') . '-' . strtoupper(Str::random(5));

        $booking = Booking::create([
            'user_id' => $user->id,
            'showtime_id' => $showtime->id,
            'booking_code' => $bookingCode,
            'total_amount' => $totalAmount,
            'status' => 'pending',
        ]);

        // Simpan Tiket Kursi
        foreach ($request->seats as $seat) {
            Ticket::create([
                'booking_id' => $booking->id,
                'seat_code' => $seat,
                'ticket_code' => 'TKT-' . strtoupper(Str::random(8)),
            ]);
        }

        // Simpan Pesanan Snack (Kalau Ada)
        if ($request->snacks) {
            foreach ($request->snacks as $snack) {
                BookingProduct::create([
                    'booking_id' => $booking->id,
                    'product_id' => $snack['id'],
                    'quantity' => $snack['quantity'],
                    'price' => $snack['price'], // Harga fix saat dibeli
                    'status' => 'unclaimed',
                ]);
            }
        }

        // --- KONFIGURASI MIDTRANS ---
        \Midtrans\Config::$serverKey = env('MIDTRANS_SERVER_KEY');
        \Midtrans\Config::$isProduction = env('MIDTRANS_IS_PRODUCTION', false);
        \Midtrans\Config::$isSanitized = true;
        \Midtrans\Config::$is3ds = true;

        $params = [
            'transaction_details' => [
                'order_id' => $booking->booking_code,
                'gross_amount' => $booking->total_amount, // Midtrans otomatis baca total baru
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

        return response()->json(['message' => 'Berhasil ditambahkan']);
    }
}

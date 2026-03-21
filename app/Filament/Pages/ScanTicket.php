<?php

namespace App\Filament\Pages;

use Filament\Pages\Page;
use App\Models\Booking;
use App\Models\BookingProduct;
use Filament\Notifications\Notification;

class ScanTicket extends Page
{
    protected string $view = 'filament.pages.scan-ticket';

    public ?array $scanResult = null;
    public ?string $scanStatus = null;

    // Variabel tambahan buat nampung pesanan snack
    public ?array $snackItems = null;

    public function processScan($bookingCode)
    {
        // Ambil data lengkap termasuk relasi F&B (bookingProducts)
        $booking = Booking::with(['tickets', 'showtime.movie', 'showtime.studio', 'user', 'bookingProducts.product'])->where('booking_code', $bookingCode)->first();

        // Reset data snack dari scan sebelumnya
        $this->snackItems = null;

        if (!$booking) {
            $this->scanStatus = 'error';
            $this->scanResult = ['message' => 'Tiket Tidak Ditemukan!'];
            Notification::make()->danger()->title('Invalid! Tiket Tidak Ditemukan.')->send();
            return;
        }

        if ($booking->status !== 'paid') {
            $this->scanStatus = 'error';
            $this->scanResult = ['message' => 'Tiket Belum Lunas / Expired!'];
            Notification::make()->warning()->title('Ditolak! Tiket Belum Lunas.')->send();
            return;
        }

        // --- SIAPKAN DATA SNACK ---
        if ($booking->bookingProducts->count() > 0) {
            $this->snackItems = $booking->bookingProducts->toArray();
        }

        // --- LOGIC TIKET (KODE ASLIMU) ---
        $usedTickets = $booking->tickets->where('status', 'used')->count();
        $totalTickets = $booking->tickets->count();

        if ($usedTickets === $totalTickets) {
            $this->scanStatus = 'error';
            $this->scanResult = [
                'message' => 'Tiket Sudah Digunakan!',
                'movie' => $booking->showtime->movie->title,
                'user' => $booking->user->name ?? 'Customer',
            ];
            Notification::make()->danger()->title('Ditolak! Tiket Sudah Digunakan.')->send();
            return;
        }

        // Kalau aman, update status tiket jadi 'used'
        $booking->tickets()->update(['status' => 'used']);
        $seats = $booking->tickets->pluck('seat_code')->join(', ');

        // Kirim data ke layar summary
        $this->scanStatus = 'success';
        $this->scanResult = [
            'message' => 'Akses Diberikan!',
            'movie' => $booking->showtime->movie->title,
            'studio' => $booking->showtime->studio->name,
            'seats' => $seats,
            'user' => $booking->user->name ?? 'Customer',
            'booking_code' => $booking->booking_code // Simpan kodenya buat refresh data F&B
        ];

        Notification::make()->success()->title('Sukses! Akses Diberikan.')->send();
    }

    // --- FUNGSI BARU BUAT KLAIM SNACK ---
    public function claimSingleSnack($bookingProductId)
    {
        $item = BookingProduct::find($bookingProductId);
        if ($item && $item->status === 'unclaimed') {
            $item->update(['status' => 'claimed']);
            Notification::make()->success()->title('Berhasil')->body("{$item->product->name} telah diserahkan.")->send();

            // Refresh data snack di layar tanpa harus scan ulang
            if (isset($this->scanResult['booking_code'])) {
                $booking = Booking::with('bookingProducts.product')
                    ->where('booking_code', $this->scanResult['booking_code'])
                    ->first();
                $this->snackItems = $booking->bookingProducts->toArray();
            }
        }
    }
}

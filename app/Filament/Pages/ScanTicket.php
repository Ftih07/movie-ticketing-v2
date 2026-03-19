<?php

namespace App\Filament\Pages;

use Filament\Pages\Page;
use App\Models\Booking;
use Filament\Notifications\Notification;

class ScanTicket extends Page
{
    protected string $view = 'filament.pages.scan-ticket';

    // Tambahin dua variabel ini buat nampilin Summary di layar
    public ?array $scanResult = null;
    public ?string $scanStatus = null;

    public function processScan($bookingCode)
    {
        // Ambil data lengkap sama relasinya (user, movie, studio)
        $booking = Booking::with(['tickets', 'showtime.movie', 'showtime.studio', 'user'])->where('booking_code', $bookingCode)->first();

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
        ];

        Notification::make()->success()->title('Sukses! Akses Diberikan.')->send();
    }
}

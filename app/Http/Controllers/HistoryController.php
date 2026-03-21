<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\Booking;

class HistoryController extends Controller
{
    public function index()
    {
        $bookings = Booking::with([
            'showtime.movie',
            'showtime.studio',
            'tickets',
            'bookingProducts.product' 
        ])
            ->where('user_id', auth()->id())
            ->latest()
            ->get();

        return Inertia::render('History/Index', [
            'bookings' => $bookings,
            'midtransClientKey' => env('MIDTRANS_CLIENT_KEY') // Tambahin baris ini
        ]);
    }
}

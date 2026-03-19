<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;


use App\Http\Controllers\MovieController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\BookingController;
use App\Http\Controllers\WebhookController;
use App\Http\Controllers\HistoryController;

use App\Http\Controllers\Auth\SocialiteController;

// Auth Google - Facebook
Route::get('/auth/{provider}/redirect', [SocialiteController::class, 'redirect'])->name('socialite.redirect');
Route::get('/auth/{provider}/callback', [SocialiteController::class, 'callback'])->name('socialite.callback');

// 1. Landing Page
Route::get('/', [HomeController::class, 'index'])->name('home');

// 2. Data All Film (dengan Filter Tanggal)
Route::get('/movies', [MovieController::class, 'index'])->name('movies.index');

// 3. Detail Film
Route::get('/movies/{movie:slug}', [MovieController::class, 'show'])->name('movies.show');


// --- LOGIC BOOKING --- //
// Halaman milih kursi (bisa diakses publik)
Route::get('/booking/{showtime}', [BookingController::class, 'show'])->name('booking.show');

// Proses checkout & generate Midtrans (WAJIB LOGIN)
Route::post('/booking/{showtime}/checkout', [BookingController::class, 'checkout'])
    ->name('booking.checkout')
    ->middleware('auth');

// Webhook (Tanpa middleware auth, karena yang ngakses server Midtrans)
Route::post('/midtrans/webhook', [WebhookController::class, 'handle'])->name('midtrans.webhook');

// Halaman History (Wajib login)
Route::get('/history', [HistoryController::class, 'index'])->name('history.index')->middleware('auth');
// --------------------- //

Route::middleware(['auth'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';

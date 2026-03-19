<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;


use App\Http\Controllers\MovieController;
use App\Http\Controllers\HomeController;

// 1. Landing Page
Route::get('/', [HomeController::class, 'index'])->name('home');

// 2. Data All Film (dengan Filter Tanggal)
Route::get('/movies', [MovieController::class, 'index'])->name('movies.index');

// 3. Detail Film
Route::get('/movies/{movie:slug}', [MovieController::class, 'show'])->name('movies.show');


Route::middleware(['auth'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';

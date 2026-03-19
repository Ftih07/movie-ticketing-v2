<?php

namespace App\Http\Controllers;

use App\Models\Movie;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MovieController extends Controller
{
    // Halaman ALL FILM + FILTER TANGGAL
    public function index(Request $request): Response
    {
        // Mulai query
        $query = Movie::query()->with('categories');

        // Logic Filter by Tanggal: Ambil film yang PUNYA jadwal tayang di tanggal tersebut
        if ($request->has('date') && $request->date != '') {
            $filterDate = $request->date;
            $query->whereHas('showtimes', function ($q) use ($filterDate) {
                $q->where('show_date', $filterDate);
            });
        }

        // Ambil datanya
        $movies = $query->latest()->get();

        // Kirim data ke React (Pages/Movies/Index.tsx)
        return Inertia::render('Movies/Index', [
            'movies' => $movies,
            // Kirim tanggal yang sedang difilter balik ke frontend buat isi value input date
            'selectedDate' => $request->date,
        ]);
    }

    // Halaman DETAIL FILM
    public function show(Movie $movie): Response
    {
        // Eager load data relasi yang dibutuhkan
        $movie->load([
            'categories',
            // Ambil jadwal tayang kedepan, urutkan tanggal & jam mulai, sekalian studionya
            'showtimes' => function ($query) {
                $query->with('studio')
                    ->where('show_date', '>=', now())
                    ->orderBy('show_date')
                    ->orderBy('start_time');
            }
        ]);

        // Kelompokkan jadwal tayang berdasarkan TANGGAL biar gampang dirender di React
        $groupedShowtimes = $movie->showtimes->groupBy('show_date');

        // Kirim data ke React (Pages/Movies/Show.tsx)
        return Inertia::render('Movies/Show', [
            'movie' => $movie,
            'groupedShowtimes' => $groupedShowtimes,
        ]);
    }
}

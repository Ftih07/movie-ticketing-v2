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
        $query = Movie::query()->with('categories');

        if ($request->has('date') && $request->date != '') {
            $filterDate = $request->date;
            $query->whereHas('showtimes', function ($q) use ($filterDate) {
                $q->where('show_date', $filterDate);
            });
        }

        $movies = $query->latest()->paginate(12)->withQueryString();

        return Inertia::render('Movies/Index', [
            'movies' => $movies, 
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

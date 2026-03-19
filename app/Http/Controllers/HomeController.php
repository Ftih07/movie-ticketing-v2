<?php

namespace App\Http\Controllers;

use App\Models\Movie;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    public function index(): Response
    {
        // Ambil data film premier buat hero section (paling baru di-upload)
        $heroMovie = Movie::with('categories')->latest()->first();

        // Ambil film kategori 'Action' buat carousel pertama
        $actionMovies = Movie::whereHas('categories', function ($query) {
            $query->where('name', 'Action');
        })->take(10)->get();

        // Ambil film kategori 'Drama' buat carousel kedua
        $dramaMovies = Movie::whereHas('categories', function ($query) {
            $query->where('name', 'Drama');
        })->take(10)->get();

        // Kirim data ke React (Pages/Home.tsx)
        return Inertia::render('Home', [
            'heroMovie' => $heroMovie,
            'actionMovies' => $actionMovies,
            'dramaMovies' => $dramaMovies,
        ]);
    }
}

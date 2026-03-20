<?php

namespace App\Http\Controllers;

use App\Models\Movie;
use Inertia\Inertia;

class FavoriteController extends Controller
{
    public function index()
    {
        return Inertia::render('Movies/Favorites', [
            'movies' => auth()->user()->favorites()->with('categories')->latest()->get()
        ]);
    }

    public function toggle(Movie $movie)
    {
        // toggle() balikin array 'attached' atau 'detached'
        $result = auth()->user()->favorites()->toggle($movie->id);

        $isAdded = count($result['attached']) > 0;
        $message = $isAdded
            ? "Film {$movie->title} berhasil ditambah ke favorit! ❤️"
            : "Film {$movie->title} dihapus dari favorit.";

        return back()->with('message', $message);
    }
}

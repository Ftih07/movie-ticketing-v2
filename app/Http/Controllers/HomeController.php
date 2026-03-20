<?php

namespace App\Http\Controllers;

use App\Models\Movie;
use Inertia\Inertia;
use Inertia\Response;
use App\Models\Category;
use Illuminate\Http\Request;

class HomeController extends Controller
{
    public function index(Request $request): Response
    {
        // 1. BASE QUERY (Apply semua filter Search, Genre, Duration dulu)
        $query = Movie::with('categories');

        // 🔍 Search
        if ($request->search) {
            $query->where('title', 'like', '%' . $request->search . '%');
        }

        // 🎭 Genre
        if ($request->genre) {
            $query->whereHas('categories', function ($q) use ($request) {
                $q->where('categories.id', $request->genre);
            });
        }

        // ⏱ Duration
        if ($request->duration) {
            $query->where('duration', '<=', (int) $request->duration);
        }

        // 📅 DATE FILTER
        if ($request->date === 'today') {
            $query->whereHas('showtimes', function ($q) {
                $q->whereDate('show_date', now());
            });
        } elseif ($request->date === 'week') {
            $query->whereHas('showtimes', function ($q) {
                $q->whereBetween('show_date', [now()->startOfWeek(), now()->endOfWeek()]);
            });
        }

        // 2. NOW SHOWING (Film yang ada jadwal tayangnya mulai hari ini ke depan)
        $nowShowing = (clone $query)->whereHas('showtimes', function ($q) {
            $q->whereDate('show_date', '>=', now());
        })->latest()->take(12)->get();

        // 3. COMING SOON (Film yang BELUM ada jadwal tayang sama sekali)
        // Catatan: Kalau user filter by Date='today', otomatis comingSoon bakal kosong. Ini normal.
        $comingSoon = (clone $query)->whereDoesntHave('showtimes')
            ->latest()
            ->take(12)
            ->get();

        return Inertia::render('Home', [
            'nowShowing' => $nowShowing,
            'comingSoon' => $comingSoon,
            'allGenres' => Category::select('id', 'name')->get(),
            'filters' => $request->only(['search', 'genre', 'duration', 'date']),
        ]);
    }
}

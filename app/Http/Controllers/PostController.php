<?php

namespace App\Http\Controllers;

use App\Models\Post;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PostController extends Controller
{
    // Halaman List Semua Artikel & Promo
    public function index(Request $request)
    {
        $query = Post::where('status', 'published')->latest('published_at');

        // 1. Logika Filter Tipe (Article/Promo)
        if ($request->has('type') && in_array($request->type, ['article', 'promo'])) {
            $query->where('type', $request->type);
        }

        // 2. Logika Search (Pencarian Judul)
        if ($request->filled('search')) {
            $query->where('title', 'like', '%' . $request->search . '%');
        }

        $posts = $query->paginate(12)->withQueryString();

        return Inertia::render('Posts/Index', [
            'posts' => $posts,
            'filters' => [
                'type' => $request->type ?? 'all',
                'search' => $request->search ?? '', // Kirim kembali nilai search ke React
            ]
        ]);
    }

    // Halaman Baca Artikel
    public function show($slug)
    {
        // Muat artikel beserta komentar dan relasi usernya, plus jumlah likes
        $post = Post::with([
            'comments' => function ($query) {
                // 1. FILTER KOMENTAR UTAMA: Cuma ambil yang is_approved = true
                $query->whereNull('parent_id')
                    ->where('is_approved', true)
                    ->latest()
                    ->with([
                        'user',
                        // 2. FILTER BALASAN: Cuma load balasan yang is_approved = true juga
                        'replies' => function ($replyQuery) {
                            $replyQuery->where('is_approved', true)->with('user');
                        }
                    ]);
            }
        ])
            ->withCount('likes')
            ->where('slug', $slug)
            ->where('status', 'published')
            ->firstOrFail();

        $post->increment('read_count');

        // Ambil 3 artikel terbaru untuk rekomendasi di bawah
        $relatedPosts = Post::where('status', 'published')
            ->where('id', '!=', $post->id)
            ->latest('published_at')
            ->take(3)
            ->get();

        // Cek status like & save untuk user yang sedang login
        $user = auth()->user();
        $isLiked = $user ? $post->likes()->where('user_id', $user->id)->exists() : false;
        $isSaved = $user ? $post->savedBy()->where('user_id', $user->id)->exists() : false;

        return Inertia::render('Posts/Show', [
            'post' => $post,
            'isLiked' => $isLiked,
            'isSaved' => $isSaved,
            'relatedPosts' => $relatedPosts,
        ]);
    }

    // ==========================================
    // LOGIKA TAMBAH KOMENTAR
    // ==========================================
    public function comment(Request $request, Post $post)
    {
        $request->validate([
            'content' => 'required|string|max:1000',
            'parent_id' => 'nullable|exists:post_comments,id', // Tambahkan ini
        ]);

        $post->comments()->create([
            'user_id' => auth()->id(),
            'content' => $request->content,
            'parent_id' => $request->parent_id, // Tambahkan ini
        ]);

        return back();
    }

    // ==========================================
    // LOGIKA TOGGLE LIKE
    // ==========================================
    public function toggleLike(Post $post)
    {
        // Fungsi toggle() otomatis ngecek: 
        // Kalau belum like -> di-like (masuk database). Kalau udah like -> di-unlike (dihapus dari database).
        $post->likes()->toggle(auth()->id());

        return back();
    }

    // ==========================================
    // LOGIKA TOGGLE SAVE / BOOKMARK
    // ==========================================
    public function toggleSave(Post $post)
    {
        $post->savedBy()->toggle(auth()->id());

        return back();
    }

    // ==========================================
    // HALAMAN MY LIST (SAVED & LIKED POSTS)
    // ==========================================
    public function myList()
    {
        $user = auth()->user();

        // Ambil artikel yang di-save (berdasarkan relasi di model User)
        $savedPosts = $user->savedPosts()
            ->where('status', 'published')
            ->latest('post_saves.created_at') // Urutkan dari yang terbaru disimpan
            ->get();

        // Ambil artikel yang di-like
        $likedPosts = $user->likedPosts()
            ->where('status', 'published')
            ->latest('post_likes.created_at')
            ->get();

        return Inertia::render('Posts/MyList', [
            'savedPosts' => $savedPosts,
            'likedPosts' => $likedPosts,
        ]);
    }
}

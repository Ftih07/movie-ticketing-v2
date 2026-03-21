<?php

namespace App\Http\Controllers;

use App\Models\ProductCategory;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SnackController extends Controller
{
    public function index()
    {
        // Ambil semua kategori beserta produk di dalamnya
        $categories = ProductCategory::with('products')->get();

        return Inertia::render('Snacks/Index', [
            'categories' => $categories
        ]);
    }
}

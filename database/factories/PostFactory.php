<?php

namespace Database\Factories;

use App\Models\Post;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class PostFactory extends Factory
{
    protected $model = Post::class;

    public function definition(): array
    {
        // 1. Kita siapkan daftar judul ala artikel dan promo bioskop
        $indonesianTitles = [
            'Review Film Agak Laen: Mengocok Perut dari Awal Sampai Akhir',
            'Promo Spesial Weekend: Nonton Hemat Beli 1 Gratis 1',
            '5 Fakta Menarik di Balik Pembuatan Film Godzilla x Kong',
            'Cara Mendapatkan Diskon Tiket Bioskop Pakai Saldo E-Wallet',
            'Rekomendasi Film Horor Indonesia Terbaik Bulan Ini',
            'Harga Tiket Promo Spesial Liburan Lebaran di Movieflix',
            'Daftar Film Action yang Wajib Ditonton Ulang',
            'Review Exhuma: Misteri Kuburan yang Bikin Merinding',
            'Promo Flash Sale Tiket Nonton Midnight Show',
            'Behind the Scene: Pembuatan CGI Film Bertema Luar Angkasa'
        ];

        // 2. Faker akan memilih salah satu judul di atas secara acak
        $title = $this->faker->randomElement($indonesianTitles);

        return [
            'author_id' => \App\Models\User::inRandomOrder()->first()?->id ?? \App\Models\User::factory(),
            'movie_id' => null,
            'type' => $this->faker->randomElement(['article', 'promo']),
            'title' => $title,
            // Slug-nya bakal menyesuaikan judul bahasa Indonesianya
            'slug' => \Illuminate\Support\Str::slug($title) . '-' . $this->faker->numberBetween(100, 999),

            // Untuk konten panjang, nggak apa-apa pakai Latin biar teksnya kelihatan penuh pas dites
            'content' => '<p>' . implode('</p><p>', $this->faker->paragraphs(5)) . '</p>',
            'excerpt' => $this->faker->paragraph(2),
            'thumbnail' => null,
            'status' => $this->faker->randomElement(['draft', 'published', 'archived']),
            'is_featured' => $this->faker->boolean(20),
            'read_time' => $this->faker->numberBetween(2, 10),
            'read_count' => $this->faker->numberBetween(10, 5000),
            'meta_title' => $title,
            'meta_description' => $this->faker->text(150),
            'published_at' => $this->faker->dateTimeBetween('-2 months', 'now'),
            'created_at' => now(),
            'updated_at' => now(),
        ];
    }
}

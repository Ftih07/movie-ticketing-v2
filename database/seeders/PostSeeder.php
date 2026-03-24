<?php

namespace Database\Seeders;

use App\Models\Post;
use Illuminate\Database\Seeder;

class PostSeeder extends Seeder
{
    public function run(): void
    {
        // Bikin 15 data bertipe 'article' yang statusnya langsung 'published'
        Post::factory()->count(15)->create([
            'type' => 'article',
            'status' => 'published',
        ]);

        // Bikin 5 data bertipe 'promo' yang statusnya langsung 'published'
        Post::factory()->count(5)->create([
            'type' => 'promo',
            'status' => 'published',
        ]);

        // Bikin 5 data campur yang statusnya masih 'draft'
        Post::factory()->count(5)->create([
            'status' => 'draft',
        ]);
    }
}

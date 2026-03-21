<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('booking_products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('booking_id')->constrained('bookings')->cascadeOnDelete();
            $table->foreignId('product_id')->constrained('products')->cascadeOnDelete();
            $table->integer('quantity');
            $table->unsignedBigInteger('price'); // Harga satuan saat di-booking (buat history)
            $table->enum('status', ['unclaimed', 'claimed'])->default('unclaimed');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('booking_products');
    }
};

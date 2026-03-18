<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('bookings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('showtime_id')->constrained()->cascadeOnDelete();
            $table->string('booking_code')->unique();
            $table->integer('total_amount');
            $table->enum('status', ['pending', 'paid', 'failed', 'expired', 'canceled'])->default('pending');
            $table->string('snap_token')->nullable(); // Untuk Midtrans
            $table->string('payment_type')->nullable();
            $table->string('midtrans_transaction_id')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bookings');
    }
};

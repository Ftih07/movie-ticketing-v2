<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            // Asumsi kolom total_amount sudah ada, kita tambahkan sisanya sebelum total_amount
            $table->decimal('subtotal_amount', 12, 2)->after('booking_code')->default(0);
            $table->foreignId('promo_id')->nullable()->after('subtotal_amount')->constrained('promos')->nullOnDelete();
            $table->decimal('discount_amount', 12, 2)->default(0)->after('promo_id');
            $table->integer('points_used')->default(0)->after('discount_amount');
            $table->decimal('points_discount_amount', 12, 2)->default(0)->after('points_used');
            $table->integer('points_earned')->default(0)->after('points_discount_amount');
        });
    }

    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->dropForeign(['promo_id']);
            $table->dropColumn([
                'subtotal_amount',
                'promo_id',
                'discount_amount',
                'points_used',
                'points_discount_amount',
                'points_earned'
            ]);
        });
    }
};

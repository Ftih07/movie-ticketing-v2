<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('promos', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique()->nullable()->comment('Null berarti auto-apply');
            $table->string('name');
            $table->text('description')->nullable();
            $table->enum('discount_type', ['fixed', 'percentage', 'buy_x_get_y']);
            $table->decimal('discount_value', 10, 2);
            $table->decimal('max_discount', 10, 2)->nullable();
            $table->dateTime('start_date');
            $table->dateTime('end_date');
            $table->integer('quota')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('promos');
    }
};

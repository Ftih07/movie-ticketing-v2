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
        Schema::table('movies', function (Blueprint $table) {
            $table->string('writer')->nullable()->after('director'); // Penulis
            $table->string('production_company')->nullable()->after('writer'); // Produksi Perusahaan
            $table->string('producer')->nullable()->after('production_company'); // Produser
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('movies', function (Blueprint $table) {
            $table->dropColumn('writer');
            $table->dropColumn('production_company');
            $table->dropColumn('producer');
        });
    }
};

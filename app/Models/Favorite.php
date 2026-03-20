<?php

// app/Models/Favorite.php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\Pivot;

class Favorite extends Pivot
{
    // Nama tabelnya
    protected $table = 'favorites';

    // Biar timestamps otomatis terisi
    public $incrementing = true;
}
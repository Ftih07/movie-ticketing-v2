<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Studio extends Model
{
    protected $guarded = ['id'];

    public function showtimes()
    {
        return $this->hasMany(Showtime::class);
    }
}

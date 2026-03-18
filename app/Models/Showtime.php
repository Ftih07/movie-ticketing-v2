<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Showtime extends Model
{
    protected $guarded = ['id'];

    public function movie()
    {
        return $this->belongsTo(Movie::class);
    }
    public function studio()
    {
        return $this->belongsTo(Studio::class);
    }
    public function bookings()
    {
        return $this->hasMany(Booking::class);
    }
}

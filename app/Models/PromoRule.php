<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PromoRule extends Model
{
    protected $fillable = [
        'promo_id',
        'rule_type',
        'rule_value'
    ];

    public function promo(): BelongsTo
    {
        return $this->belongsTo(Promo::class);
    }
}

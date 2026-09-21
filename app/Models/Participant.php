<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Participant extends Model
{
    protected $fillable = [
        'name',
        'phone',
        'email',
        'table_id',
        'doorprize_number',
        'registered_at',
    ];

    protected $casts = [
        'registered_at' => 'datetime',
    ];

    public function table(): BelongsTo
    {
        return $this->belongsTo(Table::class);
    }

    public function doorprizeNumber(): HasOne
    {
        return $this->hasOne(DoorprizeNumber::class, 'assigned_to');
    }

    public function winner(): HasOne
    {
        return $this->hasOne(Winner::class);
    }
}

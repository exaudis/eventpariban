<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Winner extends Model
{
    protected $fillable = [
        'participant_id',
        'prize_id',
        'doorprize_number',
        'drawn_at',
    ];

    protected $casts = [
        'drawn_at' => 'datetime',
    ];

    public function participant(): BelongsTo
    {
        return $this->belongsTo(Participant::class);
    }

    public function prize(): BelongsTo
    {
        return $this->belongsTo(Prize::class);
    }
}

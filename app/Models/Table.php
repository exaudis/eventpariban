<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Table extends Model
{
    protected $fillable = [
        'table_number',
        'qr_token',
        'status',
    ];

    public function participants(): HasMany
    {
        return $this->hasMany(Participant::class);
    }
}

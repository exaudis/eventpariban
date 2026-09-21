<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Prize extends Model
{
    protected $fillable = [
        'name',
        'description',
        'quantity',
        'status',
    ];

    public function winners(): HasMany
    {
        return $this->hasMany(Winner::class);
    }
}

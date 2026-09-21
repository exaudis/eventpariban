<?php

namespace Database\Seeders;

use App\Models\Table;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class TableSeeder extends Seeder
{
    public function run(): void
    {
        for ($i = 1; $i <= 20; $i++) {
            $tableNumber = str_pad($i, 2, '0', STR_PAD_LEFT);
            Table::firstOrCreate(
                ['table_number' => $tableNumber],
                [
                    'qr_token' => Str::random(16),
                    'status' => 'active',
                ]
            );
        }
    }
}

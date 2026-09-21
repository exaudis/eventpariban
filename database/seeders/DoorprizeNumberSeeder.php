<?php

namespace Database\Seeders;

use App\Models\DoorprizeNumber;
use Illuminate\Database\Seeder;

class DoorprizeNumberSeeder extends Seeder
{
    public function run(): void
    {
        for ($i = 1; $i <= 200; $i++) {
            $numberStr = str_pad($i, 3, '0', STR_PAD_LEFT);
            DoorprizeNumber::firstOrCreate(
                ['number' => $numberStr],
                [
                    'status' => 'available',
                    'assigned_to' => null,
                    'assigned_at' => null,
                ]
            );
        }
    }
}

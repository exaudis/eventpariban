<?php

namespace Database\Seeders;

use App\Models\Prize;
use Illuminate\Database\Seeder;

class PrizeSeeder extends Seeder
{
    public function run(): void
    {
        $prizes = [
            ['name' => 'Smartwatch Premium', 'description' => 'Hadiah Utama', 'quantity' => 1],
            ['name' => 'Bluetooth Speaker', 'description' => 'Hadiah Kedua', 'quantity' => 2],
            ['name' => 'TWS Wireless Earbuds', 'description' => 'Hadiah Ketiga', 'quantity' => 3],
            ['name' => 'Powerbank 20.000 mAh', 'description' => 'Hadiah Hiburan', 'quantity' => 5],
            ['name' => 'Voucher Belanja', 'description' => 'Hadiah Hiburan', 'quantity' => 10],
        ];

        foreach ($prizes as $prize) {
            Prize::firstOrCreate(
                ['name' => $prize['name']],
                [
                    'description' => $prize['description'],
                    'quantity' => $prize['quantity'],
                    'status' => 'active',
                ]
            );
        }
    }
}

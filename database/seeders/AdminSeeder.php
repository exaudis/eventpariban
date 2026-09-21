<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'admin@kedaipariban.com'],
            [
                'name' => 'Panitia Kedai Pariban',
                'password' => Hash::make('kedaipariban'),
                'email_verified_at' => now(),
            ]
        );
    }
}

<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'ramananathumingthierry@gmail.com'],
            [
                'pseudo' => 'RAMANANA Thu Ming Thierry',
                'email_verified_at' => now(),
                'status' => 'active',
                'contact' => '0327563770',
                'address' => 'VT 29 RAI Bis Ampahateza, Antananarivo 101',
                'role' => 'admin',
                'password' => Hash::make('Soleil@2026!'),
            ]
        );
    }
}

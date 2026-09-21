<?php

use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\DrawController;
use App\Http\Controllers\Admin\ParticipantController;
use App\Http\Controllers\Admin\QrCodeController;
use App\Http\Controllers\Admin\WinnerController;
use App\Http\Controllers\RegistrationController;
use Illuminate\Support\Facades\Route;

// Public Participant Flow
Route::get('/', function () {
    return redirect()->route('register');
});

Route::get('/register', [RegistrationController::class, 'create'])->name('register');
Route::post('/register', [RegistrationController::class, 'store'])
    ->middleware('throttle:10,1')
    ->name('register.store');
Route::get('/registration/success', [RegistrationController::class, 'success'])->name('registration.success');

// Admin Auth Routes
require __DIR__ . '/auth.php';

// Admin Panel Routes
Route::middleware('auth')->prefix('admin')->as('admin.')->group(function () {
    Route::get('/', function () {
        return redirect()->route('admin.dashboard');
    });

    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('/participants', [ParticipantController::class, 'index'])->name('participants');
    Route::get('/draw', [DrawController::class, 'index'])->name('draw');
    Route::post('/draw', [DrawController::class, 'draw'])->name('draw.process');
    Route::post('/draw/confirm', [DrawController::class, 'confirm'])->name('draw.confirm');
    Route::get('/winners', [WinnerController::class, 'index'])->name('winners');
    Route::get('/qrcodes', [QrCodeController::class, 'index'])->name('qrcodes');
});

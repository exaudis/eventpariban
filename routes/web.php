<?php

use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\DrawController;
use App\Http\Controllers\Admin\ParticipantController;
use App\Http\Controllers\Admin\PaymentController;
use App\Http\Controllers\Admin\PrizeController;
use App\Http\Controllers\Admin\NumberController;
use App\Http\Controllers\Admin\QrCodeController;
use App\Http\Controllers\Admin\WinnerController;
use App\Http\Controllers\RegistrationController;
use Illuminate\Support\Facades\Route;

// Public Participant Flow
Route::get('/', [RegistrationController::class, 'landing'])->name('landing');

Route::get('/register', [RegistrationController::class, 'landing'])->name('register');
Route::get('/register/data', [RegistrationController::class, 'create'])->name('register.form');
Route::post('/register', [RegistrationController::class, 'store'])
    ->middleware('throttle:10,1')
    ->name('register.store');
Route::get('/registration/success', [RegistrationController::class, 'success'])->name('registration.success');
Route::get('/payment/{token}', [RegistrationController::class, 'payment'])->name('payment.show');
Route::post('/payment/{token}', [RegistrationController::class, 'submitPayment'])->middleware('throttle:10,1')->name('payment.submit');

// Admin Auth Routes
require __DIR__ . '/auth.php';

// Admin Panel Routes
Route::middleware('auth')->prefix('admin')->as('admin.')->group(function () {
    Route::get('/', function () {
        return redirect()->route('admin.dashboard');
    });

    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('/participants', [ParticipantController::class, 'index'])->name('participants');
    Route::get('/payments', [PaymentController::class, 'index'])->name('payments');
    Route::get('/payments/{participant}/proof', [PaymentController::class, 'proof'])->name('payments.proof');
    Route::post('/payments/{participant}/approve', [PaymentController::class, 'approve'])->name('payments.approve');
    Route::post('/payments/{participant}/reject', [PaymentController::class, 'reject'])->name('payments.reject');
    Route::get('/prizes', [PrizeController::class, 'index'])->name('prizes');
    Route::post('/prizes', [PrizeController::class, 'store'])->name('prizes.store');
    Route::put('/prizes/{prize}', [PrizeController::class, 'update'])->name('prizes.update');
    Route::delete('/prizes/{prize}', [PrizeController::class, 'destroy'])->name('prizes.destroy');
    Route::get('/numbers', [NumberController::class, 'index'])->name('numbers');
    Route::post('/numbers', [NumberController::class, 'store'])->name('numbers.store');
    Route::delete('/numbers/{number}', [NumberController::class, 'destroy'])->name('numbers.destroy');
    Route::post('/reset', [NumberController::class, 'reset'])->name('reset');
    Route::get('/draw', [DrawController::class, 'index'])->name('draw');
    Route::post('/draw', [DrawController::class, 'draw'])->name('draw.process');
    Route::post('/draw/confirm', [DrawController::class, 'confirm'])->name('draw.confirm');
    Route::get('/winners', [WinnerController::class, 'index'])->name('winners');
    Route::get('/qrcodes', [QrCodeController::class, 'index'])->name('qrcodes');
});

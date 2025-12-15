<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\CostumeController;
use App\Http\Controllers\BookingController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);

Route::get('/costumes', [CostumeController::class, 'index']);
Route::get('/costumes/{id}', [CostumeController::class, 'show']);

Route::middleware('auth:api')->group(function () {
    Route::get('/auth/me', [AuthController::class, 'me']);

    Route::post('/bookings', [BookingController::class, 'store']);
    Route::get('/bookings', [BookingController::class, 'index']);
});

Route::middleware(['auth:api', 'admin'])->group(function () {
    Route::post('/costumes', [CostumeController::class, 'store']);
    Route::put('/costumes/{id}', [CostumeController::class, 'update']);
    Route::delete('/costumes/{id}', [CostumeController::class, 'destroy']);

    Route::get('/admin/bookings', [BookingController::class, 'adminIndex']);
    Route::put('/admin/bookings/{id}/status', [BookingController::class, 'updateStatus']);
});

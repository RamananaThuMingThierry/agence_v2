<?php

use App\Http\Controllers\Api\ActivityLogController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\SlideController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Support\Facades\Route;

Route::prefix('auth')->group(function () {
    Route::post('login', [AuthController::class, 'login']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::get('me', [AuthController::class, 'me']);
        Route::post('logout', [AuthController::class, 'logout']);
    });
});

Route::middleware(['auth:sanctum', 'admin'])->group(function () {
    Route::apiResource('activity-logs', ActivityLogController::class)->except(['destroy']);
    Route::delete('activity-logs/{activityLog}', [ActivityLogController::class, 'destroy']);

    Route::apiResource('slides', SlideController::class)->except(['destroy']);
    Route::delete('slides/{slide}', [SlideController::class, 'destroy']);
    Route::post('slides/{slide}/restore', [SlideController::class, 'restore']);
    Route::delete('slides/{slide}/force', [SlideController::class, 'forceDelete']);

    Route::apiResource('users', UserController::class)->except(['destroy']);
    Route::delete('users/{user}', [UserController::class, 'destroy']);
    Route::post('users/{user}/restore', [UserController::class, 'restore']);
    Route::delete('users/{user}/force', [UserController::class, 'forceDelete']);
});

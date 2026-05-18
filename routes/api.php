<?php

use App\Http\Controllers\Api\ActivityLogController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BookingController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\ContactFormController;
use App\Http\Controllers\Api\GalleryController;
use App\Http\Controllers\Api\PaymentMethodController;
use App\Http\Controllers\Api\PlatformSettingController;
use App\Http\Controllers\Api\SlideController;
use App\Http\Controllers\Api\TestimonialController;
use App\Http\Controllers\Api\TourController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Support\Facades\Route;

Route::prefix('auth')->group(function () {
    Route::post('login', [AuthController::class, 'login']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::get('me', [AuthController::class, 'me']);
        Route::post('logout', [AuthController::class, 'logout']);
        Route::delete('account', [AuthController::class, 'deleteAccount']);
    });
});

Route::get('public/testimonials', [TestimonialController::class, 'publicIndex']);
Route::get('public/slides', [SlideController::class, 'publicIndex']);
Route::get('public/galleries', [GalleryController::class, 'publicIndex']);
Route::get('public/galleries/{encryptedId}', [GalleryController::class, 'publicShow']);
Route::get('public/tours', [TourController::class, 'publicIndex']);
Route::get('public/tours/{encryptedId}', [TourController::class, 'publicShow']);
Route::post('public/tours/{encryptedId}/reviews', [TourController::class, 'publicStoreReview']);
Route::post('public/bookings', [BookingController::class, 'publicStore']);
Route::get('platform-settings', [PlatformSettingController::class, 'show']);

Route::middleware(['auth:sanctum', 'admin'])->group(function () {
    Route::put('platform-settings', [PlatformSettingController::class, 'update']);

    Route::apiResource('categories', CategoryController::class);
    Route::apiResource('bookings', BookingController::class)->only(['index', 'show', 'update', 'destroy']);
    Route::apiResource('contact-forms', ContactFormController::class)->only(['index', 'show', 'destroy']);
    Route::apiResource('galleries', GalleryController::class);
    Route::apiResource('payment-methods', PaymentMethodController::class)->except(['show']);
    Route::apiResource('testimonials', TestimonialController::class)->except(['destroy']);
    Route::delete('testimonials/{testimonial}', [TestimonialController::class, 'destroy']);
    Route::post('testimonials/{testimonial}/restore', [TestimonialController::class, 'restore']);
    Route::delete('testimonials/{testimonial}/force', [TestimonialController::class, 'forceDelete']);

    Route::apiResource('activity-logs', ActivityLogController::class)->except(['destroy']);
    Route::delete('activity-logs/{activityLog}', [ActivityLogController::class, 'destroy']);

    Route::apiResource('slides', SlideController::class)->except(['destroy']);
    Route::delete('slides/{slide}', [SlideController::class, 'destroy']);
    Route::post('slides/{slide}/restore', [SlideController::class, 'restore']);
    Route::delete('slides/{slide}/force', [SlideController::class, 'forceDelete']);

    Route::apiResource('tours', TourController::class)->except(['destroy']);
    Route::put('tours/{tour}/reviews/{review}', [TourController::class, 'updateReview']);
    Route::delete('tours/{tour}/reviews/{review}', [TourController::class, 'destroyReview']);
    Route::delete('tours/{tour}', [TourController::class, 'destroy']);
    Route::post('tours/{tour}/restore', [TourController::class, 'restore']);
    Route::delete('tours/{tour}/force', [TourController::class, 'forceDelete']);

    Route::apiResource('users', UserController::class)->except(['destroy']);
    Route::delete('users/{user}', [UserController::class, 'destroy']);
    Route::post('users/{user}/restore', [UserController::class, 'restore']);
    Route::delete('users/{user}/force', [UserController::class, 'forceDelete']);
});
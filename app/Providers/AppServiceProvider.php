<?php

namespace App\Providers;

use App\Interfaces\ActivityLogInterface;
use App\Interfaces\SlideInterface;
use App\Interfaces\UserInterface;
use App\Repositories\ActivityLogRepository;
use App\Repositories\SlideRepository;
use App\Repositories\UserRepository;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->bind(ActivityLogInterface::class, ActivityLogRepository::class);
        $this->app->bind(SlideInterface::class, SlideRepository::class);
        $this->app->bind(UserInterface::class, UserRepository::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}

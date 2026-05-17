<?php

namespace App\Providers;

use App\Interfaces\ActivityLogInterface;
use App\Interfaces\CategoryInterface;
use App\Interfaces\GalleryInterface;
use App\Interfaces\PlatformSettingInterface;
use App\Interfaces\SlideInterface;
use App\Interfaces\TestimonialInterface;
use App\Interfaces\TourInterface;
use App\Interfaces\UserInterface;
use App\Repositories\ActivityLogRepository;
use App\Repositories\CategoryRepository;
use App\Repositories\GalleryRepository;
use App\Repositories\PlatformSettingRepository;
use App\Repositories\SlideRepository;
use App\Repositories\TestimonialRepository;
use App\Repositories\TourRepository;
use App\Repositories\UserRepository;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(ActivityLogInterface::class, ActivityLogRepository::class);
        $this->app->bind(SlideInterface::class, SlideRepository::class);
        $this->app->bind(UserInterface::class, UserRepository::class);
        $this->app->bind(PlatformSettingInterface::class, PlatformSettingRepository::class);
        $this->app->bind(CategoryInterface::class, CategoryRepository::class);
        $this->app->bind(TestimonialInterface::class, TestimonialRepository::class);
        $this->app->bind(TourInterface::class, TourRepository::class);
        $this->app->bind(GalleryInterface::class, GalleryRepository::class);
    }

    public function boot(): void
    {
        //
    }
}

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('platform_videos', function (Blueprint $table) {
            $table->id();
            $table->string('title')->nullable();
            $table->text('description')->nullable();
            $table->string('source_type')->default('external');
            $table->string('video_url')->nullable();
            $table->string('video_path')->nullable();
            $table->string('thumbnail')->nullable();
            $table->string('placement')->default('home');
            $table->unsignedInteger('order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->foreignId('tour_id')->nullable()->constrained('tours')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['placement', 'is_active', 'order']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('platform_videos');
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('galleries', function (Blueprint $table) {
            $table->id();
            $table->string('title');                       // Titre de la galerie
            $table->string('subtitle')->nullable();                    // Sous-titre de la galerie
            $table->string('place')->nullable();
            $table->text('description')->nullable();
            $table->enum('status', ['draft', 'publish'])->default('publish');
            $table->foreignId('category_id')->constrained('categories')->onDelete('cascade');
            $table->foreignId('tour_id')->nullable()->constrained('tours')->nullOnDelete();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('galleries');
    }
};

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
        Schema::create('payment_methods', function (Blueprint $table) {
            $table->id();

            // Image (logo)
            $table->string('image')->nullable(); // path ou URL du logo

            // Identification
            $table->string('name'); // ex: Mvola
            $table->string('code')->unique(); // ex: mvola, orange_money, cash

            // Activation
            $table->boolean('is_active')->default(true);

            $table->timestamps();
            $table->index(['code', 'is_active']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payment_methods');
    }
};

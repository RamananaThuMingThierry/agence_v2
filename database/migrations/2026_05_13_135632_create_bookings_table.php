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
        Schema::create('bookings', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email');
            $table->string('phone')->nullable();
            $table->string('image')->nullable();
            $table->foreignId('tour_id')->constrained()->onDelete('cascade');
            $table->text('message')->nullable();
            $table->date('start_date');
            $table->date('end_date');
            $table->integer('number_of_people');
            $table->enum('status', ['booked', 'cancelled', 'completed'])->default('booked');
            $table->softDeletes();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bookings');
    }
};

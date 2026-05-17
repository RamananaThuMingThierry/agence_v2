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
        Schema::create('booking_payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('booking_id')->constrained('bookings')->onDelete('cascade');
            $table->foreignId('payment_method_id')->constrained('payment_methods')->onDelete('cascade');
            $table->decimal('amount', 10, 2);
            $table->enum('payment_type', ['deposit', 'installment', 'balance', 'adjustment'])->default('installment');
            $table->enum('status', ['pending', 'completed', 'failed'])->default('pending');
            $table->date('due_date')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->string('reference')->nullable();
            $table->text('note')->nullable();
            $table->unsignedInteger('sort_order')->default(1);
            $table->index(['booking_id', 'status']);
            $table->index(['booking_id', 'payment_type']);
            $table->index(['booking_id', 'sort_order']);
            $table->softDeletes();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('booking_payments');
    }
};

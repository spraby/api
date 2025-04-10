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
        Schema::create('orders', function (Blueprint $table) {
            $table->id()->primary();
            $table->string('name');
            $table->unsignedBigInteger('customer_id');
            $table->unsignedBigInteger('brand_id');
            $table->text('note')->nullable();
            $table->enum('status', ['pending', 'confirmed', 'processing', 'completed', 'cancelled', 'archived'])->default('pending');
            $table->enum('delivery_status', ['pending', 'packing', 'shipped', 'transit', 'delivered'])->default('pending');
            $table->enum('financial_status', ['unpaid', 'paid', 'partial_paid', 'refunded'])->default('unpaid');
            $table->timestamps();

            $table->foreign('customer_id')->references('id')->on('customers')->cascadeOnDelete()->cascadeOnUpdate();
            $table->foreign('brand_id')->references('id')->on('brands')->cascadeOnDelete()->cascadeOnUpdate();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};

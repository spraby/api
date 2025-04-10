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
        Schema::create('order_items', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('order_id');
            $table->uuid('product_id')->nullable();
            $table->uuid('variant_id')->nullable();
            $table->uuid('image_id')->nullable();
            $table->string('title');
            $table->string('variant_title');
            $table->text('description')->nullable();
            $table->integer('quantity');
            $table->decimal('price', 10, 2)->default(0);
            $table->decimal('final_price', 10, 2)->default(0);
            $table->timestamps();

            $table->foreign('order_id')->references('id')->on('orders')->cascadeOnDelete()->cascadeOnUpdate();
            $table->foreign('product_id')->references('id')->on('products')->nullOnDelete()->nullOnUpdate();
            $table->foreign('variant_id')->references('id')->on('variants')->nullOnDelete()->nullOnUpdate();
            $table->foreign('image_id')->references('id')->on('product_images')->nullOnDelete()->nullOnUpdate();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('order_items');
    }
};

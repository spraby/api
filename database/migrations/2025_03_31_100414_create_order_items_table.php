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
            $table->id()->primary();
            $table->unsignedBigInteger('order_id');
            $table->unsignedBigInteger('product_id')->nullable();
            $table->unsignedBigInteger('variant_id')->nullable();
            $table->unsignedBigInteger('image_id')->nullable();
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

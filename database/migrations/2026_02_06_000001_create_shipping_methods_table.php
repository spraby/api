<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('shipping_methods', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->string('name');
            $table->string('description')->nullable();
            $table->timestamps();
        });

        Schema::create('brand_shipping_method', function (Blueprint $table) {
            $table->unsignedBigInteger('brand_id');
            $table->unsignedBigInteger('shipping_method_id');
            $table->primary(['brand_id', 'shipping_method_id']);

            $table->foreign('brand_id')->references('id')->on('brands')->cascadeOnDelete();
            $table->foreign('shipping_method_id')->references('id')->on('shipping_methods')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('brand_shipping_method');
        Schema::dropIfExists('shipping_methods');
    }
};

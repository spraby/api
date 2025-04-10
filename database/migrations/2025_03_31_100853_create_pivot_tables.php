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
        Schema::create('brand_image', function (Blueprint $table) {
            $table->uuid('brand_id');
            $table->uuid('image_id');
            $table->primary(['brand_id', 'image_id']);

            $table->foreign('brand_id')->references('id')->on('brands')->cascadeOnDelete();
            $table->foreign('image_id')->references('id')->on('images')->cascadeOnDelete();
        });

        Schema::create('brand_category', function (Blueprint $table) {
            $table->uuid('brand_id');
            $table->uuid('category_id');
            $table->primary(['brand_id', 'category_id']);

            $table->foreign('brand_id')->references('id')->on('brands')->cascadeOnDelete();
            $table->foreign('category_id')->references('id')->on('categories')->cascadeOnDelete();
        });

        Schema::create('category_collection', function (Blueprint $table) {
            $table->uuid('category_id');
            $table->uuid('collection_id');
            $table->primary(['category_id', 'collection_id']);

            $table->foreign('category_id')->references('id')->on('categories')->cascadeOnDelete();
            $table->foreign('collection_id')->references('id')->on('collections')->cascadeOnDelete();
        });

        Schema::create('category_option', function (Blueprint $table) {
            $table->uuid('category_id');
            $table->uuid('option_id');
            $table->primary(['category_id', 'option_id']);

            $table->foreign('category_id')->references('id')->on('categories')->cascadeOnDelete();
            $table->foreign('option_id')->references('id')->on('options')->cascadeOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('brand_image');
        Schema::dropIfExists('brand_category');
        Schema::dropIfExists('category_collection');
        Schema::dropIfExists('category_option');
    }
};

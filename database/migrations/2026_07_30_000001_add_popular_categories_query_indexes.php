<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('product_statistics', function (Blueprint $table) {
            $table->index(
                ['created_at', 'product_id', 'type'],
                'product_statistics_popular_lookup_idx',
            );
        });

        Schema::table('products', function (Blueprint $table) {
            $table->index(
                ['enabled', 'category_id'],
                'products_enabled_category_idx',
            );
        });

        Schema::table('product_images', function (Blueprint $table) {
            $table->index(
                ['product_id', 'position'],
                'product_images_product_position_idx',
            );
        });
    }

    public function down(): void
    {
        Schema::table('product_images', function (Blueprint $table) {
            $table->dropIndex('product_images_product_position_idx');
        });

        Schema::table('products', function (Blueprint $table) {
            $table->dropIndex('products_enabled_category_idx');
        });

        Schema::table('product_statistics', function (Blueprint $table) {
            $table->dropIndex('product_statistics_popular_lookup_idx');
        });
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * CREATE INDEX CONCURRENTLY нельзя выполнять внутри транзакции,
     * поэтому миграция запускается вне её. Индексы обслуживают запрос
     * «Популярные категории» на главной странице витрины (store, SP-121).
     */
    public $withinTransaction = false;

    public function up(): void
    {
        DB::statement('CREATE INDEX CONCURRENTLY IF NOT EXISTS products_enabled_category_idx ON products (enabled, category_id)');
        DB::statement('CREATE INDEX CONCURRENTLY IF NOT EXISTS product_images_product_position_idx ON product_images (product_id, position)');
        DB::statement('CREATE INDEX CONCURRENTLY IF NOT EXISTS product_statistics_popular_lookup_idx ON product_statistics (created_at, product_id, type)');
    }

    public function down(): void
    {
        DB::statement('DROP INDEX CONCURRENTLY IF EXISTS products_enabled_category_idx');
        DB::statement('DROP INDEX CONCURRENTLY IF EXISTS product_images_product_position_idx');
        DB::statement('DROP INDEX CONCURRENTLY IF EXISTS product_statistics_popular_lookup_idx');
    }
};
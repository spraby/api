<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Eloquent заполняет created_at на уровне приложения, но витрина (store)
     * пишет в часть таблиц напрямую через Prisma и полагается на дефолт.
     * DEFAULT на уровне БД делает поведение одинаковым для всех клиентов,
     * а prisma db pull после этого сам генерирует @default(now()) в схеме.
     *
     * jobs и job_batches исключены: там created_at — integer (unix-время).
     * brand_requests не трогаем: дефолт уже установлен ранее.
     */
    private const TABLES = [
        'addresses',
        'audits',
        'brands',
        'categories',
        'category_request_items',
        'category_requests',
        'collections',
        'contacts',
        'customers',
        'email_messages',
        'images',
        'option_values',
        'options',
        'order_items',
        'order_shippings',
        'orders',
        'password_setup_tokens',
        'permissions',
        'product_images',
        'product_statistics',
        'products',
        'roles',
        'settings',
        'shipping_method_constructors',
        'shipping_methods',
        'users',
        'variant_values',
        'variants',
    ];

    public function up(): void
    {
        foreach (self::TABLES as $table) {
            DB::statement("ALTER TABLE {$table} ALTER COLUMN created_at SET DEFAULT CURRENT_TIMESTAMP");
        }
    }

    public function down(): void
    {
        foreach (self::TABLES as $table) {
            DB::statement("ALTER TABLE {$table} ALTER COLUMN created_at DROP DEFAULT");
        }
    }
};
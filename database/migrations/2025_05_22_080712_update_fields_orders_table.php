<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::statement("
            CREATE TYPE order_status AS ENUM (
                'pending',
                'confirmed',
                'processing',
                'completed',
                'cancelled',
                'archived'
            );
        ");
        DB::statement("
            CREATE TYPE delivery_status AS ENUM (
                'pending',
                'packing',
                'shipped',
                'transit',
                'delivered'
            );
        ");
        DB::statement("
            CREATE TYPE financial_status AS ENUM (
                'unpaid',
                'paid',
                'partial_paid',
                'refunded'
            );
        ");

        DB::statement("
            ALTER TABLE orders
              ALTER COLUMN status
                DROP DEFAULT,
              ALTER COLUMN status
                TYPE order_status
                USING status::order_status,
              ALTER COLUMN status
                SET DEFAULT 'pending';
        ");
        DB::statement("
            ALTER TABLE orders
              ALTER COLUMN delivery_status
                DROP DEFAULT,
              ALTER COLUMN delivery_status
                TYPE delivery_status
                USING delivery_status::delivery_status,
              ALTER COLUMN delivery_status
                SET DEFAULT 'pending';
        ");
        DB::statement("
            ALTER TABLE orders
              ALTER COLUMN financial_status
                DROP DEFAULT,
              ALTER COLUMN financial_status
                TYPE financial_status
                USING financial_status::financial_status,
              ALTER COLUMN financial_status
                SET DEFAULT 'unpaid';
        ");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement('
            ALTER TABLE orders
              ALTER COLUMN status
                DROP DEFAULT,
              ALTER COLUMN status
                TYPE varchar
                USING status::text;
        ');
        DB::statement('
            ALTER TABLE orders
              ALTER COLUMN delivery_status
                DROP DEFAULT,
              ALTER COLUMN delivery_status
                TYPE varchar
                USING delivery_status::text;
        ');
        DB::statement('
            ALTER TABLE orders
              ALTER COLUMN financial_status
                DROP DEFAULT,
              ALTER COLUMN financial_status
                TYPE varchar
                USING financial_status::text;
        ');

        DB::statement('DROP TYPE IF EXISTS order_status;');
        DB::statement('DROP TYPE IF EXISTS delivery_status;');
        DB::statement('DROP TYPE IF EXISTS financial_status;');
    }
};

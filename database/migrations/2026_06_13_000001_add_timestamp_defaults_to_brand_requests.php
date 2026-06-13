<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Guarantee created_at/updated_at are populated at the database level
     * so timestamps no longer depend on the writing client (Prisma/Eloquent/raw SQL).
     */
    public function up(): void
    {
        DB::statement('ALTER TABLE brand_requests ALTER COLUMN created_at SET DEFAULT CURRENT_TIMESTAMP');
        DB::statement('ALTER TABLE brand_requests ALTER COLUMN updated_at SET DEFAULT CURRENT_TIMESTAMP');

        // Backfill any existing rows that were inserted with NULL timestamps.
        DB::statement('UPDATE brand_requests SET created_at = COALESCE(created_at, CURRENT_TIMESTAMP), updated_at = COALESCE(updated_at, created_at, CURRENT_TIMESTAMP) WHERE created_at IS NULL OR updated_at IS NULL');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement('ALTER TABLE brand_requests ALTER COLUMN created_at DROP DEFAULT');
        DB::statement('ALTER TABLE brand_requests ALTER COLUMN updated_at DROP DEFAULT');
    }
};
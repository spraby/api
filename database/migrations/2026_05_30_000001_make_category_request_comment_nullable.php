<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement('ALTER TABLE category_requests ALTER COLUMN comment DROP NOT NULL');
    }

    public function down(): void
    {
        DB::table('category_requests')
            ->whereNull('comment')
            ->update(['comment' => '']);

        DB::statement('ALTER TABLE category_requests ALTER COLUMN comment SET NOT NULL');
    }
};

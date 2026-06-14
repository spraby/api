<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('brand_requests', function (Blueprint $table) {
            $table->timestamp('notified_at')->nullable()->after('rejected_at');
        });

        DB::table('brand_requests')
            ->whereNull('notified_at')
            ->update(['notified_at' => now()]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('brand_requests', function (Blueprint $table) {
            $table->dropColumn('notified_at');
        });
    }
};

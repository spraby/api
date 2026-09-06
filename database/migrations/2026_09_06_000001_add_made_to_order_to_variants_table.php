<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Статус «под заказ» задаётся для каждого варианта отдельно: разные
     * варианты одного товара могут отличаться по доступности.
     */
    public function up(): void
    {
        Schema::table('variants', function (Blueprint $table) {
            $table->boolean('is_made_to_order')->default(false)->after('enabled');
            // Срок необязателен даже у варианта «под заказ», поэтому nullable.
            $table->smallInteger('production_time_days')->nullable()->after('is_made_to_order');
        });
    }

    public function down(): void
    {
        Schema::table('variants', function (Blueprint $table) {
            $table->dropColumn(['is_made_to_order', 'production_time_days']);
        });
    }
};

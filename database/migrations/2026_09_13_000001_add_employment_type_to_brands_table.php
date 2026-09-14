<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Форма занятости продавца. Список значений продублирован здесь намеренно:
     * миграция фиксирует схему на момент выката и не должна ехать за
     * константой модели (Brand::EMPLOYMENT_TYPES).
     *
     * Поле необязательное — у существующих брендов и в заявке без ответа
     * остаётся null.
     */
    private const TYPES = [
        'craftsman',
        'self_employed',
        'sole_proprietor',
        'private_unitary_enterprise',
        'llc',
    ];

    public function up(): void
    {
        Schema::table('brands', function (Blueprint $table) {
            $table->enum('employment_type', self::TYPES)->nullable()->after('name');
        });

        Schema::table('brand_requests', function (Blueprint $table) {
            $table->enum('employment_type', self::TYPES)->nullable()->after('brand_name');
        });
    }

    public function down(): void
    {
        Schema::table('brands', function (Blueprint $table) {
            $table->dropColumn('employment_type');
        });

        Schema::table('brand_requests', function (Blueprint $table) {
            $table->dropColumn('employment_type');
        });
    }
};

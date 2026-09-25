<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Реквизиты продавца рядом с формой занятости (employment_type):
     *  - employment_name   — наименование бизнеса (ИП, ЧУП, ООО);
     *  - employment_number — УНП, в Беларуси он всегда из 9 символов.
     *
     * Оба поля необязательные: у существующих брендов и заявок остаются null.
     * В заявке они хранятся до одобрения, затем копируются в бренд.
     */
    public function up(): void
    {
        Schema::table('brands', function (Blueprint $table) {
            $table->string('employment_name')->nullable()->default(null)->after('employment_type');
            $table->string('employment_number', 9)->nullable()->default(null)->after('employment_name');
        });

        Schema::table('brand_requests', function (Blueprint $table) {
            $table->string('employment_name')->nullable()->default(null)->after('employment_type');
            $table->string('employment_number', 9)->nullable()->default(null)->after('employment_name');
        });
    }

    public function down(): void
    {
        Schema::table('brands', function (Blueprint $table) {
            $table->dropColumn(['employment_name', 'employment_number']);
        });

        Schema::table('brand_requests', function (Blueprint $table) {
            $table->dropColumn(['employment_name', 'employment_number']);
        });
    }
};

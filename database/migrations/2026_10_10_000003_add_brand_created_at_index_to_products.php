<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Postgres не индексирует внешние ключи сам. Оповещения менеджеров считают
     * товары бренда и ищут его последний товар — без индекса это проход
     * по всей таблице products на каждый бренд.
     */
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->index(['brand_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropIndex(['brand_id', 'created_at']);
        });
    }
};

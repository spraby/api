<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('order_shippings', function (Blueprint $table) {
            // Снапшот выбранного способа доставки на момент заказа:
            // история заказов не должна ломаться при удалении способа/конструктора,
            // поэтому FK — nullOnDelete, а название и поля покупателя дублируются.
            $table->foreignId('shipping_method_id')
                ->nullable()
                ->constrained('shipping_methods')
                ->nullOnDelete();
            $table->string('shipping_method_name')->nullable();
            $table->jsonb('customer_settings')->default(DB::raw("'[]'::jsonb"));
        });
    }

    public function down(): void
    {
        Schema::table('order_shippings', function (Blueprint $table) {
            $table->dropConstrainedForeignId('shipping_method_id');
            $table->dropColumn(['shipping_method_name', 'customer_settings']);
        });
    }
};

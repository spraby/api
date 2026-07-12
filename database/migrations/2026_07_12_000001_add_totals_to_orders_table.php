<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            // Финансовый снапшот заказа: считается сервером витрины при создании
            // и больше не меняется (кроме shipping_price — его может проставить
            // менеджер, когда стоимость «согласуется»). NULL во всех колонках —
            // старый заказ, для него тоталы вычисляются из order_items на лету.
            // shipping_price NULL при заполненных остальных — доставка согласуется:
            // total в этом случае не включает доставку.
            $table->decimal('subtotal', 10, 2)->nullable();
            $table->decimal('discount_total', 10, 2)->nullable();
            $table->decimal('shipping_price', 10, 2)->nullable();
            $table->decimal('total', 10, 2)->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['subtotal', 'discount_total', 'shipping_price', 'total']);
        });
    }
};

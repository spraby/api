<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Кардинальная смена подхода: старые данные не переносим.
        DB::table('brand_shipping_method')->delete();
        DB::table('shipping_methods')->delete();

        Schema::table('shipping_methods', function (Blueprint $table) {
            $table->dropColumn(['key', 'name', 'description']);
        });

        Schema::table('shipping_methods', function (Blueprint $table) {
            $table->foreignId('shipping_method_constructor_id')
                ->constrained('shipping_method_constructors')
                ->cascadeOnDelete();
            $table->jsonb('merchant_settings')->default(DB::raw("'[]'::jsonb"));
            $table->jsonb('customer_settings')->default(DB::raw("'[]'::jsonb"));
        });
    }

    public function down(): void
    {
        DB::table('brand_shipping_method')->delete();
        DB::table('shipping_methods')->delete();

        Schema::table('shipping_methods', function (Blueprint $table) {
            $table->dropConstrainedForeignId('shipping_method_constructor_id');
            $table->dropColumn(['merchant_settings', 'customer_settings']);
        });

        Schema::table('shipping_methods', function (Blueprint $table) {
            $table->string('key')->unique();
            $table->string('name');
            $table->string('description')->nullable();
        });
    }
};

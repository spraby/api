<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('shipping_method_constructors', function (Blueprint $table) {
            $table->id();
            // Неизменяемый ключ дефолтных конструкторов из сидера; у созданных
            // админом — null. Сидер матчится по нему, а не по редактируемому name.
            $table->string('key')->nullable()->unique();
            $table->string('name');
            $table->string('description')->nullable();
            $table->boolean('active')->default(false);
            $table->integer('position')->default(0);
            $table->jsonb('merchant_settings')->default(DB::raw('\'{"fields": []}\'::jsonb'));
            $table->jsonb('customer_settings')->default(DB::raw('\'{"fields": []}\'::jsonb'));
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('shipping_method_constructors');
    }
};

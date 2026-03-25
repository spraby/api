<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::dropIfExists('brand_settings');
    }

    public function down(): void
    {
        Schema::create('brand_settings', function ($table) {
            $table->id()->primary();
            $table->enum('type', ['delivery', 'refund', 'phones', 'emails', 'socials', 'addresses']);
            $table->jsonb('data')->default(DB::raw("'{}'::jsonb"));
            $table->unsignedBigInteger('brand_id');
            $table->timestamps();

            $table->foreign('brand_id')->references('id')->on('brands')->cascadeOnDelete()->cascadeOnUpdate();
            $table->unique(['type', 'brand_id']);
            $table->unique(['id', 'type', 'brand_id']);
        });
    }
};
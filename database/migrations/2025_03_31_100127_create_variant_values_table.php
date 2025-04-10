<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('variant_values', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('variant_id');
            $table->uuid('option_id');
            $table->uuid('option_value_id');
            $table->timestamps();

            $table->foreign('variant_id')->references('id')->on('variants')->cascadeOnDelete()->cascadeOnUpdate();
            $table->foreign('option_id')->references('id')->on('options')->cascadeOnDelete()->cascadeOnUpdate();
            $table->foreign('option_value_id')->references('id')->on('option_values')->cascadeOnDelete()->cascadeOnUpdate();

            $table->unique(['variant_id', 'option_id']);
            $table->unique(['variant_id', 'option_id', 'option_value_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('variant_values');
    }
};

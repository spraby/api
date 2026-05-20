<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('category_request_items', function (Blueprint $table) {
            $table->id()->primary();
            $table->unsignedBigInteger('category_request_id');
            $table->unsignedBigInteger('category_id');
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->text('rejection_reason')->nullable();
            $table->timestamps();

            $table->foreign('category_request_id')->references('id')->on('category_requests')->cascadeOnDelete();
            $table->foreign('category_id')->references('id')->on('categories')->cascadeOnDelete();

            $table->unique(['category_request_id', 'category_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('category_request_items');
    }
};

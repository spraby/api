<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('moderation_requests', function (Blueprint $table) {
            $table->id()->primary();
            $table->morphs('source');
            $table->string('type');
            $table->json('settings')->nullable();
            $table->string('status')->default('pending');
            $table->string('reason')->nullable();
            $table->unsignedBigInteger('reviewed_by')->nullable();
            $table->timestamp('reviewed_at')->nullable();
            $table->timestamp('created_at')->nullable()->useCurrent();
            $table->timestamp('updated_at')->nullable();

            $table->foreign('reviewed_by')->references('id')->on('users')->nullOnDelete();

            $table->index(['type', 'status']);
            $table->index(['status', 'created_at']);
            $table->index('reviewed_by');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('moderation_requests');
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('email_messages', function (Blueprint $table) {
            $table->id();

            $table->string('to_email');
            $table->string('to_name')->nullable();
            $table->string('from_email')->nullable();
            $table->string('from_name')->nullable();
            $table->string('reply_to')->nullable();

            $table->string('template_key');
            $table->string('subject');
            $table->jsonb('payload')->default(DB::raw("'{}'::jsonb"));
            $table->string('locale', 5)->default('ru');

            $table->string('status')->default('pending');
            $table->unsignedSmallInteger('attempts')->default(0);
            $table->unsignedSmallInteger('max_attempts')->default(3);
            $table->text('last_error')->nullable();

            $table->timestamp('scheduled_at')->useCurrent();
            $table->timestamp('sent_at')->nullable();

            $table->nullableMorphs('source');

            $table->timestamps();

            $table->index(['status', 'scheduled_at']);
            $table->index('template_key');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('email_messages');
    }
};
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->json('onboarding_skipped_steps')->nullable()->after('phone');
            $table->timestamp('onboarding_dismissed_at')->nullable()->after('onboarding_skipped_steps');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['onboarding_skipped_steps', 'onboarding_dismissed_at']);
        });
    }
};

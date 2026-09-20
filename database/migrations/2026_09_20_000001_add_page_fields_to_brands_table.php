<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Списки значений продублированы здесь намеренно: миграция фиксирует схему
     * на момент выката и не должна ехать за константами модели
     * (Brand::TYPES, Brand::PAGE_STATUSES).
     */
    private const TYPES = [
        'master',
        'business',
    ];

    private const PAGE_STATUSES = [
        'none',
        'draft',
        'pending',
        'published',
    ];

    public function up(): void
    {
        Schema::table('brands', function (Blueprint $table) {
            $table->enum('type', self::TYPES)->default('master');
            $table->string('domain')->nullable()->default(null);
            $table->enum('page_status', self::PAGE_STATUSES)->default('none');
            $table->timestamp('page_published_at')->nullable();

            $table->unique('domain');
            $table->index(['page_status', 'page_published_at']);
        });
    }

    public function down(): void
    {
        Schema::table('brands', function (Blueprint $table) {
            $table->dropIndex('brands_page_status_page_published_at_index');
            $table->dropUnique('brands_domain_unique');
            $table->dropColumn(['type', 'domain', 'page_status', 'page_published_at']);
        });
    }
};

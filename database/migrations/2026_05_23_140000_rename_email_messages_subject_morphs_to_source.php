<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasColumn('email_messages', 'subject_type')) {
            return;
        }

        Schema::table('email_messages', function (Blueprint $table) {
            $table->dropIndex('email_messages_subject_type_subject_id_index');
            $table->renameColumn('subject_type', 'source_type');
            $table->renameColumn('subject_id', 'source_id');
        });

        Schema::table('email_messages', function (Blueprint $table) {
            $table->index(['source_type', 'source_id'], 'email_messages_source_type_source_id_index');
        });
    }

    public function down(): void
    {
        if (! Schema::hasColumn('email_messages', 'source_type')) {
            return;
        }

        Schema::table('email_messages', function (Blueprint $table) {
            $table->dropIndex('email_messages_source_type_source_id_index');
            $table->renameColumn('source_type', 'subject_type');
            $table->renameColumn('source_id', 'subject_id');
        });

        Schema::table('email_messages', function (Blueprint $table) {
            $table->index(['subject_type', 'subject_id'], 'email_messages_subject_type_subject_id_index');
        });
    }
};

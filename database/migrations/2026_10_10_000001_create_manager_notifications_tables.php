<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Момент, когда менеджер задал пароль: от него считаются сроки оповещений.
        Schema::table('users', function (Blueprint $table) {
            $table->timestamp('password_set_at')->nullable();
        });

        // Виды оповещений. Логика выборки — в коде (по key), а conditions только
        // её параметризует: сроки, пороги, повторы.
        Schema::create('manager_notifications', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->string('name');
            $table->text('description')->nullable();
            $table->json('conditions');
            $table->unsignedTinyInteger('send_hour')->default(10);
            $table->boolean('enabled')->default(true);
            $table->timestamps();
        });

        // Какое оповещение, какому бренду и каким письмом ушло. anchor_at и
        // sequence — от какого события шёл отсчёт и какое это письмо в цикле;
        // по ним выборка понимает, что уже отправлено. У ручных отправок пусты.
        Schema::create('manager_notification_deliveries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('manager_notification_id')->constrained()->cascadeOnDelete();
            $table->foreignId('brand_id')->constrained()->cascadeOnDelete();
            // История отправок переживает удаление пользователя: иначе бренду,
            // переданному новому владельцу, «Первый товар» ушёл бы повторно.
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('email_message_id')->nullable()->constrained()->nullOnDelete();
            $table->string('trigger', 16);
            $table->foreignId('sent_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('anchor_at')->nullable();
            $table->unsignedInteger('sequence')->nullable();
            $table->timestamp('created_at')->useCurrent();

            // Повторный запуск крона не создаст второе письмо на то же событие.
            $table->unique(['manager_notification_id', 'brand_id', 'anchor_at', 'sequence'], 'mnd_unique_send');
            $table->index(['manager_notification_id', 'created_at']);
            $table->index(['brand_id', 'manager_notification_id']);
        });

        DB::table('manager_notifications')->insert([
            [
                'key' => 'first_product',
                'name' => 'Первый товар',
                'description' => 'Напоминание добавить первый товар, если после регистрации бренд так и не опубликовал ни одного.',
                'conditions' => json_encode([
                    'days_after_password_set' => 3,
                    'max_published_products' => 0,
                    'send_once' => true,
                ]),
                'send_hour' => 10,
                'enabled' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'key' => 'catalog_inactivity',
                'name' => 'Пополните каталог',
                'description' => 'Напоминание добавить новые работы, если бренд давно не добавлял товаров.',
                'conditions' => json_encode([
                    'min_products' => 1,
                    'min_published_products' => 1,
                    'count_drafts' => true,
                    'inactive_days' => 14,
                    'repeat_every_days' => 28,
                ]),
                'send_hour' => 10,
                'enabled' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('manager_notification_deliveries');
        Schema::dropIfExists('manager_notifications');

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('password_set_at');
        });
    }
};

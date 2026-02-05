<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('addresses', function (Blueprint $table) {
            $table->id();
            $table->string('name')->nullable();
            $table->string('country');
            $table->string('province')->nullable();
            $table->string('city');
            $table->string('zip_code')->nullable();
            $table->string('address1')->nullable();
            $table->string('address2')->nullable();
            $table->morphs('addressable');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('addresses');
    }
};
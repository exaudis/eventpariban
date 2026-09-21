<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('doorprize_numbers', function (Blueprint $table) {
            $table->id();
            $table->string('number')->unique();
            $table->enum('status', ['available', 'used'])->default('available');
            $table->foreignId('assigned_to')->nullable()->constrained('participants')->nullOnDelete();
            $table->timestamp('assigned_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('doorprize_numbers');
    }
};

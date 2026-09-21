<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('winners', function (Blueprint $table) {
            $table->id();
            $table->foreignId('participant_id')->constrained('participants')->onDelete('cascade');
            $table->foreignId('prize_id')->constrained('prizes')->onDelete('cascade');
            $table->string('doorprize_number');
            $table->timestamp('drawn_at');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('winners');
    }
};

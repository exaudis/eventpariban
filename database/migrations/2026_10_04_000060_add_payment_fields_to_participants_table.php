<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasColumn('participants', 'age')) {
            Schema::table('participants', function (Blueprint $table) {
                $table->integer('age')->nullable()->after('email');
            });
        }

        Schema::table('participants', function (Blueprint $table) {
            $table->uuid('payment_token')->nullable()->unique()->after('id');
            $table->string('payment_method')->nullable()->after('doorprize_number');
            $table->string('payment_status')->default('awaiting_payment')->after('payment_method');
            $table->unsignedInteger('payment_amount')->default(35000)->after('payment_status');
            $table->longText('payment_proof_data')->nullable()->after('payment_amount');
            $table->string('payment_proof_mime', 100)->nullable()->after('payment_proof_data');
            $table->timestamp('paid_at')->nullable()->after('payment_proof_mime');
        });
    }

    public function down(): void
    {
        Schema::table('participants', function (Blueprint $table) {
            $table->dropUnique(['payment_token']);
            $table->dropColumn(['payment_token', 'payment_method', 'payment_status', 'payment_amount', 'payment_proof_data', 'payment_proof_mime', 'paid_at']);
        });
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasColumn('participants', 'table_id')) {
            Schema::table('participants', function (Blueprint $table) {
                $table->dropForeign(['table_id']);
                $table->dropColumn('table_id');
            });
        }

        $now = now();
        $numbers = [];

        for ($i = 201; $i <= 500; $i++) {
            $numbers[] = [
                'number' => str_pad((string) $i, 3, '0', STR_PAD_LEFT),
                'status' => 'available',
                'assigned_to' => null,
                'assigned_at' => null,
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }

        DB::table('doorprize_numbers')->insertOrIgnore($numbers);
    }

    public function down(): void
    {
        $numbers = array_map(
            fn ($i) => str_pad((string) $i, 3, '0', STR_PAD_LEFT),
            range(201, 500)
        );

        DB::table('doorprize_numbers')->whereIn('number', $numbers)->where('status', 'available')->delete();

        if (!Schema::hasColumn('participants', 'table_id') && Schema::hasTable('tables')) {
            Schema::table('participants', function (Blueprint $table) {
                $table->foreignId('table_id')->nullable()->constrained('tables')->nullOnDelete();
            });
        }
    }
};

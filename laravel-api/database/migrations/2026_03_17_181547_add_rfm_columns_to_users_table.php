<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->unsignedTinyInteger('r_score')->nullable()->comment('Recency (1–5)');
            $table->unsignedTinyInteger('f_score')->nullable()->comment('Frequency (1–5)');
            $table->unsignedTinyInteger('m_score')->nullable()->comment('Monetary (1–5)');
            $table->string('rfm_segment')->nullable()->comment('RFM segment, e.g. "555"');
            $table->timestamp('rfm_calculated_at')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['r_score', 'f_score', 'm_score', 'rfm_segment', 'rfm_calculated_at']);
        });
    }
};

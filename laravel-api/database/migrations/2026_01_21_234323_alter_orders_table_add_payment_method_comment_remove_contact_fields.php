<?php


use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            // добавить
            $table->string('payment_method', 30)->after('user_id');
            $table->text('comment')->nullable()->after('payment_method');

            // удалить лишнее (если поля реально есть)
            if (Schema::hasColumn('orders', 'name')) $table->dropColumn('name');
            if (Schema::hasColumn('orders', 'phone')) $table->dropColumn('phone');
            if (Schema::hasColumn('orders', 'address')) $table->dropColumn('address');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            // вернуть удалённые поля
            $table->string('name')->nullable();
            $table->string('phone', 50)->nullable();
            $table->string('address')->nullable();

            // удалить добавленные
            $table->dropColumn(['payment_method', 'comment']);
        });
    }
};

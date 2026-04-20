<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Order;
use Carbon\Carbon;

class RfmTestDataSeeder extends Seeder
{
    /**
     * Конфигурация генерации: сегмент => [кол-во, распределение заказов]
     */
    private array $segments = [
        'champion'    => ['count' => 25, 'orders' => [15, 30], 'spent' => [50000, 200000]],
        'loyal'       => ['count' => 40, 'orders' => [8, 20], 'spent' => [15000, 80000]],
        'big_spender' => ['count' => 20, 'orders' => [5, 15], 'spent' => [100000, 500000]],
        'at_risk'     => ['count' => 35, 'orders' => [4, 12], 'spent' => [5000, 40000]],
        'lost'        => ['count' => 30, 'orders' => [1, 3], 'spent' => [1000, 10000]],
        'promising'   => ['count' => 25, 'orders' => [2, 6], 'spent' => [30000, 150000]],
        'regular'     => ['count' => 50, 'orders' => [2, 5], 'spent' => [3000, 20000]],
    ];

    public function run(): void
    {
        echo "🚀 Генерация тестовых данных для RFM...\n";

        // Очистка (опционально)
        // Order::truncate();
        // User::whereNotNull('rfm_segment')->delete();

        $totalUsers = 0;
        $totalOrders = 0;

        foreach ($this->segments as $segmentType => $config) {
            echo "  ├─ {$segmentType}: {$config['count']} пользователей...\n";
            
            for ($i = 0; $i < $config['count']; $i++) {
                $user = $this->createUserWithSegment($segmentType);
                $ordersCount = $this->createOrdersForUser($user, $config);
                
                $totalUsers++;
                $totalOrders += $ordersCount;
            }
        }

        // Добавим несколько пользователей без РФМ для проверки обработки
        User::factory()->count(10)->create();

        // Обновим timestamp пересчёта для всех
        User::whereNotNull('rfm_segment')->update(['rfm_calculated_at' => now()]);

        echo "✅ Готово!\n";
        echo "   • Пользователей с РФМ: {$totalUsers}\n";
        echo "   • Создано заказов: {$totalOrders}\n";
        echo "   • Пароль для всех: password123\n";
    }

    /**
     * Создание пользователя с нужным сегментом
     */
    private function createUserWithSegment(string $segment): User
    {
        return match ($segment) {
            'champion'    => User::factory()->champion()->create(),
            'loyal'       => User::factory()->loyal()->create(),
            'big_spender' => User::factory()->bigSpender()->create(),
            'at_risk'     => User::factory()->atRisk()->create(),
            'lost'        => User::factory()->lost()->create(),
            'promising'   => User::factory()->promising()->create(),
            'regular'     => User::factory()->regular()->create(),
            default       => User::factory()->randomRfm()->create(),
        };
    }

    /**
     * Генерация заказов для пользователя с учётом сегмента
     */
   /**
 * Генерация заказов для пользователя с учётом сегмента
 * АДАПТИРОВАНО под вашу схему orders
 */
private function createOrdersForUser(User $user, array $config): int
{
    [$minOrders, $maxOrders] = $config['orders'];
    [$minSpent, $maxSpent] = $config['spent'];
    
    $ordersCount = fake()->numberBetween($minOrders, $maxOrders);
    
    // Определяем "давность" последнего заказа на основе R-скор
    $rScore = $user->r_score ?? 3;
    $lastOrderDaysAgo = match ($rScore) {
        5 => fake()->numberBetween(0, 7),
        4 => fake()->numberBetween(8, 30),
        3 => fake()->numberBetween(31, 90),
        2 => fake()->numberBetween(91, 180),
        1 => fake()->numberBetween(181, 365),
        default => 90,
    };

    for ($i = 0; $i < $ordersCount; $i++) {
        $daysOffset = $lastOrderDaysAgo + fake()->numberBetween(0, $i * 15);
        $orderDate = Carbon::now()->subDays(min($daysOffset, 400));
        $paidDate = $orderDate->copy()->addHours(fake()->numberBetween(1, 72));
        $amount = fake()->randomFloat(2, $minSpent / $ordersCount, $maxSpent / max($ordersCount, 1));

        // ✅ Формируем данные под ВАШУ схему
        $orderData = [
            'user_id' => $user->id,
            // Вместо order_number используем префикс + id (уникальность обеспечит БД)
            // Или можно генерировать уникальный номер, если добавите колонку позже
            'grand_total' => round($amount, 2),
            'subtotal' => round($amount * 0.9, 2),
            'shipping' => round($amount * 0.1, 2),
            'total' => round($amount, 2),
            'status' => 'paid', // ✅ для RFM важны только оплаченные
            'payment_method' => fake()->randomElement(['card', 'cash', 'yookassa', 'sbp']),
            'comment' => fake()->optional(0.3)->sentence(),
            'created_at' => $orderDate,
            'updated_at' => $paidDate, // используем как "дата оплаты"
        ];

        Order::create($orderData);
    }

    return $ordersCount;
}
}
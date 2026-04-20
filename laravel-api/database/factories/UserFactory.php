<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class UserFactory extends Factory
{
    public function definition(): array
    {
        return [
            'name' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'email_verified_at' => now(),
            'password' => Hash::make('password123'),
            'remember_token' => Str::random(10),
            'created_at' => fake()->dateTimeBetween('-2 years', '-6 months'),
            'updated_at' => now(),
        ];
    }

    /**
     * Пользователь с заданными РФМ-параметрами
     */
    public function withRfm(int $r, int $f, int $m, string $segment = null, ?\Carbon\Carbon $calculatedAt = null): self
    {
        return $this->state(fn (array $attributes) => [
            'r_score' => $r,
            'f_score' => $f,
            'm_score' => $m,
            'rfm_segment' => $segment ?? "{$r}{$f}{$m}",
            'rfm_calculated_at' => $calculatedAt ?? now(),
        ]);
    }

    /**
     * Чемпион: 555, 554, 545, 455
     */
    public function champion(): self
    {
        $scores = [[5,5,5], [5,5,4], [5,4,5], [4,5,5]];
        [$r, $f, $m] = $scores[array_rand($scores)];
        return $this->withRfm($r, $f, $m);
    }

    /**
     * Лояльный: R>=4, F>=3
     */
    public function loyal(): self
    {
        $r = fake()->numberBetween(4, 5);
        $f = fake()->numberBetween(3, 5);
        $m = fake()->numberBetween(1, 5);
        return $this->withRfm($r, $f, $m);
    }

    /**
     * Крупный покупатель: F>=4, M>=4
     */
    public function bigSpender(): self
    {
        $r = fake()->numberBetween(1, 5);
        $f = fake()->numberBetween(4, 5);
        $m = fake()->numberBetween(4, 5);
        return $this->withRfm($r, $f, $m);
    }

    /**
     * Под угрозой: R<=2, F>=3
     */
    public function atRisk(): self
    {
        $r = fake()->numberBetween(1, 2);
        $f = fake()->numberBetween(3, 5);
        $m = fake()->numberBetween(1, 5);
        return $this->withRfm($r, $f, $m);
    }

    /**
     * Потерянный: R<=2, F<=2
     */
    public function lost(): self
    {
        $r = fake()->numberBetween(1, 2);
        $f = fake()->numberBetween(1, 2);
        $m = fake()->numberBetween(1, 5);
        return $this->withRfm($r, $f, $m);
    }

    /**
     * Перспективный: M>=4, R>=3
     */
    public function promising(): self
    {
        $r = fake()->numberBetween(3, 5);
        $f = fake()->numberBetween(1, 3);
        $m = fake()->numberBetween(4, 5);
        return $this->withRfm($r, $f, $m);
    }

    /**
     * Обычный: все остальные комбинации
     */
    public function regular(): self
    {
        $r = fake()->numberBetween(2, 4);
        $f = fake()->numberBetween(2, 3);
        $m = fake()->numberBetween(2, 3);
        return $this->withRfm($r, $f, $m);
    }

    /**
     * Случайный РФМ-профиль
     */
    public function randomRfm(): self
    {
        $r = fake()->numberBetween(1, 5);
        $f = fake()->numberBetween(1, 5);
        $m = fake()->numberBetween(1, 5);
        return $this->withRfm($r, $f, $m);
    }
}
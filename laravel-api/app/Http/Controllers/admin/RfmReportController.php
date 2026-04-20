<?php

namespace App\Http\Controllers\admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use Carbon\Carbon;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Log;

class RfmReportController extends Controller
{
    /**
     * Сводная аналитика
     */
    public function summary()
    {
        try {
            $totalUsers = User::whereNotNull('rfm_segment')->count();
            
            $avgScores = User::selectRaw('
                ROUND(AVG(r_score), 2) as r_avg,
                ROUND(AVG(f_score), 2) as f_avg,
                ROUND(AVG(m_score), 2) as m_avg
            ')
            ->whereNotNull('rfm_segment')
            ->first();
            
            // Распределение по сегментам (исправлены кавычки для MySQL)
            $segments = DB::table('users')
                ->selectRaw("
                    CASE 
                        WHEN rfm_segment LIKE '5__' THEN 'Champions'
                        WHEN rfm_segment LIKE '4__' THEN 'Loyal'
                        WHEN rfm_segment LIKE '_5_' THEN 'Frequent'
                        WHEN rfm_segment LIKE '__5' THEN 'Big Spenders'
                        WHEN r_score <= 2 AND f_score >= 3 THEN 'At Risk'
                        WHEN r_score <= 2 AND f_score <= 2 THEN 'Lost'
                        ELSE 'Other'
                    END as segment_group,
                    COUNT(*) as count
                ")
                ->whereNotNull('rfm_segment')
                ->groupBy('segment_group')
                ->get();
            
            // Топ-5 сегментов
            $topSegments = DB::table('users')
                ->selectRaw('rfm_segment, COUNT(*) as count')
                ->whereNotNull('rfm_segment')
                ->groupBy('rfm_segment')
                ->orderByDesc('count')
                ->limit(5)
                ->get();

            return response()->json([
                'total_users' => $totalUsers,
                'avg_scores' => $avgScores,
                'segments' => $segments,
                'top_segments' => $topSegments,
                'calculated_at' => User::max('rfm_calculated_at'),
            ]);
        } catch (\Exception $e) {
            \Log::error('RFM Summary Error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Ошибка при загрузке аналитики',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Пользователи с РФМ (пагинация)
     */
    public function usersWithRfm(Request $request)
    {
        try {
            $users = User::whereNotNull('rfm_segment')
                ->withCount(['orders' => function ($query) {
                    $query->where('status', 'paid');
                }])
                ->withSum(['orders' => function ($query) {
                    $query->where('status', 'paid');
                }], 'grand_total')
                ->orderByDesc('rfm_segment')
                ->paginate($request->get('per_page', 20));

            // Преобразуем коллекцию для совместимости с фронтендом
            $users->getCollection()->transform(function ($user) {
                $user->orders_sum_grand_total = $user->orders_sum_grand_total ?? 0;
                return $user;
            });

            return response()->json($users);
        } catch (\Exception $e) {
            \Log::error('RFM Users Error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Ошибка при загрузке пользователей',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Топ-чемпионы
     */
    public function topChampions()
    {
        try {
            $users = User::where('rfm_segment', 'LIKE', '55%')
                ->where('rfm_segment', '!=', '111')
                ->withCount(['orders' => function ($query) {
                    $query->where('status', 'paid');
                }])
                ->withSum(['orders' => function ($query) {
                    $query->where('status', 'paid');
                }], 'grand_total')
                ->orderByDesc('r_score')
                ->orderByDesc('m_score')
                ->limit(100)
                ->get(['id', 'name', 'email', 'r_score', 'f_score', 'm_score', 'rfm_segment', 'orders_count', 'orders_sum_grand_total']);

            return response()->json($users);
        } catch (\Exception $e) {
            \Log::error('RFM Champions Error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Ошибка при загрузке чемпионов',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Под угрозой оттока — ИСПРАВЛЕНО: f_score >= 3
     */
    public function atRiskCustomers()
    {
        try {
            $users = User::where('r_score', '<=', 2)
                ->where('f_score', '>=', 3)  // ✅ Исправлено: было >= 2
                ->whereNotNull('rfm_segment')
                ->withCount(['orders' => function ($query) {
                    $query->where('status', 'paid');
                }])
                ->withSum(['orders' => function ($query) {
                    $query->where('status', 'paid');
                }], 'grand_total')
                ->orderByDesc('r_score')
                ->get([
                    'id', 'name', 'email', 
                    'r_score', 'f_score', 'm_score', 
                    'rfm_segment', 'orders_count', 'orders_sum_grand_total'
                ]);

            return response()->json($users);
        } catch (\Exception $e) {
            \Log::error('RFM At-Risk Error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Ошибка при загрузке пользователей под угрозой',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }







     public function recalculate(Request $request)
    {
        try {
            // Опционально: проверка прав (если не покрыто middleware)
            // if (!auth('admin')->user()?->isSuperAdmin()) {
            //     return response()->json(['message' => 'Доступ запрещён'], 403);
            // }

            $date = $request->input('date'); // опционально: "2024-01-15"
            
            // Формируем команду
            $command = 'rfm:calculate';
            $parameters = $date ? ['--date' => $date] : [];

            // Запускаем команду и получаем вывод
            $exitCode = Artisan::call($command, $parameters);
            $output = Artisan::output();

            if ($exitCode !== 0) {
                Log::error('RFM Recalculation failed', [
                    'exit_code' => $exitCode,
                    'output' => $output,
                    'params' => $parameters
                ]);
                
                return response()->json([
                    'success' => false,
                    'message' => 'Ошибка при пересчёте РФМ',
                    'details' => config('app.debug') ? trim($output) : null
                ], 500);
            }

            // Парсим полезную информацию из вывода команды
            $elapsed = preg_match('/updated in ([\d.]+) ms/', $output, $matches) 
                ? (float) $matches[1] 
                : null;

            return response()->json([
                'success' => true,
                'message' => 'РФМ-скоринг пересчитан',
                'elapsed_ms' => $elapsed,
                'calculated_at' => Carbon::now(),
                'output' => config('app.debug') ? trim($output) : null
            ]);

        } catch (\Throwable $e) {
            Log::error('RFM Recalculate Exception: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Внутренняя ошибка сервера',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }
}
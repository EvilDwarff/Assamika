<?php

namespace App\Services;

use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use App\Models\User;

class RfmCalculator
{
    protected $referenceDate;

    public function __construct(?Carbon $referenceDate = null)
    {
        $this->referenceDate = $referenceDate ?? Carbon::now();
    }

   public function calculateForAllUsers(): void
{
    $now = $this->referenceDate->copy();

    $rfmRaw = DB::table('orders')
        ->where('orders.status', 'paid')
        ->whereNotNull('orders.created_at')
        ->groupBy('orders.user_id')
        ->select([
            'orders.user_id',
            DB::raw('DATEDIFF(?, MAX(orders.created_at)) as recency'),
            DB::raw('COUNT(*) as frequency'),
            DB::raw('SUM(orders.grand_total) as monetary'),
        ])
        ->addBinding($now, 'select')  
        ->get();

    if ($rfmRaw->isEmpty()) {
        return;
    }

    $rBoundaries = $this->getBoundaries(collect($rfmRaw)->pluck('recency'));
    $fBoundaries = $this->getBoundaries(collect($rfmRaw)->pluck('frequency'));
    $mBoundaries = $this->getBoundaries(collect($rfmRaw)->pluck('monetary'));

    foreach ($rfmRaw as $row) {
        $r = $this->scoreFromBoundaries($row->recency, $rBoundaries, ascending: false);
        $f = $this->scoreFromBoundaries($row->frequency, $fBoundaries, ascending: true);
        $m = $this->scoreFromBoundaries($row->monetary, $mBoundaries, ascending: true);
        $segment = "{$r}{$f}{$m}";

        User::where('id', $row->user_id)->update([
            'r_score' => $r,
            'f_score' => $f,
            'm_score' => $m,
            'rfm_segment' => $segment,
            'rfm_calculated_at' => $now,
        ]);
    }
}

    protected function getBoundaries($values, int $n = 5): array
    {
        if ($values->isEmpty()) return array_fill(0, $n, 0);

        $sorted = $values->sort()->values();
        $count = $sorted->count();

        $boundaries = [];
        for ($i = 1; $i < $n; $i++) {
            $index = ($i * $count) / $n;
            $lower = (int) floor($index);
            $upper = min((int) ceil($index), $count - 1);

            $val = $sorted[$lower] + ($sorted[$upper] - $sorted[$lower]) * ($index - $lower);
            $boundaries[] = $val;
        }

        return $boundaries; // [p20, p40, p60, p80]
    }

    protected function scoreFromBoundaries($value, array $boundaries, bool $ascending): int
    {
        // $boundaries = [t20, t40, t60, t80]
        // ascending: больше → выше балл
        // descending: меньше → выше балл

        if ($ascending) {
            if ($value <= $boundaries[0]) return 1;
            if ($value <= $boundaries[1]) return 2;
            if ($value <= $boundaries[2]) return 3;
            if ($value <= $boundaries[3]) return 4;
            return 5;
        } else {
            // Recency: чем меньше — тем лучше
            if ($value <= $boundaries[0]) return 5;
            if ($value <= $boundaries[1]) return 4;
            if ($value <= $boundaries[2]) return 3;
            if ($value <= $boundaries[3]) return 2;
            return 1;
        }
    }
}

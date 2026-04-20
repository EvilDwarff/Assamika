<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\RfmCalculator;
use Carbon\Carbon;

class CalculateRfmScores extends Command
{
    protected $signature = 'rfm:calculate {--date= : Reference date in format "Y-m-d"}';
    protected $description = 'Calculate and store RFM scores for all users';

    public function handle()
    {
        $dateStr = $this->option('date');
        $date = $dateStr ? Carbon::parse($dateStr) : Carbon::now();

        $this->info("Starting RFM calculation for {$date->toDateString()}...");

        $startTime = hrtime(true);
        (new RfmCalculator($date))->calculateForAllUsers();
        $elapsed = (hrtime(true) - $startTime) / 1_000_000; // ms

        $this->info("RFM scores updated in " . number_format($elapsed, 2) . ' ms');
        return 0;
    }
}

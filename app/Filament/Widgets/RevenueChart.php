<?php

namespace App\Filament\Widgets;

use App\Models\Booking;
use Filament\Widgets\ChartWidget;
use Carbon\Carbon;

class RevenueChart extends ChartWidget
{
    // Hapus kata 'static', cukup 'protected ?string' saja
    protected ?string $heading = 'Tren Pendapatan';
    protected static ?int $sort = 2; // Taruh di bawah Stats Overview

    // --- Tambahan 1: Bikin Chart Jadi Full Width ---
    protected int | string | array $columnSpan = 'full';

    // --- Tambahan 2: Definisikan Judul Dinamis berdasarkan Filter ---
    public function getHeading(): string
    {
        return match ($this->filter) {
            'today' => 'Tren Pendapatan (7 Hari Terakhir)',
            'month' => 'Tren Pendapatan Bulanan (Tahun Ini)',
            'year' => 'Tren Pendapatan Tahunan (5 Tahun Terakhir)',
            default => 'Tren Pendapatan',
        };
    }

    // --- Tambahan 3: Definisikan Pilihan Filter ---
    protected function getFilters(): ?array
    {
        return [
            'today' => 'Hari Ini (7 Hari Terakhir)',
            'month' => 'Bulan Ini (Tahun Ini)',
            'year' => 'Tahun Ini (5 Tahun Terakhir)',
        ];
    }

    // --- Tambahan 4: Atur Default Filter yang Aktif ---
    public function getDefaultFilter(): ?string
    {
        return 'today'; // Default-nya nampilin yang harian
    }

    protected function getData(): array
    {
        $activeFilter = $this->filter;
        $data = [];
        $labels = [];

        // --- Tambahan 5: Logika Data Berdasarkan Filter ---
        if ($activeFilter === 'today' || $activeFilter === null) {
            // Logika Harian (Bawaan awal, 7 hari terakhir)
            for ($i = 6; $i >= 0; $i--) {
                $date = Carbon::today()->subDays($i);
                $labels[] = $date->format('d M');

                // Ambil total amount per hari (casting ke float biar aman)
                $dailyRevenue = (float) Booking::whereDate('created_at', $date)->sum('total_amount');
                $data[] = $dailyRevenue;
            }
        } elseif ($activeFilter === 'month') {
            // Logika Bulanan (Bulan 1 sampai Bulan 12 di Tahun Ini)
            $startOfYear = Carbon::now()->startOfYear();
            for ($i = 0; $i < 12; $i++) {
                $monthDate = (clone $startOfYear)->addMonths($i);
                $labels[] = $monthDate->format('M Y');

                // Ambil total amount per bulan penuh
                $monthlyRevenue = (float) Booking::whereBetween('created_at', [
                    $monthDate->copy()->startOfMonth(),
                    $monthDate->copy()->endOfMonth()
                ])->sum('total_amount');
                $data[] = $monthlyRevenue;
            }
        } elseif ($activeFilter === 'year') {
            // Logika Tahunan (5 Tahun ke Belakang inklusif tahun ini)
            for ($i = 4; $i >= 0; $i--) {
                $yearDate = Carbon::now()->subYears($i);
                $labels[] = $yearDate->format('Y');

                // Ambil total amount per tahun penuh
                $yearlyRevenue = (float) Booking::whereBetween('created_at', [
                    $yearDate->copy()->startOfYear(),
                    $yearDate->copy()->endOfYear()
                ])->sum('total_amount');
                $data[] = $yearlyRevenue;
            }
        }

        return [
            'datasets' => [
                [
                    'label' => 'Pendapatan (Rp)',
                    'data' => $data,
                    'fill' => 'start',
                    'borderColor' => 'rgb(255, 99, 132)', // Kasih warna biar cakep
                    'backgroundColor' => 'rgba(255, 99, 132, 0.2)', // Kasih background fill
                ],
            ],
            'labels' => $labels,
        ];
    }

    protected function getType(): string
    {
        return 'line'; // Tetap line chart
    }
}

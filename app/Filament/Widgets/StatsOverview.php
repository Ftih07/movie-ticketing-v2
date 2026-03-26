<?php

namespace App\Filament\Widgets;

use App\Models\Booking;
use App\Models\Ticket;
use App\Models\Showtime;
use App\Models\User;
use Filament\Widgets\StatsOverviewWidget as BaseWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;
use Carbon\Carbon;

class StatsOverview extends BaseWidget
{
    protected static ?int $sort = 1; // Taruh paling atas

    protected function getStats(): array
    {
        $today = Carbon::today();

        // Hitung Omset Hari Ini (Misal status booking-nya 'paid' atau 'success')
        $revenueToday = Booking::whereDate('created_at', $today)
            // ->where('status', 'paid') // Buka komen ini kalau ada filter status
            ->sum('total_amount');

        // Hitung Tiket Terjual Hari Ini
        $ticketsToday = Ticket::whereDate('created_at', $today)->count();

        // Hitung Jadwal Tayang Hari Ini
        $showtimesToday = Showtime::whereDate('show_date', $today)->count();

        return [
            Stat::make('Omset Hari Ini', 'Rp ' . number_format($revenueToday, 0, ',', '.'))
                ->description('Total pendapatan hari ini')
                ->descriptionIcon('heroicon-m-arrow-trending-up')
                ->color('success'),

            Stat::make('Tiket Terjual (Hari Ini)', $ticketsToday)
                ->description('Total tiket di-*issue*')
                ->descriptionIcon('heroicon-m-ticket')
                ->color('warning'),

            Stat::make('Jadwal Tayang (Hari Ini)', $showtimesToday)
                ->description('Total sesi film')
                ->descriptionIcon('heroicon-m-video-camera')
                ->color('primary'),
        ];
    }
}

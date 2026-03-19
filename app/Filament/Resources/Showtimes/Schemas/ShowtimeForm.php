<?php

namespace App\Filament\Resources\Showtimes\Schemas;

use Filament\Forms\Components\DatePicker;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\TimePicker;
use Filament\Schemas\Schema;

class ShowtimeForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Select::make('movie_id')
                    ->relationship('movie', 'title')
                    ->required()
                    ->searchable()
                    ->preload()
                    ->columnSpan(1),

                Select::make('studio_id')
                    ->relationship('studio', 'name')
                    ->required()
                    ->searchable()
                    ->preload()
                    ->columnSpan(1),

                DatePicker::make('show_date')
                    ->required()
                    ->minDate(now()) // BEST PRACTICE 1: Nggak bisa milih tanggal kemarin! Masa iya jual tiket masa lalu?
                    ->native(false) // Bikin UI kalendernya lebih cakep ala Filament, bukan bawaan browser
                    ->columnSpanFull(),

                TimePicker::make('start_time')
                    ->required()
                    ->seconds(false) // BEST PRACTICE 2: Ilangin detik. Bioskop cuma butuh Jam & Menit (misal: 14:30)
                    ->displayFormat('H:i')
                    ->columnSpan(1),

                TimePicker::make('end_time')
                    ->required()
                    ->seconds(false)
                    ->displayFormat('H:i')
                    ->after('start_time') // BEST PRACTICE 3: Ini kunciannya! Jam selesai WAJIB setelah jam mulai
                    ->validationMessages([
                        'after' => 'Jam selesai nggak boleh lebih awal dari jam mulai, boss!', // Custom pesan error
                    ])
                    ->columnSpan(1),

                TextInput::make('price')
                    ->required()
                    ->numeric()
                    ->prefix('Rp')
                    ->step(5000) // BEST PRACTICE 4: Bikin tombol panah naik-turun kelipatan 5.000 (biar ga ada harga 32.145)
                    ->columnSpanFull(),
            ]);
    }
}

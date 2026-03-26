<?php

namespace App\Filament\Resources\Showtimes\Schemas;

use Filament\Forms\Components\DatePicker;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\TimePicker;
use Filament\Schemas\Schema;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Components\Grid;

class ShowtimeForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Grid::make(1)->schema([ // Pakai 1 kolom utama biar ke tengah

                    Section::make('Informasi Tayang')->schema([
                        Select::make('movie_id')
                            ->label('Pilih Film')
                            ->relationship('movie', 'title')
                            ->required()
                            ->searchable()
                            ->preload()
                            ->columnSpan(1),

                        Select::make('studio_id')
                            ->label('Pilih Studio')
                            ->relationship('studio', 'name')
                            ->required()
                            ->searchable()
                            ->preload()
                            ->columnSpan(1),
                    ])->columns(2), // Dibagi 2 kiri-kanan untuk Film & Studio

                    Section::make('Jadwal & Harga')->schema([
                        DatePicker::make('show_date')
                            ->label('Tanggal Tayang')
                            ->required()
                            ->minDate(now())
                            ->native(false)
                            ->columnSpanFull(),

                        Grid::make(2)->schema([ // Bikin grid lagi khusus buat Jam
                            TimePicker::make('start_time')
                                ->label('Jam Mulai')
                                ->required()
                                ->seconds(false)
                                ->displayFormat('H:i')
                                ->prefixIcon('heroicon-o-clock'), // Tambah icon

                            TimePicker::make('end_time')
                                ->label('Jam Selesai')
                                ->required()
                                ->seconds(false)
                                ->displayFormat('H:i')
                                ->after('start_time')
                                ->validationMessages([
                                    'after' => 'Jam selesai nggak boleh mendahului jam mulai!',
                                ])
                                ->prefixIcon('heroicon-o-clock'),
                        ]),

                        TextInput::make('price')
                            ->label('Harga Tiket (Per Kursi)')
                            ->required()
                            ->numeric()
                            ->prefix('Rp')
                            ->step(5000)
                            ->columnSpanFull(),
                    ]),
                ])->columnSpan('lg'), // Biar formnya nggak terlalu melebar (centered)
            ]);
    }
}

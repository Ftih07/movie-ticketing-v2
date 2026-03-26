<?php

namespace App\Filament\Resources\Movies\Schemas;

use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Textarea;
use Filament\Schemas\Components\Grid;
use Filament\Schemas\Components\Group;
use Filament\Schemas\Components\Section; 
use Filament\Schemas\Schema;
use Filament\Schemas\Components\Utilities\Set;
use Illuminate\Support\Str;

class MovieForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Grid::make(3)->schema([

                    // KOLOM KIRI (Porsi 2/3)
                    Group::make()->schema([
                        Section::make('Informasi Utama')->schema([
                            TextInput::make('title')
                                ->label('Judul Film')
                                ->required()
                                ->live(onBlur: true)
                                ->afterStateUpdated(fn($set, ?string $state) => $set('slug', Str::slug($state))),

                            TextInput::make('slug')
                                ->required()
                                ->unique(ignoreRecord: true)
                                ->readOnly()
                                ->helperText('Slug otomatis di-generate dari Judul Film.')
                                ->prefix('url/movies/'),

                            Textarea::make('description')
                                ->label('Sinopsis / Deskripsi')
                                ->default(null)
                                ->rows(5)
                                ->columnSpanFull(),
                        ])->columns(2), // Dibagi 2 kolom di dalam section ini

                        Section::make('Kru & Pemeran')->schema([
                            TextInput::make('director')
                                ->label('Sutradara')
                                ->placeholder('Nama sutradara...'),

                            TextInput::make('writer')
                                ->label('Penulis')
                                ->placeholder('Nama penulis film...'),

                            TextInput::make('producer')
                                ->label('Produser')
                                ->placeholder('Nama produser film...'),

                            TextInput::make('production_company')
                                ->label('Rumah Produksi')
                                ->placeholder('Perusahaan produksi...'),

                            TextInput::make('cast')
                                ->label('Pemeran / Cast')
                                ->placeholder('Contoh: Keanu Reeves, Laurence Fishburne...')
                                ->helperText('Pisahkan nama pemeran dengan koma.')
                                ->columnSpanFull(),
                        ])->columns(2),
                    ])->columnSpan(['lg' => 2]),

                    // KOLOM KANAN (Porsi 1/3)
                    Group::make()->schema([
                        Section::make('Media & Spesifikasi')->schema([
                            FileUpload::make('poster')
                                ->label('Poster Film')
                                ->image()
                                ->directory('movie-posters')
                                ->disk('public')
                                ->imageEditor() // Tambahan fitur biar admin bisa nge-crop gambar
                                ->columnSpanFull(),

                            TextInput::make('trailer_url')
                                ->label('YouTube Trailer URL')
                                ->url()
                                ->placeholder('https://www.youtube.com/watch?v=...')
                                ->columnSpanFull(),

                            Select::make('categories')
                                ->label('Genre / Kategori')
                                ->multiple()
                                ->relationship('categories', 'name')
                                ->preload()
                                ->searchable()
                                ->columnSpanFull(),

                            TextInput::make('duration')
                                ->label('Durasi')
                                ->required()
                                ->numeric()
                                ->suffix('Menit'),

                            Select::make('age')
                                ->label('Rating Usia')
                                ->options([
                                    'SU' => 'Semua Umur (SU)',
                                    '13+' => 'Remaja (13+)',
                                    '17+' => 'Dewasa (17+)',
                                    '21+' => 'Dewasa Khusus (21+)',
                                ])
                                ->required(),
                        ]),
                    ])->columnSpan(['lg' => 1]),

                ])->columnSpanFull() // <--- INI KUNCI FIX-NYA BIAR FULL WIDTH
            ]);
    }
}

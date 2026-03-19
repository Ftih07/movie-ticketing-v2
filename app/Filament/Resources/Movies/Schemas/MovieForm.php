<?php

namespace App\Filament\Resources\Movies\Schemas;

use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Textarea;
use Filament\Schemas\Schema;
use Filament\Schemas\Components\Utilities\Set;
use Illuminate\Support\Str; // <-- Tambahkan ini untuk fungsi helper pembuat slug

class MovieForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextInput::make('title')
                    ->required()
                    ->live(onBlur: true) // Mantau inputan, trigger saat user selesai ngetik (pindah kolom)
                    ->afterStateUpdated(fn($set, ?string $state) => $set('slug', Str::slug($state))),

                TextInput::make('slug')
                    ->required()
                    ->unique(ignoreRecord: true) // Biar ngga error pas update data
                    ->readOnly() // Bikin jadi preview aja, ngga bisa diedit manual biar aman
                    ->helperText('Slug otomatis di-generate dari Judul Film dan digunakan untuk URL.') // Info tambahan di bawah input
                    ->prefix('yvezh.my.id/movies/'), // Bikin visual preview-nya makin keren!

                TextInput::make('duration')
                    ->required()
                    ->numeric()
                    ->suffix('Menit'), // Tambahan visual biar jelas satuannya

                Textarea::make('description')
                    ->default(null)
                    ->columnSpanFull(),

                FileUpload::make('poster')
                    ->image()
                    ->directory('movie-posters')
                    ->disk('public')
                    ->columnSpanFull(),

                Select::make('categories')
                    ->multiple()
                    ->relationship('categories', 'name')
                    ->preload()
                    ->searchable()
                    ->columnSpanFull(),
            ]);
    }
}

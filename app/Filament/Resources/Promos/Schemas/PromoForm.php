<?php

namespace App\Filament\Resources\Promos\Schemas;

use Filament\Forms\Components\Toggle;
use Filament\Forms\Components\DateTimePicker;
use Filament\Forms\Components\Repeater;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Components\Utilities\Get;
use Filament\Schemas\Schema;

class PromoForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Section::make('Detail Promo')->schema([
                    TextInput::make('name')->required(),
                    TextInput::make('code')
                        ->unique(ignoreRecord: true)
                        ->helperText('Kosongkan jika ini adalah promo otomatis (Auto-Apply)'),
                    Textarea::make('description')->columnSpanFull(),

                    Select::make('discount_type')
                        ->options([
                            'fixed' => 'Potongan Harga (Rp)',
                            'percentage' => 'Persentase (%)',
                        ])->required()->reactive(),

                    TextInput::make('discount_value')->numeric()->required(),
                    TextInput::make('max_discount')
                        ->numeric()
                        ->visible(fn(Get $get) => $get('discount_type') === 'percentage'),

                    DateTimePicker::make('start_date')->required(),
                    DateTimePicker::make('end_date')->required(),
                    TextInput::make('quota')->numeric(),
                    Toggle::make('is_active')->default(true),
                ])->columns(2),

                // INI BAGIAN RULE ENGINE-NYA
                Section::make('Syarat & Ketentuan (Rules)')->schema([
                    Repeater::make('rules')
                        ->relationship() // Langsung nyambung ke relasi hasMany di Model Promo
                        ->schema([
                            Select::make('rule_type')
                                ->options([
                                    'min_purchase_amount' => 'Minimal Belanja (Rp)',
                                    'min_ticket_qty' => 'Minimal Jumlah Tiket',
                                    'specific_day' => 'Hari Tertentu (e.g., Saturday)',
                                ])->required(),
                            TextInput::make('rule_value')
                                ->required()
                                ->helperText('Masukkan nilai syarat (misal: 100000 atau 2)'),
                        ])->columns(2)
                ])
            ]);
    }
}

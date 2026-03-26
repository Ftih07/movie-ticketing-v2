<?php

namespace App\Filament\Resources\Studios;

use App\Filament\Resources\Studios\Pages\CreateStudio;
use App\Filament\Resources\Studios\Pages\EditStudio;
use App\Filament\Resources\Studios\Pages\ListStudios;
use App\Filament\Resources\Studios\Schemas\StudioForm;
use App\Filament\Resources\Studios\Tables\StudiosTable;
use App\Models\Studio;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;

class StudioResource extends Resource
{
    protected static ?string $model = Studio::class;

    protected static string | \UnitEnum | null $navigationGroup = 'Cinema Management';
    protected static  string| \BackedEnum|null  $navigationIcon = 'heroicon-o-video-camera';
    protected static ?int $navigationSort = 3;

    protected static ?string $recordTitleAttribute = 'name';

    public static function form(Schema $schema): Schema
    {
        return StudioForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return StudiosTable::configure($table);
    }

    public static function getRelations(): array
    {
        return [
            //
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => ListStudios::route('/'),
            'create' => CreateStudio::route('/create'),
            'edit' => EditStudio::route('/{record}/edit'),
        ];
    }
}

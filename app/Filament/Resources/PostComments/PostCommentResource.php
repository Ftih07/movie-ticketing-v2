<?php

namespace App\Filament\Resources\PostComments;

use App\Filament\Resources\PostComments\Pages\CreatePostComment;
use App\Filament\Resources\PostComments\Pages\EditPostComment;
use App\Filament\Resources\PostComments\Pages\ListPostComments;
use App\Filament\Resources\PostComments\Schemas\PostCommentForm;
use App\Filament\Resources\PostComments\Tables\PostCommentsTable;
use App\Models\PostComment;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\SoftDeletingScope;

class PostCommentResource extends Resource
{
    protected static ?string $model = PostComment::class;

    protected static ?string $navigationLabel = 'Komentar Artikel';
    protected static string | \UnitEnum | null $navigationGroup = 'Marketing & Content';
    protected static string| \BackedEnum|null  $navigationIcon = 'heroicon-o-chat-bubble-left-right';
    protected static ?int $navigationSort = 3;

    public static function form(Schema $schema): Schema
    {
        return PostCommentForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return PostCommentsTable::configure($table);
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
            'index' => ListPostComments::route('/'),
        ];
    }

    public static function getRecordRouteBindingEloquentQuery(): Builder
    {
        return parent::getRecordRouteBindingEloquentQuery()
            ->withoutGlobalScopes([
                SoftDeletingScope::class,
            ]);
    }
}

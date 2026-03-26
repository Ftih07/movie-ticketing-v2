<?php

namespace App\Filament\Resources\PostComments\Schemas;

use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Schema;

class PostCommentForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextInput::make('post_title')
                    ->label('Di Artikel / Promo:')
                    ->formatStateUsing(fn($record) => $record?->post?->title)
                    ->columnSpanFull()
                    ->disabled(),

                TextInput::make('user_name')
                    ->label('Ditulis oleh:')
                    ->formatStateUsing(fn($record) => $record?->user?->name)
                    ->disabled(),

                TextInput::make('created_at_formatted')
                    ->label('Waktu Komentar:')
                    ->formatStateUsing(fn($record) => $record?->created_at?->format('d M Y, H:i'))
                    ->disabled(),

                Textarea::make('content')
                    ->label('Isi Komentar:')
                    ->rows(5)
                    ->columnSpanFull()
                    ->disabled(),
            ]);
    }
}

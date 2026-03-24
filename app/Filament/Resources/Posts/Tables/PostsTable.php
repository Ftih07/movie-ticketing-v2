<?php

namespace App\Filament\Resources\Posts\Tables;

use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteAction;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\ImageColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;

class PostsTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                ImageColumn::make('thumbnail')
                    ->label('Image')
                    ->circular()
                    ->defaultImageUrl(url('/images/placeholder.png')), // Opsional kalau kosong

                TextColumn::make('title')
                    ->label('Judul Post')
                    ->searchable()
                    ->sortable()
                    ->description(fn($record) => $record->type === 'promo' ? 'Promo' : 'Artikel')
                    ->limit(30),

                TextColumn::make('movie.title')
                    ->label('Terkait Film')
                    ->searchable()
                    ->badge()
                    ->color('info')
                    ->toggleable(), // Bisa disembunyikan/ditampilkan user

                TextColumn::make('status')
                    ->badge()
                    ->color(fn(string $state): string => match ($state) {
                        'draft' => 'gray',
                        'published' => 'success',
                        'archived' => 'danger',
                    }),

                IconColumn::make('is_featured')
                    ->label('Featured')
                    ->boolean(),

                TextColumn::make('read_count')
                    ->label('Views')
                    ->numeric()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true), // Sembunyi secara default

                TextColumn::make('published_at')
                    ->label('Tanggal Publish')
                    ->dateTime('d M Y')
                    ->sortable(),
            ])
            ->filters([
                SelectFilter::make('status')
                    ->options([
                        'draft' => 'Draft',
                        'published' => 'Published',
                        'archived' => 'Archived',
                    ]),
                SelectFilter::make('type')
                    ->options([
                        'article' => 'Article',
                        'promo' => 'Promo',
                    ]),
            ])
            ->recordActions([
                EditAction::make(),
                DeleteAction::make(),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make(),
                ]),
            ]);
    }
}

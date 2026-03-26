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
                    ->label('Thumbnail')
                    ->circular()
                    ->disk('public') // PENTING
                    ->defaultImageUrl(url('/images/placeholder.png')),

                TextColumn::make('title')
                    ->label('Judul Post')
                    ->searchable()
                    ->sortable()
                    ->weight('bold')
                    ->description(fn($record) => $record->type === 'promo' ? '🎟️ Promo' : '📰 Artikel')
                    ->limit(40),

                TextColumn::make('movie.title')
                    ->label('Film Terkait')
                    ->searchable()
                    ->badge()
                    ->color('info')
                    ->toggleable(isToggledHiddenByDefault: true), // Default sembunyi

                TextColumn::make('status')
                    ->label('Status')
                    ->badge()
                    // Manipulasi teks: Kalau draft tapi ada jadwalnya, ubah tulisannya!
                    ->formatStateUsing(function ($state, $record) {
                        if ($state === 'draft' && $record->scheduled_at && $record->scheduled_at > now()) {
                            return 'Scheduled';
                        }
                        return ucfirst($state);
                    })
                    // Warnanya disesuaikan
                    ->color(function (string $state, $record): string {
                        if ($state === 'draft' && $record->scheduled_at && $record->scheduled_at > now()) {
                            return 'info'; // Biru kalau lagi dijadwalkan
                        }
                        return match ($state) {
                            'draft' => 'gray',
                            'published' => 'success',
                            'archived' => 'danger',
                            default => 'gray',
                        };
                    })
                    ->description(fn($record) => $record->scheduled_at && $record->status === 'draft' ? $record->scheduled_at->format('d M, H:i') : null),

                IconColumn::make('is_featured')
                    ->label('Featured')
                    ->boolean()
                    ->toggleable(),

                TextColumn::make('published_at')
                    ->label('Tgl Terbit')
                    ->dateTime('d M Y, H:i')
                    ->sortable(),
            ])
            ->defaultSort('created_at', 'desc')
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

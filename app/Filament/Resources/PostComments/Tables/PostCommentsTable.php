<?php

namespace App\Filament\Resources\PostComments\Tables;

use App\Models\PostComment;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteAction;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Actions\ForceDeleteBulkAction;
use Filament\Actions\RestoreBulkAction;
use Filament\Actions\ViewAction;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Columns\ToggleColumn;
use Filament\Tables\Filters\TernaryFilter;
use Filament\Tables\Filters\TrashedFilter;
use Filament\Tables\Table;

class PostCommentsTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('user.name')
                    ->label('Pengguna')
                    ->searchable()
                    ->sortable()
                    ->weight('bold')
                    ->description(fn(PostComment $record): string => $record->user->email ?? ''),

                TextColumn::make('post.title')
                    ->label('Artikel Terkait')
                    ->searchable()
                    ->limit(30)
                    ->color('info'),

                TextColumn::make('content')
                    ->label('Isi Komentar')
                    ->searchable()
                    ->limit(40)
                    // Kasih indikator kalau ini balasan (reply)
                    ->description(fn(PostComment $record) => $record->parent_id ? '↳ Membalas komentar...' : ''),

                ToggleColumn::make('is_approved')
                    ->label('Approved / Tampil')
                    ->updateStateUsing(function ($record, $state) {

                        // Kalau admin mencoba menyalakan toggle (True)
                        if ($state === true) {
                            // Cek apakah ini adalah komentar balasan
                            if ($record->parent_id !== null) {
                                // Cek apakah komentar UTAMANYA masih mati
                                if (!$record->parent->is_approved) {
                                    \Filament\Notifications\Notification::make()
                                        ->title('Ditolak Sistem!')
                                        ->body('Tidak bisa menyetujui balasan jika komentar utamanya masih disembunyikan.')
                                        ->danger()
                                        ->send();

                                    return false; // Batalkan, kembalikan ke Off
                                }
                            }
                        }
                        $record->update(['is_approved' => $state]);
                        return $state;
                    }),

                TextColumn::make('created_at')
                    ->label('Waktu')
                    ->dateTime('d M Y, H:i')
                    ->sortable(),
            ])
            ->filters([
                TernaryFilter::make('is_approved')
                    ->label('Status Approval')
                    ->boolean()
                    ->trueLabel('Sudah Approved')
                    ->falseLabel('Belum Approved'),
            ])
            ->recordActions([
                ViewAction::make()->modalWidth('lg'), // Pop-up ukuran gede dikit biar enak baca komen
                DeleteAction::make(),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make(),
                    ForceDeleteBulkAction::make(),
                    RestoreBulkAction::make(),
                ]),
            ]);
    }
}

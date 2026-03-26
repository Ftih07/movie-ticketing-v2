<?php

namespace App\Filament\Resources\Users\Schemas;

use Filament\Forms\Components\DateTimePicker;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Schema;

class UserForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                FileUpload::make('profile_image')
                    ->label('Foto Profil')
                    ->avatar()
                    ->columnSpanFull()
                    ->alignCenter()
                    ->disk('public')
                    ->disabled(),

                TextInput::make('name')
                    ->label('Nama Lengkap')
                    ->disabled(),

                TextInput::make('email')
                    ->label('Alamat Email')
                    ->disabled(),

                TextInput::make('role')
                    ->label('Hak Akses')
                    ->disabled(),

                TextInput::make('point_balance')
                    ->label('Saldo Poin')
                    ->numeric()
                    ->disabled(),

                DateTimePicker::make('created_at')
                    ->label('Tanggal Bergabung')
                    ->disabled(),
            ]);
    }
}

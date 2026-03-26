<?php

namespace App\Filament\Resources\Promos\Schemas;

use App\Models\Promo;
use Filament\Forms\Components\Toggle;
use Filament\Forms\Components\DateTimePicker;
use Filament\Forms\Components\Repeater;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Components\Utilities\Get;
use Filament\Schemas\Schema;
use Filament\Schemas\Components\Grid;
use Filament\Schemas\Components\Group;

class PromoForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Grid::make(3)->schema([
                    // KOLOM KIRI (Detail Utama Promo)
                    Group::make()->schema([
                        Section::make('Informasi Dasar')->schema([
                            TextInput::make('name')
                                ->label('Nama / Judul Promo')
                                ->required()
                                ->placeholder('Contoh: Diskon Kemerdekaan 17 Agustus')
                                ->columnSpanFull(),

                            Textarea::make('description')
                                ->label('Deskripsi Promo')
                                ->rows(3)
                                ->placeholder('Jelaskan promo ini untuk apa...')
                                ->columnSpanFull(),

                            TextInput::make('code')
                                ->label('Kode Promo (Voucher)')
                                ->unique(ignoreRecord: true)
                                ->placeholder('Contoh: MERDEKA26')
                                ->helperText('Biarkan KOSONG jika promo ini otomatis aktif tanpa perlu input kode (Auto-Apply).')
                                ->extraInputAttributes(['style' => 'text-transform: uppercase;']), // Bikin kodenya huruf besar semua
                        ])->columns(1),

                        Section::make('Besaran Diskon')->schema([
                            Select::make('discount_type')
                                ->label('Tipe Diskon')
                                ->options([
                                    'fixed' => 'Potongan Harga (Nominal Rp)',
                                    'percentage' => 'Persentase (%)',
                                ])
                                ->required()
                                ->live(), // Pakai live() gantiin reactive() di versi 5

                            Grid::make(2)->schema([ // Sub-grid biar sebelahan
                                TextInput::make('discount_value')
                                    ->label('Nilai Diskon')
                                    ->numeric()
                                    ->required()
                                    ->placeholder(fn(Get $get) => $get('discount_type') === 'percentage' ? 'Misal: 10' : 'Misal: 15000')
                                    ->prefix(fn(Get $get) => $get('discount_type') === 'fixed' ? 'Rp' : null)
                                    ->suffix(fn(Get $get) => $get('discount_type') === 'percentage' ? '%' : null),

                                TextInput::make('max_discount')
                                    ->label('Maksimal Diskon (Rp)')
                                    ->numeric()
                                    ->placeholder('Misal: 25000')
                                    ->prefix('Rp')
                                    ->helperText('Kosongkan jika tidak ada batas maksimal.')
                                    ->visible(fn(Get $get) => $get('discount_type') === 'percentage'), // Cuma muncul kalau tipe diskonnya persen
                            ]),
                        ]),
                    ])->columnSpan(['lg' => 2]),

                    // KOLOM KANAN (Pengaturan Waktu & Syarat)
                    Group::make()->schema([
                        Section::make('Masa Berlaku & Kuota')->schema([
                            DateTimePicker::make('start_date')
                                ->label('Tanggal & Waktu Mulai')
                                ->required()
                                ->native(false),

                            DateTimePicker::make('end_date')
                                ->label('Tanggal & Waktu Selesai')
                                ->required()
                                ->after('start_date') // Validasi nggak boleh mendahului waktu mulai
                                ->native(false),

                            TextInput::make('quota')
                                ->label('Kuota Penggunaan')
                                ->numeric()
                                ->placeholder('Misal: 100')
                                ->helperText('Kosongkan jika kuota tidak terbatas (Unlimited).'),
                            Toggle::make('is_active')
                                ->label('Status Promo')
                                ->helperText('Status diatur otomatis oleh sistem. Ubah Tanggal Selesai ke hari kemarin jika ingin mematikan promo lebih awal.')
                                ->default(true)
                                ->disabled() // Bikin view-only / terkunci
                                ->dehydrated(), // WAJIB ADA: Biar pas Create promo baru, nilai 'true' tetep dikirim ke database
                        ]),
                    ])->columnSpan(['lg' => 1]),

                ])->columnSpanFull(),

                // INI BAGIAN RULE ENGINE-NYA (Dibikin Full Width di bawah)
                Section::make('Syarat & Ketentuan (Rules)')
                    ->description('Tambahkan syarat-syarat khusus agar promo ini bisa digunakan oleh pelanggan.')
                    ->schema([
                        Repeater::make('rules')
                            ->relationship()
                            ->hiddenLabel() // Udah ada judul section, jadi label repeaternya disembunyiin aja
                            ->collapsible() // Biar kotak rules-nya bisa di-minimize
                            ->defaultItems(0) // Defaultnya kosong, admin tinggal klik "Add" kalau butuh
                            ->addActionLabel('Tambah Syarat Baru')
                            ->schema([
                                Select::make('rule_type')
                                    ->label('Pilih Jenis Syarat')
                                    ->options([
                                        'min_purchase_amount' => 'Minimal Total Belanja (Rp)',
                                        'min_ticket_qty' => 'Minimal Pembelian Tiket',
                                        'specific_day' => 'Khusus Hari Tertentu (Senin-Minggu)',
                                    ])
                                    ->required(),

                                TextInput::make('rule_value')
                                    ->label('Nilai Syarat')
                                    ->required()
                                    ->placeholder('Contoh: 100000 atau 2 atau Saturday'),
                            ])->columns(2)
                    ])->collapsible(), // Sectionnya juga bisa di-minimize
            ]);
    }
}

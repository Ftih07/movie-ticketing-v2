<?php

namespace App\Filament\Resources\Posts\Schemas;

use App\Models\Post;
use Filament\Schemas\Schema;
use Filament\Schemas\Components\Utilities\Set;
use Illuminate\Support\Str;

use Filament\Schemas\Components\Group;
use Filament\Schemas\Components\Section;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Hidden;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\RichEditor;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\Toggle;
use Filament\Forms\Components\DateTimePicker;
use Filament\Forms\Components\FileUpload;
use Filament\Schemas\Components\Grid;

class PostForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Grid::make(3)->schema([
                    // KOLOM KIRI (Konten Utama)
                    Group::make()->schema([
                        Section::make('Konten Artikel/Promo')->schema([
                            TextInput::make('title')
                                ->label('Judul')
                                ->required()
                                ->maxLength(255)
                                ->live(onBlur: true)
                                ->afterStateUpdated(function (string $operation, $state, Set $set) {
                                    if ($operation === 'create') {
                                        $set('slug', Str::slug($state));
                                    }
                                }),

                            TextInput::make('slug')
                                ->disabled()
                                ->dehydrated()
                                ->required()
                                ->unique(Post::class, 'slug', ignoreRecord: true),

                            Hidden::make('author_id')
                                ->default(fn() => auth()->id()),

                            Select::make('movie_id')
                                ->label('Terkait Film (Opsional)')
                                ->relationship('movie', 'title')
                                ->searchable()
                                ->preload()
                                ->helperText('Pilih jika artikel ini membahas film tertentu.'),

                            RichEditor::make('content')
                                ->label('Isi Konten')
                                ->required()
                                ->fileAttachmentsDisk('public') // Biar gambar di dalem artikel nyimpennya bener
                                ->fileAttachmentsDirectory('post-content')
                                ->columnSpanFull(),

                            Textarea::make('excerpt')
                                ->label('Ringkasan (Excerpt)')
                                ->helperText('Teks singkat yang muncul di halaman depan.')
                                ->rows(3)
                                ->columnSpanFull(),
                        ])->columns(2),

                        Section::make('SEO & Metadata')->schema([
                            TextInput::make('meta_title')
                                ->maxLength(255),
                            Textarea::make('meta_description')
                                ->rows(3),
                        ])->collapsed(),
                    ])->columnSpan(['lg' => 2]),

                    // KOLOM KANAN (Status & Gambar)
                    Group::make()->schema([
                        Section::make('Status & Publikasi')->schema([
                            Select::make('type')
                                ->label('Jenis Postingan')
                                ->options([
                                    'article' => 'Artikel Berita',
                                    'promo' => 'Pengumuman Promo',
                                ])
                                ->default('article')
                                ->required(),

                            Select::make('status')
                                ->options([
                                    'draft' => 'Draft (Sembunyikan)',
                                    'published' => 'Published (Terbit)',
                                    'archived' => 'Archived (Arsip)',
                                ])
                                ->default('draft')
                                ->required()
                                ->live(),

                            DateTimePicker::make('scheduled_at')
                                ->label('Jadwalkan Terbit (Opsional)')
                                ->helperText('Pilih waktu. Postingan otomatis Published saat waktu tiba.')
                                ->native(false)
                                ->seconds(false) // (Opsional) Tambahin ini biar admin ga usah pusing milih detik
                                ->minDate(today()), // <--- KUNCINYA DI SINI: Ganti now() jadi today()

                            Toggle::make('is_featured')
                                ->label('Tandai sebagai Pilihan (Featured)')
                                ->default(false),
                        ]),

                        Section::make('Media')->schema([
                            FileUpload::make('thumbnail')
                                ->label('Gambar Utama (Thumbnail)')
                                ->image()
                                ->directory('post-thumbnails')
                                ->disk('public') // PENTING biar gak broken image
                                ->imageEditor()
                                ->columnSpanFull(),

                            TextInput::make('read_time')
                                ->label('Waktu Baca')
                                ->numeric()
                                ->default(0)
                                ->suffix('Menit'),
                        ]),
                    ])->columnSpan(['lg' => 1]),
                ])->columnSpanFull(),
            ]);
    }
}

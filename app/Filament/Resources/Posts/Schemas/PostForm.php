<?php

namespace App\Filament\Resources\Posts\Schemas;

use App\Models\Post;
use Filament\Schemas\Schema;
use Filament\Schemas\Components\Utilities\Set;
use Illuminate\Support\Str;

// Components
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

class PostForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Group::make()
                    ->schema([
                        Section::make('Konten Utama')
                            ->schema([
                                TextInput::make('title')
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
                                    ->relationship('movie', 'title')
                                    ->searchable()
                                    ->preload()
                                    ->placeholder('Pilih film (Opsional)'),

                                RichEditor::make('content')
                                    ->required()
                                    ->columnSpanFull(),

                                Textarea::make('excerpt')
                                    ->rows(3)
                                    ->columnSpanFull(),
                            ])
                            ->columns(2),

                        Section::make('SEO & Metadata')
                            ->schema([
                                TextInput::make('meta_title')
                                    ->maxLength(255),

                                Textarea::make('meta_description')
                                    ->rows(3),
                            ])
                            ->collapsed(),
                    ])
                    ->columnSpan(['lg' => 2]),

                // Sidebar
                Group::make()
                    ->schema([
                        Section::make('Status & Visibilitas')
                            ->schema([
                                Select::make('status')
                                    ->options([
                                        'draft' => 'Draft',
                                        'published' => 'Published',
                                        'archived' => 'Archived',
                                    ])
                                    ->default('draft')
                                    ->required(),

                                Select::make('type')
                                    ->options([
                                        'article' => 'Article',
                                        'promo' => 'Promo',
                                    ])
                                    ->default('article')
                                    ->required(),

                                Toggle::make('is_featured')
                                    ->label('Featured Post'),

                                DateTimePicker::make('published_at')
                                    ->label('Publish Date'),

                                DateTimePicker::make('scheduled_at')
                                    ->label('Schedule Date'),
                            ]),

                        Section::make('Media')
                            ->schema([
                                FileUpload::make('thumbnail')
                                    ->image()
                                    ->directory('post-thumbnails')
                                    ->imageEditor(),

                                TextInput::make('read_time')
                                    ->numeric()
                                    ->default(0)
                                    ->suffix('Menit')
                                    ->helperText('Estimasi waktu baca'),
                            ]),
                    ])
                    ->columnSpan(['lg' => 1]),
            ])
            ->columns(3);
    }
}

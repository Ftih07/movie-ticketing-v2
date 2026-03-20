import MainLayout from '@/layouts/MainLayout';
import { Movie } from '@/types';
import { Head, Link } from '@inertiajs/react';

interface Props {
    movies: Movie[];
}

export default function Favorites({ movies }: Props) {
    return (
        <MainLayout>
            <Head title="My Favorites | MovieFlix" />

            <div className="mx-auto max-w-7xl px-4 pt-12 pb-20 lg:px-8">
                {/* Header Section */}
                <div className="mb-12 flex flex-col items-start gap-2">
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-1.5 rounded-full bg-red-600"></div>
                        <h1 className="text-3xl font-black tracking-tight text-gray-900 md:text-4xl dark:text-white">My Favorites</h1>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-zinc-400">Movies you've saved to watch later.</p>
                </div>

                {/* Movie Grid */}
                {movies.length > 0 ? (
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:gap-6 lg:grid-cols-5 xl:grid-cols-6">
                        {movies.map((movie) => (
                            <Link key={movie.id} href={route('movies.show', movie.slug)} className="group relative block">
                                <div className="relative aspect-[2/3] w-full overflow-hidden rounded-xl bg-gray-200 transition-all duration-300 group-hover:scale-105 group-hover:shadow-2xl dark:bg-zinc-800">
                                    <img src={`/storage/${movie.poster}`} alt={movie.title} className="absolute inset-0 h-full w-full object-cover" />

                                    {/* Overlay on Hover */}
                                    <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/95 via-black/40 to-transparent p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                                        <h3 className="line-clamp-1 text-sm font-bold text-white">{movie.title}</h3>
                                        <p className="mt-1 text-[10px] font-medium tracking-wider text-gray-300 uppercase">
                                            {movie.categories?.map((c) => c.name).join(', ')}
                                        </p>
                                        <button className="mt-3 w-full rounded-lg bg-red-600 py-2 text-xs font-bold text-white transition-colors hover:bg-red-700">
                                            Book Ticket
                                        </button>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    /* Empty State - Estetik */
                    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-gray-300 bg-gray-50/50 py-32 dark:border-zinc-800 dark:bg-zinc-900/30">
                        <div className="relative mb-6">
                            <span className="text-6xl">❤️</span>
                            <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white shadow-lg">
                                0
                            </span>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Your list is empty</h3>
                        <p className="mt-2 max-w-xs text-center text-sm text-gray-500 dark:text-zinc-400">
                            Start adding movies to your favorites and they will show up here.
                        </p>
                        <Link
                            href={route('movies.index')}
                            className="mt-8 rounded-full bg-red-600 px-8 py-2.5 text-sm font-bold text-white shadow-lg shadow-red-600/20 transition-all hover:scale-105 hover:bg-red-700"
                        >
                            Discover Movies
                        </Link>
                    </div>
                )}
            </div>
        </MainLayout>
    );
}

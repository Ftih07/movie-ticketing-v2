import MainLayout from '@/layouts/MainLayout';
import { Movie } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

// 1. Tambahkan interface Post
export interface Post {
    id: number;
    title: string;
    slug: string;
    excerpt: string;
    thumbnail: string | null;
    type: string;
    read_time: number;
    published_at: string;
}

interface Props {
    nowShowing: Movie[];
    comingSoon: Movie[];
    allGenres: { id: number; name: string }[];
    latestPosts: Post[]; // Props untuk artikel
    filters: {
        search?: string;
        genre?: string;
        duration?: string;
        date?: string;
    };
}

export default function Home({ nowShowing, comingSoon, allGenres, latestPosts, filters: initialFilters }: Props) {
    const [filters, setFilters] = useState({
        search: initialFilters?.search || '',
        genre: initialFilters?.genre || '',
        duration: initialFilters?.duration || '',
        date: initialFilters?.date || '',
    });

    const handleSearch = () => {
        router.get(route('home'), filters, {
            preserveState: true,
            replace: true,
        });
    };

    const handleReset = () => {
        setFilters({ search: '', genre: '', duration: '', date: '' });
        router.get(
            route('home'),
            {},
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    // Cek kalau hasil filter benar-benar kosong di kedua section
    const isDataEmpty = nowShowing.length === 0 && comingSoon.length === 0;

    return (
        <MainLayout>
            <Head title="Home | Unlimited Movies" />

            {/* Generic CTA Hero Section */}
            <section className="relative flex w-full items-center justify-center overflow-hidden bg-gray-50 py-20 md:py-32 lg:h-[70vh] dark:bg-black">
                {/* Background Image */}
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=2025&auto=format&fit=crop')] bg-cover bg-center bg-no-repeat opacity-40 dark:opacity-50"></div>

                {/* Overlay Gradients */}
                <div className="absolute inset-0 bg-gradient-to-b from-gray-50/80 via-gray-50/60 to-gray-50 dark:from-black/80 dark:via-black/60 dark:to-zinc-950"></div>
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-gray-50 via-gray-50/80 to-transparent dark:from-zinc-950 dark:via-zinc-950/80"></div>

                {/* Konten Text Slogan */}
                <div className="relative z-10 flex flex-col items-center px-4 text-center">
                    <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-gray-900 drop-shadow-sm sm:text-5xl md:text-6xl lg:text-7xl dark:text-white">
                        The big screen awaits.
                        <br className="hidden sm:block" />
                        <span className="text-red-600 drop-shadow-md"> Book your seat today.</span>
                    </h1>
                    <p className="mb-8 max-w-2xl text-base text-gray-800 drop-shadow sm:text-lg md:text-xl dark:text-gray-300">
                        Experience movies the way they’re meant to be seen — in theaters, with the best seats reserved for you.
                    </p>
                </div>
            </section>

            <div className="mx-auto max-w-7xl px-4 lg:px-8">
                {/* 🔍 FILTER BAR */}
                <div className="relative z-20 -mt-6 mb-12 flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-xl md:-mt-10 md:flex-row md:items-end dark:border-zinc-800 dark:bg-zinc-900">
                    <div className="flex-1">
                        <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-zinc-400">Search</label>
                        <input
                            type="text"
                            value={filters.search}
                            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                            placeholder="Find movies..."
                            className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2.5 text-sm focus:border-red-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-950 dark:text-white dark:placeholder-zinc-500"
                        />
                    </div>

                    <div className="w-full md:w-48">
                        <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-zinc-400">Genre</label>
                        <select
                            value={filters.genre}
                            onChange={(e) => setFilters({ ...filters, genre: e.target.value })}
                            className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2.5 text-sm focus:border-red-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
                        >
                            <option value="">All Genres</option>
                            {allGenres.map((genre) => (
                                <option key={genre.id} value={genre.id}>
                                    {genre.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="w-full md:w-48">
                        <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-zinc-400">Duration</label>
                        <select
                            value={filters.duration}
                            onChange={(e) => setFilters({ ...filters, duration: e.target.value })}
                            className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2.5 text-sm focus:border-red-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
                        >
                            <option value="">Any Duration</option>
                            <option value="90">&lt; 1.5 Hours</option>
                            <option value="120">&lt; 2 Hours</option>
                            <option value="150">&lt; 2.5 Hours</option>
                            <option value="180">&lt; 3 Hours</option>
                        </select>
                    </div>

                    <div className="w-full md:w-48">
                        <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-zinc-400">Date</label>
                        <select
                            value={filters.date}
                            onChange={(e) => setFilters({ ...filters, date: e.target.value })}
                            className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2.5 text-sm focus:border-red-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
                        >
                            <option value="">Any Time</option>
                            <option value="today">Today</option>
                            <option value="week">This Week</option>
                        </select>
                    </div>

                    <button
                        onClick={handleSearch}
                        className="h-[42px] w-full rounded-lg bg-red-600 px-6 text-sm font-semibold text-white transition-colors hover:bg-red-700 md:w-auto"
                    >
                        Search
                    </button>
                </div>

                {/* 🎬 MOVIE CAROUSEL ATAU EMPTY STATE */}
                {!isDataEmpty ? (
                    <>
                        {nowShowing.length > 0 && <MovieCarousel title="Now Showing" movies={nowShowing} />}
                        {comingSoon.length > 0 && <MovieCarousel title="Coming Soon" movies={comingSoon} />}
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-gray-50 py-24 dark:border-zinc-800 dark:bg-zinc-900/50">
                        <span className="mb-4 text-5xl">🧐</span>
                        <p className="text-lg font-medium text-gray-600 dark:text-zinc-400">Waduh, film yang kamu cari nggak ketemu.</p>
                        <button
                            onClick={handleReset}
                            className="mt-4 rounded-lg bg-gray-200 px-6 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-300 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                        >
                            Reset Filter
                        </button>
                    </div>
                )}
            </div>

            {/* 📰 SECTION LATEST NEWS & PROMOS (DESIGN DISESUAIKAN) */}
            {latestPosts && latestPosts.length > 0 && (
                <div className="mx-auto max-w-7xl px-4 lg:px-8">
                    <section className="mt-14 mb-20 border-t border-gray-200 pt-16 dark:border-zinc-800/80">
                        {/* Header Section */}
                        <div className="mb-8 flex items-center gap-3">
                            <div className="h-6 w-1.5 rounded-full bg-red-600"></div>
                            <h2 className="text-xl font-bold tracking-tight text-gray-900 md:text-2xl dark:text-white">Latest News & Promos</h2>
                        </div>

                        {/* Grid Artikel */}
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                            {latestPosts.map((post) => (
                                <Link
                                    key={post.id}
                                    href={route('posts.show', post.slug)}
                                    className="group flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-red-500/5 dark:border-zinc-800 dark:bg-zinc-900/80"
                                >
                                    {/* Thumbnail (Aspect Video 16:9) dengan Animasi Smooth */}
                                    <div className="relative aspect-video w-full overflow-hidden bg-gray-100 dark:bg-zinc-800">
                                        <img
                                            src={
                                                post.thumbnail
                                                    ? `/storage/${post.thumbnail}`
                                                    : 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=800&auto=format&fit=crop'
                                            }
                                            alt={post.title}
                                            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                        {/* Overlay Gradient Halus saat Hover */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>

                                        {/* Badge Tipe */}
                                        <div className="absolute top-3 left-3 rounded-md bg-red-600 px-2.5 py-1 text-[10px] font-black tracking-widest text-white uppercase shadow-lg">
                                            {post.type}
                                        </div>
                                    </div>

                                    {/* Konten Text */}
                                    <div className="flex flex-1 flex-col p-5">
                                        <h3 className="line-clamp-2 text-base font-bold text-gray-900 transition-colors group-hover:text-red-600 dark:text-white dark:group-hover:text-red-500">
                                            {post.title}
                                        </h3>
                                        <p className="mt-2 line-clamp-2 text-sm text-gray-600 dark:text-zinc-400">{post.excerpt}</p>

                                        {/* Meta Data (Tanggal & Waktu Baca) */}
                                        <div className="mt-auto flex items-center justify-between pt-5 text-xs font-semibold text-gray-500 dark:text-zinc-500">
                                            <span>
                                                {new Date(post.published_at).toLocaleDateString('id-ID', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric',
                                                })}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    className="h-3.5 w-3.5 text-red-500 opacity-80"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2.5}
                                                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                                    />
                                                </svg>
                                                {post.read_time} min
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>

                        {/* Tombol View All Posts (Desain sama persis dengan View All Movies) */}
                        <div className="mt-10 flex justify-center">
                            <Link
                                href={route('posts.index')}
                                className="group flex items-center gap-2 rounded-full border border-red-200 px-6 py-2.5 text-sm font-bold transition-all hover:border-red-600 hover:text-red-600 dark:border-zinc-800 dark:text-zinc-400 dark:hover:text-red-500"
                            >
                                VIEW ALL POSTS
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-4 w-4 transition-transform group-hover:translate-x-1"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            </Link>
                        </div>
                    </section>
                </div>
            )}
        </MainLayout>
    );
}

// Sub-komponen Carousel
interface CarouselProps {
    title: string;
    movies: Movie[];
}
function MovieCarousel({ title, movies }: CarouselProps) {
    return (
        <section className="mb-14">
            <div className="mb-6 flex items-center gap-3">
                <div className="h-6 w-1.5 rounded-full bg-red-600"></div>
                <h2 className="text-xl font-bold tracking-tight text-gray-900 md:text-2xl dark:text-white">{title}</h2>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:gap-6 lg:grid-cols-5 xl:grid-cols-6">
                {movies?.map((movie) => (
                    <Link key={movie.id} href={route('movies.show', movie.slug)} className="group relative block">
                        <div className="relative aspect-[2/3] w-full overflow-hidden rounded-md bg-gray-200 transition-transform duration-300 group-hover:z-10 group-hover:scale-105 group-hover:shadow-xl dark:bg-zinc-800">
                            <img
                                src={`/storage/${movie.poster}`}
                                alt={movie.title}
                                className="absolute inset-0 h-full w-full object-cover transition-opacity duration-300"
                            />

                            <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/90 via-black/40 to-transparent p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                                <h3 className="line-clamp-1 text-sm font-bold text-white">{movie.title}</h3>
                                <p className="mt-1 text-xs font-medium text-gray-300">{movie.duration} Minutes</p>
                                <button className="mt-3 w-full rounded bg-white py-1.5 text-xs font-bold text-black transition-colors hover:bg-gray-200">
                                    Book Now
                                </button>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            <div className="mt-10 flex justify-center">
                <Link
                    href={route('movies.index')}
                    className="group flex items-center gap-2 rounded-full border border-red-200 px-6 py-2.5 text-sm font-bold transition-all hover:border-red-600 hover:text-red-600 dark:border-zinc-800 dark:text-zinc-400 dark:hover:text-red-500"
                >
                    VIEW ALL MOVIES
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 transition-transform group-hover:translate-x-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                </Link>
            </div>
        </section>
    );
}

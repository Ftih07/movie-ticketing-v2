import MainLayout from '@/layouts/MainLayout';
import { MovieDetail, Showtime } from '@/types';
import { PageProps } from '@inertiajs/core'; // <--- 1. Import PageProps bawaan Inertia
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';

// 1. Tambahkan Interface Post
interface Post {
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
    movie: MovieDetail;
    groupedShowtimes: Record<string, Showtime[]>;
    relatedPosts: Post[];
}

// 2. Buat SharedProps untuk menggantikan 'any'
interface SharedProps extends PageProps {
    auth: {
        user: unknown | null; // Pakai unknown lebih aman di mata linter daripada any
    };
    flash: {
        message: string | null;
    };
}

export default function Show({ movie, groupedShowtimes, relatedPosts = [] }: Props) {
    // Kasih default {}
    const { auth, flash } = usePage<SharedProps>().props;
    
    const formatRupiah = (number: number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);
    };

    const getYouTubeEmbedUrl = (url: string | undefined) => {
        if (!url) return null;
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return match && match[2].length === 11 ? `https://www.youtube.com/embed/${match[2]}?autoplay=0&rel=0` : null;
    };

    const embedUrl = getYouTubeEmbedUrl(movie?.trailer_url);

    useEffect(() => {
        if (flash?.message) {
            toast.success(flash.message, {
                style: {
                    borderRadius: '10px',
                    background: '#27272a',
                    color: '#fff',
                },
            });
        }
    }, [flash?.message]);

    // --- LOGIC SHARE ---
    const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
    const shareText = `Eh, nonton film "${movie.title}" yuk di MovieFlix!`;

    const handleCopyLink = () => {
        navigator.clipboard.writeText(shareUrl);
        toast.success('Link berhasil disalin ke clipboard! 📋', {
            style: { borderRadius: '10px', background: '#27272a', color: '#fff' },
        });
    };

    const shareWA = () => window.open(`https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`, '_blank');
    const shareFB = () => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
    // ------------------

    const toggleFavorite = () => {
        if (!movie?.id) return;
        router.post(route('movies.favorite.toggle', movie.id), {}, { preserveScroll: true });
    };

    // 2. Safety: Jangan render apapun kalau movie belum ada
    if (!movie) return <div className="min-h-screen bg-black"></div>;

    return (
        <MainLayout>
            <Toaster position="bottom-right" />
            <Head title={`${movie.title} | Book Tickets`} />

            <section className="relative w-full overflow-hidden bg-black pt-8 pb-12 md:pt-16 lg:pb-20">
                <div className="absolute inset-0 z-0">
                    <img
                        src={`/storage/${movie.poster}`}
                        alt={movie.title}
                        className="h-full w-full object-cover opacity-20 blur-md dark:opacity-30"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-50 via-gray-50/80 to-transparent dark:from-zinc-950 dark:via-zinc-950/80"></div>
                </div>

                <div className="relative z-10 mx-auto max-w-7xl px-4 lg:px-8">
                    <div className="grid grid-cols-1 items-start gap-8 md:grid-cols-[280px,1fr] lg:gap-12">
                        <div className="mx-auto w-[200px] md:w-full">
                            <img
                                src={`/storage/${movie.poster}`}
                                alt={movie.title}
                                className="aspect-[2/3] w-full rounded-xl object-cover shadow-2xl ring-1 ring-gray-200 dark:ring-zinc-800"
                            />
                        </div>

                        <div className="flex flex-col justify-center pt-4">
                            {/* --- TITLE & ACTIONS SECTION --- */}
                            <div className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                                {/* Kolom Judul */}
                                <h1 className="max-w-2xl text-4xl font-black tracking-tight text-gray-900 md:text-5xl lg:text-6xl dark:text-white">
                                    {movie.title}
                                </h1>

                                {/* Kolom Tombol Aksi */}
                                <div className="flex flex-wrap items-center gap-3">
                                    {/* Tombol Favorite (Model Kapsul) */}
                                    {!!auth?.user && (
                                        <button
                                            onClick={toggleFavorite}
                                            className={`group flex items-center gap-2 rounded-full border px-6 py-2.5 text-sm font-bold transition-all hover:scale-105 active:scale-95 ${
                                                movie.is_favorited
                                                    ? 'border-red-600 bg-red-600 text-white shadow-lg shadow-red-600/40'
                                                    : 'border-gray-200 bg-white text-gray-700 hover:border-red-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300'
                                            }`}
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className={`h-5 w-5 transition-colors ${movie.is_favorited ? 'fill-white' : 'group-hover:text-red-500'}`}
                                                fill={movie.is_favorited ? 'currentColor' : 'none'}
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2.5}
                                                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                                                />
                                            </svg>
                                            <span>{movie.is_favorited ? 'Favorited' : 'Favorite'}</span>
                                        </button>
                                    )}

                                    {/* Garis Pemisah (Hanya muncul di layar sm ke atas) */}
                                    <div className="hidden h-8 w-px bg-gray-200 sm:block dark:bg-zinc-800"></div>

                                    {/* Group Share Buttons */}
                                    <div className="flex items-center gap-2">
                                        {/* WhatsApp */}
                                        <button
                                            onClick={shareWA}
                                            title="Share to WhatsApp"
                                            className="flex h-10 w-10 items-center justify-center rounded-full bg-[#25D366] text-white shadow-md transition-all hover:-translate-y-1 hover:brightness-110 active:scale-90"
                                        >
                                            <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                                                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.319 1.592 5.548 0 10.061-4.512 10.063-10.062.001-2.69-1.048-5.219-2.953-7.124s-4.435-2.956-7.125-2.957c-5.548 0-10.061 4.512-10.063 10.062 0 2.115.603 3.656 1.605 5.312l-1.011 3.693 3.785-.992zm11.332-6.505c-.247-.124-1.465-.722-1.692-.804-.226-.083-.391-.124-.555.124s-.638.805-.781.969c-.144.165-.289.185-.536.062-.247-.124-1.042-.383-1.986-1.226-.733-.655-1.229-1.464-1.373-1.711-.144-.247-.015-.38.109-.504.111-.112.247-.289.371-.434.124-.144.165-.247.247-.412.082-.165.042-.31-.021-.434s-.555-1.339-.761-1.835c-.2-.486-.403-.42-.555-.427h-.474c-.165 0-.433.062-.659.31-.227.247-.865.845-.865 2.062 0 1.216.886 2.392 1.01 2.557.124.165 1.744 2.663 4.223 3.732.59.255 1.05.407 1.408.521.593.188 1.132.161 1.558.098.476-.07 1.465-.598 1.671-1.176.206-.578.206-1.073.144-1.176-.062-.103-.227-.165-.474-.289z" />
                                            </svg>
                                        </button>

                                        {/* Facebook */}
                                        <button
                                            onClick={shareFB}
                                            title="Share to Facebook"
                                            className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1877F2] text-white shadow-md transition-all hover:-translate-y-1 hover:brightness-110 active:scale-90"
                                        >
                                            <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                                                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                            </svg>
                                        </button>

                                        {/* Copy Link */}
                                        <button
                                            onClick={handleCopyLink}
                                            title="Copy Link"
                                            className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-zinc-700 shadow-md ring-1 ring-gray-200 transition-all hover:-translate-y-1 hover:bg-gray-50 active:scale-90 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:ring-zinc-700"
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="h-5 w-5"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                                                />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="mb-8 flex flex-wrap items-center gap-3">
                                <span className="rounded-md border border-red-600 px-2 py-0.5 text-xs font-black text-red-600 uppercase dark:border-red-500 dark:text-red-500">
                                    {movie.age || 'SU'}
                                </span>
                                <span className="text-gray-300 dark:text-zinc-600">|</span>
                                <span className="font-semibold text-gray-700 dark:text-zinc-300">{movie.duration} Minutes</span>
                                <span className="text-gray-300 dark:text-zinc-600">|</span>
                                {movie.categories?.map((cat) => (
                                    <span
                                        key={cat.id}
                                        className="rounded bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-700 dark:bg-zinc-800 dark:text-zinc-300"
                                    >
                                        {cat.name}
                                    </span>
                                ))}
                            </div>

                            {/* --- STAFF & PRODUCTION GRID (NEW FIELDS) --- */}
                            <div className="mb-8 grid grid-cols-2 gap-x-8 gap-y-6 rounded-2xl border border-gray-100 bg-white/50 p-6 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/40">
                                <div className="space-y-1">
                                    <h4 className="text-[10px] font-black tracking-[0.2em] text-gray-400 uppercase dark:text-zinc-500">Director</h4>
                                    <p className="text-sm font-bold text-gray-900 dark:text-white">{movie.director || '—'}</p>
                                </div>
                                <div className="space-y-1">
                                    <h4 className="text-[10px] font-black tracking-[0.2em] text-gray-400 uppercase dark:text-zinc-500">Writer</h4>
                                    <p className="text-sm font-bold text-gray-900 dark:text-white">{movie.writer || '—'}</p>
                                </div>
                                <div className="space-y-1">
                                    <h4 className="text-[10px] font-black tracking-[0.2em] text-gray-400 uppercase dark:text-zinc-500">Producer</h4>
                                    <p className="text-sm font-bold text-gray-900 dark:text-white">{movie.producer || '—'}</p>
                                </div>
                                <div className="space-y-1">
                                    <h4 className="text-[10px] font-black tracking-[0.2em] text-gray-400 uppercase dark:text-zinc-500">Production</h4>
                                    <p className="text-sm font-bold text-gray-900 dark:text-white">{movie.production_company || '—'}</p>
                                </div>
                                <div className="col-span-2 space-y-1 border-t border-gray-100 pt-4 dark:border-zinc-800">
                                    <h4 className="text-[10px] font-black tracking-[0.2em] text-gray-400 uppercase dark:text-zinc-500">Cast</h4>
                                    <p className="text-sm leading-relaxed font-bold text-gray-900 dark:text-white">{movie.cast || '—'}</p>
                                </div>
                            </div>

                            <div className="mb-8 rounded-xl border border-gray-200 bg-white/50 p-6 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/50">
                                <h3 className="mb-3 text-lg font-bold text-gray-900 dark:text-white">Synopsis</h3>
                                <p className="text-sm leading-relaxed text-gray-700 md:text-base dark:text-zinc-300">{movie.description}</p>
                            </div>

                            {embedUrl && (
                                <div className="overflow-hidden rounded-xl border border-gray-200 bg-black shadow-lg dark:border-zinc-800">
                                    <div className="aspect-video w-full">
                                        <iframe
                                            src={embedUrl}
                                            title={`${movie.title} Trailer`}
                                            className="h-full w-full border-0"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                        ></iframe>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* JADWAL TAYANG SECTION */}
            <section className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
                <div className="mb-10 flex items-center gap-4">
                    <div className="h-8 w-1.5 rounded-full bg-red-600"></div>
                    <h2 className="text-2xl font-bold tracking-tight text-gray-900 md:text-3xl dark:text-white">Pilih Jadwal & Studio</h2>
                </div>

                {/* Gunakan pengaman groupedShowtimes && ... */}
                {groupedShowtimes && Object.keys(groupedShowtimes).length > 0 ? (
                    <div className="flex flex-col gap-10">
                        {Object.entries(groupedShowtimes).map(([date, showtimes]) => (
                            <div
                                key={date}
                                className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8 dark:border-zinc-800 dark:bg-zinc-900"
                            >
                                <h3 className="mb-6 inline-block rounded-lg bg-gray-100 px-4 py-2 text-lg font-bold text-gray-900 dark:bg-zinc-800 dark:text-white">
                                    📅{' '}
                                    {new Date(date).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                </h3>
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                    {showtimes.map((showtime) => (
                                        <div
                                            key={showtime.id}
                                            className="group flex flex-col justify-between rounded-xl border border-gray-200 bg-gray-50 p-5 transition-all hover:border-red-500 hover:shadow-md dark:border-zinc-700 dark:bg-zinc-950 dark:hover:border-red-500"
                                        >
                                            <div>
                                                <div className="mb-3 flex items-start justify-between border-b border-gray-200 pb-3 dark:border-zinc-800">
                                                    <div>
                                                        <p className="font-bold text-gray-900 dark:text-white">{showtime.studio?.name}</p>
                                                        <p className="text-xs text-gray-500 dark:text-zinc-400">
                                                            Kapasitas: {showtime.studio?.capacity}
                                                        </p>
                                                    </div>
                                                    <p className="text-sm font-bold text-red-600 dark:text-red-500">{formatRupiah(showtime.price)}</p>
                                                </div>
                                                <div className="mb-6 flex items-end justify-between">
                                                    <p className="text-3xl font-black tracking-tighter text-gray-900 dark:text-white">
                                                        {showtime.start_time?.substring(0, 5)}
                                                    </p>
                                                    <p className="text-xs font-medium text-gray-500 dark:text-zinc-500">
                                                        s/d {showtime.end_time?.substring(0, 5)}
                                                    </p>
                                                </div>
                                            </div>
                                            <Link
                                                href={`/booking/${showtime.id}`}
                                                className="block w-full rounded-lg bg-red-600 py-2.5 text-center text-sm font-bold text-white transition-colors hover:bg-red-700"
                                            >
                                                Pilih Kursi
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-gray-50 py-24 dark:border-zinc-800 dark:bg-zinc-900/50">
                        <span className="mb-4 text-4xl">🎬</span>
                        <p className="text-lg font-medium text-gray-500 dark:text-zinc-400">Belum ada jadwal tayang untuk film ini.</p>
                    </div>
                )}
            </section>

            {/* 📰 SECTION ARTIKEL TERKAIT (RELATED POSTS) */}
            {relatedPosts && relatedPosts.length > 0 && (
                <section className="mx-auto max-w-7xl border-t border-gray-200 px-4 py-12 lg:px-8 dark:border-zinc-800">
                    <div className="mb-8 flex items-center gap-4">
                        <div className="h-8 w-1.5 rounded-full bg-red-600"></div>
                        <h2 className="text-2xl font-bold tracking-tight text-gray-900 md:text-3xl dark:text-white">Berita & Promo Terkait</h2>
                    </div>

                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {relatedPosts.map((post) => (
                            <Link
                                key={post.id}
                                href={route('posts.show', post.slug)}
                                className="group flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-red-500/5 dark:border-zinc-800 dark:bg-zinc-900/80"
                            >
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
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
                                    <div className="absolute top-3 left-3 rounded-md bg-red-600 px-2.5 py-1 text-[10px] font-black tracking-widest text-white uppercase shadow-lg">
                                        {post.type}
                                    </div>
                                </div>

                                <div className="flex flex-1 flex-col p-5">
                                    <h3 className="line-clamp-2 text-base font-bold text-gray-900 transition-colors group-hover:text-red-600 dark:text-white dark:group-hover:text-red-500">
                                        {post.title}
                                    </h3>
                                    <p className="mt-2 line-clamp-2 text-sm text-gray-600 dark:text-zinc-400">{post.excerpt}</p>

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
                </section>
            )}
        </MainLayout>
    );
}

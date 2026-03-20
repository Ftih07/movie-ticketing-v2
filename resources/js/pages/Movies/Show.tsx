import MainLayout from '@/layouts/MainLayout';
import { MovieDetail, Showtime } from '@/types';
import { Head, Link } from '@inertiajs/react';

interface Props {
    movie: MovieDetail & { trailer_url?: string }; // Tambahin trailer_url di type
    groupedShowtimes: Record<string, Showtime[]>;
}

const formatRupiah = (number: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);
};

// Helper buat ngambil ID Video YouTube dan ubah jadi link Embed
const getYouTubeEmbedUrl = (url: string | undefined) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? `https://www.youtube.com/embed/${match[2]}?autoplay=0&rel=0` : null;
};

export default function Show({ movie, groupedShowtimes }: Props) {
    const embedUrl = getYouTubeEmbedUrl(movie.trailer_url);

    return (
        <MainLayout>
            <Head title={`${movie.title} | Book Tickets`} />

            {/* Movie Detail Header ala Netflix */}
            <section className="relative w-full overflow-hidden bg-black pt-8 pb-12 md:pt-16 lg:pb-20">
                {/* Background Poster Blur & Darkened */}
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
                        {/* Kolom Kiri: Poster */}
                        <div className="mx-auto w-[200px] md:w-full">
                            <img
                                src={`/storage/${movie.poster}`}
                                alt={movie.title}
                                className="aspect-[2/3] w-full rounded-xl object-cover shadow-2xl ring-1 ring-gray-200 dark:ring-zinc-800"
                            />
                        </div>

                        {/* Kolom Kanan: Info, Synopsis, & Trailer */}
                        <div className="flex flex-col justify-center pt-4">
                            <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-gray-900 md:text-5xl lg:text-6xl dark:text-white">
                                {movie.title}
                            </h1>

                            <div className="mb-8 flex flex-wrap items-center gap-3">
                                <span className="font-semibold text-red-600 dark:text-red-500">{movie.duration} Minutes</span>
                                <span className="text-gray-300 dark:text-zinc-600">|</span>
                                {movie.categories?.map((cat) => (
                                    <span
                                        key={cat.id}
                                        className="rounded bg-gray-200 px-2.5 py-1 text-xs font-semibold text-gray-700 dark:bg-zinc-800 dark:text-zinc-300"
                                    >
                                        {cat.name}
                                    </span>
                                ))}
                            </div>

                            {/* Block Sinopsis */}
                            <div className="mb-8 rounded-xl border border-gray-200 bg-white/50 p-6 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/50">
                                <h3 className="mb-3 text-lg font-bold text-gray-900 dark:text-white">Synopsis</h3>
                                <p className="text-sm leading-relaxed text-gray-700 md:text-base dark:text-zinc-300">{movie.description}</p>
                            </div>

                            {/* Block Trailer (MUNCUL KALAU ADA TRAILER_URL) */}
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

            {/* Jadwal Tayang Section */}
            <section className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
                <div className="mb-10 flex items-center gap-4">
                    <div className="h-8 w-1.5 rounded-full bg-red-600"></div>
                    <h2 className="text-2xl font-bold tracking-tight text-gray-900 md:text-3xl dark:text-white">Pilih Jadwal & Studio</h2>
                </div>

                {Object.keys(groupedShowtimes).length > 0 ? (
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
                                                        {showtime.start_time.substring(0, 5)}
                                                    </p>
                                                    <p className="text-xs font-medium text-gray-500 dark:text-zinc-500">
                                                        s/d {showtime.end_time.substring(0, 5)}
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
        </MainLayout>
    );
}

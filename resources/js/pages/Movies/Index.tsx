import MainLayout from '@/layouts/MainLayout';
import { Movie } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

interface Props {
    movies: Movie[];
    selectedDate: string | null;
}

export default function Index({ movies, selectedDate }: Props) {
    // State buat handle input date lokal
    const [date, setDate] = useState(selectedDate || '');

    // Fungsi buat submit filter tanggal ke Laravel
    const handleFilterDate = (newDate: string) => {
        setDate(newDate);
        // Pakai router.get buat kirim query param '?date=YYYY-MM-DD'
        router.get(
            route('movies.index'),
            { date: newDate },
            {
                preserveState: true, // Biar input datenya ga ke-reset
                replace: true, // Ganti histori URL biar user bisa pencet back
            },
        );
    };

    return (
        <MainLayout>
            <Head title="All Movies | Browse" />

            {/* Header Halaman & Filter Tanggal */}
            <div className="mb-12 flex flex-col gap-4 border-b border-slate-800 pb-8 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight text-white">All Movies</h1>
                    <p className="mt-2 text-slate-400">Discover what's playing in MovieFlix today.</p>
                </div>

                {/* Input Filter Tanggal ala Neon */}
                <div className="relative flex items-center gap-3 rounded-full border border-slate-800 bg-slate-900 px-5 py-2.5 focus-within:ring-2 focus-within:ring-cyan-500">
                    <label htmlFor="filter_date" className="text-sm font-medium text-slate-400">
                        Filter by Date:
                    </label>
                    <input
                        type="date"
                        id="filter_date"
                        value={date}
                        onChange={(e) => handleFilterDate(e.target.value)}
                        className="bg-transparent text-sm text-white [color-scheme:dark] focus:outline-none" // [color-scheme:dark] biar icon kalendernya putih
                        min={new Date().toISOString().split('T')[0]} // Ngga bisa milih tanggal kemarin
                    />
                    {date && (
                        <button onClick={() => handleFilterDate('')} className="text-slate-500 hover:text-white">
                            ✕
                        </button>
                    )}
                </div>
            </div>

            {/* Grid Daftar Film */}
            {movies.length > 0 ? (
                <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                    {movies.map((movie) => (
                        <Link key={movie.id} href={route('movies.show', movie.slug)} className="group">
                            <div className="group-hover:ring-magenta neon-border-magenta relative aspect-[3/4] overflow-hidden rounded-2xl bg-slate-800 transition-all group-hover:scale-105 group-hover:ring-2">
                                <img src={`/storage/${movie.poster}`} alt={movie.title} className="absolute inset-0 h-full w-full object-cover" />
                            </div>
                            <h3 className="mt-4 text-base font-semibold text-slate-100 group-hover:text-white">{movie.title}</h3>
                            <p className="mt-1 text-xs text-slate-400">{movie.categories?.map((c) => c.name).join(', ')}</p>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="rounded-2xl border border-slate-800 bg-slate-900 py-20 text-center">
                    <p className="text-lg text-slate-500">Maaf, nggak ada film yang tayang di tanggal tersebut.</p>
                </div>
            )}
        </MainLayout>
    );
}

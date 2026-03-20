import MainLayout from '@/layouts/MainLayout';
import { Movie } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

interface Props {
    movies: Movie[];
    selectedDate: string | null;
}

export default function Index({ movies, selectedDate }: Props) {
    const [date, setDate] = useState(selectedDate || '');

    // Fungsi otomatis generate tanggal 14 hari ke depan
    const generateDates = (days = 14) => {
        const dates = [];
        const today = new Date();
        for (let i = 0; i < days; i++) {
            const d = new Date(today);
            d.setDate(today.getDate() + i);
            dates.push({
                value: d.toISOString().split('T')[0], // YYYY-MM-DD untuk dikirim ke backend
                day: d.toLocaleDateString('id-ID', { weekday: 'short' }), // Sen, Sel, Rab...
                month: d.toLocaleDateString('id-ID', { month: 'short' }), // Jan, Feb, Mar...
                date: d.getDate(), // 1, 2, 3...
            });
        }
        return dates;
    };

    const upcomingDates = generateDates();

    const handleFilterDate = (newDate: string) => {
        setDate(newDate);
        router.get(
            route('movies.index'),
            { date: newDate },
            {
                preserveState: true,
                replace: true,
            },
        );
    };
    
    return (
        <MainLayout>
            <Head title="All Movies | Browse" />

            <div className="mx-auto max-w-7xl px-4 pt-8 lg:px-8">
                {/* Header Halaman */}
                <div className="mb-8">
                    <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 md:text-4xl dark:text-white">All Movies</h1>
                    <p className="mt-2 text-sm text-gray-500 dark:text-zinc-400">Discover what's playing in MovieFlix today.</p>
                </div>

                {/* DATE STRIP FILTER (Horizontal Scroll) */}
                <div className="mb-10 border-b border-gray-200 pb-8 dark:border-zinc-800">
                    {/* [scrollbar-width:none] dll dipakai untuk menyembunyikan scrollbar bawaan browser biar clean */}
                    <div className="flex items-center gap-3 overflow-x-auto pb-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                        {/* Tombol "Semua Tanggal" */}
                        <button
                            onClick={() => handleFilterDate('')}
                            className={`flex min-w-[80px] flex-col items-center justify-center rounded-2xl border p-3 transition-all duration-200 ${
                                date === ''
                                    ? 'border-red-600 bg-red-600 text-white shadow-lg shadow-red-600/30'
                                    : 'border-gray-200 bg-white text-gray-500 hover:border-red-500 hover:text-red-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:border-red-500 dark:hover:text-red-400'
                            }`}
                        >
                            <span className="text-[10px] font-bold tracking-widest uppercase opacity-80">Semua</span>
                            <span className="text-xl font-black tracking-tighter">Film</span>
                        </button>

                        {/* Looping Tanggal */}
                        {upcomingDates.map((item) => {
                            const isSelected = date === item.value;
                            return (
                                <button
                                    key={item.value}
                                    onClick={() => handleFilterDate(item.value)}
                                    className={`group flex min-w-[80px] flex-col items-center justify-center rounded-2xl border p-3 transition-all duration-200 ${
                                        isSelected
                                            ? 'scale-105 border-red-600 bg-red-600 text-white shadow-lg shadow-red-600/30'
                                            : 'border-gray-200 bg-white text-gray-500 hover:border-red-500 hover:text-red-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:border-red-500 dark:hover:text-red-400'
                                    }`}
                                >
                                    <span
                                        className={`text-[10px] font-bold tracking-widest uppercase ${isSelected ? 'text-red-200' : 'text-gray-400 group-hover:text-red-400 dark:text-zinc-500'}`}
                                    >
                                        {item.day}
                                    </span>
                                    <span className="text-2xl font-black tracking-tighter">{item.date}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Grid Daftar Film */}
                {movies.data.length > 0 ? (
                    <>
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:gap-6 lg:grid-cols-5 xl:grid-cols-6">
                            {/* Pakai movies.data.map karena data filmnya sekarang ada di dalam property 'data' */}
                            {movies.data.map((movie) => (
                                <Link key={movie.id} href={route('movies.show', movie.slug)} className="group relative block">
                                    <div className="relative aspect-[2/3] w-full overflow-hidden rounded-md bg-gray-200 transition-transform duration-300 group-hover:z-10 group-hover:scale-105 group-hover:shadow-xl dark:bg-zinc-800">
                                        <img
                                            src={`/storage/${movie.poster}`}
                                            alt={movie.title}
                                            className="absolute inset-0 h-full w-full object-cover transition-opacity duration-300"
                                        />

                                        <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/90 via-black/40 to-transparent p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                                            <h3 className="line-clamp-1 text-sm font-bold text-white">{movie.title}</h3>
                                            <p className="mt-1 text-xs font-medium text-gray-300">
                                                {movie.categories?.map((c) => c.name).join(', ')}
                                            </p>
                                            <button className="mt-3 w-full rounded bg-white py-1.5 text-xs font-bold text-black transition-colors hover:bg-gray-200">
                                                Book Now
                                            </button>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>

                        {/* --- BAGIAN PAGINATION --- */}
                        <div className="mt-12 flex items-center justify-center gap-2 pb-10">
                            {movies.links.map((link, index) => (
                                <Link
                                    key={index}
                                    href={link.url || '#'}
                                    // Menggunakan dangerouslySetInnerHTML karena label dari Laravel bisa mengandung entitas HTML seperti &laquo;
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                    className={`flex h-10 min-w-[40px] items-center justify-center rounded-lg px-3 text-sm font-bold transition-all duration-200 ${
                                        link.active
                                            ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                                            : 'bg-white text-zinc-600 hover:border-red-500 hover:text-red-600 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-red-400'
                                    } ${!link.url ? 'pointer-events-none opacity-30' : 'border border-gray-200 dark:border-zinc-800'} `}
                                    // Preserve state agar filter tanggal tidak hilang saat pindah halaman
                                    preserveState
                                />
                            ))}
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-gray-50 py-32 dark:border-zinc-800 dark:bg-zinc-900/50">
                        <span className="mb-4 text-4xl">🍿</span>
                        <p className="text-lg font-medium text-gray-500 dark:text-zinc-400">Oops, no movies playing on this date.</p>
                        <button onClick={() => handleFilterDate('')} className="mt-4 text-sm font-semibold text-red-600 hover:text-red-700">
                            Clear date filter
                        </button>
                    </div>
                )}
            </div>
        </MainLayout>
    );
}

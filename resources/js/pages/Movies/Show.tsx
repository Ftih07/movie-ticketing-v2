import MainLayout from '@/layouts/MainLayout';
import { MovieDetail, Showtime } from '@/types';
import { Head, Link } from '@inertiajs/react';

interface Props {
    movie: MovieDetail;
    groupedShowtimes: Record<string, Showtime[]>;
}

// Helper buat formatting harga Rupiah
const formatRupiah = (number: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);
};

export default function Show({ movie, groupedShowtimes }: Props) {
    return (
        <MainLayout>
            <Head title={`${movie.title} | Book Tickets`} />

            {/* Movie Detail Header ala Netflix */}
            <section className="relative -mx-4 mb-16 overflow-hidden border-b border-slate-800 bg-slate-900 p-8 lg:-mx-8 lg:p-12">
                {/* Background Poster Blur */}
                <img
                    src={`/storage/${movie.poster}`}
                    alt={movie.title}
                    className="absolute inset-0 h-full w-full scale-110 object-cover opacity-10 blur-xl"
                />

                <div className="relative z-10 grid grid-cols-1 items-start gap-12 md:grid-cols-[250px,1fr]">
                    {/* Poster Kiri */}
                    <img
                        src={`/storage/${movie.poster}`}
                        alt={movie.title}
                        className="neon-border-magenta aspect-[3/4] rounded-2xl object-cover shadow-2xl ring-1 shadow-black ring-slate-700"
                    />

                    {/* Info Kanan */}
                    <div>
                        <h1 className="mb-2 text-5xl font-extrabold tracking-tight text-white">{movie.title}</h1>
                        <p className="neon-text-cyan mb-6 text-lg font-medium text-cyan-300">⏳ {movie.duration} Menit</p>

                        <div className="mb-8 inline-flex gap-2">
                            {movie.categories?.map((cat) => (
                                <span
                                    key={cat.id}
                                    className="rounded-full border border-slate-700 bg-slate-800 px-4 py-1.5 text-xs font-semibold text-slate-300"
                                >
                                    {cat.name}
                                </span>
                            ))}
                        </div>

                        <div className="prose prose-sm prose-slate prose-invert max-w-none">
                            <p>{movie.description}</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Jadwal Tayang Section */}
            <section>
                <h2 className="border-magenta mb-10 border-l-4 pl-4 text-3xl font-extrabold tracking-tight text-white">Pilih Jadwal & Studio</h2>

                {Object.keys(groupedShowtimes).length > 0 ? (
                    // Looping berdasarkan TANGGAL
                    Object.entries(groupedShowtimes).map(([date, showtimes]) => (
                        <div key={date} className="mb-12 rounded-2xl border border-slate-800 bg-slate-900 p-8">
                            {/* Formatting Tanggal Bahasa Indonesia */}
                            <h3 className="mb-8 inline-block rounded-xl bg-slate-800 px-5 py-2 text-xl font-bold text-white">
                                📅 {new Date(date).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                            </h3>

                            {/* Looping JADWAL TAYANG di tanggal tersebut */}
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {showtimes.map((showtime) => (
                                    <div
                                        key={showtime.id}
                                        className="group neon-border-cyan rounded-2xl border border-slate-800 bg-slate-950 p-6 transition-all hover:border-cyan-600 hover:ring-1 hover:ring-cyan-600"
                                    >
                                        <div className="mb-4 flex items-start justify-between border-b border-slate-800 pb-4">
                                            <div>
                                                <p className="text-sm font-semibold text-slate-300">{showtime.studio?.name}</p>
                                                <p className="text-xs text-slate-500">Kapasitas: {showtime.studio?.capacity} Kursi</p>
                                            </div>
                                            <p className="text-lg font-bold text-white">{formatRupiah(showtime.price)}</p>
                                        </div>

                                        <div className="mb-6 flex items-center justify-between">
                                            <p className="font-mono text-3xl font-extrabold tracking-tight text-white">
                                                {showtime.start_time.substring(0, 5)} {/* HH:mm */}
                                            </p>
                                            <p className="text-xs text-slate-600">Selesai {showtime.end_time.substring(0, 5)}</p>
                                        </div>

                                        {/* Button Pilih Kursi (Placeholder Link) */}
                                        <Link
                                            href={`/booking/${showtime.id}`} // Rute booking yang bakal kita bikin nanti
                                            className="block rounded-xl bg-cyan-600 px-6 py-3 text-center text-sm font-semibold text-white transition-all hover:bg-cyan-500"
                                        >
                                            Pilih Kursi
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="rounded-2xl border border-slate-800 bg-slate-900 py-20 text-center">
                        <p className="text-lg text-slate-500">Maaf, belum ada jadwal tayang untuk film ini.</p>
                    </div>
                )}
            </section>
        </MainLayout>
    );
}

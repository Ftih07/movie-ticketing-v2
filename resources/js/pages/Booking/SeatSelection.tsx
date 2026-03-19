import MainLayout from '@/layouts/MainLayout';
import { Showtime } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import axios from 'axios';
import { useEffect, useState } from 'react';

interface Props {
    showtime: Showtime & { movie: any; studio: any };
    bookedSeats: string[];
    midtransClientKey: string;
}

export default function SeatSelection({ showtime, bookedSeats, midtransClientKey }: Props) {
    const { auth } = usePage().props;
    const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);

    // Bikin konfigurasi baris dan kolom kursi (Misal: 5 Baris, 10 Kolom)
    const rows = ['A', 'B', 'C', 'D', 'E'];
    const cols = Array.from({ length: 10 }, (_, i) => i + 1);

    // 1. Cek SessionStorage saat komponen dimuat (Siapa tau user baru balik dari halaman Login)
    useEffect(() => {
        const savedSeats = sessionStorage.getItem(`seats_${showtime.id}`);
        if (savedSeats) {
            setSelectedSeats(JSON.parse(savedSeats));
            sessionStorage.removeItem(`seats_${showtime.id}`); // Bersihkan setelah dipakai
        }

        // 2. Inject Script Midtrans Snap ke Body
        const scriptUrl = 'https://app.sandbox.midtrans.com/snap/snap.js';
        let scriptTag = document.createElement('script');
        scriptTag.src = scriptUrl;
        scriptTag.setAttribute('data-client-key', midtransClientKey);
        document.body.appendChild(scriptTag);

        return () => {
            document.body.removeChild(scriptTag);
        };
    }, [showtime.id, midtransClientKey]);

    // Handle klik kursi
    const toggleSeat = (seat: string) => {
        if (bookedSeats.includes(seat)) return; // Kalau udah dibooking, abaikan

        setSelectedSeats((prev) => (prev.includes(seat) ? prev.filter((s) => s !== seat) : [...prev, seat]));
    };

    // LOGIKA CONTINUE & CHECKOUT
    const handleContinue = async () => {
        if (selectedSeats.length === 0) return alert('Pilih minimal 1 kursi bos!');

        // AUTH CHECK: Kalau belum login, simpan kursi sementara & lempar ke login
        if (!auth.user) {
            sessionStorage.setItem(`seats_${showtime.id}`, JSON.stringify(selectedSeats));
            return router.visit(route('login')); // Nanti abis login otomatis balik kesini berkat intended()
        }

        // Kalau udah login, kita proses pembayaran!
        setIsProcessing(true);
        try {
            const response = await axios.post(route('booking.checkout', showtime.id), {
                seats: selectedSeats,
            });

            // Panggil pop-up Midtrans pakai snap_token dari backend
            window.snap.pay(response.data.snap_token, {
                onSuccess: function (result: any) {
                    router.visit(route('history.index')); // Lempar ke history
                },
                onPending: function (result: any) {
                    router.visit(route('history.index')); // Lempar ke history
                },
                onError: function (result: any) {
                    router.visit(route('history.index')); // Lempar ke history
                },
                onClose: function () {
                    // User nge-close popup tanpa nyelesain aksi apa-apa
                    router.visit(route('history.index'));
                },
            });
        } catch (error) {
            console.error('Gagal checkout', error);
            alert('Terjadi kesalahan sistem.');
        } finally {
            setIsProcessing(false);
        }
    };

    const totalPrice = selectedSeats.length * showtime.price;

    return (
        <MainLayout>
            <Head title={`Pilih Kursi | ${showtime.movie.title}`} />

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                {/* KIRI: AREA PILIH KURSI */}
                <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-xl lg:col-span-2">
                    <h2 className="border-magenta mb-8 border-l-4 pl-3 text-2xl font-bold text-white">Layar Bioskop</h2>

                    {/* Visual Layar */}
                    <div className="neon-border-cyan mb-12 h-8 w-full rounded-t-full border-t-4 border-cyan-400 bg-gradient-to-b from-cyan-500/40 to-transparent opacity-60"></div>

                    {/* Grid Kursi */}
                    <div className="flex flex-col items-center gap-4">
                        {rows.map((row) => (
                            <div key={row} className="flex gap-2 sm:gap-4">
                                {/* Angka Kolom */}
                                {cols.map((col) => {
                                    const seatCode = `${row}${col}`;
                                    const isBooked = bookedSeats.includes(seatCode);
                                    const isSelected = selectedSeats.includes(seatCode);

                                    return (
                                        <button
                                            key={seatCode}
                                            disabled={isBooked}
                                            onClick={() => toggleSeat(seatCode)}
                                            className={`flex h-8 w-8 items-center justify-center rounded-t-lg rounded-b-sm text-xs font-bold transition-all sm:h-10 sm:w-10 ${
                                                isBooked
                                                    ? 'cursor-not-allowed bg-slate-700 text-slate-500'
                                                    : isSelected
                                                      ? 'bg-magenta neon-border-magenta scale-110 text-white'
                                                      : 'bg-slate-800 text-slate-400 ring-1 ring-slate-700 hover:bg-cyan-600 hover:text-white'
                                            } `}
                                        >
                                            {seatCode}
                                        </button>
                                    );
                                })}
                            </div>
                        ))}
                    </div>

                    {/* Keterangan Warna */}
                    <div className="mt-12 flex justify-center gap-8 text-sm text-slate-400">
                        <div className="flex items-center gap-2">
                            <div className="h-4 w-4 rounded-sm bg-slate-800 ring-1 ring-slate-700"></div> Tersedia
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="bg-magenta neon-border-magenta h-4 w-4 rounded-sm"></div> Pilihanmu
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="h-4 w-4 rounded-sm bg-slate-700"></div> Terisi
                        </div>
                    </div>
                </div>

                {/* KANAN: BOOKING SUMMARY */}
                <div className="sticky top-24 h-fit rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-xl">
                    <h3 className="mb-6 text-xl font-bold text-white">Booking Summary</h3>

                    <div className="mb-6 space-y-4 border-b border-slate-800 pb-6">
                        <div>
                            <p className="text-sm text-slate-400">Film</p>
                            <p className="font-semibold text-white">{showtime.movie.title}</p>
                        </div>
                        <div className="flex justify-between">
                            <div>
                                <p className="text-sm text-slate-400">Studio</p>
                                <p className="font-semibold text-white">{showtime.studio.name}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-slate-400">Waktu</p>
                                <p className="font-semibold text-cyan-400">{showtime.start_time.substring(0, 5)}</p>
                            </div>
                        </div>
                        <div>
                            <p className="text-sm text-slate-400">Kursi Terpilih</p>
                            <p className="font-semibold text-white">{selectedSeats.length > 0 ? selectedSeats.join(', ') : '-'}</p>
                        </div>
                    </div>

                    <div className="mb-8 flex items-center justify-between">
                        <p className="text-slate-400">Total Pembayaran</p>
                        <p className="text-magenta text-2xl font-extrabold">Rp {totalPrice.toLocaleString('id-ID')}</p>
                    </div>

                    <button
                        onClick={handleContinue}
                        disabled={selectedSeats.length === 0 || isProcessing}
                        className="w-full rounded-xl bg-cyan-600 py-4 font-bold text-white transition-all hover:bg-cyan-500 disabled:cursor-not-allowed disabled:bg-slate-800 disabled:text-slate-500"
                    >
                        {isProcessing ? 'Memproses...' : auth.user ? 'Bayar Sekarang (Midtrans)' : 'Login untuk Lanjut'}
                    </button>
                </div>
            </div>
        </MainLayout>
    );
}

// Deklarasi Window biar TypeScript ngga bawel soal window.snap
declare global {
    interface Window {
        snap: any;
    }
}

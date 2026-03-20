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

            <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                    {/* KIRI: AREA PILIH KURSI */}
                    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8 lg:col-span-2 dark:border-zinc-800 dark:bg-zinc-900">
                        <div className="mb-8 flex items-center gap-3">
                            <div className="h-6 w-1.5 rounded-full bg-red-600"></div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Layar Bioskop</h2>
                        </div>

                        {/* Visual Layar Elegan */}
                        <div className="relative mb-14 flex justify-center">
                            <div className="h-10 w-full max-w-lg rounded-t-[50%] border-t-2 border-gray-300 bg-gradient-to-b from-gray-200 to-transparent opacity-80 shadow-[0_-10px_20px_-5px_rgba(0,0,0,0.1)] dark:border-zinc-700 dark:from-zinc-800 dark:to-transparent dark:shadow-[0_-10px_20px_-5px_rgba(255,255,255,0.05)]"></div>
                            <p className="absolute bottom-2 text-xs font-semibold tracking-widest text-gray-400 uppercase dark:text-zinc-500">
                                Screen
                            </p>
                        </div>

                        {/* Grid Kursi */}
                        <div className="flex flex-col items-center gap-3 overflow-x-auto pb-4 sm:gap-4">
                            {rows.map((row) => (
                                <div key={row} className="flex gap-2 sm:gap-3">
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
                                                className={`flex h-8 w-8 items-center justify-center rounded-t-lg rounded-b-sm text-[10px] font-bold transition-all duration-200 sm:h-10 sm:w-10 sm:text-xs ${
                                                    isBooked
                                                        ? 'cursor-not-allowed bg-gray-100 text-gray-400 dark:bg-zinc-800/80 dark:text-zinc-600'
                                                        : isSelected
                                                          ? 'scale-110 bg-red-600 text-white shadow-lg shadow-red-600/30'
                                                          : 'bg-white text-gray-600 ring-1 ring-gray-300 hover:-translate-y-1 hover:text-red-600 hover:ring-red-500 dark:bg-zinc-950 dark:text-zinc-400 dark:ring-zinc-700 dark:hover:text-red-500 dark:hover:ring-red-500'
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
                        <div className="mt-12 flex flex-wrap justify-center gap-6 text-xs font-medium text-gray-500 sm:gap-8 sm:text-sm dark:text-zinc-400">
                            <div className="flex items-center gap-2">
                                <div className="h-5 w-5 rounded-t-md rounded-b-sm bg-white ring-1 ring-gray-300 dark:bg-zinc-950 dark:ring-zinc-700"></div>
                                <span>Tersedia</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="h-5 w-5 rounded-t-md rounded-b-sm bg-red-600 shadow-sm shadow-red-600/30"></div>
                                <span>Pilihanmu</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="h-5 w-5 rounded-t-md rounded-b-sm bg-gray-100 dark:bg-zinc-800"></div>
                                <span>Terisi</span>
                            </div>
                        </div>
                    </div>

                    {/* KANAN: BOOKING SUMMARY */}
                    <div className="sticky top-24 h-fit rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8 dark:border-zinc-800 dark:bg-zinc-900">
                        <h3 className="mb-6 text-xl font-bold text-gray-900 dark:text-white">Booking Summary</h3>

                        <div className="mb-6 space-y-5 border-b border-gray-100 pb-6 dark:border-zinc-800">
                            <div>
                                <p className="text-xs font-medium text-gray-500 dark:text-zinc-400">Film</p>
                                <p className="text-lg leading-tight font-bold text-gray-900 dark:text-white">{showtime.movie.title}</p>
                            </div>
                            <div className="flex justify-between">
                                <div>
                                    <p className="text-xs font-medium text-gray-500 dark:text-zinc-400">Studio</p>
                                    <p className="font-semibold text-gray-900 dark:text-white">{showtime.studio.name}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-medium text-gray-500 dark:text-zinc-400">Waktu</p>
                                    <p className="font-bold text-red-600">{showtime.start_time.substring(0, 5)} WIB</p>
                                </div>
                            </div>
                            <div className="rounded-lg bg-gray-50 p-4 dark:bg-zinc-950/50">
                                <p className="mb-1 text-xs font-medium text-gray-500 dark:text-zinc-400">Kursi Terpilih</p>
                                <p className="font-bold text-gray-900 dark:text-white">
                                    {selectedSeats.length > 0 ? (
                                        selectedSeats.join(', ')
                                    ) : (
                                        <span className="font-normal text-gray-400 italic">Belum ada kursi yang dipilih</span>
                                    )}
                                </p>
                            </div>
                        </div>

                        <div className="mb-8 flex items-end justify-between">
                            <p className="text-sm font-semibold text-gray-600 dark:text-zinc-400">Total Harga</p>
                            <p className="text-2xl font-black tracking-tight text-gray-900 dark:text-white">
                                Rp {totalPrice.toLocaleString('id-ID')}
                            </p>
                        </div>

                        <button
                            onClick={handleContinue}
                            disabled={selectedSeats.length === 0 || isProcessing}
                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-red-600/20 transition-all hover:bg-red-700 hover:shadow-xl hover:shadow-red-600/30 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400 disabled:shadow-none dark:disabled:bg-zinc-800 dark:disabled:text-zinc-600"
                        >
                            {isProcessing ? 'Memproses...' : auth.user ? <>Bayar Sekarang</> : <>Login untuk Lanjut &rarr;</>}
                        </button>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}

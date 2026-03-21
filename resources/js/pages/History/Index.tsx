import MainLayout from '@/layouts/MainLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useEffect } from 'react';
import QRCode from 'react-qr-code';

interface Props {
    bookings: any[];
    midtransClientKey: string;
}

// Helper badge status
const StatusBadge = ({ status }: { status: string }) => {
    switch (status) {
        case 'paid':
            return (
                <span className="rounded bg-green-100 px-2.5 py-1 text-xs font-bold tracking-wider text-green-700 uppercase dark:bg-green-900/30 dark:text-green-400">
                    Berhasil
                </span>
            );
        case 'pending':
            return (
                <span className="rounded bg-yellow-100 px-2.5 py-1 text-xs font-bold tracking-wider text-yellow-700 uppercase dark:bg-yellow-900/30 dark:text-yellow-400">
                    Menunggu Pembayaran
                </span>
            );
        default:
            return (
                <span className="rounded bg-red-100 px-2.5 py-1 text-xs font-bold tracking-wider text-red-700 uppercase dark:bg-red-900/30 dark:text-red-400">
                    Gagal / Expired
                </span>
            );
    }
};

export default function History({ bookings, midtransClientKey }: Props) {
    useEffect(() => {
        const scriptUrl = 'https://app.sandbox.midtrans.com/snap/snap.js';
        let scriptTag = document.createElement('script');
        scriptTag.src = scriptUrl;
        scriptTag.setAttribute('data-client-key', midtransClientKey);
        document.body.appendChild(scriptTag);

        return () => {
            document.body.removeChild(scriptTag);
        };
    }, [midtransClientKey]);

    const handleLanjutBayar = (snapToken: string) => {
        if (!snapToken) {
            alert('Token pembayaran tidak valid!');
            return;
        }

        window.snap.pay(snapToken, {
            onSuccess: function () {
                router.reload();
            },
            onPending: function () {
                router.reload();
            },
            onError: function () {
                alert('Pembayaran Gagal!');
                router.reload();
            },
            onClose: function () {
                router.reload();
            },
        });
    };

    // Fungsi Download QR di-UPGRADE nambah info Snack
    const downloadQR = (booking: any) => {
        const svg = document.getElementById(`qr-${booking.booking_code}`);
        if (!svg) return;

        const svgData = new XMLSerializer().serializeToString(svg);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        img.onload = () => {
            // Tinggi canvas diperbesar kalau ada F&B biar muat
            const hasSnacks = booking.booking_products && booking.booking_products.length > 0;
            const extraHeight = hasSnacks ? booking.booking_products.length * 20 + 40 : 0;
            canvas.width = 400;
            canvas.height = 550 + extraHeight;

            if (ctx) {
                // Background Putih full
                ctx.fillStyle = 'white';
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                // Header Gelap
                ctx.fillStyle = '#09090b';
                ctx.fillRect(0, 0, canvas.width, 70);

                // Teks Header
                ctx.fillStyle = '#dc2626';
                ctx.font = '900 24px sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText('MOVIEFLIX TICKET', canvas.width / 2, 42);

                // Teks Judul Film
                ctx.fillStyle = '#09090b';
                ctx.font = 'bold 22px sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText(booking.showtime.movie.title, canvas.width / 2, 110);

                // Kode Order
                ctx.fillStyle = '#71717a';
                ctx.font = '14px monospace';
                ctx.fillText(`ORDER ID: ${booking.booking_code}`, canvas.width / 2, 135);

                // Gambar QR Code
                const qrSize = 200;
                const qrX = (canvas.width - qrSize) / 2;
                const qrY = 160;
                ctx.drawImage(img, qrX, qrY, qrSize, qrSize);

                // Info Studio & Jadwal
                ctx.textAlign = 'left';
                const col1 = 50;
                const col2 = 220;
                let startY = 410;

                // Baris 1: Tanggal & Waktu
                ctx.fillStyle = '#a1a1aa';
                ctx.font = '12px sans-serif';
                ctx.fillText('Tanggal', col1, startY);
                ctx.fillText('Waktu', col2, startY);

                ctx.fillStyle = '#18181b';
                ctx.font = 'bold 16px sans-serif';
                ctx.fillText(booking.showtime.show_date, col1, startY + 20);
                ctx.fillText(booking.showtime.start_time.substring(0, 5) + ' WIB', col2, startY + 20);

                startY += 60;

                // Baris 2: Studio & Kursi
                ctx.fillStyle = '#a1a1aa';
                ctx.font = '12px sans-serif';
                ctx.fillText('Studio', col1, startY);
                ctx.fillText('Kursi', col2, startY);

                ctx.fillStyle = '#18181b';
                ctx.font = 'bold 16px sans-serif';
                ctx.fillText(booking.showtime.studio.name, col1, startY + 20);

                ctx.fillStyle = '#dc2626';
                ctx.font = '900 16px sans-serif';
                const seats = booking.tickets.map((t: any) => t.seat_code).join(', ');
                ctx.fillText(seats, col2, startY + 20);

                // --- BAGIAN BARU: INFO F&B ---
                if (hasSnacks) {
                    startY += 50;

                    // Garis pembatas
                    ctx.beginPath();
                    ctx.moveTo(col1, startY);
                    ctx.lineTo(canvas.width - 50, startY);
                    ctx.strokeStyle = '#e4e4e7'; // zinc-200
                    ctx.stroke();

                    startY += 25;
                    ctx.fillStyle = '#a1a1aa';
                    ctx.font = '12px sans-serif';
                    ctx.fillText('Pesanan F&B:', col1, startY);

                    startY += 20;
                    ctx.fillStyle = '#18181b';
                    ctx.font = 'bold 14px sans-serif';

                    booking.booking_products.forEach((bp: any) => {
                        // Cek status F&B (opsional, bisa tampilin kalau 'unclaimed')
                        const statusClaim = bp.status === 'claimed' ? '(Sudah Diambil)' : '';
                        ctx.fillText(`${bp.quantity}x ${bp.product.name} ${statusClaim}`, col1, startY);
                        startY += 20;
                    });
                }

                // Convert & Download
                const pngFile = canvas.toDataURL('image/png');
                const downloadLink = document.createElement('a');
                downloadLink.download = `Ticket-${booking.showtime.movie.title.replace(/\s+/g, '-')}-${booking.booking_code}.png`;
                downloadLink.href = `${pngFile}`;
                downloadLink.click();
            }
        };

        img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
    };

    return (
        <MainLayout>
            <Head title="My Tickets | MovieFlix" />

            <div className="mx-auto max-w-4xl px-4 py-8 lg:px-0">
                <div className="mb-10">
                    <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 md:text-4xl dark:text-white">My Tickets</h1>
                    <p className="mt-2 text-sm text-gray-500 dark:text-zinc-400">Riwayat pemesanan kursi dan F&B bioskop kamu.</p>
                </div>

                {bookings.length > 0 ? (
                    <div className="space-y-6">
                        {bookings.map((booking) => (
                            <div
                                key={booking.id}
                                className="flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all hover:border-red-500 hover:shadow-md md:flex-row dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-red-500"
                            >
                                {/* Kiri: Poster Film */}
                                <div className="relative h-48 bg-gray-200 md:h-auto md:w-48 dark:bg-zinc-800">
                                    <img
                                        src={
                                            booking.showtime.movie.poster
                                                ? `/storage/${booking.showtime.movie.poster}`
                                                : 'https://placehold.co/400x600/1e293b/white?text=No+Poster'
                                        }
                                        alt={booking.showtime.movie.title}
                                        className="h-full w-full object-cover"
                                    />
                                </div>

                                {/* Tengah: Detail Tiket & F&B */}
                                <div className="flex flex-1 flex-col justify-between p-6 sm:p-8">
                                    <div>
                                        <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row">
                                            <div>
                                                <p className="mb-1 font-mono text-xs font-semibold text-gray-500 dark:text-zinc-400">
                                                    ORDER: {booking.booking_code}
                                                </p>
                                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{booking.showtime.movie.title}</h2>
                                            </div>
                                            <div className="flex flex-col items-start gap-2 sm:items-end">
                                                <StatusBadge status={booking.status} />

                                                {booking.status === 'paid' &&
                                                    booking.tickets?.length > 0 &&
                                                    (booking.tickets.every((t: any) => t.status === 'used') ? (
                                                        <span className="rounded border border-gray-200 bg-gray-50 px-2 py-1 text-[10px] font-bold tracking-wider text-gray-500 uppercase dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400">
                                                            Sudah Dipakai
                                                        </span>
                                                    ) : (
                                                        <span className="rounded border border-red-200 bg-red-50 px-2 py-1 text-[10px] font-bold tracking-wider text-red-600 uppercase dark:border-red-900/30 dark:bg-red-900/10 dark:text-red-400">
                                                            Bisa Digunakan
                                                        </span>
                                                    ))}
                                            </div>
                                        </div>

                                        <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
                                            {/* ... (Detail Tanggal, Waktu, Studio, Kursi SAMA SEPERTI SEBELUMNYA) ... */}
                                            <div>
                                                <p className="text-xs font-medium text-gray-500 dark:text-zinc-400">Tanggal</p>
                                                <p className="text-sm font-bold text-gray-900 dark:text-zinc-200">{booking.showtime.show_date}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs font-medium text-gray-500 dark:text-zinc-400">Waktu</p>
                                                <p className="text-sm font-bold text-gray-900 dark:text-zinc-200">
                                                    {booking.showtime.start_time.substring(0, 5)}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs font-medium text-gray-500 dark:text-zinc-400">Studio</p>
                                                <p className="text-sm font-bold text-gray-900 dark:text-zinc-200">{booking.showtime.studio.name}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs font-medium text-gray-500 dark:text-zinc-400">Kursi</p>
                                                <p className="text-sm font-black text-red-600">
                                                    {booking.tickets.map((t: any) => t.seat_code).join(', ')}
                                                </p>
                                            </div>
                                        </div>

                                        {/* --- BAGIAN BARU: TAMPILAN SNACK DI UI --- */}
                                        {booking.booking_products && booking.booking_products.length > 0 && (
                                            <div className="mb-6 rounded-lg border border-gray-100 bg-gray-50 p-4 dark:border-zinc-800 dark:bg-zinc-950/50">
                                                <p className="mb-2 text-xs font-bold tracking-wider text-gray-500 uppercase dark:text-zinc-400">
                                                    Pesanan F&B
                                                </p>
                                                <ul className="space-y-1">
                                                    {booking.booking_products.map((bp: any) => (
                                                        <li key={bp.id} className="flex justify-between text-sm">
                                                            <span className="font-semibold text-gray-700 dark:text-zinc-300">
                                                                {bp.quantity}x {bp.product.name}
                                                            </span>
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-gray-500 dark:text-zinc-500">
                                                                    Rp {(bp.price * bp.quantity).toLocaleString('id-ID')}
                                                                </span>
                                                                {/* Tanda kecil kalau udah diambil atau belum */}
                                                                {bp.status === 'claimed' ? (
                                                                    <span className="rounded bg-gray-200 px-1.5 py-0.5 text-[10px] text-gray-600 dark:bg-zinc-800 dark:text-zinc-400">
                                                                        Claimed
                                                                    </span>
                                                                ) : (
                                                                    <span className="rounded bg-red-100 px-1.5 py-0.5 text-[10px] text-red-600 dark:bg-red-900/30 dark:text-red-400">
                                                                        Unclaimed
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>

                                    {/* Footer Kartu (Total Harga & Tombol) */}
                                    <div className="flex items-center justify-between border-t border-gray-100 pt-6 dark:border-zinc-800">
                                        <div>
                                            <p className="text-xs font-medium text-gray-500 dark:text-zinc-400">Total Pengeluaran</p>
                                            <p className="text-xl font-bold text-gray-900 dark:text-white">
                                                Rp {booking.total_amount.toLocaleString('id-ID')}
                                            </p>
                                        </div>

                                        {/* Kalau status pending nampilin tombol bayar */}
                                        {booking.status === 'pending' && (
                                            <button
                                                onClick={() => handleLanjutBayar(booking.snap_token)}
                                                className="rounded-lg bg-red-600 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-red-700"
                                            >
                                                Lanjut Bayar
                                            </button>
                                        )}

                                        {/* TAMBAHAN BARU: Kalau lunas dan belum tayang, munculin tombol Tambah F&B */}
                                        {booking.status === 'paid' &&
                                            new Date(`${booking.showtime.show_date}T${booking.showtime.end_time}`) > new Date() && (
                                                <Link
                                                    href={route('history.add-snacks', booking.id)}
                                                    className="rounded-lg border border-red-600 px-4 py-2 text-sm font-bold text-red-600 transition-colors hover:bg-red-50 dark:border-red-500 dark:text-red-500 dark:hover:bg-red-900/20"
                                                >
                                                    + Tambah Pesanan F&B
                                                </Link>
                                            )}
                                    </div>
                                </div>

                                {/* Kanan: TAMPILIN QR CODE DISINI KALAU LUNAS */}
                                {booking.status === 'paid' && (
                                    <div className="flex flex-col items-center justify-center border-t border-dashed border-gray-200 bg-gray-50 p-6 md:w-48 md:border-t-0 md:border-l dark:border-zinc-800 dark:bg-zinc-950">
                                        <div className="rounded-lg bg-white p-2 shadow-sm">
                                            <QRCode id={`qr-${booking.booking_code}`} value={booking.booking_code} size={100} />
                                        </div>
                                        <p className="mt-3 text-center text-xs font-medium text-gray-500 dark:text-zinc-400">Scan at Entrance</p>

                                        <button
                                            onClick={() => downloadQR(booking)}
                                            className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-md border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-gray-700 transition hover:bg-gray-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                                        >
                                            {/* (Icon SVG SAMA KAYAK SEBELUMNYA) */}
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="h-4 w-4"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                                strokeWidth={2}
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                                                />
                                            </svg>
                                            Unduh Tiket
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    // (Bagian Empty State SAMA KAYAK SEBELUMNYA)
                    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-gray-50 py-24 dark:border-zinc-800 dark:bg-zinc-900/50">
                        <span className="mb-4 text-4xl text-gray-400 dark:text-zinc-600">🎟️</span>
                        <p className="text-lg font-medium text-gray-600 dark:text-zinc-400">Kamu belum punya riwayat pemesanan tiket.</p>
                        <Link
                            href="/"
                            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-red-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-red-700"
                        >
                            Cari Film Sekarang &rarr;
                        </Link>
                    </div>
                )}
            </div>
        </MainLayout>
    );
}

declare global {
    interface Window {
        snap: any;
    }
}

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
                <span className="rounded-full border border-green-500/20 bg-green-500/10 px-3 py-1 text-xs font-bold tracking-wider text-green-400 uppercase">
                    Berhasil
                </span>
            );
        case 'pending':
            return (
                <span className="rounded-full border border-yellow-500/20 bg-yellow-500/10 px-3 py-1 text-xs font-bold tracking-wider text-yellow-400 uppercase">
                    Menunggu Pembayaran
                </span>
            );
        default:
            return (
                <span className="rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1 text-xs font-bold tracking-wider text-red-400 uppercase">
                    Gagal / Expired
                </span>
            );
    }
};

export default function History({ bookings, midtransClientKey }: Props) {
    // 1. Inject Script Midtrans pas halaman dibuka
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

    // 2. Fungsi buat Lanjut Bayar
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

    // 3. Fungsi Download QR yang di-UPGRADE jadi E-Ticket
    const downloadQR = (booking: any) => {
        const svg = document.getElementById(`qr-${booking.booking_code}`);
        if (!svg) return;

        const svgData = new XMLSerializer().serializeToString(svg);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        img.onload = () => {
            // Lebarin ukuran canvas biar muat teks (Mirip ukuran tiket)
            canvas.width = 400;
            canvas.height = 550;

            if (ctx) {
                // Background Putih full
                ctx.fillStyle = 'white';
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                // Header Gelap (Biar cakep kek tema MovieFlix)
                ctx.fillStyle = '#0f172a'; // warna slate-900
                ctx.fillRect(0, 0, canvas.width, 70);

                // Teks Header
                ctx.fillStyle = '#22d3ee'; // warna cyan-400
                ctx.font = 'bold 24px sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText('MovieFlix E-Ticket', canvas.width / 2, 42);

                // Teks Judul Film
                ctx.fillStyle = '#0f172a';
                ctx.font = 'bold 22px sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText(booking.showtime.movie.title, canvas.width / 2, 110);

                // Kode Order di atas QR
                ctx.fillStyle = '#64748b'; // slate-500
                ctx.font = '14px monospace';
                ctx.fillText(`ORDER ID: ${booking.booking_code}`, canvas.width / 2, 135);

                // Gambar QR Code nya di tengah
                const qrSize = 200;
                const qrX = (canvas.width - qrSize) / 2;
                const qrY = 160;
                ctx.drawImage(img, qrX, qrY, qrSize, qrSize);

                // Info Studio & Jadwal di Bawah QR
                ctx.textAlign = 'left';
                const col1 = 50; // Margin kiri kolom 1
                const col2 = 220; // Margin kiri kolom 2
                let startY = 410; // Posisi Y buat baris pertama info

                // Baris 1: Tanggal & Waktu
                ctx.fillStyle = '#94a3b8';
                ctx.font = '12px sans-serif';
                ctx.fillText('Tanggal', col1, startY);
                ctx.fillText('Waktu', col2, startY);

                ctx.fillStyle = '#0f172a';
                ctx.font = 'bold 16px sans-serif';
                ctx.fillText(booking.showtime.show_date, col1, startY + 20);
                ctx.fillText(booking.showtime.start_time.substring(0, 5) + ' WIB', col2, startY + 20);

                startY += 60; // Turun ke baris 2

                // Baris 2: Studio & Kursi
                ctx.fillStyle = '#94a3b8';
                ctx.font = '12px sans-serif';
                ctx.fillText('Studio', col1, startY);
                ctx.fillText('Kursi', col2, startY);

                ctx.fillStyle = '#0f172a';
                ctx.font = 'bold 16px sans-serif';
                ctx.fillText(booking.showtime.studio.name, col1, startY + 20);

                // Warna magenta buat kursi biar standout
                ctx.fillStyle = '#d946ef';
                ctx.font = 'bold 16px sans-serif';
                const seats = booking.tickets.map((t: any) => t.seat_code).join(', ');
                ctx.fillText(seats, col2, startY + 20);

                // Convert jadi file PNG & Download
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

            <div className="mx-auto max-w-4xl py-8">
                <h1 className="mb-2 text-4xl font-extrabold text-white">
                    My <span className="text-magenta neon-text-magenta">Tickets</span>
                </h1>
                <p className="mb-10 text-slate-400">Riwayat pemesanan kursi dan tiket bioskop kamu.</p>

                {bookings.length > 0 ? (
                    <div className="space-y-6">
                        {bookings.map((booking) => (
                            <div
                                key={booking.id}
                                className="flex flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-xl ring-1 ring-white/5 transition-all hover:border-cyan-500/50 md:flex-row"
                            >
                                {/* Kiri: Poster Film */}
                                <div className="relative bg-slate-800 md:w-48">
                                    <img
                                        src={
                                            booking.showtime.movie.poster
                                                ? `/storage/${booking.showtime.movie.poster}`
                                                : 'https://placehold.co/400x600/1e293b/white?text=No+Poster'
                                        }
                                        alt={booking.showtime.movie.title}
                                        className="h-full w-full object-cover opacity-80"
                                    />
                                </div>

                                {/* Tengah: Detail Tiket */}
                                <div className="flex flex-1 flex-col justify-between p-6 sm:p-8">
                                    <div>
                                        <div className="mb-4 flex items-start justify-between">
                                            <div>
                                                <p className="mb-1 font-mono text-xs text-slate-500">ORDER: {booking.booking_code}</p>
                                                <h2 className="text-2xl font-bold text-white">{booking.showtime.movie.title}</h2>
                                            </div>
                                            <div className="flex flex-col items-end gap-2">
                                                <StatusBadge status={booking.status} />

                                                {/* Cek kalau lunas, apakah tiketnya udah dipake semua? */}
                                                {booking.status === 'paid' &&
                                                    booking.tickets?.length > 0 &&
                                                    (booking.tickets.every((t: any) => t.status === 'used') ? (
                                                        <span className="rounded-full border border-slate-500/20 bg-slate-500/10 px-3 py-1 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                                                            Sudah Dipakai
                                                        </span>
                                                    ) : (
                                                        <span className="neon-border-cyan rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-[10px] font-bold tracking-wider text-cyan-400 uppercase">
                                                            Bisa Digunakan
                                                        </span>
                                                    ))}
                                            </div>
                                        </div>

                                        <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
                                            <div>
                                                <p className="text-xs text-slate-500">Tanggal</p>
                                                <p className="text-sm font-semibold text-slate-300">{booking.showtime.show_date}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-500">Waktu</p>
                                                <p className="text-sm font-semibold text-cyan-400">{booking.showtime.start_time.substring(0, 5)}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-500">Studio</p>
                                                <p className="text-sm font-semibold text-slate-300">{booking.showtime.studio.name}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-500">Kursi</p>
                                                <p className="text-magenta neon-text-magenta text-sm font-semibold">
                                                    {booking.tickets.map((t: any) => t.seat_code).join(', ')}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between border-t border-slate-800/50 pt-6">
                                        <div>
                                            <p className="text-xs text-slate-500">Total Pembayaran</p>
                                            <p className="text-xl font-bold text-white">Rp {booking.total_amount.toLocaleString('id-ID')}</p>
                                        </div>
                                        {booking.status === 'pending' && (
                                            <button
                                                onClick={() => handleLanjutBayar(booking.snap_token)}
                                                className="rounded-xl bg-slate-700 px-5 py-2 text-sm font-bold text-white transition-all hover:bg-slate-600"
                                            >
                                                Lanjut Bayar
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Kanan: TAMPILIN QR CODE DISINI KALAU LUNAS */}
                                {booking.status === 'paid' && (
                                    <div className="flex flex-col items-center justify-center border-t border-dashed border-slate-800 bg-slate-950 p-6 md:w-48 md:border-t-0 md:border-l">
                                        <div className="rounded-xl bg-white p-2">
                                            <QRCode id={`qr-${booking.booking_code}`} value={booking.booking_code} size={100} />
                                        </div>
                                        <p className="mt-3 text-center text-xs text-slate-500">Scan at Entrance</p>

                                        {/* PENTING: Sekarang kita passing seluruh object 'booking', bukan cuma kode doang */}
                                        <button
                                            onClick={() => downloadQR(booking)}
                                            className="mt-3 flex items-center gap-1 rounded-lg bg-cyan-500/10 px-3 py-1.5 text-xs font-semibold text-cyan-400 transition hover:bg-cyan-500/20"
                                        >
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
                                            Download Tiket
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="rounded-2xl border border-slate-800 bg-slate-900 py-20 text-center">
                        <p className="text-lg text-slate-500">Kamu belum punya riwayat pemesanan tiket.</p>
                        <Link href="/" className="mt-4 inline-block text-cyan-400 hover:text-cyan-300">
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

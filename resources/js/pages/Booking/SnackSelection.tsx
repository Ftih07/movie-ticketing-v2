import MainLayout from '@/layouts/MainLayout';
import { Product, ProductCategory, Showtime } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import axios from 'axios';
import { useEffect, useState } from 'react';

interface Props {
    showtime: Showtime & { movie: any; studio: any };
    selectedSeats: string[];
    categories: ProductCategory[];
    midtransClientKey: string;
}

// Interface buat keranjang F&B
interface CartItem {
    product: Product;
    quantity: number;
}

export default function SnackSelection({ showtime, selectedSeats, categories, midtransClientKey }: Props) {
    const { auth } = usePage().props;
    const [cart, setCart] = useState<CartItem[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);

    // 1. Inject Script Midtrans Snap ke Body
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

    const formatRupiah = (number: number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);
    };

    // --- LOGIC KERANJANG (CART) ---
    const addToCart = (product: Product) => {
        setCart((prevCart) => {
            const existingItem = prevCart.find((item) => item.product.id === product.id);
            if (existingItem) {
                return prevCart.map((item) => (item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
            }
            return [...prevCart, { product, quantity: 1 }];
        });
    };

    const removeFromCart = (productId: number) => {
        setCart((prevCart) => {
            const existingItem = prevCart.find((item) => item.product.id === productId);
            if (existingItem?.quantity === 1) {
                return prevCart.filter((item) => item.product.id !== productId);
            }
            return prevCart.map((item) => (item.product.id === productId ? { ...item, quantity: item.quantity - 1 } : item));
        });
    };

    const getQuantity = (productId: number) => {
        const item = cart.find((item) => item.product.id === productId);
        return item ? item.quantity : 0;
    };

    // --- KALKULASI TOTAL HARGA ---
    const seatsTotal = selectedSeats.length * showtime.price;
    const snacksTotal = cart.reduce((total, item) => total + item.product.price * item.quantity, 0);
    const grandTotal = seatsTotal + snacksTotal;

    // --- LOGIKA CHECKOUT & MIDTRANS ---
    const handleCheckout = async () => {
        setIsProcessing(true);
        try {
            // Format data snack buat dikirim ke backend
            const snacksPayload = cart.map((item) => ({
                id: item.product.id,
                quantity: item.quantity,
                price: item.product.price, // Harga fix saat ini
            }));

            // Tembak Axios ke method checkout()
            const response = await axios.post(route('booking.checkout', showtime.id), {
                seats: selectedSeats,
                snacks: snacksPayload.length > 0 ? snacksPayload : null, // Kirim null kalau skip snack
            });

            // Panggil pop-up Midtrans
            window.snap.pay(response.data.snap_token, {
                onSuccess: function () {
                    router.visit(route('history.index'));
                },
                onPending: function () {
                    router.visit(route('history.index'));
                },
                onError: function () {
                    router.visit(route('history.index'));
                },
                onClose: function () {
                    router.visit(route('history.index'));
                },
            });
        } catch (error) {
            console.error('Gagal checkout', error);
            alert('Terjadi kesalahan saat memproses pesanan.');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <MainLayout>
            <Head title={`Pilih F&B | ${showtime.movie.title}`} />

            <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
                {/* Header Navigasi Step */}
                <div className="mb-8 flex items-center gap-2 text-sm font-bold text-gray-500 dark:text-zinc-500">
                    <button onClick={() => window.history.back()} className="transition hover:text-white">
                        Pilih Kursi
                    </button>
                    <span>&rsaquo;</span>
                    <span className="text-red-600 dark:text-red-500">Add-ons F&B</span>
                    <span>&rsaquo;</span>
                    <span>Pembayaran</span>
                </div>

                <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                    {/* KIRI: KATALOG MENU F&B */}
                    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8 lg:col-span-2 dark:border-zinc-800 dark:bg-zinc-900">
                        <div className="mb-8 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="h-6 w-1.5 rounded-full bg-red-600"></div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Tambah Camilan?</h2>
                            </div>
                        </div>

                        {categories.length > 0 ? (
                            categories.map((category) => (
                                <div key={category.id} className="mb-10">
                                    <h3 className="mb-4 text-lg font-bold text-gray-800 dark:text-zinc-300">{category.name}</h3>
                                    <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                                        {category.products?.map((product) => {
                                            const qty = getQuantity(product.id);
                                            return (
                                                <div
                                                    key={product.id}
                                                    className="group flex flex-col justify-between overflow-hidden rounded-xl border border-gray-200 bg-gray-50 transition-all hover:border-red-500 dark:border-zinc-700 dark:bg-zinc-950 dark:hover:border-red-500"
                                                >
                                                    <div className="aspect-square w-full overflow-hidden bg-white dark:bg-zinc-900">
                                                        <img
                                                            src={`/storage/${product.image}`}
                                                            alt={product.name}
                                                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                                            onError={(e) =>
                                                                (e.currentTarget.src = 'https://via.placeholder.com/200x200?text=No+Image')
                                                            }
                                                        />
                                                    </div>
                                                    <div className="flex flex-1 flex-col justify-between p-4">
                                                        <div>
                                                            <h4 className="line-clamp-2 text-sm font-bold text-gray-900 dark:text-white">
                                                                {product.name}
                                                            </h4>
                                                            <p className="mt-1 text-xs font-black text-red-600 dark:text-red-500">
                                                                {formatRupiah(product.price)}
                                                            </p>
                                                        </div>

                                                        {/* Kontrol QTY */}
                                                        <div className="mt-4">
                                                            {qty > 0 ? (
                                                                <div className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 p-1 dark:border-red-900/50 dark:bg-red-900/20">
                                                                    <button
                                                                        onClick={() => removeFromCart(product.id)}
                                                                        className="flex h-7 w-7 items-center justify-center rounded bg-white font-bold text-red-600 shadow-sm transition hover:bg-gray-100 dark:bg-zinc-800 dark:text-red-400 dark:hover:bg-zinc-700"
                                                                    >
                                                                        -
                                                                    </button>
                                                                    <span className="text-sm font-bold text-gray-900 dark:text-white">{qty}</span>
                                                                    <button
                                                                        onClick={() => addToCart(product)}
                                                                        className="flex h-7 w-7 items-center justify-center rounded bg-red-600 font-bold text-white shadow-sm transition hover:bg-red-700"
                                                                    >
                                                                        +
                                                                    </button>
                                                                </div>
                                                            ) : (
                                                                <button
                                                                    onClick={() => addToCart(product)}
                                                                    className="w-full rounded-lg border border-gray-300 bg-white py-2 text-xs font-bold text-gray-700 transition hover:border-red-500 hover:text-red-600 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:border-red-500 dark:hover:text-red-500"
                                                                >
                                                                    Tambah
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-gray-500 dark:text-zinc-400">Tidak ada menu F&B saat ini.</p>
                        )}
                    </div>

                    {/* KANAN: BOOKING SUMMARY (GABUNGAN TIKET + SNACK) */}
                    <div className="sticky top-24 h-fit rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8 dark:border-zinc-800 dark:bg-zinc-900">
                        <h3 className="mb-6 text-xl font-bold text-gray-900 dark:text-white">Order Summary</h3>

                        {/* Rincian Tiket Film */}
                        <div className="mb-4 space-y-3 border-b border-gray-100 pb-4 dark:border-zinc-800">
                            <div>
                                <p className="text-xs font-medium text-gray-500 dark:text-zinc-400">Film</p>
                                <p className="text-sm font-bold text-gray-900 dark:text-white">{showtime.movie.title}</p>
                            </div>
                            <div className="flex justify-between">
                                <p className="text-xs font-medium text-gray-500 dark:text-zinc-400">
                                    {showtime.studio.name} | {showtime.start_time.substring(0, 5)} WIB
                                </p>
                                <p className="text-xs font-bold text-gray-900 dark:text-zinc-300">Kursi: {selectedSeats.join(', ')}</p>
                            </div>
                            <div className="flex justify-between font-semibold">
                                <p className="text-sm text-gray-600 dark:text-zinc-300">Total Tiket</p>
                                <p className="text-sm text-gray-900 dark:text-white">{formatRupiah(seatsTotal)}</p>
                            </div>
                        </div>

                        {/* Rincian Snack */}
                        <div className="mb-6 border-b border-gray-100 pb-6 dark:border-zinc-800">
                            <p className="mb-3 text-sm font-semibold text-gray-600 dark:text-zinc-300">F&B Add-ons</p>
                            {cart.length > 0 ? (
                                <ul className="space-y-2">
                                    {cart.map((item) => (
                                        <li key={item.product.id} className="flex justify-between text-xs">
                                            <span className="text-gray-500 dark:text-zinc-400">
                                                {item.quantity}x {item.product.name}
                                            </span>
                                            <span className="font-semibold text-gray-900 dark:text-zinc-300">
                                                {formatRupiah(item.product.price * item.quantity)}
                                            </span>
                                        </li>
                                    ))}
                                    <li className="mt-3 flex justify-between border-t border-dashed border-gray-200 pt-2 font-semibold dark:border-zinc-700">
                                        <p className="text-sm text-gray-600 dark:text-zinc-300">Total F&B</p>
                                        <p className="text-sm text-gray-900 dark:text-white">{formatRupiah(snacksTotal)}</p>
                                    </li>
                                </ul>
                            ) : (
                                <p className="text-xs text-gray-400 italic dark:text-zinc-500">Tidak ada tambahan F&B</p>
                            )}
                        </div>

                        {/* Grand Total */}
                        <div className="mb-8 flex items-end justify-between">
                            <p className="text-sm font-bold text-gray-900 dark:text-zinc-300">Grand Total</p>
                            <p className="text-2xl font-black tracking-tight text-red-600 dark:text-red-500">{formatRupiah(grandTotal)}</p>
                        </div>

                        <div className="flex flex-col gap-3">
                            <button
                                onClick={handleCheckout}
                                disabled={isProcessing}
                                className="flex w-full items-center justify-center rounded-xl bg-red-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-red-600/20 transition-all hover:bg-red-700 hover:shadow-xl hover:shadow-red-600/30 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400 disabled:shadow-none dark:disabled:bg-zinc-800 dark:disabled:text-zinc-600"
                            >
                                {isProcessing ? 'Memproses...' : 'Checkout & Bayar'}
                            </button>

                            {/* Tombol Skip jika user belum milih F&B sama sekali */}
                            {cart.length === 0 && !isProcessing && (
                                <button
                                    onClick={handleCheckout}
                                    className="w-full text-center text-xs font-semibold text-gray-500 transition hover:text-gray-800 dark:text-zinc-400 dark:hover:text-white"
                                >
                                    Lewati F&B & Bayar Langsung
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}

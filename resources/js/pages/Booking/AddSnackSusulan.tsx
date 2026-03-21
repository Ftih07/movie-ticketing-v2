import MainLayout from '@/layouts/MainLayout';
import { ProductCategory, Product } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import axios from 'axios';
import { useEffect, useState } from 'react';

interface Props {
    booking: any;
    categories: ProductCategory[];
    midtransClientKey: string;
}

interface CartItem {
    product: Product;
    quantity: number;
}

export default function AddSnackSusulan({ booking, categories, midtransClientKey }: Props) {
    const { auth } = usePage().props;
    const [cart, setCart] = useState<CartItem[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);

    // 1. Inject Script Midtrans
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

    // --- LOGIC CART ---
    const addToCart = (product: Product) => {
        setCart((prev) => {
            const existing = prev.find((item) => item.product.id === product.id);
            if (existing) {
                return prev.map((item) =>
                    item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
                );
            }
            return [...prev, { product, quantity: 1 }];
        });
    };

    const removeFromCart = (productId: number) => {
        setCart((prev) => {
            const existing = prev.find((item) => item.product.id === productId);
            if (existing?.quantity === 1) {
                return prev.filter((item) => item.product.id !== productId);
            }
            return prev.map((item) =>
                item.product.id === productId ? { ...item, quantity: item.quantity - 1 } : item
            );
        });
    };

    const getQuantity = (productId: number) => {
        const item = cart.find((item) => item.product.id === productId);
        return item ? item.quantity : 0;
    };

    const snacksTotal = cart.reduce((total, item) => total + item.product.price * item.quantity, 0);

    // --- LOGIKA CHECKOUT SUSULAN ---
    const handleCheckout = async () => {
        if (cart.length === 0) return alert('Pilih minimal 1 menu F&B!');

        setIsProcessing(true);
        try {
            const snacksPayload = cart.map((item) => ({
                id: item.product.id,
                quantity: item.quantity,
                price: item.product.price,
            }));

            // 1. Minta Token Bayar Khusus Snack ke Controller
            const responseToken = await axios.post(route('history.checkout-snacks', booking.id), {
                snacks: snacksPayload,
            });

            // 2. Tampilkan Popup Pembayaran
            window.snap.pay(responseToken.data.snap_token, {
                onSuccess: async function () {
                    // 3. JIKA LUNAS, BIKIN DATA SNACK-NYA DI DATABASE
                    try {
                        await axios.post(route('history.save-snacks', booking.id), {
                            snacks: snacksPayload,
                        });
                        alert('Pembayaran Sukses! F&B berhasil ditambahkan ke tiketmu.');
                        router.visit(route('history.index'));
                    } catch (err) {
                        alert('Pembayaran sukses, tapi gagal menyimpan data F&B. Lapor admin!');
                    }
                },
                onPending: function () {
                    alert('Harap selesaikan pembayaran. F&B belum masuk ke tiket sebelum lunas.');
                    router.visit(route('history.index'));
                },
                onError: function () {
                    alert('Pembayaran gagal atau dibatalkan.');
                },
                onClose: function () {
                    alert('Pembayaran dibatalkan.');
                },
            });
        } catch (error) {
            console.error('Checkout error', error);
            alert('Terjadi kesalahan sistem.');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <MainLayout>
            <Head title={`Tambah F&B | ${booking.showtime.movie.title}`} />

            <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
                {/* Header Navigasi */}
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-black text-gray-900 dark:text-white">Tambah Pesanan F&B</h1>
                        <p className="mt-1 text-sm text-gray-500 dark:text-zinc-400">
                            Untuk Tiket Order: <span className="font-mono font-bold text-gray-700 dark:text-zinc-300">{booking.booking_code}</span>
                        </p>
                    </div>
                    <button 
                        onClick={() => router.visit(route('history.index'))}
                        className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-bold text-gray-700 shadow-sm transition hover:bg-gray-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                    >
                        Batal
                    </button>
                </div>

                <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                    {/* KIRI: KATALOG MENU F&B (SAMA PERSIS) */}
                    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8 lg:col-span-2 dark:border-zinc-800 dark:bg-zinc-900">
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
                                                            onError={(e) => e.currentTarget.src = 'https://via.placeholder.com/200x200?text=No+Image'}
                                                        />
                                                    </div>
                                                    <div className="flex flex-1 flex-col justify-between p-4">
                                                        <div>
                                                            <h4 className="text-sm font-bold text-gray-900 line-clamp-2 dark:text-white">{product.name}</h4>
                                                            <p className="mt-1 text-xs font-black text-red-600 dark:text-red-500">{formatRupiah(product.price)}</p>
                                                        </div>
                                                        <div className="mt-4">
                                                            {qty > 0 ? (
                                                                <div className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 p-1 dark:border-red-900/50 dark:bg-red-900/20">
                                                                    <button onClick={() => removeFromCart(product.id)} className="flex h-7 w-7 items-center justify-center rounded bg-white font-bold text-red-600 shadow-sm transition hover:bg-gray-100 dark:bg-zinc-800 dark:text-red-400 dark:hover:bg-zinc-700">-</button>
                                                                    <span className="text-sm font-bold text-gray-900 dark:text-white">{qty}</span>
                                                                    <button onClick={() => addToCart(product)} className="flex h-7 w-7 items-center justify-center rounded bg-red-600 font-bold text-white shadow-sm transition hover:bg-red-700">+</button>
                                                                </div>
                                                            ) : (
                                                                <button onClick={() => addToCart(product)} className="w-full rounded-lg border border-gray-300 bg-white py-2 text-xs font-bold text-gray-700 transition hover:border-red-500 hover:text-red-600 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:border-red-500 dark:hover:text-red-500">Tambah</button>
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

                    {/* KANAN: RINGKASAN PEMBAYARAN F&B AJA */}
                    <div className="sticky top-24 h-fit rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8 dark:border-zinc-800 dark:bg-zinc-900">
                        <h3 className="mb-6 text-xl font-bold text-gray-900 dark:text-white">Order Summary</h3>

                        <div className="mb-6 border-b border-gray-100 pb-6 dark:border-zinc-800">
                            {cart.length > 0 ? (
                                <ul className="space-y-3">
                                    {cart.map((item) => (
                                        <li key={item.product.id} className="flex justify-between text-sm">
                                            <span className="text-gray-600 dark:text-zinc-300">{item.quantity}x {item.product.name}</span>
                                            <span className="font-semibold text-gray-900 dark:text-white">{formatRupiah(item.product.price * item.quantity)}</span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-sm italic text-gray-400 dark:text-zinc-500">Pilih F&B untuk mulai memesan.</p>
                            )}
                        </div>

                        <div className="mb-8 flex items-end justify-between">
                            <p className="text-sm font-bold text-gray-900 dark:text-zinc-300">Total F&B</p>
                            <p className="text-2xl font-black tracking-tight text-red-600 dark:text-red-500">
                                {formatRupiah(snacksTotal)}
                            </p>
                        </div>

                        <button
                            onClick={handleCheckout}
                            disabled={cart.length === 0 || isProcessing}
                            className="flex w-full items-center justify-center rounded-xl bg-red-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-red-600/20 transition-all hover:bg-red-700 hover:shadow-xl hover:shadow-red-600/30 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400 disabled:shadow-none dark:disabled:bg-zinc-800 dark:disabled:text-zinc-600"
                        >
                            {isProcessing ? 'Memproses...' : 'Bayar Sekarang'}
                        </button>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
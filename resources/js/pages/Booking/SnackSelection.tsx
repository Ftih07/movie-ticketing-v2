import PromoModal from '@/components/PromoModal';
import MainLayout from '@/layouts/MainLayout';
import { Product, ProductCategory, Showtime, Promo } from '@/types';
import { PageProps } from '@inertiajs/core';
import { Head, router, usePage } from '@inertiajs/react';
import axios, { AxiosError } from 'axios';
import { useCallback, useEffect, useState } from 'react';

// 2. Perbaiki Props (hilangkan any pada movie, studio, dan activePromos)
interface Props {
    showtime: Showtime & {
        movie: { title: string };
        studio: { name: string };
    };
    selectedSeats: string[];
    categories: ProductCategory[];
    activePromos: Promo[]; // <--- Ubah any[] jadi Promo[]
    midtransClientKey: string;
}

interface CartItem {
    product: Product;
    quantity: number;
}

// 3. Buat interface untuk Props Inertia biar auth-nya nggak 'any'
interface SharedProps extends PageProps {
    auth: {
        user: {
            id: number;
            name: string;
            point_balance: number; // Dibutuhkan di baris 260
        } | null;
    };
}

// 4. Interface untuk response kalkulasi (opsional tapi bagus buat typing)
interface CalculationResponse {
    subtotal: number;
    discount_amount: number;
    points_discount: number;
    total_amount: number;
    points_earned: number;
}

// --- ERROR RESPONSE TYPE DARI AXIOS ---
interface ErrorResponse {
    message: string;
}

export default function SnackSelection({ showtime, selectedSeats, categories, activePromos, midtransClientKey }: Props) {
    const { auth } = usePage<SharedProps>().props;
    const [cart, setCart] = useState<CartItem[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);

    // --- STATE BARU UNTUK PROMO & POIN ---
    const [promoCode, setPromoCode] = useState('');
    const [usePoints, setUsePoints] = useState(false);
    const [calcError, setCalcError] = useState('');
    const [isPromoModalOpen, setIsPromoModalOpen] = useState(false);

    // State untuk nyimpen hasil kalkulasi dari backend
    const [calculation, setCalculation] = useState<CalculationResponse>({
        subtotal: 0,
        discount_amount: 0,
        points_discount: 0,
        total_amount: 0,
        points_earned: 0,
    });

    // 1. Inject Script Midtrans Snap ke Body
    useEffect(() => {
        const scriptUrl = 'https://app.sandbox.midtrans.com/snap/snap.js';
        const scriptTag = document.createElement('script');
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

    // --- KALKULASI TOTAL HARGA DASAR ---
    const seatsTotal = selectedSeats.length * showtime.price;
    const snacksTotal = cart.reduce((total, item) => total + item.product.price * item.quantity, 0);
    const baseSubtotal = seatsTotal + snacksTotal;

    // --- FETCH KALKULASI PROMO/POIN KE BACKEND ---
    const fetchCalculation = useCallback(async () => {
        try {
            const snacksPayload = cart.map((item) => ({
                id: item.product.id,
                quantity: item.quantity,
                price: item.product.price,
            }));

            const res = await axios.post<CalculationResponse>(route('booking.calculate', showtime.id), {
                seats: selectedSeats,
                snacks: snacksPayload.length > 0 ? snacksPayload : null,
                promo_code: promoCode,
                use_points: usePoints,
            });

            setCalculation(res.data);
            setCalcError('');
        } catch (error) {
            // 5. Hapus :any di sini
            const axiosError = error as AxiosError<ErrorResponse>; // Casting ke AxiosError biar aman dari Linter
            setCalcError(axiosError.response?.data?.message || 'Gagal menghitung promo');

            // Reset kalkulasi ke harga dasar kalau error promo
            setCalculation((prev) => ({
                ...prev,
                subtotal: baseSubtotal,
                total_amount: baseSubtotal - prev.points_discount,
                discount_amount: 0,
            }));
        }
    }, [cart, selectedSeats, promoCode, usePoints, showtime.id, baseSubtotal]);

    // Trigger hitung ulang tiap kali ada perubahan di keranjang, input promo, atau toggle poin
    useEffect(() => {
        // Pake setTimeout biar gak spam request backend pas ngetik kode promo
        const delay = setTimeout(() => {
            fetchCalculation();
        }, 500);
        return () => clearTimeout(delay);
    }, [fetchCalculation]);

    // --- LOGIKA CHECKOUT & MIDTRANS ---
    const handleCheckout = async () => {
        setIsProcessing(true);
        try {
            const snacksPayload = cart.map((item) => ({
                id: item.product.id,
                quantity: item.quantity,
                price: item.product.price,
            }));

            // Tambahkan interface untuk response checkout
            const response = await axios.post<{ redirect?: string; snap_token: string }>(route('booking.checkout', showtime.id), {
                seats: selectedSeats,
                snacks: snacksPayload.length > 0 ? snacksPayload : null,
                promo_code: promoCode,
                use_points: usePoints,
            });

            // Bypass Midtrans kalau tagihannya Rp 0 (gara-gara diskon full)
            if (response.data.redirect) {
                router.visit(response.data.redirect);
                return;
            }

            // Panggil pop-up Midtrans (Kita abaikan tipe window sementara buat Midtrans karena itu external library)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (window as any).snap.pay(response.data.snap_token, {
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
            // 6. Hapus :any di sini
            console.error('Gagal checkout', error);
            const axiosError = error as AxiosError<ErrorResponse>;
            alert(axiosError.response?.data?.message || 'Terjadi kesalahan saat memproses pesanan.');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <MainLayout>
            {/* ... SISA UI KAMU DI BAWAH SINI TIDAK ADA YANG DIUBAH ... */}
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

                    {/* KANAN: BOOKING SUMMARY (GABUNGAN TIKET + SNACK + PROMO) */}
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

                        {/* --- SEKSI PROMO & POIN --- */}
                        <div className="mb-6 space-y-4 border-b border-gray-100 pb-6 dark:border-zinc-800">
                            {/* Input Promo */}
                            <div>
                                <label className="mb-1 block text-xs font-semibold text-gray-600 dark:text-zinc-300">Punya Kode Promo?</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={promoCode}
                                        onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                                        placeholder="Masukkan Kode"
                                        className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm uppercase focus:border-red-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                                    />
                                    {/* Tombol Clear Promo kalau ada isinya */}
                                    {promoCode && (
                                        <button
                                            onClick={() => setPromoCode('')}
                                            className="rounded-lg border border-gray-300 bg-white px-3 text-sm font-bold text-gray-500 hover:bg-gray-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
                                        >
                                            ✕
                                        </button>
                                    )}
                                </div>
                                {calcError && <p className="mt-1 text-xs text-red-500">{calcError}</p>}

                                {/* Tombol Buka Modal Promo (NEW) */}
                                <button
                                    onClick={() => setIsPromoModalOpen(true)}
                                    className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-red-300 bg-red-50 py-2 text-xs font-bold text-red-600 transition hover:bg-red-100 dark:border-red-900/50 dark:bg-red-900/10 dark:text-red-500 dark:hover:bg-red-900/20"
                                >
                                    🎫 Lihat Promo Tersedia
                                </button>
                            </div>

                            {/* Toggle Points */}
                            <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-zinc-800/50">
                                <div>
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white">Gunakan Poin</p>
                                    <p className="text-xs text-gray-500 dark:text-zinc-400">Saldo: {auth?.user?.point_balance || 0} Pts</p>
                                </div>
                                <label className="relative inline-flex cursor-pointer items-center">
                                    <input
                                        type="checkbox"
                                        checked={usePoints}
                                        onChange={(e) => setUsePoints(e.target.checked)}
                                        disabled={!auth?.user?.point_balance}
                                        className="peer sr-only"
                                    />
                                    <div className="peer h-6 w-11 rounded-full bg-gray-300 peer-checked:bg-red-600 peer-focus:outline-none after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white dark:bg-zinc-700 dark:peer-checked:bg-red-500"></div>
                                </label>
                            </div>
                        </div>

                        {/* --- RANGKUMAN BIAYA --- */}
                        <div className="mb-8 space-y-2">
                            <div className="flex justify-between text-sm text-gray-600 dark:text-zinc-400">
                                <span>Subtotal</span>
                                <span>{formatRupiah(calculation.subtotal || baseSubtotal)}</span>
                            </div>

                            {calculation.discount_amount > 0 && (
                                <div className="flex justify-between text-sm font-semibold text-green-600 dark:text-green-500">
                                    <span>Diskon Promo</span>
                                    <span>-{formatRupiah(calculation.discount_amount)}</span>
                                </div>
                            )}

                            {calculation.points_discount > 0 && (
                                <div className="flex justify-between text-sm font-semibold text-yellow-600 dark:text-yellow-500">
                                    <span>Potongan Poin</span>
                                    <span>-{formatRupiah(calculation.points_discount)}</span>
                                </div>
                            )}

                            <div className="mt-4 flex items-end justify-between border-t border-gray-100 pt-4 dark:border-zinc-800">
                                <p className="text-sm font-bold text-gray-900 dark:text-zinc-300">Total Bayar</p>
                                <div className="text-right">
                                    <p className="text-2xl font-black tracking-tight text-red-600 dark:text-red-500">
                                        {formatRupiah(calculation.total_amount || baseSubtotal)}
                                    </p>
                                    {calculation.points_earned > 0 && (
                                        <p className="text-xs font-semibold text-yellow-500">✨ +{calculation.points_earned} Pts</p>
                                    )}
                                </div>
                            </div>
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

            {/* Render Modal Promo di sini */}
            <PromoModal
                isOpen={isPromoModalOpen}
                onClose={() => setIsPromoModalOpen(false)}
                promos={activePromos} // <--- CUKUP SEPERTI INI, HAPUS 'as any'
                onSelectPromo={(code: string) => {
                    setPromoCode(code); // Set inputan promo
                    setIsPromoModalOpen(false); // Langsung tutup modal otomatis
                }}
            />
        </MainLayout>
    );
}

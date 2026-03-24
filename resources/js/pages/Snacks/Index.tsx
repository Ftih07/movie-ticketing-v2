import MainLayout from '@/layouts/MainLayout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
// Pastikan kamu sudah buat interface untuk ProductCategory dan Product di '@/types'
import { Product, ProductCategory } from '@/types';

interface Props {
    categories: ProductCategory[];
}

export default function SnackIndex({ categories = [] }: Props) {
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [showWarning, setShowWarning] = useState(false);

    const formatRupiah = (number: number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);
    };

    const handleOrderClick = () => {
        setSelectedProduct(null);
        setShowWarning(true);
    };

    const handleRedirectToMovies = () => {
        router.visit(route('movies.index')); // Sesuaikan dengan nama route halaman list film kamu
    };

    return (
        <MainLayout>
            <Head title="Katalog F&B | MovieFlix" />

            {/* HERO SECTION ALA MOVIE DETAIL */}
            <section className="relative flex w-full items-center justify-center overflow-hidden bg-gray-50 py-20 md:py-32 lg:h-[70vh] dark:bg-black">
                {/* Background Image */}
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center bg-no-repeat opacity-40 dark:opacity-50"></div>

                {/* Overlay Gradients */}
                <div className="absolute inset-0 bg-gradient-to-b from-gray-50/80 via-gray-50/60 to-gray-50 dark:from-black/80 dark:via-black/60 dark:to-zinc-950"></div>
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-gray-50 via-gray-50/80 to-transparent dark:from-zinc-950 dark:via-zinc-950/80"></div>

                {/* Konten Text Slogan */}
                <div className="relative z-10 flex flex-col items-center px-4 text-center">
                    <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-gray-900 drop-shadow-sm sm:text-5xl md:text-6xl lg:text-7xl dark:text-white">
                        MovieFlix
                        <br className="hidden sm:block" />
                        <span className="text-red-600 drop-shadow-md"> Concessions</span>
                    </h1>
                    <p className="mb-8 max-w-2xl text-base text-gray-800 drop-shadow sm:text-lg md:text-xl dark:text-gray-300">
                        Lengkapi pengalaman nontonmu dengan pilihan camilan dan minuman terbaik dari kami.
                    </p>
                </div>
            </section>

            {/* KATALOG SECTION */}
            <section className="mx-auto min-h-screen max-w-7xl px-4 py-12 lg:px-8">
                {categories.length > 0 ? (
                    categories.map((category) => (
                        <div key={category.id} className="mb-16">
                            <div className="mb-8 flex items-center gap-4">
                                <div className="h-8 w-1.5 rounded-full bg-red-600"></div>
                                <h2 className="text-2xl font-bold tracking-tight text-gray-900 md:text-3xl dark:text-white">{category.name}</h2>
                            </div>

                            <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                                {category.products?.map((product) => (
                                    <div
                                        key={product.id}
                                        className="group cursor-pointer rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition-all hover:border-red-500 hover:shadow-xl dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-red-500"
                                        onClick={() => setSelectedProduct(product)}
                                    >
                                        <div className="mb-4 aspect-square overflow-hidden rounded-xl bg-gray-100 dark:bg-zinc-800">
                                            <img
                                                src={`/storage/${product.image}`}
                                                alt={product.name}
                                                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/300x300?text=No+Image')}
                                            />
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <h3 className="line-clamp-1 text-base font-bold text-gray-900 dark:text-white">{product.name}</h3>
                                            <p className="text-sm font-black text-red-600 dark:text-red-500">{formatRupiah(product.price)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-gray-50 py-24 dark:border-zinc-800 dark:bg-zinc-900/50">
                        <span className="mb-4 text-4xl">🍿</span>
                        <p className="text-lg font-medium text-gray-500 dark:text-zinc-400">Belum ada menu F&B yang tersedia.</p>
                    </div>
                )}
            </section>

            {/* MODAL DETAIL PRODUK */}
            {selectedProduct && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
                    <div className="animate-in fade-in zoom-in w-full max-w-lg overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl duration-200 dark:border-zinc-800 dark:bg-zinc-900">
                        <div className="relative aspect-[4/3] w-full bg-zinc-800">
                            <img
                                src={`/storage/${selectedProduct.image}`}
                                alt={selectedProduct.name}
                                className="h-full w-full object-cover"
                                onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/500x375?text=No+Image')}
                            />
                            {/* Close Button Top Right */}
                            <button
                                onClick={() => setSelectedProduct(null)}
                                className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-md transition hover:bg-black/70"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="p-6 md:p-8">
                            <h2 className="text-2xl font-black text-gray-900 dark:text-white">{selectedProduct.name}</h2>
                            <p className="mt-2 text-xl font-bold text-red-600 dark:text-red-500">{formatRupiah(selectedProduct.price)}</p>

                            <div className="my-6 h-px w-full bg-gray-200 dark:bg-zinc-800"></div>

                            <h3 className="mb-2 text-sm font-bold text-gray-900 dark:text-white">Deskripsi Menu</h3>
                            <p className="text-sm leading-relaxed text-gray-600 dark:text-zinc-400">
                                {selectedProduct.description || 'Pilihan tepat untuk menemani waktu nonton santaimu di MovieFlix.'}
                            </p>

                            <div className="mt-8 flex gap-3">
                                <button
                                    onClick={() => setSelectedProduct(null)}
                                    className="flex-1 rounded-xl border border-gray-200 bg-white py-3 text-sm font-bold text-gray-700 transition hover:bg-gray-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                                >
                                    Tutup
                                </button>
                                <button
                                    onClick={handleOrderClick}
                                    className="flex-[2] rounded-xl bg-red-600 py-3 text-sm font-bold text-white shadow-lg shadow-red-600/30 transition hover:bg-red-700 hover:shadow-red-600/50"
                                >
                                    Beli Sekarang
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL WARNING WAKTU KLIK BELI */}
            {showWarning && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
                    <div className="animate-in fade-in zoom-in w-full max-w-sm overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-2xl duration-200 dark:border-zinc-800 dark:bg-zinc-900">
                        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                            <span className="text-3xl">🎫</span>
                        </div>
                        <h2 className="mb-2 text-xl font-black text-gray-900 dark:text-white">Pilih Film Dulu Ya!</h2>
                        <p className="mb-8 text-sm leading-relaxed text-gray-600 dark:text-zinc-400">
                            Camilan ini spesial buat nemenin kamu nonton. Yuk, pilih jadwal film dan kursimu terlebih dahulu.
                        </p>

                        <div className="flex flex-col gap-3">
                            <button
                                onClick={handleRedirectToMovies}
                                className="w-full rounded-xl bg-red-600 py-3 text-sm font-bold text-white shadow-md shadow-red-600/30 transition hover:bg-red-700"
                            >
                                Cari Film Sekarang
                            </button>
                            <button
                                onClick={() => setShowWarning(false)}
                                className="w-full rounded-xl py-3 text-sm font-bold text-gray-500 transition hover:text-gray-800 dark:text-zinc-500 dark:hover:text-zinc-300"
                            >
                                Batal
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </MainLayout>
    );
}

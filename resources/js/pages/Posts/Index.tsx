import MainLayout from '@/layouts/MainLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

interface Post {
    id: number;
    title: string;
    slug: string;
    excerpt: string;
    thumbnail: string | null;
    type: string;
    read_time: number;
    published_at: string;
}

// 1. Tambahkan Interface khusus untuk Link Pagination Laravel
interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

// 2. Gunakan PaginationLink untuk menggantikan any[]
interface Props {
    posts: {
        data: Post[];
        links: PaginationLink[]; // <--- UBAH DI SINI
    };
    filters: {
        type: string;
        search: string;
    };
}

export default function Index({ posts, filters: initialFilters }: Props) {
    // State untuk menyimpan nilai inputan
    const [searchQuery, setSearchQuery] = useState(initialFilters.search);
    const [typeFilter, setTypeFilter] = useState(initialFilters.type);

    // Fungsi untuk memicu pencarian ke backend
    const applyFilters = (newType?: string) => {
        const selectedType = newType !== undefined ? newType : typeFilter;

        router.get(
            route('posts.index'),
            {
                search: searchQuery,
                type: selectedType === 'all' ? undefined : selectedType, // Kalau 'all', hilangkan dari URL
            },
            { preserveState: true, replace: true },
        );
    };

    // Fungsi khusus kalau user menekan tombol 'Enter' di kolom search
    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            applyFilters();
        }
    };

    // Fungsi kalau tombol Tab/Pill Filter diklik
    const handleTypeClick = (type: string) => {
        setTypeFilter(type);
        applyFilters(type);
    };

    return (
        <MainLayout>
            <Head title="News & Promos | Movieflix" />

            {/* Generic CTA Hero Section */}
            <section className="relative flex w-full items-center justify-center overflow-hidden bg-gray-50 py-20 md:py-32 lg:h-[70vh] dark:bg-black">
                {/* Background Image */}
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1513106580091-1d82408b8cd6?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center bg-no-repeat opacity-40 dark:opacity-50"></div>

                {/* Overlay Gradients */}
                <div className="absolute inset-0 bg-gradient-to-b from-gray-50/80 via-gray-50/60 to-gray-50 dark:from-black/80 dark:via-black/60 dark:to-zinc-950"></div>
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-gray-50 via-gray-50/80 to-transparent dark:from-zinc-950 dark:via-zinc-950/80"></div>

                {/* Konten Text Slogan */}
                <div className="relative z-10 flex flex-col items-center px-4 text-center">
                    <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-gray-900 drop-shadow-sm sm:text-5xl md:text-6xl lg:text-7xl dark:text-white">
                        MovieFlix
                        <br className="hidden sm:block" />
                        <span className="text-red-600 drop-shadow-md"> News & Promos</span>
                    </h1>
                    <p className="mb-8 max-w-2xl text-base text-gray-800 drop-shadow sm:text-lg md:text-xl dark:text-gray-300">
                        Stay updated with the latest movie reviews, insights, and exclusive ticket deals.
                    </p>
                </div>
            </section>

            <div className="mx-auto max-w-7xl px-4 lg:px-8">
                {/* 🔍 FILTER & SEARCH BAR SECTION */}
                <div className="mb-12 flex flex-col items-center justify-between gap-6 md:flex-row">
                    {/* Tabs Kategori (All, Article, Promo) */}
                    <div className="flex w-full space-x-2 overflow-x-auto rounded-xl bg-gray-100 p-1.5 sm:w-auto dark:bg-zinc-900/80">
                        {[
                            { value: 'all', label: 'All Posts' },
                            { value: 'article', label: 'Articles' },
                            { value: 'promo', label: 'Promos' },
                        ].map((tab) => (
                            <button
                                key={tab.value}
                                onClick={() => handleTypeClick(tab.value)}
                                className={`flex-1 rounded-lg px-6 py-2.5 text-sm font-semibold whitespace-nowrap transition-all sm:flex-none ${
                                    typeFilter === tab.value
                                        ? 'bg-white text-red-600 shadow-sm dark:bg-zinc-800 dark:text-red-500'
                                        : 'text-gray-600 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-zinc-200'
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Search Bar & Button */}
                    <div className="flex w-full items-center gap-2 md:w-auto">
                        <div className="relative w-full md:w-80">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={handleKeyPress}
                                placeholder="Search articles or promos..."
                                className="w-full rounded-xl border border-gray-300 bg-white py-3 pr-4 pl-11 text-sm shadow-sm focus:border-red-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:placeholder-zinc-500"
                            />
                            <div className="absolute inset-y-0 left-0 flex items-center pl-4">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-5 w-5 text-gray-400 dark:text-zinc-500"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                    />
                                </svg>
                            </div>
                        </div>

                        {/* Tombol Search Tambahan */}
                        <button
                            onClick={() => applyFilters()}
                            className="hidden rounded-xl bg-red-600 px-6 py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-red-700 active:scale-95 md:block"
                        >
                            Search
                        </button>
                    </div>
                </div>

                {/* 📰 GRID ARTIKEL */}
                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {posts.data.map((post) => (
                        <Link
                            key={post.id}
                            href={route('posts.show', post.slug)}
                            className="group flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-red-500/5 dark:border-zinc-800 dark:bg-zinc-900/80"
                        >
                            {/* Desain Card disamakan dengan Home.tsx */}
                            <div className="relative aspect-video w-full overflow-hidden bg-gray-100 dark:bg-zinc-800">
                                <img
                                    src={
                                        post.thumbnail
                                            ? `/storage/${post.thumbnail}`
                                            : 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=800&auto=format&fit=crop'
                                    }
                                    alt={post.title}
                                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
                                <div className="absolute top-3 left-3 rounded-md bg-red-600 px-2.5 py-1 text-[10px] font-black tracking-widest text-white uppercase shadow-lg">
                                    {post.type}
                                </div>
                            </div>

                            <div className="flex flex-1 flex-col p-5">
                                <h3 className="line-clamp-2 text-base font-bold text-gray-900 transition-colors group-hover:text-red-600 dark:text-white dark:group-hover:text-red-500">
                                    {post.title}
                                </h3>
                                <p className="mt-3 line-clamp-2 text-sm text-gray-600 dark:text-zinc-400">{post.excerpt}</p>

                                <div className="mt-auto flex items-center justify-between pt-6 text-xs font-semibold text-gray-500 dark:text-zinc-500">
                                    <span>
                                        {new Date(post.published_at).toLocaleDateString('id-ID', {
                                            day: 'numeric',
                                            month: 'short',
                                            year: 'numeric',
                                        })}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-3.5 w-3.5 text-red-500 opacity-80"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2.5}
                                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                            />
                                        </svg>
                                        {post.read_time} min
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* 🧭 PAGINATION */}
                {/* Kita cek dulu, kalau halamannya cuma 1, pagination nggak perlu muncul */}
                {posts.links && posts.links.length > 3 && (
                    <div className="mt-12 flex items-center justify-center gap-2">
                        {posts.links.map((link, index) =>
                            link.url ? (
                                <Link
                                    key={index}
                                    href={link.url}
                                    /* PreserveScroll biar pas pindah halaman nggak auto scroll ke atas banget kalau nggak dimau */
                                    preserveScroll
                                    className={`rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
                                        link.active
                                            ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' // Style untuk halaman saat ini
                                            : 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-zinc-800 dark:bg-zinc-900/80 dark:text-zinc-300 dark:hover:bg-zinc-800'
                                    }`}
                                    // Laravel mengirim karakter khusus seperti &laquo; untuk 'Previous', jadi kita pakai dangerouslySetInnerHTML
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ) : (
                                <span
                                    key={index}
                                    className="cursor-not-allowed rounded-lg border border-gray-100 bg-gray-50 px-4 py-2 text-sm font-semibold text-gray-400 dark:border-zinc-800/50 dark:bg-zinc-900/40 dark:text-zinc-600"
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ),
                        )}
                    </div>
                )}

                {/* Empty State kalau belum ada artikel / hasil search kosong */}
                {posts.data.length === 0 && (
                    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-gray-50 py-24 dark:border-zinc-800 dark:bg-zinc-900/50">
                        <span className="mb-4 text-5xl">🧐</span>
                        <p className="text-lg font-medium text-gray-600 dark:text-zinc-400">Waduh, artikel yang kamu cari nggak ketemu.</p>
                        <button
                            onClick={() => {
                                setSearchQuery('');
                                handleTypeClick('all');
                            }}
                            className="mt-4 rounded-lg bg-gray-200 px-6 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-300 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                        >
                            Reset Filter
                        </button>
                    </div>
                )}
            </div>
        </MainLayout>
    );
}

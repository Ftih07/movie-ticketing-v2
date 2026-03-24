import MainLayout from '@/layouts/MainLayout';
import { Head, Link } from '@inertiajs/react';
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

interface Props {
    savedPosts: Post[];
    likedPosts: Post[];
}

export default function MyList({ savedPosts, likedPosts }: Props) {
    // State untuk ngatur tab mana yang aktif (default: 'saved')
    const [activeTab, setActiveTab] = useState<'saved' | 'liked'>('saved');

    // Menentukan data mana yang mau di-render berdasarkan tab
    const displayedPosts = activeTab === 'saved' ? savedPosts : likedPosts;

    return (
        <MainLayout>
            <Head title="My Reading List | Movieflix" />

            {/* Generic CTA Hero Section */}
            <section className="relative flex w-full items-center justify-center overflow-hidden bg-gray-50 py-20 md:py-32 lg:h-[70vh] dark:bg-black">
                {/* Background Image */}
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center bg-no-repeat opacity-40 dark:opacity-50"></div>

                {/* Overlay Gradients */}
                <div className="absolute inset-0 bg-gradient-to-b from-gray-50/80 via-gray-50/60 to-gray-50 dark:from-black/80 dark:via-black/60 dark:to-zinc-950"></div>
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-gray-50 via-gray-50/80 to-transparent dark:from-zinc-950 dark:via-zinc-950/80"></div>

                {/* Konten Text Slogan */}
                <div className="relative z-10 flex flex-col items-center px-4 text-center">
                    <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-gray-900 drop-shadow-sm sm:text-5xl md:text-6xl lg:text-7xl dark:text-white">
                        My
                        <span className="text-red-600 drop-shadow-md"> Reading List</span>
                    </h1>
                    <p className="mb-8 max-w-2xl text-base text-gray-800 drop-shadow sm:text-lg md:text-xl dark:text-gray-300">
                        Kumpulan artikel dan promo yang kamu simpan dan sukai.
                    </p>
                </div>
            </section>

            <div className="mx-auto max-w-7xl px-4 lg:px-8">
                {/* 🗂️ TABS SECTION */}
                <div className="mb-12 flex justify-center">
                    <div className="flex w-full space-x-2 overflow-x-auto rounded-xl bg-gray-100 p-1.5 sm:w-auto dark:bg-zinc-900/80">
                        <button
                            onClick={() => setActiveTab('saved')}
                            className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-8 py-3 text-sm font-bold whitespace-nowrap transition-all sm:flex-none ${
                                activeTab === 'saved'
                                    ? 'bg-white text-blue-600 shadow-sm dark:bg-zinc-800 dark:text-blue-500'
                                    : 'text-gray-600 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-zinc-200'
                            }`}
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                fill={activeTab === 'saved' ? 'currentColor' : 'none'}
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                                />
                            </svg>
                            Saved Articles ({savedPosts.length})
                        </button>

                        <button
                            onClick={() => setActiveTab('liked')}
                            className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-8 py-3 text-sm font-bold whitespace-nowrap transition-all sm:flex-none ${
                                activeTab === 'liked'
                                    ? 'bg-white text-red-600 shadow-sm dark:bg-zinc-800 dark:text-red-500'
                                    : 'text-gray-600 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-zinc-200'
                            }`}
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                fill={activeTab === 'liked' ? 'currentColor' : 'none'}
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                                />
                            </svg>
                            Liked Articles ({likedPosts.length})
                        </button>
                    </div>
                </div>

                {/* 📰 GRID ARTIKEL */}
                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {displayedPosts.map((post) => (
                        <Link
                            key={post.id}
                            href={route('posts.show', post.slug)}
                            className="group flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-red-500/5 dark:border-zinc-800 dark:bg-zinc-900/80"
                        >
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

                {/* Empty State */}
                {displayedPosts.length === 0 && (
                    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-gray-50 py-24 dark:border-zinc-800 dark:bg-zinc-900/50">
                        <span className="mb-4 text-5xl">📭</span>
                        <p className="text-lg font-medium text-gray-600 dark:text-zinc-400">
                            Belum ada artikel yang kamu {activeTab === 'saved' ? 'simpan' : 'sukai'}.
                        </p>
                        <Link
                            href={route('posts.index')}
                            className="mt-4 rounded-lg bg-red-600 px-6 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
                        >
                            Cari Artikel Menarik
                        </Link>
                    </div>
                )}
            </div>
        </MainLayout>
    );
}

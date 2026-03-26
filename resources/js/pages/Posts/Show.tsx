import MainLayout from '@/layouts/MainLayout';
import { PageProps } from '@inertiajs/core';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';

// Interface untuk Komentar & Reply
interface Comment {
    id: number;
    content: string;
    created_at: string;
    user: {
        id: number;
        name: string;
    };
    replies?: Comment[]; // Tambahan untuk menampung balasan
}

interface PostDetail {
    id: number;
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    thumbnail: string | null;
    type: string;
    read_time: number;
    read_count: number;
    published_at: string;
    likes_count: number;
    author: {
        name: string;
    };
    comments: Comment[];
}

// 2. Bikin Interface buat RelatedPost (Sama persis kayak Post di file Index)
interface RelatedPost {
    id: number;
    title: string;
    slug: string;
    excerpt: string;
    thumbnail: string | null;
    type: string;
    read_time: number;
    published_at: string;
}

// 3. Masukin RelatedPost[] ke dalam Props
interface Props {
    post: PostDetail;
    relatedPosts: RelatedPost[]; // <--- Ganti any[] di sini
    isLiked: boolean;
    isSaved: boolean;
}

// 4. Buat SharedProps biar auth-nya nggak butuh 'as any'
interface SharedProps extends PageProps {
    auth: {
        user: unknown | null; // unknown lebih aman daripada any
    };
    appUrl: string;
}

export default function Show({ post, relatedPosts, isLiked, isSaved }: Props) {
    const { auth, appUrl } = usePage<SharedProps>().props;

    // State Komentar Utama
    const [commentText, setCommentText] = useState('');

    // State Komentar Balasan (Reply)
    const [replyingTo, setReplyingTo] = useState<number | null>(null);
    const [replyText, setReplyText] = useState('');

    const [showShareMenu, setShowShareMenu] = useState(false);
    const [copied, setCopied] = useState(false);
    const postUrl = typeof window !== 'undefined' ? window.location.href : '';

    // ==========================================
    // LOGIKA SHARE BUTTONS
    // ==========================================
    const handleCopyLink = () => {
        navigator.clipboard.writeText(postUrl);
        setCopied(true);
        setShowShareMenu(false);
        setTimeout(() => setCopied(false), 2000);
    };

    const shareWhatsApp = () => {
        const text = encodeURIComponent(`${post.title} | Baca selengkapnya di: ${postUrl}`);
        window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
        setShowShareMenu(false);
    };

    const shareFacebook = () => {
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`, '_blank');
        setShowShareMenu(false);
    };

    // ==========================================
    // LOGIKA LIKE, SAVE & COMMENT
    // ==========================================
    const toggleLike = () => {
        if (!auth?.user) return alert('Silakan Log In terlebih dahulu untuk menyukai artikel ini.');
        router.post(route('posts.like', post.id), {}, { preserveScroll: true });
    };

    const toggleSave = () => {
        if (!auth?.user) return alert('Silakan Log In terlebih dahulu untuk menyimpan artikel ini.');
        router.post(route('posts.save', post.id), {}, { preserveScroll: true });
    };

    // Kirim Komentar Utama
    const submitComment = (e: React.FormEvent) => {
        e.preventDefault();
        if (!commentText.trim()) return;
        router.post(
            route('posts.comment', post.id),
            { content: commentText },
            {
                preserveScroll: true,
                onSuccess: () => setCommentText(''),
            },
        );
    };

    // Kirim Balasan (Reply)
    const submitReply = (e: React.FormEvent, parentId: number) => {
        e.preventDefault();
        if (!replyText.trim()) return;

        router.post(
            route('posts.comment', post.id),
            {
                content: replyText,
                parent_id: parentId, // Kirim ID komentar utamanya
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setReplyText('');
                    setReplyingTo(null); // Tutup form reply setelah sukses
                },
            },
        );
    };

    const thumbnailUrl = post.thumbnail ? `${appUrl}/storage/${post.thumbnail}` : `${appUrl}/images/default-poster.png`;

    return (
        <MainLayout>
            <Head>
                <meta name="description" content={post.excerpt || undefined} head-key="description" />

                {/* Open Graph (Facebook, WhatsApp) */}
                <meta property="og:title" content={`${post.title} | MovieFlix`} head-key="og:title" />
                <meta property="og:description" content={post.excerpt || undefined} head-key="og:description" />
                <meta property="og:image" content={thumbnailUrl} head-key="og:image" />
                <meta property="og:url" content={postUrl} head-key="og:url" />
                <meta property="og:type" content="article" head-key="og:type" />

                {/* Twitter Card */}
                <meta name="twitter:card" content="summary_large_image" head-key="twitter:card" />
                <meta name="twitter:title" content={`${post.title} | MovieFlix`} head-key="twitter:title" />
                <meta name="twitter:description" content={post.excerpt || undefined} head-key="twitter:description" />
                <meta name="twitter:image" content={thumbnailUrl} head-key="twitter:image" />
            </Head>

            {/* ARTIKEL UTAMA */}
            <article className="mx-auto max-w-4xl px-4 pt-32 pb-12 lg:px-8">
                {/* Meta Header */}
                <div className="mb-8 text-center">
                    <span className="inline-block rounded bg-red-600/10 px-3 py-1 text-xs font-black tracking-widest text-red-600 uppercase dark:bg-red-500/20 dark:text-red-400">
                        {post.type}
                    </span>
                    <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl md:text-5xl dark:text-white">
                        {post.title}
                    </h1>

                    {/* BAGIAN META INFO (AUTHOR, TANGGAL, VIEW) */}
                    <div className="mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm font-medium text-gray-500 dark:text-zinc-400">
                        {/* TAMPILAN AUTHOR */}
                        <span className="flex items-center gap-1.5 font-bold text-gray-900 dark:text-gray-200">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4 text-red-600"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                />
                            </svg>
                            {post.author?.name || 'Admin'}
                        </span>
                        <span>•</span>

                        <span>
                            {new Date(post.published_at).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                            })}
                        </span>
                        <span>•</span>
                        <span>{post.read_time} min read</span>
                        <span>•</span>
                        <span>{post.read_count} views</span>
                    </div>
                </div>

                <div className="mb-12 overflow-hidden rounded-2xl bg-gray-100 shadow-xl dark:bg-zinc-800">
                    <img
                        src={
                            post.thumbnail
                                ? `/storage/${post.thumbnail}`
                                : 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=1200&auto=format&fit=crop'
                        }
                        alt={post.title}
                        className="aspect-video w-full object-cover"
                    />
                </div>

                <div
                    className="prose prose-lg prose-red prose-img:rounded-xl dark:prose-invert mx-auto max-w-none"
                    dangerouslySetInnerHTML={{ __html: post.content }}
                />

                {/* ACTION BAR (LIKE, SAVE, SHARE) */}
                <div className="mt-16 flex items-center justify-between border-y border-gray-200 py-6 dark:border-zinc-800">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={toggleLike}
                            className={`group flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition-all ${isLiked ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'}`}
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className={`h-5 w-5 ${isLiked ? 'fill-current' : 'fill-none'} transition-transform group-hover:scale-110`}
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
                            {post.likes_count} Likes
                        </button>

                        <button
                            onClick={toggleSave}
                            className={`group flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition-all ${isSaved ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'}`}
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className={`h-5 w-5 ${isSaved ? 'fill-current' : 'fill-none'} transition-transform group-hover:scale-110`}
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
                            {isSaved ? 'Saved' : 'Save'}
                        </button>
                    </div>

                    {/* SHARE DROPDOWN */}
                    <div className="relative">
                        <button
                            onClick={() => setShowShareMenu(!showShareMenu)}
                            className="flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2 text-sm font-bold text-gray-700 transition-all hover:bg-gray-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                                />
                            </svg>
                            {copied ? 'Copied!' : 'Share'}
                        </button>
                        {/* Menu Share Pop-up */}
                        {showShareMenu && (
                            <div className="absolute right-0 bottom-full z-50 mb-2 w-48 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl dark:border-zinc-700 dark:bg-zinc-800">
                                <button
                                    onClick={shareWhatsApp}
                                    className="flex w-full items-center gap-3 px-4 py-3 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-100 dark:text-zinc-200 dark:hover:bg-zinc-700"
                                >
                                    <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.614-.087-.112-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.274.072.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.099.824z" />
                                    </svg>{' '}
                                    WhatsApp
                                </button>
                                <button
                                    onClick={shareFacebook}
                                    className="flex w-full items-center gap-3 px-4 py-3 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-100 dark:text-zinc-200 dark:hover:bg-zinc-700"
                                >
                                    <svg className="h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M22.675 0h-21.35C.597 0 0 .597 0 1.325v21.351C0 23.403.597 24 1.325 24H12.82v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116c.73 0 1.323-.597 1.323-1.325V1.325C24 .597 23.403 0 22.675 0z" />
                                    </svg>{' '}
                                    Facebook
                                </button>
                                <button
                                    onClick={handleCopyLink}
                                    className="flex w-full items-center gap-3 border-t border-gray-100 px-4 py-3 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-700"
                                >
                                    <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                                        />
                                    </svg>{' '}
                                    Copy Link
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </article>

            {/* BAGIAN BAWAH */}
            <div className="mx-auto max-w-7xl px-4 pb-20 lg:px-8">
                <div className="grid grid-cols-1 gap-16 lg:grid-cols-12">
                    {/* 💬 KOLOM KOMENTAR (Kiri) */}
                    <div className="lg:col-span-8">
                        {/* Hitung total komentar + total balasan biar akurat */}
                        <h3 className="mb-8 text-2xl font-bold text-gray-900 dark:text-white">
                            Comments ({post.comments?.reduce((acc, curr) => acc + 1 + (curr.replies?.length || 0), 0) || 0})
                        </h3>

                        {/* Form Komentar Utama */}
                        <div className="mb-10 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                            {auth?.user ? (
                                <form onSubmit={submitComment}>
                                    <textarea
                                        rows={3}
                                        value={commentText}
                                        onChange={(e) => setCommentText(e.target.value)}
                                        placeholder="What are your thoughts?"
                                        className="w-full rounded-xl border border-gray-300 bg-gray-50 p-4 text-sm focus:border-red-500 focus:outline-none dark:border-zinc-700 dark:bg-black dark:text-white"
                                    ></textarea>
                                    <div className="mt-4 flex justify-end">
                                        <button
                                            type="submit"
                                            disabled={!commentText.trim()}
                                            className="rounded-lg bg-red-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-red-700 disabled:opacity-50"
                                        >
                                            Post Comment
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <div className="text-center text-sm text-gray-600 dark:text-zinc-400">
                                    Please{' '}
                                    <Link href="/login" className="font-bold text-red-600 hover:underline">
                                        Log in
                                    </Link>{' '}
                                    to join the conversation.
                                </div>
                            )}
                        </div>

                        {/* List Komentar Bersarang */}
                        <div className="space-y-8">
                            {post.comments?.length > 0 ? (
                                post.comments.map((comment) => (
                                    <div key={comment.id} className="border-b border-gray-100 pb-8 dark:border-zinc-800/50">
                                        {/* --- KOMENTAR UTAMA --- */}
                                        <div className="flex gap-4">
                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-red-700 text-sm font-bold text-white">
                                                {comment.user.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <h4 className="font-bold text-gray-900 dark:text-white">{comment.user.name}</h4>
                                                        <span className="text-xs text-gray-500 dark:text-zinc-500">
                                                            {new Date(comment.created_at).toLocaleDateString('id-ID', {
                                                                day: 'numeric',
                                                                month: 'short',
                                                                year: 'numeric',
                                                            })}
                                                        </span>
                                                    </div>
                                                </div>
                                                <p className="mt-2 text-sm leading-relaxed text-gray-700 dark:text-zinc-300">{comment.content}</p>

                                                {/* Tombol Balas (Reply) */}
                                                {!!auth?.user && (
                                                    <button
                                                        onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                                                        className="mt-3 flex items-center gap-1.5 text-xs font-bold text-gray-500 transition-colors hover:text-red-600 dark:text-zinc-400 dark:hover:text-red-500"
                                                    >
                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            className="h-3.5 w-3.5"
                                                            fill="none"
                                                            viewBox="0 0 24 24"
                                                            stroke="currentColor"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={2.5}
                                                                d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                                                            />
                                                        </svg>
                                                        {replyingTo === comment.id ? 'Cancel' : 'Reply'}
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        {/* --- FORM BALASAN (Muncul kalau tombol Reply diklik) --- */}
                                        {replyingTo === comment.id && (
                                            <div className="mt-4 ml-14">
                                                <form onSubmit={(e) => submitReply(e, comment.id)}>
                                                    <textarea
                                                        rows={2}
                                                        value={replyText}
                                                        onChange={(e) => setReplyText(e.target.value)}
                                                        placeholder={`Replying to ${comment.user.name}...`}
                                                        className="w-full rounded-xl border border-gray-300 bg-gray-50 p-3 text-sm focus:border-red-500 focus:outline-none dark:border-zinc-700 dark:bg-black dark:text-white"
                                                    ></textarea>
                                                    <div className="mt-2 flex justify-end">
                                                        <button
                                                            type="submit"
                                                            disabled={!replyText.trim()}
                                                            className="rounded-lg bg-red-600 px-4 py-1.5 text-xs font-bold text-white transition hover:bg-red-700 disabled:opacity-50"
                                                        >
                                                            Post Reply
                                                        </button>
                                                    </div>
                                                </form>
                                            </div>
                                        )}

                                        {/* --- LIST BALASAN (REPLIES) --- */}
                                        {comment.replies && comment.replies.length > 0 && (
                                            <div className="mt-6 ml-12 space-y-6 border-l-2 border-gray-100 pl-4 sm:ml-14 sm:pl-6 dark:border-zinc-800">
                                                {comment.replies.map((reply) => (
                                                    <div key={reply.id} className="flex gap-3">
                                                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-gray-500 to-gray-700 text-xs font-bold text-white">
                                                            {reply.user.name.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <h4 className="text-sm font-bold text-gray-900 dark:text-white">{reply.user.name}</h4>
                                                                <span className="text-xs text-gray-500 dark:text-zinc-500">
                                                                    {new Date(reply.created_at).toLocaleDateString('id-ID', {
                                                                        day: 'numeric',
                                                                        month: 'short',
                                                                        year: 'numeric',
                                                                    })}
                                                                </span>
                                                            </div>
                                                            <p className="mt-1.5 text-sm leading-relaxed text-gray-700 dark:text-zinc-300">
                                                                {reply.content}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <p className="text-center text-gray-500 dark:text-zinc-500">No comments yet. Be the first to share your thoughts!</p>
                            )}
                        </div>
                    </div>

                    {/* 📰 RELATED POSTS (Kanan) */}
                    <div className="lg:col-span-4">
                        <h3 className="mb-8 text-xl font-bold text-gray-900 dark:text-white">Related Articles</h3>
                        <div className="flex flex-col gap-6">
                            {relatedPosts.map((relPost) => (
                                <Link
                                    key={relPost.id}
                                    href={route('posts.show', relPost.slug)}
                                    className="group flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-red-500/5 dark:border-zinc-800 dark:bg-zinc-900/80"
                                >
                                    <div className="relative aspect-video w-full overflow-hidden bg-gray-100 dark:bg-zinc-800">
                                        <img
                                            src={
                                                relPost.thumbnail
                                                    ? `/storage/${relPost.thumbnail}`
                                                    : 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=800&auto=format&fit=crop'
                                            }
                                            alt={relPost.title}
                                            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
                                        <div className="absolute top-2 left-2 rounded bg-red-600 px-2 py-0.5 text-[9px] font-black tracking-widest text-white uppercase shadow-lg">
                                            {relPost.type}
                                        </div>
                                    </div>
                                    <div className="flex flex-1 flex-col p-4">
                                        <h4 className="line-clamp-2 text-sm font-bold text-gray-900 transition-colors group-hover:text-red-600 dark:text-white dark:group-hover:text-red-500">
                                            {relPost.title}
                                        </h4>
                                        <div className="mt-2 flex items-center justify-between text-[11px] font-semibold text-gray-500 dark:text-zinc-500">
                                            <span>
                                                {new Date(relPost.published_at).toLocaleDateString('id-ID', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric',
                                                })}
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}

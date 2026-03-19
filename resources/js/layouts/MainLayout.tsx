import type { PageProps } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { PropsWithChildren } from 'react';

export default function MainLayout({ children }: PropsWithChildren) {
    const { auth } = usePage<PageProps>().props;
    
    return (
        <div className="selection:bg-magenta min-h-screen bg-slate-950 font-sans text-slate-200 selection:text-white">
            <Head>
                <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
            </Head>

            {/* Header / Navigasi */}
            <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/90 backdrop-blur-sm">
                <nav className="mx-auto flex max-w-7xl items-center justify-between p-4 lg:px-8">
                    {/* Logo MOVIEFLIX */}
                    <Link href="/" className="text-3xl font-extrabold tracking-tight text-slate-50">
                        MOVIE<span className="text-magenta neon-text-magenta">FLIX</span>
                    </Link>

                    {/* Menu Tengah */}
                    <div className="hidden items-center gap-6 md:flex">
                        {['Home', 'Movies', 'Upcoming'].map((item) => (
                            <Link
                                key={item}
                                href={item === 'Home' ? '/' : `/${item.toLowerCase()}`}
                                className="text-sm font-medium transition-colors hover:text-cyan-400"
                            >
                                {item}
                            </Link>
                        ))}
                    </div>

                    {/* Menu Kanan (Auth/Profile) */}
                    <div className="flex items-center gap-4">
                        <button className="text-slate-400 hover:text-white">🔎 {/* Icon Search Placeholder */}</button>
                        {auth?.user ? (
                            <div className="neon-border-cyan relative h-10 w-10 overflow-hidden rounded-full bg-slate-800 ring-2 ring-cyan-500">
                                <span className="flex h-full w-full items-center justify-center font-bold text-cyan-300">
                                    {auth.user.name[0].toUpperCase()}
                                </span>
                            </div>
                        ) : (
                            <Link href={route('login')} className="rounded-full bg-slate-800 px-5 py-2 text-sm font-medium hover:bg-slate-700">
                                Login
                            </Link>
                        )}
                    </div>
                </nav>
            </header>

            {/* Konten Utama */}
            <main className="mx-auto max-w-7xl p-4 pb-16 lg:px-8">{children}</main>

            {/* Footer Minimalis */}
            <footer className="border-t border-slate-800 bg-slate-900 px-8 py-6 text-center text-sm text-slate-500">
                &copy; {new Date().getFullYear()} MovieFlix by Naufal. Part of Portfolio Project.
            </footer>
        </div>
    );
}

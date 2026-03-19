import type { NavItem, PageProps } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { PropsWithChildren, useEffect, useRef, useState } from 'react';

export default function MainLayout({ children }: PropsWithChildren) {
    const { auth } = usePage<PageProps>().props;

    const [open, setOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // close kalau klik luar
    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const sidebarNavItems: NavItem[] = [
        { title: 'Profile', url: '/settings/profile' },
        { title: 'Password', url: '/settings/password' },
        { title: 'Appearance', url: '/settings/appearance' },
    ];

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
                        {['Home', 'Movies', 'History'].map((item) => (
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
                            <div className="relative" ref={dropdownRef}>
                                {/* Avatar */}
                                <button
                                    onClick={() => setOpen(!open)}
                                    className="neon-border-cyan relative h-10 w-10 overflow-hidden rounded-full bg-slate-800 ring-2 ring-cyan-500"
                                >
                                    <span className="flex h-full w-full items-center justify-center font-bold text-cyan-300">
                                        {auth.user.name[0].toUpperCase()}
                                    </span>
                                </button>

                                {/* Dropdown */}
                                {open && (
                                    <div className="absolute right-0 mt-3 w-56 rounded-xl border border-slate-800 bg-slate-900 shadow-xl">
                                        {/* User Info */}
                                        <div className="border-b border-slate-800 px-4 py-3">
                                            <p className="text-sm font-semibold text-white">{auth.user.name}</p>
                                            <p className="text-xs text-slate-400">{auth.user.email}</p>
                                        </div>

                                        {/* Menu */}
                                        <div className="py-2 text-sm">
                                            {sidebarNavItems.map((item) => (
                                                <Link key={item.url} href={item.url} className="block px-4 py-2 hover:bg-slate-800">
                                                    {item.title === 'Profile' && 'Manage Profile'}
                                                    {item.title === 'Password' && 'Change Password'}
                                                    {item.title === 'Appearance' && 'Appearance'}
                                                </Link>
                                            ))}
                                        </div>

                                        {/* Logout */}
                                        <div className="border-t border-slate-800 py-2">
                                            <Link
                                                href={route('logout')}
                                                method="post"
                                                as="button"
                                                className="block w-full px-4 py-2 text-left text-red-400 hover:bg-slate-800"
                                            >
                                                Logout
                                            </Link>
                                        </div>
                                    </div>
                                )}
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

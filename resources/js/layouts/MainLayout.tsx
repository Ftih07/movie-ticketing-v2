import type { NavItem, PageProps } from '@/types';
// 1. TAMBAHKAN 'router' PADA IMPORT INERTIA
import { Head, Link, router, usePage } from '@inertiajs/react';
import { PropsWithChildren, useEffect, useRef, useState } from 'react';

// 2. IMPORT KOMPONEN PAGELOADER
import PageLoader from '@/components/PageLoader';

export default function MainLayout({ children }: PropsWithChildren) {
    const { auth } = usePage<PageProps>().props;
    const { url } = usePage();

    const [open, setOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // 1. Cek localStorage pas komponen pertama kali dirender
    const [isDarkMode, setIsDarkMode] = useState(() => {
        if (typeof window !== 'undefined') {
            const savedTheme = localStorage.getItem('theme');
            // Kalau ada simpanan 'light', set false. Kalau nggak ada, default-nya true (Dark Mode)
            return savedTheme === 'light' ? false : true;
        }
        return true;
    });

    // 2. Terapkan class 'dark' ke HTML dan simpan ke localStorage setiap kali tombol diklik
    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [isDarkMode]);

    // 3. TAMBAHKAN STATE UNTUK LOADING
    const [isPageLoading, setIsPageLoading] = useState(false);

    // 4. TAMBAHKAN EFFECT UNTUK MENDENGARKAN EVENT ROUTER
    useEffect(() => {
        // Mulai loading saat router mulai berpindah
        const startListener = router.on('start', () => setIsPageLoading(true));

        // Selesai loading saat router selesai berpindah (sukses/error)
        const finishListener = router.on('finish', () => setIsPageLoading(false));

        // Cleanup listener saat komponen di-unmount
        return () => {
            startListener();
            finishListener();
        };
    }, []);

    // Toggle Dark Mode
    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [isDarkMode]);

    // Close Dropdown Profile kalau klik luar
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
        { title: 'My Favorites', url: '/favorites' },
        { title: 'Password', url: '/settings/password' },
        { title: 'Appearance', url: '/settings/appearance' },
        { title: 'Loyalty Points', url: '/settings/points', icon: null },
    ];

    const navLinks = ['Home', 'Movies', 'History', 'Snacks'];

    // Helper untuk cek apakah menu sedang aktif
    const isMenuActive = (item: string) => {
        const itemPath = item === 'Home' ? '/' : `/${item.toLowerCase()}`;

        // Kalau Home, harus sama persis dengan '/'
        if (itemPath === '/') {
            return url === '/';
        }

        // Kalau menu lain (Movies/History), pake startsWith biar kalau masuk ke detail film tetep nyala
        return url.startsWith(itemPath);
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-900 transition-colors duration-300 selection:bg-red-600 selection:text-white dark:bg-zinc-950 dark:text-zinc-100">
            <Head>
                <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
            </Head>

            {/* Header / Navigasi (SAMA SEPERTI SEBELUMNYA) */}
            <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/80">
                <nav className="mx-auto flex max-w-7xl items-center justify-between p-4 lg:px-8">
                    {/* Logo & Menu Kiri */}
                    <div className="flex items-center gap-8">
                        <Link href="/" className="text-2xl font-extrabold tracking-tighter text-red-600 uppercase md:text-3xl">
                            MovieFlix
                        </Link>

                        {/* Menu Kiri (Desktop) */}
                        <div className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-8 md:flex">
                            {navLinks.map((item) => {
                                const active = isMenuActive(item);
                                return (
                                    <Link
                                        key={item}
                                        href={item === 'Home' ? '/' : `/${item.toLowerCase()}`}
                                        className={`text-md transition ${
                                            active
                                                ? 'font-bold text-red-600'
                                                : 'text-gray-600 hover:text-red-600 dark:text-zinc-400 dark:hover:text-white'
                                        }`}
                                    >
                                        {item}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>

                    {/* Menu Kanan (Auth/Profile, Theme Toggle, & Hamburger) */}
                    <div className="flex items-center gap-3 md:gap-4">
                        {/* Theme Toggle Button dengan Animasi Keren */}
                        <button
                            onClick={() => setIsDarkMode(!isDarkMode)}
                            className="relative flex h-9 w-9 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 focus:outline-none dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white"
                            aria-label="Toggle Dark Mode"
                        >
                            {/* Icon Matahari (Muncul saat Dark Mode aktif) */}
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="currentColor"
                                className={`absolute h-5 w-5 transition-all duration-500 ease-in-out ${
                                    isDarkMode ? 'scale-100 rotate-0 opacity-100' : 'scale-0 -rotate-90 opacity-0'
                                }`}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-2.259 1.591-1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"
                                />
                            </svg>

                            {/* Icon Bulan (Muncul saat Light Mode aktif) */}
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="currentColor"
                                className={`absolute h-5 w-5 transition-all duration-500 ease-in-out ${
                                    isDarkMode ? 'scale-0 rotate-90 opacity-0' : 'scale-100 rotate-0 opacity-100'
                                }`}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z"
                                />
                            </svg>
                        </button>

                        {/* Profile Dropdown */}
                        {auth?.user ? (
                            <div className="relative" ref={dropdownRef}>
                                <button
                                    onClick={() => setOpen(!open)}
                                    className="relative h-8 w-8 overflow-hidden rounded-md bg-zinc-200 ring-1 ring-gray-300 transition-transform hover:scale-105 md:h-9 md:w-9 dark:bg-zinc-800 dark:ring-zinc-700"
                                >
                                    {auth.user.profile_image ? (
                                        <img
                                            src={
                                                auth.user.profile_image.startsWith('http')
                                                    ? auth.user.profile_image
                                                    : `/storage/${auth.user.profile_image}`
                                            }
                                            alt={auth.user.name}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <span className="flex h-full w-full items-center justify-center font-bold text-gray-700 dark:text-zinc-300">
                                            {auth.user.name[0].toUpperCase()}
                                        </span>
                                    )}
                                </button>

                                {open && (
                                    <div className="absolute right-0 mt-3 w-56 rounded-lg border border-gray-200 bg-white shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
                                        <div className="border-b border-gray-100 px-4 py-3 dark:border-zinc-800">
                                            <p className="text-sm font-semibold text-gray-900 dark:text-white">{auth.user.name}</p>
                                        </div>
                                        <div className="py-2 text-sm">
                                            {sidebarNavItems.map((item) => (
                                                <Link
                                                    key={item.url}
                                                    href={item.url}
                                                    className={`block px-4 py-2 hover:bg-gray-100 dark:hover:bg-zinc-800 ${
                                                        url.startsWith(item.url)
                                                            ? 'font-bold text-red-600 dark:text-red-500' // Nyala di dropdown setting
                                                            : 'text-gray-700 dark:text-zinc-300'
                                                    }`}
                                                >
                                                    {item.title}
                                                </Link>
                                            ))}
                                        </div>
                                        <div className="border-t border-gray-100 py-2 dark:border-zinc-800">
                                            <Link
                                                href={route('logout')}
                                                method="post"
                                                as="button"
                                                className="block w-full px-4 py-2 text-left font-medium text-red-600 hover:bg-gray-100 dark:hover:bg-zinc-800"
                                            >
                                                Sign Out
                                            </Link>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <Link
                                href={route('login')}
                                className="hidden rounded bg-red-600 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 md:block"
                            >
                                Sign In
                            </Link>
                        )}

                        {/* Hamburger Button (Mobile Only) */}
                        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-gray-600 md:hidden dark:text-zinc-300">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={2}
                                stroke="currentColor"
                                className="h-6 w-6"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 12h18M3 6h18M3 18h18" />
                            </svg>
                        </button>
                    </div>
                </nav>

                {/* Mobile Menu Dropdown */}
                {isMobileMenuOpen && (
                    <div className="border-t border-gray-200 bg-white px-4 py-4 md:hidden dark:border-zinc-800 dark:bg-zinc-950">
                        <div className="flex flex-col gap-4">
                            {navLinks.map((item) => {
                                const active = isMenuActive(item);
                                return (
                                    <Link
                                        key={item}
                                        href={item === 'Home' ? '/' : `/${item.toLowerCase()}`}
                                        className={`text-base transition-colors ${
                                            active
                                                ? 'font-bold text-red-600 dark:text-red-500' // State Nyala (Aktif)
                                                : 'font-medium text-gray-700 hover:text-red-600 dark:text-zinc-300 dark:hover:text-white' // State Normal
                                        }`}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        {item}
                                    </Link>
                                );
                            })}
                            {!auth?.user && (
                                <Link href={route('login')} className="mt-2 rounded bg-red-600 px-4 py-2 text-center text-sm font-medium text-white">
                                    Sign In
                                </Link>
                            )}
                        </div>
                    </div>
                )}
            </header>

            {/* 5. IMPLEMENTASI LOGIC LOADING DI KONTEN UTAMA */}
            <main className="relative min-h-[80vh] pb-16">
                {/* Tampilkan Skeleton saat Loading */}
                {isPageLoading && (
                    <div className="absolute inset-0 z-40 bg-gray-50 dark:bg-zinc-950">
                        <PageLoader />
                    </div>
                )}

                {/* Komponen Children Asli (Akan disembunyikan perlahan saat loading) */}
                <div className={`transition-opacity duration-300 ${isPageLoading ? 'opacity-0' : 'opacity-100'}`}>{children}</div>
            </main>

            {/* Footer Minimalis */}
            <footer className="border-t border-gray-200 bg-white px-8 py-8 text-center text-sm text-gray-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-500">
                <p>&copy; {new Date().getFullYear()} MovieFlix by Naufal Fathi. Part of Portfolio Project.</p>
            </footer>
        </div>
    );
}

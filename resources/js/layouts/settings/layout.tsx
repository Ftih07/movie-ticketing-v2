import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
// IMPORT MAINLAYOUT KITA DI SINI
import MainLayout from '@/layouts/MainLayout';
import { usePage } from '@inertiajs/react';

const sidebarNavItems: NavItem[] = [
    {
        title: 'Profile',
        url: '/settings/profile',
        icon: null,
    },
    {
        title: 'Password',
        url: '/settings/password',
        icon: null,
    },
    {
        title: 'Appearance',
        url: '/settings/appearance',
        icon: null,
    },
];

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
    const currentPath = window.location.pathname;
    const { url } = usePage();

    // ambil path aja (tanpa domain kalau ada)
    const path = new URL(url, window.location.origin).pathname;

    const activeItem = sidebarNavItems.find((item) => path.startsWith(item.url));

    return (
        // BUNGKUS DENGAN MAINLAYOUT
        <MainLayout>
            <div className="mx-auto max-w-5xl px-4 py-8">
                {/* Heading Custom Biar Masuk Tema Neon */}
                <div className="mb-8 border-b border-slate-800 pb-6">
                    <h2 className="text-3xl font-extrabold tracking-tight text-white">
                        {activeItem?.title || 'Account'} <span className="text-magenta neon-text-magenta">Settings</span>
                    </h2>
                    <p className="mt-2 text-sm text-slate-400">Manage your profile, security, and account preferences.</p>
                </div>

                <div className="flex flex-col space-y-8 lg:flex-row lg:space-y-0 lg:space-x-12">
                    {/* Sidebar Navigasi Settings (Kiri) */}
                    <aside className="w-full max-w-xl lg:w-48">
                        <nav className="flex flex-col space-y-2">
                            {sidebarNavItems.map((item) => (
                                <Button
                                    key={item.url}
                                    size="sm"
                                    variant="ghost"
                                    asChild
                                    className={cn('w-full justify-start text-slate-300 hover:bg-slate-800 hover:text-white', {
                                        'rounded-none border-l-2 border-cyan-400 bg-slate-800 font-bold text-cyan-400': currentPath === item.url,
                                    })}
                                >
                                    <Link href={item.url} prefetch>
                                        {item.title}
                                    </Link>
                                </Button>
                            ))}
                        </nav>
                    </aside>

                    <Separator className="my-6 bg-slate-800 md:hidden" />

                    {/* Area Konten Settings (Kanan) - Berisi Form Profile/Password */}
                    <div className="flex-1 rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-xl ring-1 ring-white/5 md:max-w-2xl">
                        <section className="space-y-12">
                            {/* Children di sini otomatis merender isi dari profile.tsx atau password.tsx */}
                            {children}
                        </section>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}

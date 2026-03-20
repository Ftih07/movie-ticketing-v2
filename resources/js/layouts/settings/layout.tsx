import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import MainLayout from '@/layouts/MainLayout';
import { cn } from '@/lib/utils';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';

const sidebarNavItems: NavItem[] = [
    { title: 'Profile', url: '/settings/profile', icon: null },
    { title: 'Password', url: '/settings/password', icon: null },
    { title: 'Appearance', url: '/settings/appearance', icon: null },
];

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
    const currentPath = window.location.pathname;
    const { url } = usePage();
    const path = new URL(url, window.location.origin).pathname;
    const activeItem = sidebarNavItems.find((item) => path.startsWith(item.url));

    return (
        <MainLayout>
            <div className="mx-auto max-w-5xl px-4 py-8 lg:px-8">
                {/* Heading Elegan MovieFlix */}
                <div className="mb-8 border-b border-gray-200 pb-6 dark:border-zinc-800">
                    <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                        {activeItem?.title || 'Account'} <span className="text-red-600">Settings</span>
                    </h2>
                    <p className="mt-2 text-sm text-gray-500 dark:text-zinc-400">Manage your profile, security, and account preferences.</p>
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
                                    className={cn('w-full justify-start transition-colors', {
                                        // Active State (Merah)
                                        'rounded-none border-l-2 border-red-600 bg-red-50 font-bold text-red-700 hover:bg-red-100 hover:text-red-800 dark:bg-zinc-800/80 dark:text-red-500 dark:hover:bg-zinc-800 dark:hover:text-red-400':
                                            currentPath === item.url,
                                        // Inactive State
                                        'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-zinc-400 dark:hover:bg-zinc-800/50 dark:hover:text-white':
                                            currentPath !== item.url,
                                    })}
                                >
                                    <Link href={item.url} prefetch>
                                        {item.title}
                                    </Link>
                                </Button>
                            ))}
                        </nav>
                    </aside>

                    <Separator className="my-6 bg-gray-200 md:hidden dark:bg-zinc-800" />

                    {/* Area Konten Settings (Kanan) */}
                    <div className="flex-1 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:max-w-2xl md:p-8 dark:border-zinc-800 dark:bg-zinc-900">
                        <section className="space-y-12">{children}</section>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}

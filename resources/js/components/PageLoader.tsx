import { usePage } from '@inertiajs/react';
import { Skeleton } from './Skeleton';

export default function PageLoader() {
    const { url } = usePage();

    // 1. SKELETON HOME (/)
    if (url === '/') {
        return (
            <div className="w-full pb-16">
                <section className="relative flex w-full items-center justify-center overflow-hidden bg-gray-50 py-20 md:py-32 lg:h-[70vh] dark:bg-black">
                    <div className="relative z-10 flex w-full max-w-4xl flex-col items-center px-4 text-center">
                        <Skeleton className="mb-3 h-12 w-3/4 max-w-[600px] md:h-16 lg:h-20" />
                        <Skeleton className="mb-6 h-12 w-2/3 max-w-[500px] md:h-16 lg:h-20" />
                        <Skeleton className="mb-2 h-5 w-full max-w-[700px]" />
                        <Skeleton className="h-5 w-4/5 max-w-[500px]" />
                    </div>
                </section>
                <div className="mx-auto max-w-7xl px-4 lg:px-8">
                    <div className="relative z-20 -mt-6 mb-12 flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-xl md:-mt-10 md:flex-row md:items-end dark:border-zinc-800 dark:bg-zinc-900">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="flex-1 space-y-2">
                                <Skeleton className="h-3 w-12" />
                                <Skeleton className="h-[42px] w-full" />
                            </div>
                        ))}
                    </div>
                    <div className="space-y-16">
                        {[...Array(2)].map((_, i) => (
                            <section key={i} className="mb-14">
                                <div className="mb-6 flex items-center gap-3">
                                    <Skeleton className="h-6 w-1.5 rounded-full" />
                                    <Skeleton className="h-8 w-48" />
                                </div>
                                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:gap-6 lg:grid-cols-5 xl:grid-cols-6">
                                    {[...Array(6)].map((_, j) => (
                                        <Skeleton key={j} className="aspect-[2/3] w-full rounded-md" />
                                    ))}
                                </div>
                            </section>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // 2. SKELETON ALL MOVIES (/movies)
    if (url === '/movies') {
        return (
            <div className="mx-auto max-w-7xl px-4 pt-8 lg:px-8">
                <div className="mb-8 space-y-3">
                    <Skeleton className="h-10 w-64 md:h-12" />
                    <Skeleton className="h-5 w-80" />
                </div>

                {/* Date Strip Skeleton */}
                <div className="mb-10 flex gap-3 overflow-hidden border-b border-zinc-800 pb-8">
                    {[...Array(12)].map((_, i) => (
                        <Skeleton key={i} className="h-20 min-w-[80px] rounded-2xl" />
                    ))}
                </div>

                {/* Grid Poster */}
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:gap-6 lg:grid-cols-5 xl:grid-cols-6">
                    {[...Array(12)].map((_, i) => (
                        <Skeleton key={i} className="aspect-[2/3] w-full rounded-md" />
                    ))}
                </div>
            </div>
        );
    }

    // 3. SKELETON HISTORY (/history)
    if (url === '/history') {
        return (
            <div className="mx-auto max-w-4xl px-4 pt-10 pb-16">
                {' '}
                {/* max-w diperkecil biar fokus tengah */}
                <div className="mb-12 space-y-3">
                    <Skeleton className="h-10 w-48" />
                    <Skeleton className="h-4 w-80" />
                </div>
                {/* Ticket Cards Stack */}
                <div className="flex flex-col items-center gap-6">
                    {[...Array(3)].map((_, i) => (
                        <div
                            key={i}
                            className="flex w-full max-w-3xl flex-col gap-6 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4 md:flex-row"
                        >
                            {/* Poster area */}
                            <Skeleton className="aspect-[2/3] w-full rounded-xl md:w-[180px]" />

                            {/* Info area */}
                            <div className="flex flex-1 flex-col justify-between space-y-4 py-2">
                                <div className="space-y-3">
                                    <Skeleton className="h-4 w-32" />
                                    <Skeleton className="h-8 w-full" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    {[...Array(4)].map((_, j) => (
                                        <div key={j} className="space-y-2">
                                            <Skeleton className="h-3 w-12" />
                                            <Skeleton className="h-5 w-20" />
                                        </div>
                                    ))}
                                </div>
                                <Skeleton className="h-10 w-32" />
                            </div>

                            {/* QR Section */}
                            <div className="hidden w-[160px] flex-col items-center justify-center border-l border-zinc-800 pl-6 md:flex">
                                <Skeleton className="h-28 w-28 rounded-lg" />
                                <Skeleton className="mt-4 h-8 w-full rounded-md" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // 4. SKELETON DETAIL FILM (/movies/slug)
    if (url.startsWith('/movies/') && url !== '/movies') {
        return (
            <div className="w-full pb-16">
                <section className="bg-black py-12 md:py-16">
                    <div className="mx-auto max-w-7xl px-4 lg:px-8">
                        <div className="grid grid-cols-1 gap-8 md:grid-cols-[280px,1fr] lg:gap-12">
                            <Skeleton className="mx-auto aspect-[2/3] w-[200px] rounded-xl md:w-full" />
                            <div className="space-y-6 pt-4">
                                <Skeleton className="h-14 w-3/4" />
                                <div className="flex gap-3">
                                    {[...Array(3)].map((_, i) => (
                                        <Skeleton key={i} className="h-6 w-20" />
                                    ))}
                                </div>
                                <Skeleton className="h-32 w-full rounded-xl" />
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        );
    }

    // 5. BOOKING PAGE (/booking/1) 
    if (url.startsWith('/booking/')) {
        return (
            <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr,400px]">
                    {/* Left: Cinema Screen Area */}
                    <div className="rounded-3xl border border-zinc-800 bg-zinc-900/20 p-8 flex flex-col items-center">
                        <Skeleton className="mb-4 h-6 w-40" /> {/* Title Layar Bioskop */}
                        <Skeleton className="mb-20 h-4 w-3/4 rounded-full" /> {/* Cinema Screen Curve */}
                        <div className="grid grid-cols-10 gap-2"> {/* Seat Grid */}
                            {[...Array(50)].map((_, i) => <Skeleton key={i} className="h-8 w-8 rounded-md" />)}
                        </div>
                        <div className="mt-12 flex gap-6">
                            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-4 w-24 rounded-full" />)}
                        </div>
                    </div>
                    {/* Right: Booking Summary */}
                    <div className="rounded-3xl border border-zinc-800 bg-zinc-900/50 p-6 space-y-8">
                        <Skeleton className="h-8 w-48" />
                        <div className="space-y-4">
                            <Skeleton className="h-20 w-full" />
                            <Skeleton className="h-32 w-full rounded-xl" />
                        </div>
                        <div className="flex justify-between items-center">
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-8 w-32" />
                        </div>
                        <Skeleton className="h-14 w-full rounded-2xl" />
                    </div>
                </div>
            </div>
        );
    }

    // DEFAULT SKELETON
    return (
        <div className="mx-auto max-w-7xl space-y-10 px-4 pt-8 pb-16 lg:px-8">
            <div className="space-y-3">
                <Skeleton className="h-10 w-64" />
                <Skeleton className="h-5 w-96" />
            </div>
            <Skeleton className="h-[400px] w-full rounded-2xl" />
        </div>
    );
}

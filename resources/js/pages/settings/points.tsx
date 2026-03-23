import { type SharedData } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import SettingsLayout from '@/layouts/settings/layout';
import HeadingSmall from '@/components/heading-small';
import dayjs from 'dayjs'; // Opsional: buat format tanggal biar rapi, kalau ga ada bisa pakai toLocaleDateString()

interface PointTransaction {
    id: number;
    type: 'earned' | 'redeemed';
    amount: number;
    balance: number;
    expired_at: string | null;
    created_at: string;
}

interface Props {
    point_balance: number;
    transactions: PointTransaction[];
}

export default function Points({ point_balance, transactions }: Props) {
    const { auth } = usePage<SharedData>().props;

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    return (
        <SettingsLayout>
            <Head title="Loyalty Points" />

            <div className="space-y-8">
                <HeadingSmall 
                    title="Loyalty Points" 
                    description="View your active points and transaction history." 
                />

                {/* --- KARTU HIGHLIGHT POIN --- */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-red-600 to-red-800 p-8 text-white shadow-lg">
                    {/* Hiasan background abstrak opsional */}
                    <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl"></div>
                    <div className="absolute -bottom-10 right-20 h-32 w-32 rounded-full bg-black/10 blur-xl"></div>
                    
                    <div className="relative z-10">
                        <p className="text-sm font-medium text-red-100 uppercase tracking-wider">Total Active Points</p>
                        <h2 className="mt-2 text-5xl font-black tracking-tight">{point_balance} <span className="text-2xl font-bold text-red-200">Pts</span></h2>
                        <p className="mt-4 text-sm font-medium text-red-100">
                            ✨ 1 Poin bernilai Rp 1.000 untuk potongan harga F&B atau tiket.
                        </p>
                    </div>
                </div>

                {/* --- TABEL HISTORY --- */}
                <div>
                    <h3 className="mb-4 text-lg font-bold text-gray-900 dark:text-white">Transaction History</h3>
                    
                    {transactions.length > 0 ? (
                        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
                            <div className="divide-y divide-gray-100 dark:divide-zinc-800">
                                {transactions.map((tx) => (
                                    <div key={tx.id} className="flex items-center justify-between p-4 transition-colors hover:bg-gray-50 dark:hover:bg-zinc-800/50">
                                        <div className="flex items-center gap-4">
                                            {/* Icon Berdasarkan Tipe */}
                                            <div className={`flex h-10 w-10 items-center justify-center rounded-full ${tx.type === 'earned' ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'}`}>
                                                {tx.type === 'earned' ? '↓' : '↑'}
                                            </div>
                                            
                                            <div>
                                                <p className="font-bold text-gray-900 capitalize dark:text-white">
                                                    {tx.type === 'earned' ? 'Points Earned' : 'Points Redeemed'}
                                                </p>
                                                <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-zinc-400">
                                                    <span>{formatDate(tx.created_at)}</span>
                                                    {tx.type === 'earned' && tx.expired_at && (
                                                        <>
                                                            <span>•</span>
                                                            <span className="text-orange-500">Exp: {formatDate(tx.expired_at)}</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="text-right">
                                            <p className={`text-lg font-black ${tx.type === 'earned' ? 'text-green-600 dark:text-green-400' : 'text-gray-900 dark:text-white'}`}>
                                                {tx.type === 'earned' ? '+' : '-'}{tx.amount}
                                            </p>
                                            {tx.type === 'earned' && (
                                                <p className="text-xs text-gray-500 dark:text-zinc-500">
                                                    Sisa: {tx.balance}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 py-12 dark:border-zinc-700">
                            <span className="text-4xl">🎟️</span>
                            <p className="mt-4 text-sm font-medium text-gray-500 dark:text-zinc-400">Belum ada riwayat poin.</p>
                            <p className="text-xs text-gray-400 dark:text-zinc-500">Lakukan transaksi untuk mulai mengumpulkan poin!</p>
                        </div>
                    )}
                </div>
            </div>
        </SettingsLayout>
    );
}
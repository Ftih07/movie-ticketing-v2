import React from 'react';

interface Promo {
    id: number;
    name: string;
    code: string;
    description: string;
    discount_type: string;
    discount_value: number;
}

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSelectPromo: (code: string) => void;
    promos: Promo[];
}

export default function PromoModal({ isOpen, onClose, onSelectPromo, promos }: Props) {
    if (!isOpen) return null;

    // Fungsi format rupiah buat nampilin diskon
    const formatRupiah = (number: number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm transition-opacity">
            {/* Modal Container */}
            <div className="relative w-full max-w-md animate-fade-in-up rounded-2xl bg-white p-6 shadow-2xl dark:bg-zinc-900">
                
                {/* Header */}
                <div className="mb-4 flex items-center justify-between border-b border-gray-100 pb-4 dark:border-zinc-800">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Promo Tersedia</h3>
                    <button 
                        onClick={onClose}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition hover:bg-red-100 hover:text-red-600 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-red-500/20 dark:hover:text-red-400"
                    >
                        ✕
                    </button>
                </div>

                {/* Promo List */}
                <div className="max-h-[60vh] overflow-y-auto pr-2">
                    {promos.length > 0 ? (
                        <div className="space-y-4">
                            {promos.map((promo) => (
                                <div key={promo.id} className="group relative overflow-hidden rounded-xl border border-gray-200 bg-gray-50 p-4 transition hover:border-red-500 dark:border-zinc-800 dark:bg-zinc-950/50 dark:hover:border-red-500">
                                    <div className="mb-2 flex items-start justify-between">
                                        <div>
                                            <h4 className="font-bold text-gray-900 dark:text-white">{promo.name}</h4>
                                            <p className="mt-1 text-xs text-gray-500 dark:text-zinc-400">{promo.description}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="mt-4 flex items-center justify-between border-t border-dashed border-gray-200 pt-3 dark:border-zinc-800">
                                        <div className="rounded border border-red-200 bg-red-50 px-2 py-1 text-xs font-black uppercase tracking-wider text-red-600 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-500">
                                            {promo.code}
                                        </div>
                                        <button 
                                            onClick={() => onSelectPromo(promo.code)}
                                            className="rounded-lg bg-gray-900 px-4 py-2 text-xs font-bold text-white transition hover:bg-red-600 dark:bg-white dark:text-zinc-900 dark:hover:bg-red-500 dark:hover:text-white"
                                        >
                                            Pakai
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                            <span className="text-4xl">🎫</span>
                            <p className="mt-4 text-sm font-medium text-gray-500 dark:text-zinc-400">Belum ada promo yang tersedia saat ini.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
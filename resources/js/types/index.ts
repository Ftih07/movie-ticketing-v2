import { LucideIcon } from 'lucide-react';

export interface Auth {
    user: User;
}

export interface PageProps {
    auth: Auth;
    [key: string]: unknown; // 🔥 WAJIB buat Inertia
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    url: string;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    google_id: string | null;
    role: 'admin' | 'customer' | string;
    profile_image: string | null;
    active_points?: number;

    created_at: string;
    updated_at: string;
    [key: string]: unknown; // This allows for additional properties...
}

export interface Category {
    id: number;
    name: string;
    description: string | null;
}

export interface Studio {
    id: number;
    name: string;
    capacity: number;
}

export interface Showtime {
    id: number;
    movie_id: number;
    studio_id: number;
    show_date: string; // YYYY-MM-DD
    start_time: string; // HH:mm:ss
    end_time: string; // HH:mm:ss
    price: number;
    studio?: Studio; // Relasi
}

export interface Movie {
    id: number;
    title: string;
    slug: string;
    duration: number; // menit
    description: string | null;
    director: string;
    cast: string;
    age: string;
    writer: string;
    producer: string;
    production_company: string;
    poster: string | null;
    trailer_url?: string;
    created_at: string;
    categories?: Category[]; // Relasi Many-to-Many
    showtimes?: Showtime[]; // Relasi One-to-Many
}

// Type khusus buat detail film yang jadwalnya udah dikelompokkan
export interface MovieDetail extends Movie {
    groupedShowtimes: Record<string, Showtime[]>; // Key: Tanggal, Value: Array Jadwal
    is_favorited?: boolean; // <--- TAMBAHKAN BARIS INI (Pakai ? biar aman kalau datanya kosong)
}

export interface ProductCategory {
    id: number;
    name: string;
    products?: Product[];
}

export interface Product {
    id: number;
    product_category_id: number;
    name: string;
    image: string;
    price: number;
    description: string;
}

export interface Promo {
    id: number;
    code: string;
    name: string;
    description: string;
    discount_type: string;
    discount_value: number;
    max_discount: number | null; 
    start_date: string | null;
    end_date: string | null;
    quota: number | null;
    is_active: boolean;
    created_at?: string;
    updated_at?: string;
}

import MainLayout from '@/layouts/MainLayout';
import { Movie } from '@/types';
import { Head, Link } from '@inertiajs/react';

interface Props {
    heroMovie: Movie;
    actionMovies: Movie[];
    dramaMovies: Movie[];
}

export default function Home({ heroMovie, actionMovies, dramaMovies }: Props) {
    return (
        <MainLayout>
            <Head title="Home | Watch Now" />

            {/* Hero Section */}
            {heroMovie && (
                <section className="relative -mx-4 mb-12 aspect-[21/9] overflow-hidden bg-slate-900 lg:-mx-8">
                    {/* Poster Background */}
                    <img
                        src={`/storage/${heroMovie.poster}`}
                        alt={heroMovie.title}
                        className="absolute inset-0 h-full w-full object-cover opacity-30"
                    />
                    {/* Gradient Overlay ala Netflix */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent"></div>

                    {/* Konten Hero */}
                    <div className="relative z-10 flex h-full max-w-3xl flex-col justify-end p-8 lg:p-12">
                        <div className="mb-4 inline-flex gap-2">
                            {heroMovie.categories?.map((cat) => (
                                <span key={cat.id} className="rounded-full bg-slate-800 px-3 py-1 text-xs font-medium text-slate-300">
                                    {cat.name}
                                </span>
                            ))}
                        </div>
                        <h1 className="mb-4 text-5xl font-extrabold tracking-tight text-white lg:text-6xl">{heroMovie.title}</h1>
                        <p className="mb-8 line-clamp-3 text-lg text-slate-300">{heroMovie.description}</p>
                        <div className="flex gap-4">
                            <Link
                                href={route('movies.show', heroMovie.slug)}
                                className="bg-magenta neon-border-magenta rounded-full px-8 py-3 text-sm font-semibold text-white transition-all hover:scale-105 hover:bg-fuchsia-600"
                            >
                                Book Tickets Now
                            </Link>
                            <button className="rounded-full border border-white/20 bg-white/5 px-8 py-3 text-sm font-semibold text-white backdrop-blur-md transition-all hover:bg-white/10">
                                Watch Trailer
                            </button>
                        </div>
                    </div>
                </section>
            )}

            {/* Movie Carousels */}
            <MovieCarousel title="Action Packed" movies={actionMovies} />
            <MovieCarousel title="Drama Series" movies={dramaMovies} />
        </MainLayout>
    );
}

// Sub-komponen buat Carousel biar rapi
interface CarouselProps {
    title: string;
    movies: Movie[];
}
function MovieCarousel({ title, movies }: CarouselProps) {
    return (
        <section className="mb-12">
            <h2 className="mb-6 text-2xl font-bold tracking-tight text-white">
                <span className="neon-text-cyan text-cyan-400">|</span> {title}
            </h2>
            <div className="grid grid-cols-2 gap-6 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                {movies.map((movie) => (
                    <Link key={movie.id} href={route('movies.show', movie.slug)} className="group">
                        <div className="neon-border-cyan relative aspect-[3/4] overflow-hidden rounded-xl bg-slate-800 ring-1 ring-slate-700 transition-all group-hover:-translate-y-2 group-hover:ring-2 group-hover:ring-cyan-500">
                            <img
                                src={`/storage/${movie.poster}`}
                                alt={movie.title}
                                className="absolute inset-0 h-full w-full object-cover transition-opacity duration-300 group-hover:opacity-80"
                            />
                            {/* Overlay info durasi pas di-hover */}
                            <div className="absolute inset-x-0 bottom-0 translate-y-4 bg-gradient-to-t from-black/80 to-transparent p-3 opacity-0 transition-all group-hover:translate-y-0 group-hover:opacity-100">
                                <p className="text-xs font-medium text-cyan-300">{movie.duration} Menit</p>
                            </div>
                        </div>
                        <h3 className="mt-3 line-clamp-1 text-sm font-semibold text-slate-100 group-hover:text-white">{movie.title}</h3>
                    </Link>
                ))}
            </div>
        </section>
    );
}

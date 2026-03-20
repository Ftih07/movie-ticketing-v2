<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>@yield('title') - MovieFlix</title>

    <script>
        if (localStorage.getItem('theme') === 'light') {
            document.documentElement.classList.remove('dark');
        } else {
            document.documentElement.classList.add('dark');
        }
    </script>

    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            darkMode: 'class', // Penting: Agar Tailwind baca class "dark" di <html>
        }
    </script>

    <style>
        .red-glow {
            text-shadow: 0 0 20px rgba(220, 38, 38, 0.4);
        }

        /* Transisi halus saat pindah tema */
        body {
            transition: background-color 0.3s, color 0.3s;
        }
    </style>
</head>

<body class="flex items-center justify-center min-h-screen p-6 overflow-hidden bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 font-[Inter,sans-serif]">

    <div class="absolute inset-0 -z-10 
        bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] 
        from-red-500/10 via-zinc-50 to-zinc-50
        dark:from-red-900/10 dark:via-zinc-950 dark:to-zinc-950">
    </div>

    <div class="text-center">
        <h1 class="text-[10rem] md:text-[12rem] font-black leading-none 
            text-zinc-200 dark:text-zinc-800 
            selection:bg-red-600 red-glow">
            @yield('code')
        </h1>

        <p class="text-2xl md:text-3xl font-bold mt-4 uppercase tracking-widest text-zinc-900 dark:text-white">
            @yield('message')
        </p>

        <p class="text-zinc-500 dark:text-zinc-400 mt-2 max-w-md mx-auto">
            @yield('description')
        </p>

        <div class="mt-10">
            <a href="/" class="inline-block px-8 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-full transition-all duration-300 transform hover:scale-105 shadow-[0_0_15px_rgba(220,38,38,0.4)]">
                KEMBALI KE BERANDA
            </a>
        </div>
    </div>
</body>

</html>
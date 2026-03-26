<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Post;
use App\Models\User;
use App\Models\Movie;
use Illuminate\Support\Str;

class PostSeeder extends Seeder
{
    public function run(): void
    {
        // Pastikan ada user untuk dijadikan author
        $author = User::first();
        if (!$author) {
            $author = User::factory()->create(['name' => 'Admin Content', 'email' => 'admin@movie.com']);
        }

        $posts = [
            // ==========================================
            // VERSI ARTIKEL PANJANG (LONG READS)
            // ==========================================
            [
                'type' => 'article',
                'title' => 'Menyambut Aksi Gila Baba Yaga: Nonton John Wick 4 Rame-Rame, Setengah Harga!',
                'content' => '<p>Siapa yang tidak kenal John Wick? Sang pembunuh bayaran legendaris "Baba Yaga" kini kembali dengan aksi yang jauh lebih memukau, brutal, dan estetis di <strong>John Wick: Chapter 4</strong>. Berlatar di berbagai belahan dunia, mulai dari gurun pasir hingga jalanan ikonik kota Paris, film ini menawarkan koreografi aksi yang akan membuatmu menahan napas.</p><p>Melihat antusiasme penonton yang luar biasa, kami menghadirkan <strong>Flash Sale Yvez</strong> khusus untuk kamu pecinta aksi! Mengingat durasi film ini yang cukup panjang (hampir 3 jam), menonton bersama teman-teman tentu akan membuat pengalaman sinematik ini semakin pecah.</p><p>Caranya gampang banget: Ajak minimal satu temanmu, pastikan total belanjamu di atas Rp 100.000, lalu gunakan kode promo <strong>YVEZFLASH</strong> saat proses <em>checkout</em> di aplikasi ini. Kamu otomatis mendapatkan diskon 50% (Maksimal potongan Rp 50.000). Ingat, sisa kuota cuma 50 tiket! Jangan sampai temanmu yang mentraktir karena kamu kehabisan tiketnya.</p>',
                'excerpt' => 'Menyambut epiknya John Wick 4, nikmati diskon 50% untuk nonton bareng teman dengan kode YVEZFLASH. Sisa kuota 50 tiket!',
                'status' => 'published',
                'is_featured' => true,
                'read_time' => 3,
                'meta_title' => 'Artikel: Promo Tiket John Wick 4 Diskon 50% | Kode YVEZFLASH',
                'meta_description' => 'Review singkat John Wick 4 dan dapatkan diskon tiket bioskop 50% pakai kode promo YVEZFLASH sekarang sebelum kehabisan kuota!',
            ],
            [
                'type' => 'article',
                'title' => 'Eksplorasi Luar Angkasa Epik: Nonton Interstellar Layaknya Sultan!',
                'content' => '<p>Karya <em>masterpiece</em> Christopher Nolan, <strong>Interstellar</strong>, bukan sekadar film fiksi ilmiah biasa. Ini adalah perjalanan visual dan emosional melintasi galaksi, lubang cacing (wormhole), dan dimensi waktu demi menyelamatkan umat manusia. Dengan visual yang memanjakan mata dan *scoring* musik Hans Zimmer yang legendaris, film ini wajib ditonton di layar sebesar mungkin.</p><p>Namun, durasi film yang mencapai 2 jam 49 menit tentu membutuhkan persiapan khusus. Kamu tidak mungkin menjelajahi galaksi dengan perut kosong, bukan?</p><p>Oleh karena itu, kami merilis <strong>Diskon Sultan</strong>. Beli tiket Interstellar sekalian borong popcorn karamel dan minuman soda ukuran besar. Jika total keranjangmu (Tiket + F&B) menembus Rp 150.000, sistem kami akan otomatis memberikan potongan langsung sebesar Rp 15.000 tanpa perlu repot mengetik kode apa pun! Jadilah sultan di bioskop, nikmati filmnya, habiskan popcorn-nya. Sisa 4 kuota lagi, amankan sekarang!</p>',
                'excerpt' => 'Perjalanan luar angkasa butuh amunisi! Beli tiket Interstellar + Snack minimal 150rb, otomatis dapat potongan Sultan 15rb.',
                'status' => 'published',
                'is_featured' => true,
                'read_time' => 4,
                'meta_title' => 'Diskon Sultan: Nonton Interstellar & Beli Snack Potong 15rb',
                'meta_description' => 'Nonton Interstellar makin asyik dengan Diskon Sultan. Otomatis potong Rp 15.000 untuk pembelian tiket dan snack minimal Rp 150.000.',
            ],
            [
                'type' => 'article',
                'title' => 'Bedah Film F1: Balapan Brad Pitt Makin Dekat, Ini Persiapan Nontonnya!',
                'content' => '<p>Dunia balap Formula 1 tidak pernah kehilangan daya tariknya, dan kini Hollywood membawanya ke level yang sepenuhnya baru. Disutradarai oleh Joseph Kosinski (sutradara di balik <em>Top Gun: Maverick</em>) dan dibintangi oleh Brad Pitt, film <strong>F1</strong> diprediksi akan menjadi standar baru untuk genre balapan.</p><p>Dalam produksi ini, Brad Pitt benar-benar mengemudikan mobil balap yang dimodifikasi khusus di lintasan sirkuit asli selama akhir pekan balapan F1 sungguhan. Sensasi kecepatan, raungan mesin, dan drama di garasi pit akan tersaji secara nyata.</p><p>Sambil menunggu tanggal rilis resminya, kamu bisa mulai merencanakan jadwal nonton bareng komunitas balapmu. Pastikan kamu mem-booking tiket untuk penayangan hari Sabtu dan manfaatkan promo <strong>WEEKENDSERU</strong>. Kamu bisa mendapatkan diskon 20% yang pastinya bikin agenda kumpul komunitas jadi lebih irit. Pantau terus aplikasi kami untuk notifikasi <em>pre-sale</em> tiketnya!</p>',
                'excerpt' => 'Fakta di balik pembuatan film F1 oleh Brad Pitt dan cara nonton hemat pakai promo Sabtu Seru diskon 20%.',
                'status' => 'published',
                'is_featured' => true,
                'read_time' => 3,
                'meta_title' => 'Bedah Film F1 Brad Pitt & Promo Tiket Sabtu Seru',
                'meta_description' => 'Jangan lewatkan film balap F1 Brad Pitt. Dapatkan info produksinya dan diskon 20% untuk penayangan hari Sabtu dengan WEEKENDSERU.',
            ],
            [
                'type' => 'article',
                'title' => 'Anime Layar Lebar: Siap-Siap Ledakan Reze di Chainsaw Man The Movie!',
                'content' => '<p>Studio MAPPA kembali menggebrak industri anime! Setelah sukses besar dengan adaptasi serial televisinya, perjalanan Denji sang Manusia Gergaji Mesin berlanjut ke layar lebar melalui <strong>Chainsaw Man – The Movie: Reze Arc</strong>.</p><p>Bagi kamu pembaca manga karya Tatsuki Fujimoto, <em>Reze Arc</em> (atau Bomb Girl Arc) adalah salah satu cerita yang paling emosional, penuh ledakan, dan brutal. Pertemuan Denji dengan seorang gadis misterius bernama Reze di sebuah kedai kopi akan membawa alur cerita ke arah yang tidak terduga, menggabungkan romansa masa muda dengan pertarungan berdarah yang menjadi ciri khas seri ini.</p><p>Visual sekelas bioskop dari MAPPA jelas tidak boleh dilewatkan. Buat pengalaman ini makin berkesan dengan mengajak sesama <em>nakama</em>. Beli minimal 2 tiket (pastikan total belanja di atas Rp 100.000), lalu masukkan kode <strong>YVEZFLASH</strong>. Kamu berhak atas diskon gede 50% (maksimal Rp 50.000). Mari saksikan ledakannya bersama-sama!</p>',
                'excerpt' => 'Kenapa Reze Arc sangat dinanti penggemar anime? Simak alasannya dan klaim diskon 50% YVEZFLASH untuk nonton bareng.',
                'status' => 'published',
                'is_featured' => true,
                'read_time' => 3,
                'meta_title' => 'Anime: Chainsaw Man The Movie Reze Arc Diskon 50%',
                'meta_description' => 'Kupas tuntas Reze Arc di Chainsaw Man The Movie. Gunakan kode YVEZFLASH untuk diskon tiket 50% khusus pembelian di atas Rp 100.000.',
            ],
            [
                'type' => 'article',
                'title' => 'Kencan Romantis & Cerdas: Belajar Fisika Cinta Lewat The Theory of Everything',
                'content' => '<p>Mencari ide kencan yang berbeda dari biasanya? Film biopik <strong>The Theory of Everything</strong> menawarkan perpaduan sempurna antara drama romantis dan kecerdasan intelektual. Film ini tidak hanya menyoroti pencapaian luar biasa fisikawan teoretis Stephen Hawking, tetapi juga kekuatan cinta tanpa syarat dari istrinya, Jane Wilde, di tengah penyakit mematikan yang perlahan melumpuhkan fisik sang ilmuwan.</p><p>Menonton film ini bersama pasangan akan memberikan perspektif baru tentang ketahanan, dedikasi, dan waktu. Eddie Redmayne yang memerankan Hawking sukses membawa pulang piala Oscar untuk aktingnya yang memukau.</p><p>Agar kencanmu makin sempurna dan hemat, manfaatkan promo otomatis dari kami. Pesankan tiket berdua sekaligus snack favorit pasanganmu (seperti popcorn manis dan iced lemon tea). Asalkan total keranjangmu menembus batas Rp 150.000, sistem kasir kami akan otomatis memotong Rp 15.000 menggunakan <strong>Diskon Sultan</strong>. Tidak perlu repot mengingat kode promo, fokus saja pada kencanmu!</p>',
                'excerpt' => 'Rekomendasi ide kencan cerdas: Nonton The Theory of Everything ditambah snack hemat dengan Diskon Sultan.',
                'status' => 'published',
                'is_featured' => false,
                'read_time' => 4,
                'meta_title' => 'Date Idea: Diskon Tiket The Theory of Everything & Snack',
                'meta_description' => 'Nikmati Diskon Sultan potongan langsung Rp 15.000 untuk kencan sambil nonton The Theory of Everything minimal Rp 150.000.',
            ],

            // ==========================================
            // VERSI PROMO SINGKAT (QUICK PROMOS)
            // ==========================================
            [
                'type' => 'promo',
                'title' => 'Pusingnya Tenet Makin Seru di Hari Sabtu',
                'content' => '<p>Pusing mikirin alur maju-mundur di <em>Tenet</em> karya Christopher Nolan? Biar pusingnya di hari libur aja! Booking tiketmu untuk penayangan hari Sabtu dan gunakan kode <strong>WEEKENDSERU</strong>. Dapatkan diskon 20% (Maksimal Rp 30.000). Jangan sampai kehabisan, kuota terbatas 100 tiket!</p>',
                'excerpt' => 'Promo khusus hari Sabtu! Nonton Tenet diskon 20% pakai kode WEEKENDSERU.',
                'status' => 'published',
                'is_featured' => false,
                'read_time' => 1,
                'meta_title' => 'Promo Nonton Tenet Hari Sabtu Diskon 20%',
                'meta_description' => 'Nonton film Tenet di akhir pekan lebih hemat dengan promo Sabtu Seru. Masukkan kode WEEKENDSERU dan nikmati diskon 20%.',
            ],
            [
                'type' => 'promo',
                'title' => 'Greyhound vs Dunkirk: Double Feature Akhir Pekan',
                'content' => '<p>Bingung mau nonton ketegangan di laut bareng Tom Hanks (<em>Greyhound</em>) atau evakuasi menegangkan di pantai (<em>Dunkirk</em>)? Tonton aja dua-duanya di hari Sabtu! Nikmati promo <strong>Sabtu Seru</strong> diskon 20% (Maks. Rp 30.000) dengan kode <strong>WEEKENDSERU</strong>.</p>',
                'excerpt' => 'Tonton Dunkirk atau Greyhound di hari Sabtu dan nikmati diskon 20% tiket bioskop.',
                'status' => 'published',
                'is_featured' => false,
                'read_time' => 1,
                'meta_title' => 'Promo Film Perang: Dunkirk & Greyhound Diskon 20%',
                'meta_description' => 'Habiskan akhir pekanmu dengan film epic Dunkirk dan Greyhound. Pakai kode WEEKENDSERU untuk diskon 20% di hari Sabtu.',
            ],
            [
                'type' => 'promo',
                'title' => 'Uji Kapasitas Otak Bersama Lucy (Scarlett Johansson)',
                'content' => '<p>Apa jadinya kalau manusia bisa menggunakan 100% kapasitas otaknya? Temukan jawabannya di <em>Lucy</em>. Ajak temanmu malam ini, pastikan beli 2 tiket (Total > Rp 100.000) dan masukkan kode <strong>YVEZFLASH</strong> buat nikmatin diskon 50% (Maks. 50rb).</p>',
                'excerpt' => 'Ajak teman nonton Lucy, gunakan kode YVEZFLASH untuk diskon 50%.',
                'status' => 'published',
                'is_featured' => false,
                'read_time' => 1,
                'meta_title' => 'Promo Nonton Lucy: Diskon Tiket 50% Flash Sale',
                'meta_description' => 'Nonton aksi seru Scarlett Johansson di film Lucy dengan diskon 50%. Masukkan kode promo YVEZFLASH saat checkout!',
            ],
            [
                'type' => 'promo',
                'title' => 'Pemanasan Sebelum JW4: Tonton Ulang John Wick 1-3',
                'content' => '<p>Sebelum nonton <em>Chapter 4</em>, mending marathon dulu! Beli tiket <em>John Wick 1, 2,</em> atau <em>3</em> bareng geng kamu. Transaksi minimal 2 tiket dengan total di atas 100rb? Pakai kode <strong>YVEZFLASH</strong> sekarang juga!</p>',
                'excerpt' => 'Marathon film John Wick 1-3 lebih murah dengan diskon 50% YVEZFLASH.',
                'status' => 'published',
                'is_featured' => false,
                'read_time' => 1,
                'meta_title' => 'Promo Marathon John Wick 1, 2, 3 Diskon 50%',
                'meta_description' => 'Tonton ulang aksi Baba Yaga dari awal. Gunakan kode YVEZFLASH untuk diskon 50% tiket film John Wick klasik!',
            ],
            [
                'type' => 'promo',
                'title' => 'Visual Luar Angkasa: Oblivion & Gravity',
                'content' => '<p>Pecinta visual memukau wajib nonton <em>Oblivion</em> atau <em>Gravity</em> di layar lebar kita. Maksimalkan pengalamanmu dengan cemilan enak. Gunakan keuntungan <strong>Diskon Sultan</strong> (Otomatis potong Rp 15.000) untuk total belanja Tiket + Snack di atas Rp 150.000. Cepat, kuota tinggal 4!</p>',
                'excerpt' => 'Nonton Oblivion/Gravity + beli camilan 150rb otomatis potong 15rb.',
                'status' => 'published',
                'is_featured' => false,
                'read_time' => 1,
                'meta_title' => 'Diskon Sultan Film Sci-Fi: Oblivion & Gravity',
                'meta_description' => 'Rasakan petualangan luar angkasa di Oblivion dan Gravity. Belanja tiket & snack 150rb, langsung dapat Diskon Sultan 15rb.',
            ],
        ];

        // Lakukan looping untuk insert ke database
        foreach ($posts as $post) {
            Post::create([
                'author_id' => $author->id,
                'type' => $post['type'],
                'title' => $post['title'],
                'slug' => Str::slug($post['title']) . '-' . Str::random(4),
                'content' => $post['content'],
                'excerpt' => $post['excerpt'],
                'thumbnail' => null,
                'status' => $post['status'],
                'is_featured' => $post['is_featured'],
                'read_time' => $post['read_time'],
                'meta_title' => $post['meta_title'],
                'meta_description' => $post['meta_description'],
                // Ini akan mentrigger boot method dari modelmu, karena 'status' published tapi 'published_at' kosong
            ]);
        }
    }
}

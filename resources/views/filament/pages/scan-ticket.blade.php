<x-filament-panels::page>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">

        <div class="p-4 bg-white dark:bg-gray-900 shadow rounded-2xl ring-1 ring-gray-900/5 dark:ring-white/10 text-center" wire:ignore>
            <h2 class="text-xl font-bold mb-4">Arahkan QR Code Tiket</h2>

            <div id="reader" class="mx-auto overflow-hidden rounded-xl border-2 border-primary-500" style="max-width: 500px;"></div>

            <p class="mt-4 text-sm text-gray-500">Kamera akan memindai secara otomatis tanpa perlu klik apapun.</p>
        </div>

        <div class="p-6 bg-white dark:bg-gray-900 shadow rounded-2xl ring-1 ring-gray-900/5 dark:ring-white/10">
            <h2 class="text-xl font-bold mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">Hasil Validasi Tiket</h2>

            @if($scanResult)
            <div class="p-5 rounded-xl border {{ $scanStatus === 'success' ? 'bg-success-50 border-success-200 dark:bg-success-900/20 dark:border-success-700' : 'bg-danger-50 border-danger-200 dark:bg-danger-900/20 dark:border-danger-700' }}">

                <h3 class="text-2xl font-black mb-4 {{ $scanStatus === 'success' ? 'text-success-600 dark:text-success-400' : 'text-danger-600 dark:text-danger-400' }}">
                    {{ $scanResult['message'] }}
                </h3>

                @if(isset($scanResult['movie']))
                <div class="space-y-3 text-base dark:text-gray-200">
                    <p><strong>Film:</strong> {{ $scanResult['movie'] }}</p>
                    <p><strong>Pemesan:</strong> {{ $scanResult['user'] }}</p>

                    @if(isset($scanResult['studio']))
                    <p><strong>Studio:</strong> {{ $scanResult['studio'] }}</p>
                    <p class="text-xl mt-2"><strong>Kursi:</strong> <span class="font-black text-primary-500">{{ $scanResult['seats'] }}</span></p>
                    @endif
                </div>
                @endif
            </div>
            @else
            <div class="flex items-center justify-center h-40 text-gray-500 dark:text-gray-400 italic">
                Belum ada tiket yang discan. Silakan arahkan QR Code ke kamera...
            </div>
            @endif
        </div>

    </div>

    <script src="https://unpkg.com/html5-qrcode" type="text/javascript"></script>
    <script>
        document.addEventListener('livewire:initialized', () => {
            let lastScan = '';

            function onScanSuccess(decodedText, decodedResult) {
                if (decodedText !== lastScan) {
                    lastScan = decodedText;

                    let audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
                    audio.play().catch(e => {});

                    @this.processScan(decodedText);

                    // Reset biar bisa scan tiket yang sama lagi setelah 4 detik (jaga-jaga admin salah pencet)
                    setTimeout(() => {
                        lastScan = '';
                    }, 4000);
                }
            }

            let html5QrcodeScanner = new Html5QrcodeScanner(
                "reader", {
                    fps: 10,
                    qrbox: {
                        width: 250,
                        height: 250
                    }
                },
                /* verbose= */
                false
            );
            html5QrcodeScanner.render(onScanSuccess);
        });
    </script>
</x-filament-panels::page>
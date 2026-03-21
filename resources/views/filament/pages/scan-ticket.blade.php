<x-filament-panels::page>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">

        <div class="p-4 bg-white dark:bg-gray-900 shadow rounded-2xl ring-1 ring-gray-900/5 dark:ring-white/10 text-center" wire:ignore>
            <h2 class="text-xl font-bold mb-4">Arahkan QR Code Tiket</h2>
            <div id="reader" class="mx-auto overflow-hidden rounded-xl border-2 border-primary-500" style="max-width: 500px;"></div>
            <p class="mt-4 text-sm text-gray-500">Kamera akan memindai secara otomatis tanpa perlu klik apapun.</p>
        </div>

        <div class="space-y-6">
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

            @if($scanResult && $scanStatus === 'success')
            <div class="p-6 bg-white dark:bg-gray-900 shadow rounded-2xl ring-1 ring-gray-900/5 dark:ring-white/10">
                <h2 class="text-lg font-bold mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">🍿 Pesanan F&B</h2>

                @if($snackItems && count($snackItems) > 0)
                <ul class="space-y-3">
                    @foreach($snackItems as $item)
                    <li class="flex justify-between items-center p-3 rounded-lg border {{ $item['status'] === 'claimed' ? 'bg-gray-50 border-gray-100 opacity-60 dark:bg-gray-800/50 dark:border-gray-700' : 'bg-white border-gray-200 dark:bg-gray-900 dark:border-gray-700' }}">
                        <div>
                            <p class="font-bold text-sm dark:text-gray-200">{{ $item['quantity'] }}x {{ $item['product']['name'] }}</p>
                        </div>

                        @if($item['status'] === 'unclaimed')
                        <button wire:click="claimSingleSnack({{ $item['id'] }})" class="px-3 py-1.5 bg-warning-500 hover:bg-warning-400 text-white text-xs font-bold rounded shadow transition">
                            Serahkan
                        </button>
                        @else
                        <span class="text-xs font-bold text-success-600 dark:text-success-400">✔ Diambil</span>
                        @endif
                    </li>
                    @endforeach
                </ul>
                @else
                <div class="text-sm text-gray-500 italic p-4 text-center border border-dashed rounded-lg">
                    Customer tidak memesan F&B.
                </div>
                @endif
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
                false
            );
            html5QrcodeScanner.render(onScanSuccess);
        });
    </script>
</x-filament-panels::page>
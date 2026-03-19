<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Booking;

class WebhookController extends Controller
{
    public function handle(Request $request)
    {
        // Konfigurasi Midtrans
        \Midtrans\Config::$serverKey = env('MIDTRANS_SERVER_KEY');
        \Midtrans\Config::$isProduction = env('MIDTRANS_IS_PRODUCTION', false);

        try {
            $notif = new \Midtrans\Notification();
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 400);
        }

        $transactionStatus = $notif->transaction_status;
        $orderId = $notif->order_id; // Ini booking_code kita
        $paymentType = $notif->payment_type;
        $transactionId = $notif->transaction_id;

        // Cari transaksi di database
        $booking = Booking::where('booking_code', $orderId)->first();
        if (!$booking) return response()->json(['message' => 'Transaksi tidak ditemukan'], 404);

        // Update status berdasarkan laporan Midtrans
        if ($transactionStatus == 'capture' || $transactionStatus == 'settlement') {
            $booking->update([
                'status' => 'paid',
                'payment_type' => $paymentType,
                'midtrans_transaction_id' => $transactionId
            ]);
        } else if ($transactionStatus == 'cancel' || $transactionStatus == 'deny' || $transactionStatus == 'expire') {
            $booking->update(['status' => 'failed']);
        }

        return response()->json(['message' => 'Status berhasil diupdate!']);
    }
}

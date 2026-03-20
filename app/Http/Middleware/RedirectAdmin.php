<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RedirectAdmin
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Cek kalau user udah login DAN rolenya adalah admin
        // Sesuaikan 'role' dengan nama kolom di database kamu
        if ($request->user() && $request->user()->role === 'admin') {

            // Kalau dia nge-request via Inertia/Ajax, kita kasih response error 403 (Forbidden)
            if ($request->wantsJson() || $request->header('X-Inertia')) {
                abort(403, 'Admin tidak diizinkan mengakses halaman ini.');
            }

            // Kalau dia akses langsung via URL browser, lempar ke dashboard admin
            return redirect('/admin');
        }

        // Kalau bukan admin (user biasa), biarin lewat
        return $next($request);
    }
}

<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Laravel\Socialite\Facades\Socialite;

class SocialiteController extends Controller
{
    public function redirect($provider)
    {
        return Socialite::driver($provider)->redirect();
    }

    public function callback($provider)
    {
        try {
            $socialUser = Socialite::driver($provider)->user();

            // Cek apakah user udah pernah daftar pakai email ini
            $user = User::where('email', $socialUser->getEmail())->first();

            if ($user) {
                // Kalau udah ada, update ID provider-nya, dan update foto profilnya JIKA masih kosong
                $user->update([
                    "{$provider}_id" => $socialUser->getId(),
                    'profile_image' => $user->profile_image ?? $socialUser->getAvatar(),
                ]);
            } else {
                // Kalau belum ada, bikin user baru
                $user = User::create([
                    'name' => $socialUser->getName(),
                    'email' => $socialUser->getEmail(),
                    "{$provider}_id" => $socialUser->getId(),
                    'role' => 'customer',
                    'profile_image' => $socialUser->getAvatar(), // <--- Tambahin avatar disini
                    'email_verified_at' => now(), // Otomatis verified
                ]);
            }

            // Login-kan usernya
            Auth::login($user);

            return redirect()->route('home');
        } catch (\Exception $e) {
            return redirect()->route('login')->with('error', 'Login gagal! Silakan coba lagi.');
        }
    }
}

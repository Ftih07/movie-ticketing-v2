import { type SharedData } from '@/types';
import { Transition } from '@headlessui/react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler, useRef, useState } from 'react';

import DeleteUser from '@/components/delete-user';
import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import SettingsLayout from '@/layouts/settings/layout';

export default function Profile({ mustVerifyEmail, status }: { mustVerifyEmail: boolean; status?: string }) {
    const { auth } = usePage<SharedData>().props;
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Helper untuk cek URL image (apakah link Google/FB atau link file lokal)
    const getImageUrl = (path: string | null | undefined) => {
        if (!path) return null;
        return path.startsWith('http') ? path : `/storage/${path}`;
    };

    const [previewImage, setPreviewImage] = useState<string | null>(getImageUrl(auth.user.profile_image));

    // Perhatikan kita pakai `post` di sini, dan ada `_method: 'patch'`
    const { data, setData, post, errors, processing, recentlySuccessful } = useForm({
        _method: 'patch',
        name: auth.user.name,
        email: auth.user.email,
        profile_image: null as File | null,
    });

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('profile_image', file);
            setPreviewImage(URL.createObjectURL(file)); // Bikin preview instan
        }
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        // Pake POST dan forceFormData supaya file gambar bisa ke-kirim
        post(route('profile.update'), {
            forceFormData: true,
            preserveScroll: true,
        });
    };

    return (
        <SettingsLayout>
            <Head title="Profile settings" />

            <div className="space-y-6">
                <HeadingSmall title="Profile information" description="Update your name, email address, and avatar" />

                <form onSubmit={submit} className="space-y-6">
                    {/* --- BAGIAN AVATAR --- */}
                    <div className="flex items-center gap-6">
                        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full bg-gray-200 ring-2 ring-gray-300 dark:bg-zinc-800 dark:ring-zinc-700">
                            {previewImage ? (
                                <img src={previewImage} alt="Profile" className="h-full w-full object-cover" />
                            ) : (
                                <span className="flex h-full w-full items-center justify-center text-2xl font-bold text-gray-500 dark:text-zinc-400">
                                    {auth.user.name[0].toUpperCase()}
                                </span>
                            )}
                        </div>
                        <div>
                            <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageChange} />
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => fileInputRef.current?.click()}
                                className="text-xs dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:hover:bg-zinc-800"
                            >
                                Change Avatar
                            </Button>
                            <p className="mt-2 text-xs text-gray-500 dark:text-zinc-400">JPG, JPEG or PNG. Max size 2MB.</p>
                            <InputError className="mt-1" message={errors.profile_image} />
                        </div>
                    </div>
                    {/* --------------------- */}

                    <div className="grid gap-2">
                        <Label htmlFor="name" className="text-gray-900 dark:text-white">
                            Name
                        </Label>
                        <Input
                            id="name"
                            className="mt-1 block w-full focus-visible:ring-red-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            required
                            autoComplete="name"
                            placeholder="Full name"
                        />
                        <InputError className="mt-2" message={errors.name} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="email" className="text-gray-900 dark:text-white">
                            Email address
                        </Label>
                        <Input
                            id="email"
                            type="email"
                            className="mt-1 block w-full focus-visible:ring-red-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            required
                            autoComplete="username"
                            placeholder="Email address"
                        />
                        <InputError className="mt-2" message={errors.email} />
                    </div>

                    {mustVerifyEmail && auth.user.email_verified_at === null && (
                        <div>
                            <p className="mt-2 text-sm text-gray-800 dark:text-zinc-300">
                                Your email address is unverified.
                                <Link
                                    href={route('verification.send')}
                                    method="post"
                                    as="button"
                                    className="ml-1 rounded-md text-sm text-gray-600 underline hover:text-gray-900 focus:ring-2 focus:ring-offset-2 focus:outline-hidden dark:text-zinc-400 dark:hover:text-white"
                                >
                                    Click here to re-send the verification email.
                                </Link>
                            </p>

                            {status === 'verification-link-sent' && (
                                <div className="mt-2 text-sm font-medium text-green-600 dark:text-green-400">
                                    A new verification link has been sent to your email address.
                                </div>
                            )}
                        </div>
                    )}

                    <div className="flex items-center gap-4 border-b border-gray-100 pb-8 dark:border-zinc-800">
                        <Button className="bg-red-600 text-white transition-colors hover:bg-red-700" disabled={processing}>
                            Save
                        </Button>

                        <Transition
                            show={recentlySuccessful}
                            enter="transition ease-in-out"
                            enterFrom="opacity-0"
                            leave="transition ease-in-out"
                            leaveTo="opacity-0"
                        >
                            <p className="text-sm font-medium text-green-600 dark:text-green-400">Saved.</p>
                        </Transition>
                    </div>
                </form>

                <div className="pt-4">
                    <DeleteUser />
                </div>
            </div>
        </SettingsLayout>
    );
}

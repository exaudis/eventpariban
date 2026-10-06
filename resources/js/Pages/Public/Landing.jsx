import React from 'react';
import { Head } from '@inertiajs/react';

export default function Landing() {
    return (
        <main className="min-h-screen bg-[#17130d] flex flex-col items-center justify-center p-3 sm:p-6">
            <Head title="Dalle Pariban — Pendaftaran Doorprize" />
            <div className="w-full max-w-lg overflow-hidden rounded-2xl shadow-2xl">
                <img src="/images/event/flyer-dalle-pariban.png" alt="Flyer Dalle Pariban bersama Marpariban Entertainment" className="block w-full h-auto" />
            </div>
            <div className="sticky bottom-0 z-10 w-full max-w-lg bg-[#17130d] pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
                <a href="/register/data" className="block w-full rounded-xl bg-yellow-400 px-5 py-4 text-center text-lg font-black uppercase tracking-wide text-black shadow-lg transition hover:bg-yellow-300">
                    Lanjutkan Registrasi
                </a>
                <p className="mt-2 text-center text-xs text-white/70">HTM Rp35.000</p>
            </div>
        </main>
    );
}

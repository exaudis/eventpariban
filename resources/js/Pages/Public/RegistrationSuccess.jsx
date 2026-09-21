import React, { useState } from 'react';
import { Head } from '@inertiajs/react';

export default function RegistrationSuccess({ result }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        if (result?.doorprize_number) {
            navigator.clipboard.writeText(result.doorprize_number);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <div className="min-h-screen bg-eventbg flex flex-col justify-between items-center px-4 py-8">
            <Head title="Hasil Nomor Doorprize - Marpariban Entertainment" />

            <div className="w-full max-w-md bg-surface border border-eventborder rounded-xl p-6 sm:p-8 text-center shadow-sm">
                {/* Logo */}
                <img
                    src="/images/logo.jpg"
                    alt="Marpariban Entertainment Logo"
                    className="w-16 h-16 rounded-full mx-auto mb-3 border-2 border-primary/40 object-cover shadow-sm"
                />

                {/* Status notice if already registered */}
                {result?.already_registered && (
                    <div className="mb-4 p-3 bg-eventbg border border-eventborder rounded-lg text-xs font-medium text-secondary">
                        Anda sudah terdaftar sebelumnya.
                    </div>
                )}

                <div className="inline-block px-3 py-1 bg-success/10 text-success text-xs font-semibold tracking-wider uppercase rounded-md mb-2">
                    Registrasi Berhasil
                </div>

                <h2 className="text-sm font-medium text-secondary uppercase tracking-wider mt-2">
                    Nomor Doorprize Anda
                </h2>

                {/* Giant Doorprize Number - Gold styled */}
                <div className="my-6 py-4 bg-eventbg border-2 border-primary/30 rounded-xl">
                    <span className="text-6xl sm:text-7xl font-extrabold tracking-widest text-primary font-mono">
                        {result?.doorprize_number || '000'}
                    </span>
                </div>

                {/* Participant Name */}
                <h3 className="text-xl font-bold text-dark mb-1">
                    {result?.name || 'Peserta'}
                </h3>
                <p className="text-sm text-secondary mb-6">
                    {result?.phone}
                </p>

                <p className="text-xs text-secondary mb-6 leading-relaxed border-t border-b border-eventborder py-3">
                    Simpan nomor ini dan gunakan saat pengundian.
                </p>

                {/* Copy Button */}
                <button
                    onClick={handleCopy}
                    className="w-full py-2.5 px-4 border border-dark text-dark hover:bg-dark hover:text-surface text-sm font-semibold rounded-lg transition-colors uppercase tracking-wider"
                >
                    {copied ? 'NOMOR TERSALIN!' : 'SALIN NOMOR'}
                </button>
            </div>

            <div className="mt-6 text-center text-xs text-secondary">
                &copy; {new Date().getFullYear()} Marpariban Entertainment Event
            </div>
        </div>
    );
}

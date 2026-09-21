import React from 'react';
import { useForm, Head } from '@inertiajs/react';

export default function Register({ tableNumber, isClosed, availableCount }) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        phone: '',
        email: '',
        table_number: tableNumber || '01',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/register');
    };

    return (
        <div className="min-h-screen bg-eventbg flex flex-col justify-between items-center px-4 py-8">
            <Head title="Registrasi Doorprize - Marpariban Entertainment" />

            <div className="w-full max-w-md bg-surface border border-eventborder rounded-xl p-6 sm:p-8 shadow-sm">
                {/* Header with Logo */}
                <div className="text-center mb-6 pb-6 border-b border-eventborder">
                    <img
                        src="/images/logo.jpg"
                        alt="Marpariban Entertainment Logo"
                        className="w-16 h-16 rounded-full mx-auto mb-3 border-2 border-primary/40 object-cover shadow-sm"
                    />
                    <div className="inline-block px-3 py-1 bg-primary-light text-primary-dark text-xs font-semibold tracking-wider uppercase rounded-md mb-2">
                        MARPARIBAN ENTERTAINMENT
                    </div>
                    <h1 className="text-2xl font-bold text-dark tracking-tight">
                        Registrasi Doorprize
                    </h1>
                    <p className="text-sm text-secondary mt-1">
                        Isi data berikut untuk mendapatkan nomor doorprize.
                    </p>

                    {/* Table Badge */}
                    <div className="mt-4 inline-flex items-center gap-1.5 px-4 py-1.5 bg-eventbg border border-eventborder rounded-full text-sm font-medium text-dark">
                        <span>Meja</span>
                        <span className="font-bold text-primary">{tableNumber}</span>
                    </div>
                </div>

                {/* Form or Closed State */}
                {isClosed ? (
                    <div className="text-center py-6">
                        <div className="w-12 h-12 rounded-full bg-error/10 text-error flex items-center justify-center mx-auto mb-3 font-bold text-lg">
                            !
                        </div>
                        <h2 className="text-lg font-bold text-dark mb-1">
                            Registrasi Doorprize Telah Ditutup
                        </h2>
                        <p className="text-sm text-secondary">
                            Seluruh nomor doorprize telah terpakai.
                        </p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Nama Lengkap */}
                        <div>
                            <label className="block text-sm font-medium text-dark mb-1">
                                Nama Lengkap <span className="text-error">*</span>
                            </label>
                            <input
                                type="text"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                placeholder="Nama lengkap"
                                required
                                className="w-full px-3.5 py-2.5 bg-surface border border-eventborder rounded-lg text-bodytext focus:ring-1 focus:ring-primary focus:border-primary text-sm transition-colors"
                            />
                            {errors.name && (
                                <p className="text-xs text-error mt-1">{errors.name}</p>
                            )}
                        </div>

                        {/* Nomor WhatsApp */}
                        <div>
                            <label className="block text-sm font-medium text-dark mb-1">
                                Nomor WhatsApp <span className="text-error">*</span>
                            </label>
                            <input
                                type="tel"
                                value={data.phone}
                                onChange={(e) => setData('phone', e.target.value)}
                                placeholder="08xxxxxxxxxx"
                                required
                                className="w-full px-3.5 py-2.5 bg-surface border border-eventborder rounded-lg text-bodytext focus:ring-1 focus:ring-primary focus:border-primary text-sm transition-colors"
                            />
                            {errors.phone && (
                                <p className="text-xs text-error mt-1">{errors.phone}</p>
                            )}
                        </div>

                        {/* Email Optional */}
                        <div>
                            <label className="block text-sm font-medium text-dark mb-1">
                                Email <span className="text-xs text-secondary font-normal">(Opsional)</span>
                            </label>
                            <input
                                type="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                placeholder="nama@email.com"
                                className="w-full px-3.5 py-2.5 bg-surface border border-eventborder rounded-lg text-bodytext focus:ring-1 focus:ring-primary focus:border-primary text-sm transition-colors"
                            />
                            {errors.email && (
                                <p className="text-xs text-error mt-1">{errors.email}</p>
                            )}
                        </div>

                        {/* Submit Button */}
                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full py-3 px-4 bg-primary hover:bg-primary-hover text-surface text-sm font-bold rounded-lg shadow-sm transition-colors disabled:opacity-60 uppercase tracking-wide"
                            >
                                {processing ? 'Memproses...' : 'DAFTAR & DAPATKAN NOMOR'}
                            </button>
                        </div>
                    </form>
                )}

                {/* Footer disclaimer */}
                <div className="mt-6 pt-4 border-t border-eventborder text-center">
                    <p className="text-xs text-secondary">
                        Data digunakan untuk keperluan registrasi doorprize.
                    </p>
                </div>
            </div>

            {/* Footer Event mark */}
            <div className="mt-6 text-center text-xs text-secondary">
                &copy; {new Date().getFullYear()} Marpariban Entertainment Event
            </div>
        </div>
    );
}

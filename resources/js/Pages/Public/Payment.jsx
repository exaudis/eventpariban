import React, { useEffect, useRef, useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';

export default function Payment({ participant }) {
    const [method, setMethod] = useState(participant.payment_method || 'qris');
    const { data, setData, post, processing, errors } = useForm({ payment_method: method, payment_proof: null });
    const paid = participant.payment_status === 'paid';
    const pending = participant.payment_status === 'pending';
    const rejected = participant.payment_status === 'rejected';
    const submit = (event) => { event.preventDefault(); post(window.location.pathname, { forceFormData: true }); };

    const refreshing = useRef(false);
    useEffect(() => {
        if (participant.payment_status !== 'pending') return;

        const refresh = () => {
            if (document.visibilityState !== 'visible' || refreshing.current) return;
            refreshing.current = true;
            router.reload({
                only: ['participant'],
                preserveState: true,
                preserveScroll: true,
                onFinish: () => { refreshing.current = false; },
            });
        };

        const interval = window.setInterval(refresh, 3000);
        return () => window.clearInterval(interval);
    }, [participant.payment_status]);
    return (
        <main className="min-h-screen bg-eventbg flex items-center justify-center px-4 py-8">
            <Head title="Pembayaran — Marpariban Entertainment" />
            <section className="w-full max-w-md rounded-2xl border border-eventborder bg-surface p-6 shadow-lg sm:p-8">
                <img src="/images/logo.jpg" alt="Marpariban Entertainment" className="mx-auto mb-4 h-14 w-14 rounded-full object-cover" />
                <p className="text-center text-xs font-bold uppercase tracking-widest text-primary">Pendaftaran Dalle Pariban</p>
                <h1 className="mt-1 text-center text-2xl font-extrabold text-dark">Pembayaran HTM</h1>
                <p className="mt-2 text-center text-secondary">Halo, {participant.name}. HTM acara adalah</p>
                <p className="mt-1 text-center text-3xl font-black text-dark">Rp35.000</p>

                {paid ? (
                    <div className="mt-6 rounded-xl border border-green-200 bg-green-50 p-5 text-center">
                        <p className="font-bold text-green-800">Pembayaran lunas</p>
                        <p className="mt-2 text-sm text-green-700">Nomor doorprize Anda</p>
                        <p className="mt-1 font-mono text-5xl font-black tracking-widest text-green-800">{participant.doorprize_number}</p>
                        <p className="mt-3 text-xs text-green-700">Simpan nomor ini untuk pengundian.</p>
                    </div>
                ) : pending ? (
                    <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-5 text-center">
                        <p className="font-bold text-amber-900">Menunggu verifikasi admin</p>
                        <p className="mt-2 text-sm text-amber-800">Pendaftaran Anda sudah masuk. Nomor doorprize akan muncul di halaman ini setelah pembayaran disetujui.</p>
                        {participant.proof_url && <a className="mt-3 inline-block text-sm font-semibold text-primary underline" href={participant.proof_url} target="_blank" rel="noreferrer">Lihat bukti pembayaran</a>}
                    </div>
                ) : (
                    <form onSubmit={submit} className="mt-6 space-y-4">
                        {rejected && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-800">Pembayaran sebelumnya belum disetujui. Periksa kembali bukti atau pilihan pembayaran, lalu kirim ulang.</p>}
                        <p className="text-sm font-bold text-dark">Pilih metode pembayaran</p>
                        <label className="flex cursor-pointer gap-3 rounded-xl border border-eventborder p-4 has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                            <input type="radio" name="payment_method" value="qris" checked={method === 'qris'} onChange={() => { setMethod('qris'); setData('payment_method', 'qris'); }} />
                            <span><b className="block text-dark">QRIS</b><span className="text-xs text-secondary">Bayar Rp35.000 dan unggah bukti pembayaran.</span></span>
                        </label>
                        <label className="flex cursor-pointer gap-3 rounded-xl border border-eventborder p-4 has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                            <input type="radio" name="payment_method" value="onsite" checked={method === 'onsite'} onChange={() => { setMethod('onsite'); setData('payment_method', 'onsite'); setData('payment_proof', null); }} />
                            <span><b className="block text-dark">Bayar di tempat</b><span className="text-xs text-secondary">Admin akan menandai lunas setelah menerima pembayaran.</span></span>
                        </label>
                        {method === 'qris' && <div className="rounded-xl border border-eventborder bg-white p-3 text-center">
                            <p className="mb-2 text-sm font-semibold text-dark">Pindai QRIS dan bayar tepat Rp35.000</p>
                            <a href="/images/event/qris-pariban.jpeg" target="_blank" rel="noreferrer"><img src="/images/event/qris-pariban.jpeg" alt="QRIS Show of Batak, Hiburan" className="mx-auto max-h-[360px] w-auto rounded-lg" /></a>
                            <p className="mt-2 text-xs text-secondary">Unggah tangkapan layar atau foto bukti pembayaran di bawah.</p>
                            <input type="file" accept="image/*" onChange={(e) => setData('payment_proof', e.target.files?.[0] || null)} className="mt-3 block w-full text-sm" />
                            {errors.payment_proof && <p className="mt-1 text-left text-xs text-red-600">{errors.payment_proof}</p>}
                        </div>}
                        {errors.payment && <p className="text-sm text-red-600">{errors.payment}</p>}
                        <button disabled={processing} className="w-full rounded-xl bg-primary px-4 py-3 font-bold text-white disabled:opacity-60">{processing ? 'Mengirim...' : 'Kirim untuk verifikasi'}</button>
                        <p className="text-center text-xs text-secondary">Metode bayar di tempat juga memerlukan konfirmasi admin sebelum nomor undian diberikan.</p>
                    </form>
                )}
            </section>
        </main>
    );
}

import React, { useEffect, useRef } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

const money = (n) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

export default function Payments({ participants }) {
    const { props } = usePage();
    const refreshing = useRef(false);

    useEffect(() => {
        const refresh = () => {
            if (document.visibilityState !== 'visible' || refreshing.current) return;
            refreshing.current = true;
            router.reload({
                only: ['participants'],
                preserveState: true,
                preserveScroll: true,
                onFinish: () => { refreshing.current = false; },
            });
        };

        const interval = window.setInterval(refresh, 3000);
        return () => window.clearInterval(interval);
    }, []);

    return <AdminLayout title="Verifikasi Pembayaran">
        <Head title="Pembayaran Peserta" />
        {props.flash?.success && <p className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-800">{props.flash.success}</p>}
        {props.errors?.payment && <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-800">{props.errors.payment}</p>}
        <div className="mb-4 rounded-xl border border-eventborder bg-surface p-4 text-sm text-secondary">HTM Rp35.000. Untuk QRIS, periksa bukti dan transaksi masuk. Untuk pembayaran di tempat, setujui setelah menerima uang. Nomor undian hanya dibagikan saat disetujui.</div>
        <div className="space-y-4">
            {participants.length === 0 ? <div className="rounded-xl bg-surface p-8 text-center text-secondary">Belum ada pembayaran yang perlu ditinjau.</div> : participants.map((p) => <article key={p.id} className="rounded-xl border border-eventborder bg-surface p-5 shadow-sm">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                        <h3 className="text-lg font-bold text-dark">{p.name}</h3>
                        <p className="text-sm text-secondary">{p.phone} · {p.email}</p>
                        <p className="mt-2 text-sm"><b>{money(p.amount)}</b> · {p.status === 'awaiting_payment' ? 'Belum memilih metode pembayaran' : `${p.method === 'qris' ? 'QRIS' : 'Bayar di tempat'} · ${p.status === 'pending' ? 'Menunggu verifikasi' : 'Ditolak'}`}</p>
                        <p className="mt-1 text-xs text-secondary">Daftar {p.registered_at}</p>
                        {p.proof_url ? <a href={p.proof_url} target="_blank" rel="noreferrer" className="mt-3 inline-block text-sm font-semibold text-primary underline">Buka bukti pembayaran</a> : p.method === 'onsite' && <p className="mt-3 text-sm text-amber-700">Konfirmasi pembayaran langsung dari peserta.</p>}
                    </div>
                    {p.status !== 'awaiting_payment' && <div className="flex shrink-0 gap-2">
                        <button onClick={() => router.post(`/admin/payments/${p.id}/approve`)} className="rounded-lg bg-green-700 px-4 py-2 text-sm font-bold text-white">Setujui & beri nomor</button>
                        <button onClick={() => { if (window.confirm('Tolak pembayaran ini? Peserta tetap tercatat dan tidak bisa mendaftar ulang.')) router.post(`/admin/payments/${p.id}/reject`); }} className="rounded-lg border border-red-300 px-4 py-2 text-sm font-bold text-red-700">Tolak</button>
                    </div>}
                </div>
            </article>)}
        </div>
    </AdminLayout>;
}

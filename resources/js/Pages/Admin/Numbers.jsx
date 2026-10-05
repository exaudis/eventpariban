import React from 'react';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function Numbers({ numbers, stats }) {
    const form = useForm({ number: '' });
    const { props } = usePage();
    const submit = e => { e.preventDefault(); form.post('/admin/numbers', { onSuccess: () => form.reset() }); };
    const reset = () => {
        const typed = window.prompt('Reset akan menghapus semua pendaftaran, status pembayaran, dan pemenang; hadiah, meja, serta nomor undian tetap tersimpan. Ketik RESET untuk melanjutkan.');
        if (typed === 'RESET') router.post('/admin/reset');
    };
    return <AdminLayout title="Kelola Nomor Undian"><Head title="Nomor Undian" />
        {props.flash?.success && <p className="mb-4 rounded bg-green-50 p-3 text-sm text-green-800">{props.flash.success}</p>}
        {props.errors?.number && <p className="mb-4 rounded bg-red-50 p-3 text-sm text-red-800">{props.errors.number}</p>}
        <div className="mb-5 grid gap-4 sm:grid-cols-2"><div className="rounded-xl bg-surface p-5">Nomor tersedia <b className="ml-2 text-green-700">{stats.available}</b></div><div className="rounded-xl bg-surface p-5">Nomor sudah diberikan <b className="ml-2 text-primary">{stats.used}</b></div></div>
        <div className="mb-5 flex flex-col gap-3 rounded-xl border border-eventborder bg-surface p-4 sm:flex-row sm:items-center sm:justify-between">
            <form onSubmit={submit} className="flex gap-2"><input required value={form.data.number} onChange={e => form.setData('number', e.target.value)} placeholder="Contoh: 201" className="rounded-lg border-eventborder text-sm" /><button className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white">Tambah nomor</button></form>
            <button onClick={reset} className="rounded-lg border border-red-300 px-4 py-2 text-sm font-bold text-red-700">Reset semua data acara</button>
        </div>
        <div className="overflow-x-auto rounded-xl border border-eventborder bg-surface"><table className="w-full min-w-[600px] text-left text-sm"><thead className="bg-eventbg text-xs uppercase text-secondary"><tr><th className="p-3">Nomor</th><th className="p-3">Status</th><th className="p-3">Peserta</th><th className="p-3">Aksi</th></tr></thead><tbody>{numbers.map(n => <tr key={n.id} className="border-t border-eventborder"><td className="p-3 font-mono font-bold">{n.number}</td><td className="p-3">{n.status === 'used' ? 'Sudah diberikan' : 'Tersedia'}</td><td className="p-3">{n.participant?.name || '—'}</td><td className="p-3">{n.status === 'available' && <button onClick={() => { if (window.confirm(`Hapus nomor ${n.number}?`)) router.delete(`/admin/numbers/${n.id}`); }} className="text-xs font-bold text-red-700">Hapus</button>}</td></tr>)}</tbody></table></div>
    </AdminLayout>;
}

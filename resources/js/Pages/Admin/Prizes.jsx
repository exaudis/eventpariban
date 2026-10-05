import React from 'react';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

function PrizeRow({ prize }) {
    const form = useForm({ name: prize.name, description: prize.description || '', quantity: prize.quantity, status: prize.status });
    return <tr className="border-b border-eventborder align-top">
        <td className="p-3"><input value={form.data.name} onChange={e => form.setData('name', e.target.value)} className="w-full rounded border-eventborder text-sm" /></td>
        <td className="p-3"><input value={form.data.description} onChange={e => form.setData('description', e.target.value)} className="w-full rounded border-eventborder text-sm" /></td>
        <td className="p-3"><input type="number" min={prize.winners_count} value={form.data.quantity} onChange={e => form.setData('quantity', e.target.value)} className="w-20 rounded border-eventborder text-sm" /><p className="mt-1 text-xs text-secondary">{prize.winners_count} pemenang</p></td>
        <td className="p-3"><select value={form.data.status} onChange={e => form.setData('status', e.target.value)} className="rounded border-eventborder text-sm"><option value="active">Aktif</option><option value="inactive">Nonaktif</option></select></td>
        <td className="whitespace-nowrap p-3"><button onClick={() => form.put(`/admin/prizes/${prize.id}`)} className="mr-2 rounded bg-primary px-3 py-2 text-xs font-bold text-white">Simpan</button><button onClick={() => { if (window.confirm(`Hapus hadiah ${prize.name}?`)) router.delete(`/admin/prizes/${prize.id}`); }} disabled={prize.winners_count > 0} className="rounded border border-red-200 px-3 py-2 text-xs font-bold text-red-700 disabled:opacity-40">Hapus</button></td>
    </tr>;
}

export default function Prizes({ prizes }) {
    const form = useForm({ name: '', description: '', quantity: 1, status: 'active' });
    const { props } = usePage();
    const submit = e => { e.preventDefault(); form.post('/admin/prizes', { onSuccess: () => form.reset() }); };
    return <AdminLayout title="Kelola Hadiah Doorprize"><Head title="Hadiah Doorprize" />
        {props.flash?.success && <p className="mb-4 rounded bg-green-50 p-3 text-sm text-green-800">{props.flash.success}</p>}
        <form onSubmit={submit} className="mb-6 grid gap-3 rounded-xl border border-eventborder bg-surface p-4 md:grid-cols-5">
            <input required placeholder="Nama hadiah" value={form.data.name} onChange={e => form.setData('name', e.target.value)} className="rounded-lg border-eventborder text-sm" />
            <input placeholder="Keterangan" value={form.data.description} onChange={e => form.setData('description', e.target.value)} className="rounded-lg border-eventborder text-sm" />
            <input required type="number" min="1" placeholder="Jumlah unit" value={form.data.quantity} onChange={e => form.setData('quantity', e.target.value)} className="rounded-lg border-eventborder text-sm" />
            <select value={form.data.status} onChange={e => form.setData('status', e.target.value)} className="rounded-lg border-eventborder text-sm"><option value="active">Aktif</option><option value="inactive">Nonaktif</option></select>
            <button disabled={form.processing} className="rounded-lg bg-primary px-4 py-2 font-bold text-white">Tambah hadiah</button>
        </form>
        <div className="overflow-x-auto rounded-xl border border-eventborder bg-surface"><table className="w-full min-w-[760px] text-left text-sm"><thead className="bg-eventbg text-xs uppercase text-secondary"><tr>{['Nama', 'Keterangan', 'Kuantitas', 'Status', 'Aksi'].map(x => <th key={x} className="p-3">{x}</th>)}</tr></thead><tbody>{prizes.map(p => <PrizeRow key={p.id} prize={p} />)}</tbody></table></div>
    </AdminLayout>;
}

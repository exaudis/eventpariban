import React from 'react';
import { Head, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function Participants({ participants, filters, tables }) {
    const handleSearch = (e) => {
        e.preventDefault();
        const search = e.target.search.value;
        const table = e.target.table.value;

        router.get('/admin/participants', { search, table }, { preserveState: true });
    };

    return (
        <AdminLayout title="Data Peserta">
            <Head title="Data Peserta" />

            {/* Filter & Search Bar */}
            <div className="bg-surface border border-eventborder rounded-xl p-4 mb-6">
                <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3">
                    <div className="flex-1">
                        <input
                            type="text"
                            name="search"
                            defaultValue={filters.search}
                            placeholder="Cari nama atau nomor WhatsApp..."
                            className="w-full px-3.5 py-2 bg-surface border border-eventborder rounded-lg text-sm text-bodytext focus:ring-1 focus:ring-primary focus:border-primary"
                        />
                    </div>

                    <div className="w-full md:w-48">
                        <select
                            name="table"
                            defaultValue={filters.table}
                            onChange={(e) => {
                                router.get('/admin/participants', {
                                    search: filters.search,
                                    table: e.target.value
                                }, { preserveState: true });
                            }}
                            className="w-full px-3.5 py-2 bg-surface border border-eventborder rounded-lg text-sm text-bodytext focus:ring-1 focus:ring-primary focus:border-primary"
                        >
                            <option value="">-- Semua Meja --</option>
                            {tables.map((t) => (
                                <option key={t.id} value={t.table_number}>
                                    Meja {t.table_number}
                                </option>
                            ))}
                        </select>
                    </div>

                    <button
                        type="submit"
                        className="py-2 px-5 bg-primary hover:bg-primary-hover text-surface text-sm font-semibold rounded-lg transition-colors"
                    >
                        Cari
                    </button>
                </form>
            </div>

            {/* Table */}
            <div className="bg-surface border border-eventborder rounded-xl p-6">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-bodytext">
                        <thead>
                            <tr className="border-b border-eventborder bg-eventbg/50 text-xs font-semibold uppercase tracking-wider text-secondary">
                                <th className="py-2.5 px-4 w-12 text-center">No</th>
                                <th className="py-2.5 px-4">Nama</th>
                                <th className="py-2.5 px-4">No. WhatsApp</th>
                                <th className="py-2.5 px-4">Email</th>
                                <th className="py-2.5 px-4 text-center">Meja</th>
                                <th className="py-2.5 px-4 text-center">Nomor Doorprize</th>
                                <th className="py-2.5 px-4 text-right">Waktu Registrasi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-eventborder">
                            {participants.data.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="py-8 text-center text-secondary text-sm">
                                        Data peserta tidak ditemukan.
                                    </td>
                                </tr>
                            ) : (
                                participants.data.map((item, index) => (
                                    <tr key={item.id} className="hover:bg-eventbg/30 transition-colors">
                                        <td className="py-3 px-4 text-center text-xs text-secondary font-mono">
                                            {(participants.current_page - 1) * participants.per_page + index + 1}
                                        </td>
                                        <td className="py-3 px-4 font-semibold text-dark">{item.name}</td>
                                        <td className="py-3 px-4 font-mono text-xs">{item.phone}</td>
                                        <td className="py-3 px-4 text-secondary text-xs">{item.email}</td>
                                        <td className="py-3 px-4 text-center">
                                            <span className="inline-block px-2 py-0.5 bg-eventbg border border-eventborder rounded text-xs font-medium">
                                                Meja {item.table}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-center font-mono font-bold text-primary text-base">
                                            {item.doorprize_number}
                                        </td>
                                        <td className="py-3 px-4 text-right text-xs text-secondary">{item.registered_at}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {participants.links.length > 3 && (
                    <div className="mt-6 pt-4 border-t border-eventborder flex items-center justify-between">
                        <span className="text-xs text-secondary">
                            Menampilkan {participants.from} - {participants.to} dari {participants.total} peserta
                        </span>

                        <div className="flex gap-1">
                            {participants.links.map((link, idx) => (
                                <button
                                    key={idx}
                                    disabled={!link.url}
                                    onClick={() => link.url && router.get(link.url, {}, { preserveState: true })}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                    className={`px-3 py-1.5 text-xs font-medium rounded border transition-colors ${
                                        link.active
                                            ? 'bg-primary text-surface border-primary font-bold'
                                            : link.url
                                            ? 'bg-surface text-bodytext border-eventborder hover:bg-eventbg'
                                            : 'text-gray-400 border-eventborder opacity-50 cursor-not-allowed'
                                    }`}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}

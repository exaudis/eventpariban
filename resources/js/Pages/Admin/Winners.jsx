import React from 'react';
import { Head } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function Winners({ winners }) {
    return (
        <AdminLayout title="Histori Pemenang">
            <Head title="Histori Pemenang" />

            <div className="bg-surface border border-eventborder rounded-xl p-6">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-eventborder">
                    <h3 className="text-base font-bold text-dark">
                        Daftar Pemenang Doorprize
                    </h3>
                    <span className="text-xs text-secondary">
                        Total {winners.length} Pemenang
                    </span>
                </div>

                {winners.length === 0 ? (
                    <p className="text-sm text-secondary py-8 text-center">
                        Belum ada pemenang yang dikonfirmasi.
                    </p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-bodytext">
                            <thead>
                                <tr className="border-b border-eventborder bg-eventbg/50 text-xs font-semibold uppercase tracking-wider text-secondary">
                                    <th className="py-2.5 px-4 w-12 text-center">No</th>
                                    <th className="py-2.5 px-4 text-center">Nomor Doorprize</th>
                                    <th className="py-2.5 px-4">Nama Pemenang</th>
                                    <th className="py-2.5 px-4">Hadiah</th>
                                    <th className="py-2.5 px-4 text-right">Waktu Pengundian</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-eventborder">
                                {winners.map((item) => (
                                    <tr key={item.id} className="hover:bg-eventbg/30 transition-colors">
                                        <td className="py-3 px-4 text-center text-xs text-secondary font-mono">
                                            {item.no}
                                        </td>
                                        <td className="py-3 px-4 text-center font-mono font-bold text-primary text-base">
                                            {item.doorprize_number}
                                        </td>
                                        <td className="py-3 px-4 font-semibold text-dark">
                                            {item.name}
                                        </td>
                                        <td className="py-3 px-4 font-medium text-bodytext">
                                            {item.prize}
                                        </td>
                                        <td className="py-3 px-4 text-right text-xs text-secondary">
                                            {item.time}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}

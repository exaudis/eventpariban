import React from 'react';
import { Head } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function Dashboard({ stats, recentRegistrations }) {
    return (
        <AdminLayout title="Dashboard Overview">
            <Head title="Admin Dashboard" />

            {/* Stats Summary Bar */}
            <div className="bg-surface border border-eventborder rounded-xl p-6 mb-8">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 divide-y lg:divide-y-0 lg:divide-x divide-eventborder">
                    <div className="pt-2 lg:pt-0 lg:px-4 first:px-0">
                        <span className="text-xs font-semibold uppercase tracking-wider text-secondary">
                            Total Peserta
                        </span>
                        <div className="text-3xl font-extrabold text-dark mt-1">
                            {stats.totalParticipants}
                        </div>
                    </div>

                    <div className="pt-4 lg:pt-0 lg:px-4">
                        <span className="text-xs font-semibold uppercase tracking-wider text-secondary">
                            Nomor Terpakai
                        </span>
                        <div className="text-3xl font-extrabold text-primary mt-1">
                            {stats.usedNumbersCount} <span className="text-sm font-normal text-secondary">/ {stats.totalNumbers}</span>
                        </div>
                    </div>

                    <div className="pt-4 lg:pt-0 lg:px-4">
                        <span className="text-xs font-semibold uppercase tracking-wider text-secondary">
                            Nomor Tersedia
                        </span>
                        <div className="text-3xl font-extrabold text-success mt-1">
                            {stats.availableNumbersCount}
                        </div>
                    </div>

                    <div className="pt-4 lg:pt-0 lg:px-4">
                        <span className="text-xs font-semibold uppercase tracking-wider text-secondary">
                            Total Pemenang
                        </span>
                        <div className="text-3xl font-extrabold text-dark mt-1">
                            {stats.totalWinners}
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Registrations Table */}
            <div className="bg-surface border border-eventborder rounded-xl p-6">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-eventborder">
                    <h3 className="text-base font-bold text-dark">
                        Registrasi Terbaru
                    </h3>
                    <span className="text-xs text-secondary">
                        10 Pendaftar Terakhir
                    </span>
                </div>

                {recentRegistrations.length === 0 ? (
                    <p className="text-sm text-secondary py-4 text-center">Belum ada peserta yang mendaftar.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-bodytext">
                            <thead>
                                <tr className="border-b border-eventborder bg-eventbg/50 text-xs font-semibold uppercase tracking-wider text-secondary">
                                    <th className="py-2.5 px-4">Nama</th>
                                    <th className="py-2.5 px-4 text-center">Meja</th>
                                    <th className="py-2.5 px-4 text-center">Nomor Doorprize</th>
                                    <th className="py-2.5 px-4 text-right">Waktu</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-eventborder">
                                {recentRegistrations.map((item) => (
                                    <tr key={item.id} className="hover:bg-eventbg/30 transition-colors">
                                        <td className="py-3 px-4 font-medium text-dark">{item.name}</td>
                                        <td className="py-3 px-4 text-center">
                                            <span className="inline-block px-2.5 py-0.5 bg-eventbg border border-eventborder rounded text-xs font-semibold text-dark">
                                                Meja {item.table}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-center font-mono font-bold text-primary text-base">
                                            {item.number}
                                        </td>
                                        <td className="py-3 px-4 text-right text-secondary text-xs">{item.time}</td>
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

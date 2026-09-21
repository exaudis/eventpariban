import React from 'react';
import { Head } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function QrCodes({ tables }) {
    const handlePrint = () => {
        window.print();
    };

    return (
        <AdminLayout title="QR Code Meja">
            <Head title="QR Code Meja" />

            <div className="mb-6 flex justify-between items-center print:hidden">
                <p className="text-sm text-secondary">
                    Cetak QR Code ini dan tempatkan di masing-masing meja peserta.
                </p>
                <button
                    onClick={handlePrint}
                    className="py-2 px-4 bg-primary hover:bg-primary-hover text-surface text-sm font-bold rounded-lg transition-colors"
                >
                    Cetak QR Code
                </button>
            </div>

            {/* Grid of Printable Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 print:grid-cols-2 print:gap-4">
                {tables.map((table) => (
                    <div
                        key={table.id}
                        className="bg-surface border-2 border-eventborder rounded-xl p-6 text-center shadow-sm flex flex-col items-center justify-between page-break-inside-avoid"
                    >
                        <div className="flex flex-col items-center">
                            <img
                                src="/images/logo.jpg"
                                alt="Logo"
                                className="w-12 h-12 rounded-full mb-2 border border-primary/40 object-cover"
                            />
                            <span className="text-[10px] font-semibold text-primary-dark uppercase tracking-widest block mb-1">
                                MARPARIBAN ENTERTAINMENT
                            </span>
                            <h3 className="text-2xl font-black text-dark">
                                MEJA {table.table_number}
                            </h3>
                        </div>

                        <div
                            className="my-4 p-3 bg-white rounded-lg border border-eventborder"
                            dangerouslySetInnerHTML={{ __html: table.svg }}
                        />

                        <div>
                            <p className="text-xs text-secondary mb-1">
                                Scan QR Code untuk registrasi doorprize
                            </p>
                            <span className="text-[10px] font-mono text-gray-400 block truncate max-w-[200px]">
                                {table.url}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </AdminLayout>
    );
}

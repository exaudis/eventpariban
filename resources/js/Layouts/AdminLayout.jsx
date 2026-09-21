import React from 'react';
import { Link, usePage } from '@inertiajs/react';

export default function AdminLayout({ children, title }) {
    const { url } = usePage();

    const navItems = [
        { name: 'Dashboard', href: '/admin/dashboard', active: url.startsWith('/admin/dashboard') },
        { name: 'Peserta', href: '/admin/participants', active: url.startsWith('/admin/participants') },
        { name: 'Pengundian', href: '/admin/draw', active: url.startsWith('/admin/draw') },
        { name: 'Pemenang', href: '/admin/winners', active: url.startsWith('/admin/winners') },
        { name: 'QR Codes', href: '/admin/qrcodes', active: url.startsWith('/admin/qrcodes') },
    ];

    return (
        <div className="min-h-screen bg-eventbg flex flex-col md:flex-row">
            {/* Sidebar */}
            <aside className="w-full md:w-64 bg-dark text-surface flex-shrink-0">
                <div className="p-6 border-b border-white/10 flex items-center gap-3">
                    <img
                        src="/images/logo.jpg"
                        alt="Logo"
                        className="w-10 h-10 rounded-full border border-primary/40 object-cover"
                    />
                    <div>
                        <span className="text-[10px] font-semibold uppercase tracking-widest text-primary font-mono block">
                            Event Admin
                        </span>
                        <h1 className="text-base font-bold tracking-tight text-surface">
                            MARPARIBAN
                        </h1>
                    </div>
                </div>

                <nav className="p-4 space-y-1">
                    {navItems.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-md transition-colors ${
                                item.active
                                    ? 'bg-primary text-surface font-bold'
                                    : 'text-gray-300 hover:bg-white/5 hover:text-white'
                            }`}
                        >
                            {item.name}
                        </Link>
                    ))}
                </nav>

                <div className="p-4 border-t border-white/10 md:mt-auto">
                    <Link
                        href="/admin/logout"
                        method="post"
                        as="button"
                        className="w-full text-left px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors"
                    >
                        Logout
                    </Link>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 p-6 md:p-10 overflow-y-auto">
                {title && (
                    <div className="mb-6 pb-4 border-b border-eventborder">
                        <h2 className="text-xl font-bold text-dark">{title}</h2>
                    </div>
                )}
                {children}
            </main>
        </div>
    );
}

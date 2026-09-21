import React from 'react';
import { Head, useForm } from '@inertiajs/react';

export default function Login({ status }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post('/admin/login', {
            onFinish: () => reset('password'),
        });
    };

    return (
        <div className="min-h-screen bg-eventbg flex flex-col justify-center items-center px-4 py-8">
            <Head title="Admin Login - Marpariban Entertainment" />

            <div className="w-full max-w-sm bg-surface border border-eventborder rounded-xl p-6 sm:p-8 shadow-sm">
                <div className="text-center mb-6 pb-4 border-b border-eventborder">
                    <img
                        src="/images/logo.jpg"
                        alt="Marpariban Entertainment Logo"
                        className="w-16 h-16 rounded-full mx-auto mb-3 border-2 border-primary/40 object-cover shadow-sm"
                    />
                    <div className="inline-block px-3 py-1 bg-primary-light text-primary-dark text-xs font-semibold tracking-wider uppercase rounded-md mb-2">
                        MARPARIBAN ENTERTAINMENT
                    </div>
                    <h1 className="text-xl font-bold text-dark">
                        Admin Login
                    </h1>
                </div>

                {status && (
                    <div className="mb-4 text-xs font-medium text-success bg-success/10 p-2.5 rounded text-center">
                        {status}
                    </div>
                )}

                <form onSubmit={submit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-dark mb-1">
                            Email
                        </label>
                        <input
                            type="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            placeholder="admin@kedaipariban.com"
                            required
                            autoFocus
                            className="w-full px-3.5 py-2.5 bg-surface border border-eventborder rounded-lg text-bodytext text-sm focus:ring-1 focus:ring-primary focus:border-primary"
                        />
                        {errors.email && (
                            <p className="text-xs text-error mt-1">{errors.email}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-dark mb-1">
                            Password
                        </label>
                        <input
                            type="password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            placeholder="••••••••"
                            required
                            className="w-full px-3.5 py-2.5 bg-surface border border-eventborder rounded-lg text-bodytext text-sm focus:ring-1 focus:ring-primary focus:border-primary"
                        />
                        {errors.password && (
                            <p className="text-xs text-error mt-1">{errors.password}</p>
                        )}
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full py-2.5 px-4 bg-primary hover:bg-primary-hover text-surface text-sm font-bold rounded-lg shadow-sm transition-colors uppercase tracking-wider disabled:opacity-60"
                        >
                            {processing ? 'Masuk...' : 'MASUK'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

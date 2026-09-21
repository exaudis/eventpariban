import React, { useState, useEffect, useRef } from 'react';
import { Head } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function Draw({ prizes, eligibleCount, candidateNumbers }) {
    const [selectedPrizeId, setSelectedPrizeId] = useState(prizes.length > 0 ? prizes[0].id : '');
    const [drawingState, setDrawingState] = useState('idle'); // 'idle' | 'drawing' | 'result'
    const [tickerNumber, setTickerNumber] = useState('000');
    const [currentCandidate, setCurrentCandidate] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');
    const [confirming, setConfirming] = useState(false);

    const timerRef = useRef(null);

    const selectedPrize = prizes.find((p) => p.id === Number(selectedPrizeId)) || prizes[0];

    const startDraw = async () => {
        if (!selectedPrizeId) {
            setErrorMessage('Silakan pilih hadiah terlebih dahulu.');
            return;
        }

        setErrorMessage('');
        setDrawingState('drawing');
        setCurrentCandidate(null);

        // Start cycling animation ticker
        const numbersList = candidateNumbers && candidateNumbers.length > 0
            ? candidateNumbers
            : ['012', '045', '089', '123', '156', '199'];

        let step = 0;
        timerRef.current = setInterval(() => {
            const randomNum = numbersList[Math.floor(Math.random() * numbersList.length)];
            setTickerNumber(randomNum);
            step++;
        }, 60);

        try {
            // Request server for true random selection from database
            const response = await fetch('/admin/draw', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({ prize_id: selectedPrizeId }),
            });

            const data = await response.json();

            // Run animation for at least 3 seconds before stopping
            setTimeout(() => {
                clearInterval(timerRef.current);

                if (data.success && data.candidate) {
                    setTickerNumber(data.candidate.doorprize_number);
                    setCurrentCandidate(data.candidate);
                    setDrawingState('result');
                } else {
                    setDrawingState('idle');
                    setErrorMessage(data.message || 'Gagal melakukan pengundian.');
                }
            }, 3000);
        } catch (err) {
            clearInterval(timerRef.current);
            setDrawingState('idle');
            setErrorMessage('Terjadi kesalahan koneksi server.');
        }
    };

    const confirmWinner = async () => {
        if (!currentCandidate) return;

        setConfirming(true);
        setErrorMessage('');

        try {
            const response = await fetch('/admin/draw/confirm', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    participant_id: currentCandidate.participant_id,
                    prize_id: currentCandidate.prize_id,
                }),
            });

            const data = await response.json();

            if (data.success) {
                // Reload page to refresh eligible counts
                window.location.reload();
            } else {
                setErrorMessage(data.message || 'Gagal mengonfirmasi pemenang.');
                setConfirming(false);
            }
        } catch (err) {
            setErrorMessage('Terjadi kesalahan koneksi server.');
            setConfirming(false);
        }
    };

    const reDraw = () => {
        setDrawingState('idle');
        setCurrentCandidate(null);
        setErrorMessage('');
    };

    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

    return (
        <AdminLayout title="Pengundian Doorprize">
            <Head title="Pengundian Doorprize" />

            <div className="max-w-4xl mx-auto">
                {/* Error Banner */}
                {errorMessage && (
                    <div className="mb-6 p-4 bg-error/10 border border-error/20 rounded-xl text-error text-sm font-medium text-center">
                        {errorMessage}
                    </div>
                )}

                {/* Main Display Box (Projector Optimized) */}
                <div className="bg-surface border border-eventborder rounded-2xl p-8 md:p-12 text-center shadow-md min-h-[460px] flex flex-col justify-between items-center">
                    
                    {/* Header Info */}
                    <div className="w-full">
                        <div className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-semibold tracking-wider uppercase rounded-md mb-2">
                            PENGUNDIAN DOORPRIZE
                        </div>

                        {drawingState === 'idle' && (
                            <div className="mt-4 max-w-xs mx-auto">
                                <label className="block text-xs font-semibold text-secondary uppercase tracking-wider mb-1.5">
                                    Pilih Hadiah
                                </label>
                                <select
                                    value={selectedPrizeId}
                                    onChange={(e) => setSelectedPrizeId(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-eventbg border border-eventborder rounded-xl text-dark text-base font-bold text-center focus:ring-1 focus:ring-primary focus:border-primary"
                                >
                                    {prizes.map((p) => (
                                        <option key={p.id} value={p.id}>
                                            {p.name} ({p.quantity} Unit)
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {drawingState !== 'idle' && (
                            <div className="mt-2">
                                <span className="text-sm font-semibold uppercase tracking-wider text-secondary">
                                    HADIAH
                                </span>
                                <h2 className="text-2xl font-bold text-dark mt-0.5">
                                    {selectedPrize ? selectedPrize.name : 'Doorprize'}
                                </h2>
                            </div>
                        )}
                    </div>

                    {/* Middle Animation / Result Display */}
                    <div className="my-8 w-full">
                        {drawingState === 'idle' && (
                            <div className="py-8">
                                <p className="text-base text-secondary font-medium">
                                    Peserta yang Memenuhi Syarat: <span className="font-bold text-dark">{eligibleCount} Orang</span>
                                </p>
                                <p className="text-xs text-secondary mt-1">
                                    Klik tombol di bawah untuk memulai pengundian nomor acak.
                                </p>
                            </div>
                        )}

                        {drawingState === 'drawing' && (
                            <div className="py-6">
                                <p className="text-xs uppercase tracking-widest text-secondary font-semibold mb-4 animate-pulse">
                                    MENGUNDI NOMOR ACAK...
                                </p>
                                <div className="inline-block px-10 py-6 bg-eventbg border-2 border-primary rounded-2xl shadow-inner">
                                    <span className="text-7xl md:text-9xl font-black font-mono tracking-widest text-primary">
                                        {tickerNumber}
                                    </span>
                                </div>
                            </div>
                        )}

                        {drawingState === 'result' && currentCandidate && (
                            <div className="py-4">
                                <p className="text-xs uppercase tracking-widest text-success font-bold mb-2">
                                    PEMENANG
                                </p>
                                
                                {/* 1. Number (Largest Visual Hierarchy) */}
                                <div className="inline-block px-10 py-4 bg-eventbg border-2 border-primary rounded-2xl my-2">
                                    <span className="text-7xl md:text-9xl font-black font-mono tracking-widest text-primary">
                                        {currentCandidate.doorprize_number}
                                    </span>
                                </div>

                                {/* 2. Name */}
                                <h3 className="text-3xl md:text-4xl font-extrabold text-dark mt-4">
                                    {currentCandidate.name}
                                </h3>

                                {/* 3. Prize */}
                                <p className="text-lg font-medium text-secondary mt-1">
                                    {currentCandidate.prize_name}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Action Controls */}
                    <div className="w-full pt-4 border-t border-eventborder">
                        {drawingState === 'idle' && (
                            <button
                                onClick={startDraw}
                                disabled={eligibleCount === 0}
                                className="py-3.5 px-8 bg-primary hover:bg-primary-hover text-surface text-base font-bold rounded-xl shadow-sm transition-colors uppercase tracking-wider disabled:opacity-50"
                            >
                                MULAI PENGUNDIAN
                            </button>
                        )}

                        {drawingState === 'result' && (
                            <div className="flex flex-col sm:flex-row justify-center gap-4">
                                <button
                                    onClick={confirmWinner}
                                    disabled={confirming}
                                    className="py-3 px-6 bg-success hover:bg-success/90 text-surface text-sm font-bold rounded-xl shadow-sm transition-colors uppercase tracking-wider disabled:opacity-60"
                                >
                                    {confirming ? 'Menyimpan...' : 'KONFIRMASI PEMENANG'}
                                </button>
                                <button
                                    onClick={reDraw}
                                    disabled={confirming}
                                    className="py-3 px-6 bg-surface border border-dark text-dark hover:bg-eventbg text-sm font-bold rounded-xl transition-colors uppercase tracking-wider disabled:opacity-60"
                                >
                                    UNDI ULANG
                                </button>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </AdminLayout>
    );
}

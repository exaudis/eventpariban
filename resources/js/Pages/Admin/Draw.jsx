import React, { useMemo, useRef, useState } from 'react';
import { Head } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

const WHEEL_SIZE = 800;
const WHEEL_CENTER = WHEEL_SIZE / 2;
const WHEEL_RADIUS = 370;
const WHEEL_COLORS = ['#c49a4a', '#24201a', '#f5edda', '#8c6728', '#ded0ad'];

function createWheelSegments(numbers) {
    const count = numbers.length;
    if (!count) return [];

    const step = (Math.PI * 2) / count;
    const labelFontSize = count > 300 ? 5.5 : count > 120 ? 7 : count > 60 ? 9 : 13;
    const alternateLabelRings = count > 100;

    return numbers.map((number, index) => {
        const startAngle = -Math.PI / 2 + index * step;
        const endAngle = startAngle + step;
        const startX = WHEEL_CENTER + WHEEL_RADIUS * Math.cos(startAngle);
        const startY = WHEEL_CENTER + WHEEL_RADIUS * Math.sin(startAngle);
        const endX = WHEEL_CENTER + WHEEL_RADIUS * Math.cos(endAngle);
        const endY = WHEEL_CENTER + WHEEL_RADIUS * Math.sin(endAngle);
        const largeArc = step > Math.PI ? 1 : 0;
        const middleAngle = startAngle + step / 2;
        const labelRadius = alternateLabelRings ? (index % 2 === 0 ? 274 : 340) : 285;
        const labelX = WHEEL_CENTER + labelRadius * Math.cos(middleAngle);
        const labelY = WHEEL_CENTER + labelRadius * Math.sin(middleAngle);
        let labelRotation = (middleAngle * 180) / Math.PI + 90;
        const uprightRotation = ((labelRotation % 360) + 360) % 360;
        if (uprightRotation > 90 && uprightRotation < 270) labelRotation += 180;

        return {
            number,
            path: `M ${WHEEL_CENTER} ${WHEEL_CENTER} L ${startX} ${startY} A ${WHEEL_RADIUS} ${WHEEL_RADIUS} 0 ${largeArc} 1 ${endX} ${endY} Z`,
            color: WHEEL_COLORS[index % WHEEL_COLORS.length],
            labelX,
            labelY,
            labelRotation,
            labelFontSize,
        };
    });
}

function SpinWheel({ numbers, rotation, spinning, onSpinEnd }) {
    const segments = useMemo(() => createWheelSegments(numbers), [numbers]);

    return (
        <div className="relative mx-auto w-full max-w-[620px] px-2 pt-5">
            <div className="absolute left-1/2 top-0 z-10 -translate-x-1/2 drop-shadow-md" aria-hidden="true">
                <svg width="42" height="48" viewBox="0 0 42 48">
                    <path d="M21 48 1 4h40L21 48Z" fill="#a51f19" stroke="#fff" strokeWidth="3" />
                </svg>
            </div>
            <svg
                viewBox={`0 0 ${WHEEL_SIZE} ${WHEEL_SIZE}`}
                className="aspect-square w-full overflow-visible drop-shadow-xl"
                role="img"
                aria-label={`Roda undian dengan ${numbers.length} nomor peserta yang memenuhi syarat`}
            >
                <circle cx={WHEEL_CENTER} cy={WHEEL_CENTER} r="391" fill="#201b14" />
                <g
                    onTransitionEnd={onSpinEnd}
                    style={{
                        transform: `rotate(${rotation}deg)`,
                        transformOrigin: '50% 50%',
                        transition: spinning ? 'transform 6.5s cubic-bezier(0.12, 0.78, 0.13, 1)' : 'none',
                    }}
                >
                    {segments.map((segment, index) => (
                        <g key={`${segment.number}-${index}`}>
                            <path d={segment.path} fill={segment.color} stroke="#fff8e8" strokeWidth={numbers.length > 250 ? 0.35 : 1.2} />
                            <text
                                x={segment.labelX}
                                y={segment.labelY}
                                textAnchor="middle"
                                dominantBaseline="middle"
                                transform={`rotate(${segment.labelRotation} ${segment.labelX} ${segment.labelY})`}
                                fill={index % WHEEL_COLORS.length === 2 || index % WHEEL_COLORS.length === 4 ? '#201b14' : '#fffdf7'}
                                fontSize={segment.labelFontSize}
                                fontWeight="700"
                                fontFamily="ui-monospace, monospace"
                            >
                                {segment.number}
                            </text>
                        </g>
                    ))}
                    <circle cx={WHEEL_CENTER} cy={WHEEL_CENTER} r="61" fill="#fffaf0" stroke="#201b14" strokeWidth="8" />
                    <text x={WHEEL_CENTER} y={WHEEL_CENTER - 5} textAnchor="middle" fill="#201b14" fontSize="17" fontWeight="900">PUTAR</text>
                    <text x={WHEEL_CENTER} y={WHEEL_CENTER + 19} textAnchor="middle" fill="#8c6728" fontSize="14" fontWeight="800">UNDIAN</text>
                </g>
            </svg>
        </div>
    );
}

export default function Draw({ prizes, eligibleCount, candidateNumbers }) {
    const [selectedPrizeId, setSelectedPrizeId] = useState(prizes.length > 0 ? prizes[0].id : '');
    const [drawingState, setDrawingState] = useState('idle');
    const [currentCandidate, setCurrentCandidate] = useState(null);
    const [pendingCandidate, setPendingCandidate] = useState(null);
    const [wheelRotation, setWheelRotation] = useState(0);
    const [errorMessage, setErrorMessage] = useState('');
    const [confirming, setConfirming] = useState(false);
    const timerRef = useRef(null);
    const pendingCandidateRef = useRef(null);

    const selectedPrize = prizes.find((prize) => prize.id === Number(selectedPrizeId)) || prizes[0];

    const finishSpin = () => {
        if (!pendingCandidateRef.current) return;
        window.clearTimeout(timerRef.current);
        setCurrentCandidate(pendingCandidateRef.current);
        pendingCandidateRef.current = null;
        setPendingCandidate(null);
        setDrawingState('result');
    };

    const startDraw = async () => {
        if (!selectedPrizeId) {
            setErrorMessage('Silakan pilih hadiah terlebih dahulu.');
            return;
        }

        setErrorMessage('');
        setCurrentCandidate(null);
        setDrawingState('drawing');

        try {
            const response = await fetch('/admin/draw', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                    Accept: 'application/json',
                },
                body: JSON.stringify({ prize_id: selectedPrizeId }),
            });
            const data = await response.json();

            if (!response.ok || !data.success || !data.candidate) {
                setDrawingState('idle');
                setErrorMessage(data.message || 'Gagal melakukan pengundian.');
                return;
            }

            const selectedIndex = candidateNumbers.findIndex((number) => String(number) === String(data.candidate.doorprize_number));
            if (selectedIndex < 0) {
                setDrawingState('idle');
                setErrorMessage('Nomor peserta terpilih tidak ditemukan pada roda. Muat ulang halaman admin lalu coba lagi.');
                return;
            }

            pendingCandidateRef.current = data.candidate;
            setPendingCandidate(data.candidate);
            const segmentCenter = ((selectedIndex + 0.5) / candidateNumbers.length) * 360;
            const currentMod = ((wheelRotation % 360) + 360) % 360;
            const correction = (360 - ((segmentCenter + currentMod) % 360)) % 360;
            setWheelRotation(wheelRotation + 7 * 360 + correction);
            timerRef.current = window.setTimeout(finishSpin, 6800);
        } catch {
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
                    Accept: 'application/json',
                },
                body: JSON.stringify({ participant_id: currentCandidate.participant_id, prize_id: currentCandidate.prize_id }),
            });
            const data = await response.json();

            if (response.ok && data.success) {
                window.location.reload();
            } else {
                setErrorMessage(data.message || 'Gagal mengonfirmasi pemenang.');
                setConfirming(false);
            }
        } catch {
            setErrorMessage('Terjadi kesalahan koneksi server.');
            setConfirming(false);
        }
    };

    const reDraw = () => {
        window.clearTimeout(timerRef.current);
        setDrawingState('idle');
        setCurrentCandidate(null);
        pendingCandidateRef.current = null;
        setPendingCandidate(null);
        setErrorMessage('');
    };

    return (
        <AdminLayout title="Pengundian Doorprize">
            <Head title="Pengundian Doorprize" />

            <div className="mx-auto max-w-5xl">
                {errorMessage && (
                    <div className="mb-6 rounded-xl border border-error/20 bg-error/10 p-4 text-center text-sm font-medium text-error" role="alert">
                        {errorMessage}
                    </div>
                )}

                <div className="flex min-h-[620px] flex-col items-center justify-between rounded-2xl border border-eventborder bg-surface p-5 text-center shadow-md md:p-8">
                    <div className="w-full">
                        <div className="mb-2 inline-block rounded-md bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
                            PENGUNDIAN DOORPRIZE
                        </div>

                        {drawingState === 'idle' ? (
                            <div className="mx-auto mt-4 max-w-xs">
                                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-secondary">Pilih Hadiah</label>
                                <select
                                    value={selectedPrizeId}
                                    onChange={(event) => setSelectedPrizeId(event.target.value)}
                                    className="w-full rounded-xl border border-eventborder bg-eventbg px-4 py-2.5 text-center text-base font-bold text-dark focus:border-primary focus:ring-1 focus:ring-primary"
                                >
                                    {prizes.map((prize) => <option key={prize.id} value={prize.id}>{prize.name} ({prize.quantity} Unit)</option>)}
                                </select>
                            </div>
                        ) : (
                            <div className="mt-2">
                                <span className="text-sm font-semibold uppercase tracking-wider text-secondary">HADIAH</span>
                                <h2 className="mt-0.5 text-2xl font-bold text-dark">{selectedPrize?.name || 'Doorprize'}</h2>
                            </div>
                        )}
                    </div>

                    <div className="my-5 w-full">
                        {drawingState === 'idle' && (
                            <p className="mb-2 text-sm font-medium text-secondary">
                                Peserta yang memenuhi syarat: <span className="font-bold text-dark">{eligibleCount} orang</span>
                            </p>
                        )}

                        {candidateNumbers.length > 0 && (
                            <SpinWheel
                                numbers={candidateNumbers}
                                rotation={wheelRotation}
                                spinning={drawingState === 'drawing' && pendingCandidate !== null}
                                onSpinEnd={(event) => {
                                    if (event.target === event.currentTarget && event.propertyName === 'transform') finishSpin();
                                }}
                            />
                        )}

                        {drawingState === 'drawing' && (
                            <p className="mt-3 animate-pulse text-xs font-semibold uppercase tracking-widest text-secondary">RODA SEDANG BERPUTAR...</p>
                        )}

                        {drawingState === 'idle' && candidateNumbers.length === 0 && (
                            <p className="py-14 text-sm text-secondary">Belum ada peserta lunas yang dapat diundi.</p>
                        )}

                        {drawingState === 'result' && currentCandidate && (
                            <div className="mt-2">
                                <p className="mb-2 text-xs font-bold uppercase tracking-widest text-success">NOMOR TERPILIH</p>
                                <div className="my-2 inline-block rounded-2xl border-2 border-primary bg-eventbg px-8 py-3">
                                    <span className="font-mono text-6xl font-black tracking-widest text-primary md:text-8xl">{currentCandidate.doorprize_number}</span>
                                </div>
                                <h3 className="mt-3 text-2xl font-extrabold text-dark md:text-3xl">{currentCandidate.name}</h3>
                                <p className="mt-1 text-base font-medium text-secondary">{currentCandidate.prize_name}</p>
                            </div>
                        )}
                    </div>

                    <div className="w-full border-t border-eventborder pt-4">
                        {drawingState === 'idle' && (
                            <button
                                onClick={startDraw}
                                disabled={eligibleCount === 0 || prizes.length === 0}
                                className="rounded-xl bg-primary px-8 py-3.5 text-base font-bold uppercase tracking-wider text-surface shadow-sm transition-colors hover:bg-primary-hover disabled:opacity-50"
                            >
                                {prizes.length === 0 ? 'TIDAK ADA HADIAH TERSEDIA' : 'MULAI PENGUNDIAN'}
                            </button>
                        )}

                        {drawingState === 'result' && (
                            <div className="flex flex-col justify-center gap-4 sm:flex-row">
                                <button onClick={confirmWinner} disabled={confirming} className="rounded-xl bg-success px-6 py-3 text-sm font-bold uppercase tracking-wider text-surface shadow-sm transition-colors hover:bg-success/90 disabled:opacity-60">
                                    {confirming ? 'Menyimpan...' : 'KONFIRMASI PEMENANG'}
                                </button>
                                <button onClick={reDraw} disabled={confirming} className="rounded-xl border border-dark bg-surface px-6 py-3 text-sm font-bold uppercase tracking-wider text-dark transition-colors hover:bg-eventbg disabled:opacity-60">
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

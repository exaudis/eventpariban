<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\DoorprizeNumber;
use App\Models\Participant;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class PaymentController extends Controller
{
    public function index(): Response
    {
        $participants = Participant::whereIn('payment_status', ['awaiting_payment', 'pending', 'rejected'])
            ->orderByRaw("CASE WHEN payment_status = 'pending' THEN 0 ELSE 1 END")
            ->orderByDesc('registered_at')->get()->map(fn ($p) => [
                'id' => $p->id, 'name' => $p->name, 'phone' => $p->phone, 'email' => $p->email,
                'method' => $p->payment_method,
                'status' => $p->payment_status, 'amount' => $p->payment_amount,
                'proof_url' => $p->payment_proof_data ? route('admin.payments.proof', $p) : null,
                'registered_at' => $p->registered_at?->format('d/m/Y H:i'),
            ]);
        return Inertia::render('Admin/Payments', ['participants' => $participants]);
    }

    public function approve(Participant $participant): RedirectResponse
    {
        try {
            DB::transaction(function () use ($participant) {
                $locked = Participant::whereKey($participant->id)->lockForUpdate()->firstOrFail();
                if ($locked->payment_status === 'paid') return;
                if (!in_array($locked->payment_status, ['pending', 'rejected'], true) || !$locked->payment_method) {
                    throw new \RuntimeException('Pilih metode pembayaran terlebih dahulu.');
                }
                if ($locked->payment_method === 'qris' && !$locked->payment_proof_data) {
                    throw new \RuntimeException('Bukti pembayaran QRIS belum tersedia.');
                }
                $number = DoorprizeNumber::where('status', 'available')->lockForUpdate()->inRandomOrder()->first();
                if (!$number) throw new \RuntimeException('Nomor doorprize sudah habis. Tambahkan nomor terlebih dahulu.');
                $locked->update(['payment_status' => 'paid', 'paid_at' => now(), 'doorprize_number' => $number->number]);
                $number->update(['status' => 'used', 'assigned_to' => $locked->id, 'assigned_at' => now()]);
            });
            return back()->with('success', 'Pembayaran disetujui dan nomor doorprize telah diberikan.');
        } catch (\Throwable $e) {
            return back()->withErrors(['payment' => $e->getMessage()]);
        }
    }

    public function reject(Participant $participant): RedirectResponse
    {
        if (!in_array($participant->payment_status, ['pending', 'rejected'], true)) {
            return back()->withErrors(['payment' => 'Status pembayaran peserta ini tidak dapat ditolak.']);
        }
        $participant->update(['payment_status' => 'rejected']);
        return back()->with('success', 'Pembayaran ditandai ditolak.');
    }

    public function proof(Participant $participant)
    {
        abort_unless($participant->payment_proof_data && $participant->payment_proof_mime, 404);
        abort_unless(str_starts_with($participant->payment_proof_mime, 'image/'), 404);
        return response(base64_decode($participant->payment_proof_data, true), 200, [
            'Content-Type' => $participant->payment_proof_mime,
            'Content-Disposition' => 'inline',
            'Cache-Control' => 'private, no-store',
            'X-Content-Type-Options' => 'nosniff',
        ]);
    }
}

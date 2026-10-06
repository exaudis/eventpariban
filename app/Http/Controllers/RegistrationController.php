<?php

namespace App\Http\Controllers;

use App\Models\Participant;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class RegistrationController extends Controller
{
    public function landing(): Response
    {
        return Inertia::render('Public/Landing');
    }

    /**
     * Show registration form page.
     */
    public function create(): Response
    {
        return Inertia::render('Public/Register');
    }

    /**
     * Store registration data.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'phone' => ['required', 'string', 'max:20'],
            'email' => ['required', 'email', 'max:255'],
            'age' => ['required', 'integer', 'min:1', 'max:120'],
        ], [
            'name.required' => 'Nama lengkap wajib diisi.',
            'phone.required' => 'Nomor WhatsApp wajib diisi.',
            'email.required' => 'Email wajib diisi.',
            'email.email' => 'Format email tidak valid.',
            'age.required' => 'Umur wajib diisi.',
            'age.integer' => 'Umur harus berupa angka.',
            'age.min' => 'Umur tidak valid.',
        ]);

        // Clean phone number format
        $cleanPhone = preg_replace('/[^0-9]/', '', $validated['phone']);
        if (str_starts_with($cleanPhone, '62')) {
            $cleanPhone = '0' . substr($cleanPhone, 2);
        }

        if (Participant::where('phone', $cleanPhone)->exists()) {
            return back()->withErrors(['phone' => 'Nomor WhatsApp ini sudah terdaftar dan tidak dapat digunakan kembali.']);
        }

        try {
            $result = Participant::create([
                    'payment_token' => (string) Str::uuid(),
                    'name' => trim($validated['name']),
                    'phone' => $cleanPhone,
                    'email' => trim($validated['email']),
                    'age' => (int)$validated['age'],
                    'doorprize_number' => null,
                    'registered_at' => now(),
                ]);
            return redirect()->route('payment.show', $result->payment_token);
        } catch (\Exception $e) {
            if (Participant::where('phone', $cleanPhone)->exists()) {
                return back()->withErrors(['phone' => 'Nomor WhatsApp ini sudah terdaftar dan tidak dapat digunakan kembali.']);
            }
            return back()->withErrors([
                'phone' => 'Terjadi kesalahan sistem. Silakan coba beberapa saat lagi.'
            ]);
        }
    }

    public function payment(string $token): Response|RedirectResponse
    {
        $participant = Participant::where('payment_token', $token)->firstOrFail();
        return Inertia::render('Public/Payment', [
            'participant' => [
                'name' => $participant->name,
                'payment_method' => $participant->payment_method,
                'payment_status' => $participant->payment_status,
                'doorprize_number' => $participant->doorprize_number,
            ],
        ]);
    }

    public function submitPayment(Request $request, string $token): RedirectResponse
    {
        $participant = Participant::where('payment_token', $token)->firstOrFail();
        if (!in_array($participant->payment_status, ['awaiting_payment', 'rejected'], true)) {
            return back()->withErrors(['payment' => 'Pilihan pembayaran sudah dikirim dan sedang diproses.']);
        }

        $validated = $request->validate([
            'payment_method' => ['required', 'in:qris,onsite'],
            'payment_proof' => ['required_if:payment_method,qris', 'nullable', 'image', 'max:20480'],
        ], [
            'payment_proof.required_if' => 'Unggah bukti pembayaran QRIS.',
            'payment_proof.image' => 'Bukti pembayaran harus berupa gambar.',
            'payment_proof.max' => 'Ukuran bukti pembayaran maksimal 20 MB.',
        ]);

        $proofFile = $validated['payment_method'] === 'qris' ? $request->file('payment_proof') : null;
        $participant->update([
            'payment_method' => $validated['payment_method'],
            'payment_status' => 'pending',
            'payment_proof_data' => $proofFile ? base64_encode($proofFile->get()) : null,
            'payment_proof_mime' => $proofFile?->getMimeType(),
        ]);

        return redirect()->route('payment.show', $token);
    }

    /**
     * Show registration success page.
     */
    public function success(Request $request): Response|RedirectResponse
    {
        $resultData = session('participant_result');

        if (!$resultData) {
            return redirect()->route('register');
        }

        return Inertia::render('Public/RegistrationSuccess', [
            'result' => $resultData,
        ]);
    }
}

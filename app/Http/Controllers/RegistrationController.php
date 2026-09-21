<?php

namespace App\Http\Controllers;

use App\Models\DoorprizeNumber;
use App\Models\Participant;
use App\Models\Table;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class RegistrationController extends Controller
{
    /**
     * Show registration form page.
     */
    public function create(Request $request): Response
    {
        $tableParam = $request->query('table', '01');
        $formattedTableNumber = str_pad((string)$tableParam, 2, '0', STR_PAD_LEFT);

        $table = Table::where('table_number', $formattedTableNumber)
            ->orWhere('table_number', (string)$tableParam)
            ->first();

        if (!$table) {
            $table = Table::first();
        }

        $availableCount = DoorprizeNumber::where('status', 'available')->count();
        $isClosed = ($availableCount === 0);

        return Inertia::render('Public/Register', [
            'tableNumber' => $table ? $table->table_number : '01',
            'tableId' => $table ? $table->id : 1,
            'isClosed' => $isClosed,
            'availableCount' => $availableCount,
        ]);
    }

    /**
     * Store registration data.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'phone' => ['required', 'string', 'max:20'],
            'email' => ['nullable', 'email', 'max:255'],
            'table_number' => ['required', 'string'],
        ], [
            'name.required' => 'Nama lengkap wajib diisi.',
            'phone.required' => 'Nomor WhatsApp wajib diisi.',
            'email.email' => 'Format email tidak valid.',
        ]);

        // Clean phone number format
        $cleanPhone = preg_replace('/[^0-9]/', '', $validated['phone']);
        if (str_starts_with($cleanPhone, '62')) {
            $cleanPhone = '0' . substr($cleanPhone, 2);
        }

        // Rule 7 & 24: 1 WhatsApp = 1 participant = 1 doorprize number
        // Check if phone already registered
        $existing = Participant::where('phone', $cleanPhone)->first();
        if ($existing) {
            return redirect()->route('registration.success')->with('participant_result', [
                'name' => $existing->name,
                'phone' => $existing->phone,
                'doorprize_number' => $existing->doorprize_number,
                'already_registered' => true,
            ]);
        }

        $formattedTableNumber = str_pad((string)$validated['table_number'], 2, '0', STR_PAD_LEFT);
        $table = Table::where('table_number', $formattedTableNumber)
            ->orWhere('table_number', $validated['table_number'])
            ->first();

        $tableId = $table ? $table->id : 1;

        try {
            $result = DB::transaction(function () use ($validated, $cleanPhone, $tableId) {
                // Lock row to prevent concurrent assignment race condition
                $numberRecord = DoorprizeNumber::where('status', 'available')
                    ->lockForUpdate()
                    ->inRandomOrder()
                    ->first();

                if (!$numberRecord) {
                    return null;
                }

                $participant = Participant::create([
                    'name' => trim($validated['name']),
                    'phone' => $cleanPhone,
                    'email' => $validated['email'] ? trim($validated['email']) : null,
                    'table_id' => $tableId,
                    'doorprize_number' => $numberRecord->number,
                    'registered_at' => now(),
                ]);

                $numberRecord->update([
                    'status' => 'used',
                    'assigned_to' => $participant->id,
                    'assigned_at' => now(),
                ]);

                return $participant;
            });

            if (!$result) {
                return back()->withErrors([
                    'phone' => 'Registrasi Doorprize Telah Ditutup. Seluruh nomor doorprize telah terpakai.'
                ]);
            }

            return redirect()->route('registration.success')->with('participant_result', [
                'name' => $result->name,
                'phone' => $result->phone,
                'doorprize_number' => $result->doorprize_number,
                'already_registered' => false,
            ]);
        } catch (\Exception $e) {
            return back()->withErrors([
                'phone' => 'Terjadi kesalahan sistem. Silakan coba beberapa saat lagi.'
            ]);
        }
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

<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\DoorprizeNumber;
use App\Models\Participant;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class NumberController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Admin/Numbers', [
            'numbers' => DoorprizeNumber::with('participant:id,name,phone')->orderBy('number')->get(),
            'stats' => ['available' => DoorprizeNumber::where('status', 'available')->count(), 'used' => DoorprizeNumber::where('status', 'used')->count()],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate(['number' => ['required', 'string', 'max:32', 'regex:/^[A-Za-z0-9-]+$/', 'unique:doorprize_numbers,number']]);
        DoorprizeNumber::create(['number' => strtoupper($data['number']), 'status' => 'available']);
        return back()->with('success', 'Nomor undian ditambahkan.');
    }

    public function destroy(DoorprizeNumber $number): RedirectResponse
    {
        if ($number->status !== 'available') return back()->withErrors(['number' => 'Nomor yang sudah diberikan kepada peserta tidak dapat dihapus satu per satu. Gunakan Reset Semua untuk mengosongkan data acara.']);
        $number->delete();
        return back()->with('success', 'Nomor undian dihapus.');
    }

    public function reset(): RedirectResponse
    {
        DB::transaction(function () {
            Participant::query()->delete();
            DoorprizeNumber::query()->update(['status' => 'available', 'assigned_to' => null, 'assigned_at' => null]);
        });
        return back()->with('success', 'Data peserta, pembayaran, dan pemenang telah direset. Daftar hadiah, meja, dan nomor undian tetap tersedia.');
    }
}

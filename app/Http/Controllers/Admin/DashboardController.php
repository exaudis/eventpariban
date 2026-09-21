<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\DoorprizeNumber;
use App\Models\Participant;
use App\Models\Winner;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $totalParticipants = Participant::count();
        $usedNumbersCount = DoorprizeNumber::where('status', 'used')->count();
        $totalNumbers = DoorprizeNumber::count();
        $availableNumbersCount = DoorprizeNumber::where('status', 'available')->count();
        $totalWinners = Winner::count();

        $recentRegistrations = Participant::with('table')
            ->orderBy('registered_at', 'desc')
            ->take(10)
            ->get()
            ->map(function ($p) {
                return [
                    'id' => $p->id,
                    'name' => $p->name,
                    'table' => $p->table ? $p->table->table_number : '-',
                    'number' => $p->doorprize_number,
                    'time' => $p->registered_at ? $p->registered_at->format('H:i') : '-',
                ];
            });

        return Inertia::render('Admin/Dashboard', [
            'stats' => [
                'totalParticipants' => $totalParticipants,
                'usedNumbersCount' => $usedNumbersCount,
                'totalNumbers' => $totalNumbers,
                'availableNumbersCount' => $availableNumbersCount,
                'totalWinners' => $totalWinners,
            ],
            'recentRegistrations' => $recentRegistrations,
        ]);
    }
}

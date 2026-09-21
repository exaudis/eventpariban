<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Winner;
use Inertia\Inertia;
use Inertia\Response;

class WinnerController extends Controller
{
    public function index(): Response
    {
        $winners = Winner::with(['participant', 'prize'])
            ->orderBy('drawn_at', 'desc')
            ->get()
            ->map(function ($w, $index) {
                return [
                    'id' => $w->id,
                    'no' => $index + 1,
                    'doorprize_number' => $w->doorprize_number,
                    'name' => $w->participant ? $w->participant->name : '-',
                    'prize' => $w->prize ? $w->prize->name : '-',
                    'time' => $w->drawn_at ? $w->drawn_at->format('H:i') : '-',
                ];
            });

        return Inertia::render('Admin/Winners', [
            'winners' => $winners,
        ]);
    }
}

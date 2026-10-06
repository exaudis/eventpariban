<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Participant;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ParticipantController extends Controller
{
    public function index(Request $request): Response
    {
        $search = $request->query('search');
        $query = Participant::query();

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('doorprize_number', 'like', "%{$search}%");
            });
        }

        $participants = $query->orderBy('registered_at', 'desc')
            ->paginate(15)
            ->withQueryString()
            ->through(function ($p) {
                return [
                    'id' => $p->id,
                    'name' => $p->name,
                    'phone' => $p->phone,
                    'email' => $p->email,
                    'age' => $p->age,
                    'doorprize_number' => $p->doorprize_number ?? '-',
                    'registered_at' => $p->registered_at ? $p->registered_at->format('d/m/Y H:i') : '-',
                ];
            });

        return Inertia::render('Admin/Participants', [
            'participants' => $participants,
            'filters' => [
                'search' => $search ?? '',
            ],
        ]);
    }
}

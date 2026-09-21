<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Participant;
use App\Models\Table;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ParticipantController extends Controller
{
    public function index(Request $request): Response
    {
        $search = $request->query('search');
        $tableFilter = $request->query('table');

        $query = Participant::with('table');

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%")
                  ->orWhere('doorprize_number', 'like', "%{$search}%");
            });
        }

        if ($tableFilter) {
            $query->whereHas('table', function ($q) use ($tableFilter) {
                $q->where('table_number', $tableFilter);
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
                    'email' => $p->email ?? '-',
                    'table' => $p->table ? $p->table->table_number : '-',
                    'doorprize_number' => $p->doorprize_number ?? '-',
                    'registered_at' => $p->registered_at ? $p->registered_at->format('d/m/Y H:i') : '-',
                ];
            });

        $tables = Table::orderBy('table_number')->get(['id', 'table_number']);

        return Inertia::render('Admin/Participants', [
            'participants' => $participants,
            'filters' => [
                'search' => $search ?? '',
                'table' => $tableFilter ?? '',
            ],
            'tables' => $tables,
        ]);
    }
}

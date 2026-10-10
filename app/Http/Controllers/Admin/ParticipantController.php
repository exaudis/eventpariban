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

    public function destroy(Participant $participant): RedirectResponse
    {
        $name = $participant->name;

        DB::transaction(function () use ($participant) {
            $lockedParticipant = Participant::query()
                ->whereKey($participant->id)
                ->lockForUpdate()
                ->firstOrFail();

            $numbers = DoorprizeNumber::query()
                ->where(function ($query) use ($lockedParticipant) {
                    $query->where('assigned_to', $lockedParticipant->id);

                    if ($lockedParticipant->doorprize_number) {
                        $query->orWhere('number', $lockedParticipant->doorprize_number);
                    }
                })
                ->lockForUpdate()
                ->get();

            foreach ($numbers as $number) {
                $number->update([
                    'status' => 'available',
                    'assigned_to' => null,
                    'assigned_at' => null,
                ]);
            }

            // Winner rows are removed by the participant foreign-key cascade.
            $lockedParticipant->delete();
        });

        return back()->with('success', "Peserta {$name} berhasil dihapus. Nomor undiannya kembali tersedia.");
    }
}

<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Participant;
use App\Models\Prize;
use App\Models\Winner;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DrawController extends Controller
{
    public function index(): Response
    {
        $prizes = Prize::where('status', 'active')->get();
        $winnerParticipantIds = Winner::pluck('participant_id');

        $eligibleCount = Participant::whereNotNull('doorprize_number')
            ->whereNotIn('id', $winnerParticipantIds)
            ->count();

        // Also fetch all available doorprize numbers for ticker animation
        $candidateNumbers = Participant::whereNotNull('doorprize_number')
            ->whereNotIn('id', $winnerParticipantIds)
            ->pluck('doorprize_number');

        return Inertia::render('Admin/Draw', [
            'prizes' => $prizes,
            'eligibleCount' => $eligibleCount,
            'candidateNumbers' => $candidateNumbers,
        ]);
    }

    /**
     * Randomly pick a candidate for temporary display.
     */
    public function draw(Request $request): JsonResponse
    {
        $request->validate([
            'prize_id' => ['required', 'exists:prizes,id'],
        ]);

        $winnerParticipantIds = Winner::pluck('participant_id');

        $candidate = Participant::whereNotNull('doorprize_number')
            ->whereNotIn('id', $winnerParticipantIds)
            ->inRandomOrder()
            ->first();

        if (!$candidate) {
            return response()->json([
                'success' => false,
                'message' => 'Tidak ada peserta yang memenuhi syarat untuk diundi.'
            ], 422);
        }

        $prize = Prize::find($request->prize_id);

        return response()->json([
            'success' => true,
            'candidate' => [
                'participant_id' => $candidate->id,
                'name' => $candidate->name,
                'doorprize_number' => $candidate->doorprize_number,
                'phone' => $candidate->phone,
                'prize_id' => $prize->id,
                'prize_name' => $prize->name,
            ]
        ]);
    }

    /**
     * Confirm a winner and persist to database.
     */
    public function confirm(Request $request): JsonResponse|RedirectResponse
    {
        $validated = $request->validate([
            'participant_id' => ['required', 'exists:participants,id'],
            'prize_id' => ['required', 'exists:prizes,id'],
        ]);

        try {
            $winner = DB::transaction(function () use ($validated) {
                // Double check rule 20: 1 participant = max 1 prize
                $existingWinner = Winner::where('participant_id', $validated['participant_id'])->first();
                if ($existingWinner) {
                    throw new \Exception('Peserta ini sudah pernah menjadi pemenang.');
                }

                $participant = Participant::findOrFail($validated['participant_id']);
                $prize = Prize::findOrFail($validated['prize_id']);

                return Winner::create([
                    'participant_id' => $participant->id,
                    'prize_id' => $prize->id,
                    'doorprize_number' => $participant->doorprize_number,
                    'drawn_at' => now(),
                ]);
            });

            if ($request->wantsJson()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Pemenang berhasil dikonfirmasi!',
                    'winner' => $winner->load(['participant', 'prize']),
                ]);
            }

            return redirect()->back()->with('success', 'Pemenang berhasil dikonfirmasi!');
        } catch (\Exception $e) {
            if ($request->wantsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => $e->getMessage()
                ], 422);
            }

            return redirect()->back()->withErrors(['error' => $e->getMessage()]);
        }
    }
}

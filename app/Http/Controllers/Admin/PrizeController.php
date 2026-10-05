<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Prize;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class PrizeController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Admin/Prizes', ['prizes' => Prize::withCount('winners')->orderBy('id')->get()]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate(['name' => ['required', 'string', 'max:255'], 'description' => ['nullable', 'string'], 'quantity' => ['required', 'integer', 'min:1'], 'status' => ['required', Rule::in(['active', 'inactive'])]]);
        Prize::create($data);
        return back()->with('success', 'Hadiah ditambahkan.');
    }

    public function update(Request $request, Prize $prize): RedirectResponse
    {
        $data = $request->validate(['name' => ['required', 'string', 'max:255'], 'description' => ['nullable', 'string'], 'quantity' => ['required', 'integer', 'min:' . max(1, $prize->winners()->count())], 'status' => ['required', Rule::in(['active', 'inactive'])]]);
        $prize->update($data);
        return back()->with('success', 'Hadiah diperbarui.');
    }

    public function destroy(Prize $prize): RedirectResponse
    {
        if ($prize->winners()->exists()) return back()->withErrors(['prize' => 'Hadiah yang sudah memiliki pemenang tidak dapat dihapus.']);
        $prize->delete();
        return back()->with('success', 'Hadiah dihapus.');
    }
}

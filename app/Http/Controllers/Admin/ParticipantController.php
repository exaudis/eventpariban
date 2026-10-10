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
    public function export()
    {
        $participants = Participant::query()
            ->orderBy('registered_at')
            ->get(['name', 'phone', 'email', 'age', 'doorprize_number', 'payment_method', 'payment_status', 'payment_amount', 'registered_at', 'paid_at']);

        $headers = ['Nama', 'Nomor WhatsApp', 'Email', 'Umur', 'Nomor Doorprize', 'Metode Pembayaran', 'Status Pembayaran', 'Nominal (Rp)', 'Waktu Daftar', 'Waktu Lunas'];
        $rows = $participants->map(fn ($participant) => [
            $participant->name,
            $participant->phone,
            $participant->email,
            $participant->age,
            $participant->doorprize_number,
            match ($participant->payment_method) {
                'qris' => 'QRIS',
                'onsite' => 'Bayar di Tempat',
                default => $participant->payment_method,
            },
            match ($participant->payment_status) {
                'awaiting_payment' => 'Menunggu Pembayaran',
                'pending' => 'Menunggu Verifikasi',
                'paid' => 'Lunas',
                'rejected' => 'Ditolak',
                default => $participant->payment_status,
            },
            $participant->payment_amount,
            $participant->registered_at?->format('d/m/Y H:i'),
            $participant->paid_at?->format('d/m/Y H:i'),
        ]);

        if (!class_exists(\ZipArchive::class)) {
            abort(500, 'Ekstensi PHP zip belum aktif. Hubungi dukungan hosting untuk mengaktifkannya.');
        }

        $temporaryPath = tempnam(sys_get_temp_dir(), 'participants_');
        $xlsxPath = $temporaryPath . '.xlsx';
        @unlink($temporaryPath);

        $zip = new \ZipArchive();
        if ($zip->open($xlsxPath, \ZipArchive::CREATE | \ZipArchive::OVERWRITE) !== true) {
            abort(500, 'Tidak dapat membuat file Excel.');
        }

        $zip->addFromString('[Content_Types].xml', '<?xml version="1.0" encoding="UTF-8"?>' .
            '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">' .
            '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>' .
            '<Default Extension="xml" ContentType="application/xml"/>' .
            '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>' .
            '<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>' .
            '</Types>');
        $zip->addFromString('_rels/.rels', '<?xml version="1.0" encoding="UTF-8"?>' .
            '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' .
            '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>' .
            '</Relationships>');
        $zip->addFromString('xl/workbook.xml', '<?xml version="1.0" encoding="UTF-8"?>' .
            '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">' .
            '<sheets><sheet name="Data Peserta" sheetId="1" r:id="rId1"/></sheets></workbook>');
        $zip->addFromString('xl/_rels/workbook.xml.rels', '<?xml version="1.0" encoding="UTF-8"?>' .
            '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' .
            '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>' .
            '</Relationships>');

        $allRows = collect([$headers])->concat($rows);
        $sheetRows = '';
        foreach ($allRows as $rowIndex => $row) {
            $cells = '';
            foreach (array_values($row) as $columnIndex => $value) {
                $column = '';
                $number = $columnIndex + 1;
                while ($number > 0) {
                    $remainder = ($number - 1) % 26;
                    $column = chr(65 + $remainder) . $column;
                    $number = intdiv($number - 1, 26);
                }
                $cellRef = $column . ($rowIndex + 1);
                if (is_numeric($value) && $value !== null && $columnIndex !== 1 && $columnIndex !== 4) {
                    $cells .= '<c r="' . $cellRef . '"><v>' . (int) $value . '</v></c>';
                } else {
                    $text = (string) ($value ?? '');
                    $text = preg_replace('/[^\x{9}\x{A}\x{D}\x{20}-\x{D7FF}\x{E000}-\x{FFFD}\x{10000}-\x{10FFFF}]/u', '', $text) ?? '';
                    $escaped = htmlspecialchars($text, ENT_XML1 | ENT_QUOTES, 'UTF-8');
                    $cells .= '<c r="' . $cellRef . '" t="inlineStr"><is><t xml:space="preserve">' . $escaped . '</t></is></c>';
                }
            }
            $sheetRows .= '<row r="' . ($rowIndex + 1) . '">' . $cells . '</row>';
        }

        $zip->addFromString('xl/worksheets/sheet1.xml', '<?xml version="1.0" encoding="UTF-8"?>' .
            '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>' . $sheetRows . '</sheetData></worksheet>');
        $zip->close();

        return response()->download($xlsxPath, 'data-peserta-' . now()->format('Ymd-His') . '.xlsx', [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ])->deleteFileAfterSend(true);
    }

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

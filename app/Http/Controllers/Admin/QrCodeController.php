<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Table;
use BaconQrCode\Renderer\Image\SvgImageBackEnd;
use BaconQrCode\Renderer\ImageRenderer;
use BaconQrCode\Renderer\RendererStyle\RendererStyle;
use BaconQrCode\Writer;
use Inertia\Inertia;
use Inertia\Response;

class QrCodeController extends Controller
{
    public function index(): Response
    {
        $baseUrl = config('app.url', 'http://localhost:8000');

        $tables = Table::orderBy('table_number')->get()->map(function ($t) use ($baseUrl) {
            $registerUrl = "{$baseUrl}/register?table={$t->table_number}";

            $renderer = new ImageRenderer(
                new RendererStyle(200, 1),
                new SvgImageBackEnd()
            );
            $writer = new Writer($renderer);
            $svgString = $writer->writeString($registerUrl);

            return [
                'id' => $t->id,
                'table_number' => $t->table_number,
                'url' => $registerUrl,
                'svg' => $svgString,
            ];
        });

        return Inertia::render('Admin/QrCodes', [
            'tables' => $tables,
        ]);
    }
}

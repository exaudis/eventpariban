<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

$app = Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->redirectTo(
            guests: '/admin/login',
            users: '/admin/dashboard'
        );

        $middleware->web(append: [
            \App\Http\Middleware\HandleInertiaRequests::class,
            \Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();

$externalEnvName = basename($app->basePath()).'.env';
$externalEnvPath = dirname($app->basePath()).DIRECTORY_SEPARATOR.$externalEnvName;
if (is_file($externalEnvPath)) {
    $app->useEnvironmentPath(dirname($externalEnvPath));
    $app->loadEnvironmentFrom($externalEnvName);
}

return $app;

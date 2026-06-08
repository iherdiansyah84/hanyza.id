<?php

use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::post('/locale', function (\Illuminate\Http\Request $request) {
    $request->validate([
        'locale' => 'required|in:en,id',
    ]);

    session()->put('locale', $request->locale);

    return back()->withCookie(cookie()->forever('locale', $request->locale));
})->name('locale.set');

Route::get('/product/{slug}', function ($slug) {
    return inertia('product/show', [
        'slug' => $slug
    ]);
})->name('product.show');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
});

require __DIR__.'/settings.php';

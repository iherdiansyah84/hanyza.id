<?php

use Illuminate\Support\Facades\Route;

use App\Models\Product;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\AddressController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\VoucherController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\PointsController;
use App\Http\Controllers\CheckoutController;
use App\Http\Controllers\VendorCategoryController;
use App\Http\Controllers\SubProductController;
use App\Http\Controllers\VendorController;
use App\Http\Controllers\PurchasePricingController;

Route::get('/', function () {
    $products = Product::with('category.parent.parent')->where('status', 'active')->latest()->take(8)->get();
    $vouchers = \App\Models\Voucher::latest()->take(4)->get();
    return inertia('welcome', [
        'products' => $products,
        'vouchers' => $vouchers
    ]);
})->name('home');

Route::post('/locale', function (\Illuminate\Http\Request $request) {
    $request->validate([
        'locale' => 'required|in:en,id',
    ]);

    session()->put('locale', $request->locale);

    return back()->withCookie(cookie()->forever('locale', $request->locale));
})->name('locale.set');

Route::get('/product/{slug}', function ($slug) {
    $product = Product::with('category.parent.parent')->where('slug', $slug)->firstOrFail();
    $relatedProducts = Product::where('id', '!=', $product->id)
        ->where('status', 'active')
        ->latest()
        ->take(4)
        ->get();
    return inertia('product/show', [
        'product' => $product,
        'relatedProducts' => $relatedProducts
    ]);
})->name('product.show');

Route::middleware(['auth', 'verified'])->group(function () {
    // Address CRUD
    Route::resource('addresses', AddressController::class)->except(['create', 'edit', 'show']);

    // Cart management
    Route::get('cart', [CartController::class, 'index'])->name('cart.index');
    Route::post('cart', [CartController::class, 'store'])->name('cart.store');
    Route::patch('cart/{cartItem}', [CartController::class, 'update'])->name('cart.update');
    Route::delete('cart/{cartItem}', [CartController::class, 'destroy'])->name('cart.destroy');

    // Points claim
    Route::post('points/claim', [PointsController::class, 'claim'])->name('points.claim');

    // Checkout process
    Route::post('checkout', [CheckoutController::class, 'store'])->name('checkout.store');

    // Orders management & tracking
    Route::get('orders', [\App\Http\Controllers\OrderController::class, 'index'])->name('orders.index');
    Route::post('orders/{order}/pay', [\App\Http\Controllers\OrderController::class, 'pay'])->name('orders.pay');
    Route::patch('orders/{order}/status', [\App\Http\Controllers\OrderController::class, 'updateStatus'])->name('orders.updateStatus');

    Route::middleware(['seller'])->group(function () {
        Route::inertia('dashboard', 'dashboard')->name('dashboard');
        Route::resource('categories', CategoryController::class);
        Route::resource('products', ProductController::class);
        Route::resource('vouchers', VoucherController::class)->except(['create', 'edit', 'show']);
    });

    Route::middleware(['master'])->group(function () {
        Route::resource('users', UserController::class)->except(['create', 'edit', 'show']);
        Route::resource('vendor-categories', VendorCategoryController::class)->except(['create', 'edit', 'show']);
        Route::resource('sub-products', SubProductController::class)->except(['create', 'edit', 'show']);
        Route::resource('vendors', VendorController::class)->except(['create', 'edit', 'show']);
        Route::resource('purchase-pricings', PurchasePricingController::class)->except(['create', 'edit', 'show']);
    });
});

require __DIR__.'/settings.php';

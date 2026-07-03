<?php

namespace App\Http\Controllers;

use App\Models\PurchasePricing;
use App\Models\Product;
use App\Models\Vendor;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PurchasePricingController extends Controller
{
    public function index(Request $request)
    {
        $query = PurchasePricing::with(['product', 'vendor']);

        if ($search = $request->input('search')) {
            $query->whereHas('product', function ($q) use ($search) {
                $q->where('name_en', 'like', "%{$search}%")
                  ->orWhere('name_id', 'like', "%{$search}%")
                  ->orWhere('sku', 'like', "%{$search}%");
            })->orWhereHas('vendor', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%");
            });
        }

        $pricings = $query->latest()->paginate(10)->withQueryString();
        $products = Product::where('status', 'active')->orderBy('name_id', 'asc')->get(['id', 'name_en', 'name_id']);
        $vendors = Vendor::orderBy('name', 'asc')->get(['id', 'name']);

        return Inertia::render('purchase-pricings/index', [
            'pricings' => $pricings,
            'products' => $products,
            'vendors' => $vendors,
            'filters' => $request->only(['search']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'vendor_id' => 'required|exists:vendors,id',
            'purchase_price' => 'required|numeric|min:0',
            'selling_price' => 'required|numeric|min:0',
            'notes' => 'nullable|string',
        ]);

        PurchasePricing::create($validated);

        return redirect()->route('purchase-pricings.index')->with('success', 'Purchase pricing record created successfully.');
    }

    public function update(Request $request, PurchasePricing $purchasePricing)
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'vendor_id' => 'required|exists:vendors,id',
            'purchase_price' => 'required|numeric|min:0',
            'selling_price' => 'required|numeric|min:0',
            'notes' => 'nullable|string',
        ]);

        $purchasePricing->update($validated);

        return redirect()->route('purchase-pricings.index')->with('success', 'Purchase pricing record updated successfully.');
    }

    public function destroy(PurchasePricing $purchasePricing)
    {
        $purchasePricing->delete();

        return redirect()->route('purchase-pricings.index')->with('success', 'Purchase pricing record deleted successfully.');
    }
}

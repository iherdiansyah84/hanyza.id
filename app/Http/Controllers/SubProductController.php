<?php

namespace App\Http\Controllers;

use App\Models\SubProduct;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SubProductController extends Controller
{
    public function index(Request $request)
    {
        $query = SubProduct::with('product');

        if ($search = $request->input('search')) {
            $query->where('name', 'like', "%{$search}%")
                  ->orWhere('sku', 'like', "%{$search}%")
                  ->orWhereHas('product', function ($q) use ($search) {
                      $q->where('name_en', 'like', "%{$search}%")
                        ->orWhere('name_id', 'like', "%{$search}%");
                  });
        }

        $subProducts = $query->latest()->paginate(10)->withQueryString();
        $products = Product::where('status', 'active')->orderBy('name_id', 'asc')->get(['id', 'name_en', 'name_id']);

        return Inertia::render('sub-products/index', [
            'subProducts' => $subProducts,
            'products' => $products,
            'filters' => $request->only(['search']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'name' => 'required|string|max:255',
            'sku' => 'required|string|max:100|unique:sub_products,sku',
            'price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
        ]);

        SubProduct::create($validated);

        return redirect()->route('sub-products.index')->with('success', 'Sub product created successfully.');
    }

    public function update(Request $request, SubProduct $subProduct)
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'name' => 'required|string|max:255',
            'sku' => 'required|string|max:100|unique:sub_products,sku,' . $subProduct->id,
            'price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
        ]);

        $subProduct->update($validated);

        return redirect()->route('sub-products.index')->with('success', 'Sub product updated successfully.');
    }

    public function destroy(SubProduct $subProduct)
    {
        $subProduct->delete();

        return redirect()->route('sub-products.index')->with('success', 'Sub product deleted successfully.');
    }
}

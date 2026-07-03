<?php

namespace App\Http\Controllers;

use App\Models\VendorCategory;
use Illuminate\Http\Request;
use Inertia\Inertia;

class VendorCategoryController extends Controller
{
    public function index(Request $request)
    {
        $query = VendorCategory::query();

        if ($search = $request->input('search')) {
            $query->where('name', 'like', "%{$search}%")
                  ->orWhere('code', 'like', "%{$search}%");
        }

        $categories = $query->latest()->paginate(10)->withQueryString();

        return Inertia::render('vendor-categories/index', [
            'categories' => $categories,
            'filters' => $request->only(['search']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:vendor_categories,code',
            'description' => 'nullable|string',
        ]);

        VendorCategory::create($validated);

        return redirect()->route('vendor-categories.index')->with('success', 'Vendor category created successfully.');
    }

    public function update(Request $request, VendorCategory $vendorCategory)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:vendor_categories,code,' . $vendorCategory->id,
            'description' => 'nullable|string',
        ]);

        $vendorCategory->update($validated);

        return redirect()->route('vendor-categories.index')->with('success', 'Vendor category updated successfully.');
    }

    public function destroy(VendorCategory $vendorCategory)
    {
        $vendorCategory->delete();

        return redirect()->route('vendor-categories.index')->with('success', 'Vendor category deleted successfully.');
    }
}

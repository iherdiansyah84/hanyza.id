<?php

namespace App\Http\Controllers;

use App\Models\Vendor;
use App\Models\VendorCategory;
use Illuminate\Http\Request;
use Inertia\Inertia;

class VendorController extends Controller
{
    public function index(Request $request)
    {
        $query = Vendor::with('category');

        if ($search = $request->input('search')) {
            $query->where('name', 'like', "%{$search}%")
                  ->orWhere('contact_name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
        }

        $vendors = $query->latest()->paginate(10)->withQueryString();
        $categories = VendorCategory::orderBy('name', 'asc')->get(['id', 'name', 'code']);

        return Inertia::render('vendors/index', [
            'vendors' => $vendors,
            'categories' => $categories,
            'filters' => $request->only(['search']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'vendor_category_id' => 'nullable|exists:vendor_categories,id',
            'contact_name' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:255',
        ]);

        Vendor::create($validated);

        return redirect()->route('vendors.index')->with('success', 'Vendor created successfully.');
    }

    public function update(Request $request, Vendor $vendor)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'vendor_category_id' => 'nullable|exists:vendor_categories,id',
            'contact_name' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:255',
        ]);

        $vendor->update($validated);

        return redirect()->route('vendors.index')->with('success', 'Vendor updated successfully.');
    }

    public function destroy(Vendor $vendor)
    {
        $vendor->delete();

        return redirect()->route('vendors.index')->with('success', 'Vendor deleted successfully.');
    }
}

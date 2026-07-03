<?php

namespace App\Http\Controllers;

use App\Models\Address;
use Illuminate\Http\Request;

class AddressController extends Controller
{
    public function index(Request $request)
    {
        $addresses = $request->user()->addresses()->orderBy('is_default', 'desc')->latest()->get();

        return inertia('settings/addresses', [
            'addresses' => $addresses
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'recipient_name' => 'required|string|max:255',
            'phone_number' => 'required|string|max:20',
            'address_line' => 'required|string',
            'city' => 'required|string|max:255',
            'postal_code' => 'required|string|max:10',
            'is_default' => 'nullable|boolean',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
        ]);

        $isDefault = $request->boolean('is_default');

        if ($isDefault) {
            $request->user()->addresses()->update(['is_default' => false]);
        }

        // If it's the first address, make it default
        if ($request->user()->addresses()->count() === 0) {
            $isDefault = true;
        }

        $request->user()->addresses()->create(array_merge($validated, [
            'is_default' => $isDefault
        ]));

        return back()->with('success', 'Address added successfully.');
    }

    public function update(Request $request, Address $address)
    {
        // Ensure user owns the address
        if ($address->user_id !== $request->user()->id) {
            abort(403);
        }

        $validated = $request->validate([
            'recipient_name' => 'required|string|max:255',
            'phone_number' => 'required|string|max:20',
            'address_line' => 'required|string',
            'city' => 'required|string|max:255',
            'postal_code' => 'required|string|max:10',
            'is_default' => 'nullable|boolean',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
        ]);

        $isDefault = $request->boolean('is_default');

        if ($isDefault) {
            $request->user()->addresses()->where('id', '!=', $address->id)->update(['is_default' => false]);
        }

        $address->update(array_merge($validated, [
            'is_default' => $isDefault
        ]));

        return back()->with('success', 'Address updated successfully.');
    }

    public function destroy(Request $request, Address $address)
    {
        if ($address->user_id !== $request->user()->id) {
            abort(403);
        }

        $wasDefault = $address->is_default;
        $address->delete();

        // If default address was deleted, make the latest address default
        if ($wasDefault) {
            $latest = $request->user()->addresses()->latest()->first();
            if ($latest) {
                $latest->update(['is_default' => true]);
            }
        }

        return back()->with('success', 'Address deleted successfully.');
    }
}

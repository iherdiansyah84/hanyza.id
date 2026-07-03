<?php

namespace App\Http\Controllers;

use App\Models\Voucher;
use Illuminate\Http\Request;

class VoucherController extends Controller
{
    public function index(Request $request)
    {
        // Only sellers can access
        if (! $request->user()->isSeller()) {
            abort(403);
        }

        $vouchers = $request->user()->vouchers()->latest()->get();

        return inertia('vouchers/index', [
            'vouchers' => $vouchers
        ]);
    }

    public function store(Request $request)
    {
        if (! $request->user()->isSeller()) {
            abort(403);
        }

        $validated = $request->validate([
            'code' => 'required|string|unique:vouchers,code|max:50',
            'discount_amount' => 'required|numeric|min:0',
            'min_spend' => 'required|numeric|min:0',
        ]);

        $request->user()->vouchers()->create(array_merge($validated, [
            'code' => strtoupper($validated['code'])
        ]));

        return back()->with('success', 'Voucher created successfully.');
    }

    public function update(Request $request, Voucher $voucher)
    {
        if (! $request->user()->isSeller() || $voucher->seller_id !== $request->user()->id) {
            abort(403);
        }

        $validated = $request->validate([
            'code' => 'required|string|max:50|unique:vouchers,code,' . $voucher->id,
            'discount_amount' => 'required|numeric|min:0',
            'min_spend' => 'required|numeric|min:0',
        ]);

        $voucher->update(array_merge($validated, [
            'code' => strtoupper($validated['code'])
        ]));

        return back()->with('success', 'Voucher updated successfully.');
    }

    public function destroy(Request $request, Voucher $voucher)
    {
        if (! $request->user()->isSeller() || $voucher->seller_id !== $request->user()->id) {
            abort(403);
        }

        $voucher->delete();

        return back()->with('success', 'Voucher deleted successfully.');
    }
}

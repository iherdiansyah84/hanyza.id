<?php

namespace App\Http\Controllers;

use App\Models\CartItem;
use App\Models\Voucher;
use App\Models\Product;
use Illuminate\Http\Request;

class CartController extends Controller
{
    public function index(Request $request)
    {
        $cartItems = $request->user()->cartItems()->with('product')->get();
        $addresses = $request->user()->addresses()->orderBy('is_default', 'desc')->latest()->get();
        
        // Retrieve all vouchers available in the store
        $vouchers = Voucher::with('seller')->get();

        return inertia('cart', [
            'cartItems' => $cartItems,
            'addresses' => $addresses,
            'vouchers' => $vouchers,
            'userPoints' => $request->user()->hany_points,
            'hanypayBalance' => $request->user()->hanypay_balance,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:1',
            'color' => 'nullable|string',
            'size' => 'nullable|string',
        ]);

        $user = $request->user();
        $product = Product::findOrFail($validated['product_id']);

        // Check if there is enough stock
        if ($product->stock < $validated['quantity']) {
            return back()->withErrors(['quantity' => 'Not enough stock available.']);
        }

        // Check if the item already exists in the cart with the same color/size
        $existing = $user->cartItems()
            ->where('product_id', $validated['product_id'])
            ->where('color', $validated['color'])
            ->where('size', $validated['size'])
            ->first();

        if ($existing) {
            $newQuantity = $existing->quantity + $validated['quantity'];
            if ($product->stock < $newQuantity) {
                return back()->withErrors(['quantity' => 'Cannot add more. Not enough stock available.']);
            }
            $existing->update(['quantity' => $newQuantity]);
        } else {
            $user->cartItems()->create($validated);
        }

        return back()->with('success', 'Product added to cart.');
    }

    public function update(Request $request, CartItem $cartItem)
    {
        if ($cartItem->user_id !== $request->user()->id) {
            abort(403);
        }

        $validated = $request->validate([
            'quantity' => 'required|integer|min:1'
        ]);

        $product = $cartItem->product;
        if ($product->stock < $validated['quantity']) {
            return back()->withErrors(['quantity' => 'Not enough stock available.']);
        }

        $cartItem->update($validated);

        return back()->with('success', 'Cart updated.');
    }

    public function destroy(Request $request, CartItem $cartItem)
    {
        if ($cartItem->user_id !== $request->user()->id) {
            abort(403);
        }

        $cartItem->delete();

        return back()->with('success', 'Item removed from cart.');
    }
}

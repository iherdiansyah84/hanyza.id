<?php

namespace App\Http\Controllers;

use App\Models\Address;
use App\Models\CartItem;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Voucher;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CheckoutController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'address_id' => 'required|exists:addresses,id',
            'shipping_method' => 'required|in:reguler,express',
            'protection_enabled' => 'required|boolean',
            'payment_method' => 'required|in:COD,HanyPay,QRIS',
            'voucher_id' => 'nullable|exists:vouchers,id',
            'use_points' => 'required|boolean',
        ]);

        $user = $request->user();
        $cartItems = $user->cartItems()->with('product')->get();

        if ($cartItems->isEmpty()) {
            return back()->withErrors(['checkout' => 'Your cart is empty.']);
        }

        // Validate address ownership
        $address = Address::where('id', $validated['address_id'])->where('user_id', $user->id)->firstOrFail();

        // 1. Calculate costs
        $subtotal = 0;
        foreach ($cartItems as $item) {
            $product = $item->product;
            if ($product->stock < $item->quantity) {
                return back()->withErrors(['checkout' => "Product '{$product->name_en}' is out of stock."]);
            }
            $subtotal += ($product->sale_price ?? $product->price) * $item->quantity;
        }

        // Shipping fee
        $shippingFee = $validated['shipping_method'] === 'express' ? 25000 : 10000;

        // Protection fee (simulated insurance)
        $protectionFee = $validated['protection_enabled'] ? 10000 : 0;

        // Voucher discount
        $discount = 0;
        if ($validated['voucher_id']) {
            $voucher = Voucher::findOrFail($validated['voucher_id']);
            if ($subtotal >= $voucher->min_spend) {
                $discount = $voucher->discount_amount;
            } else {
                return back()->withErrors(['checkout' => "Minimum spend of Rp {$voucher->min_spend} not met for this voucher."]);
            }
        }

        // Points discount (1 Point Hany = Rp 1,000)
        $pointsDiscount = 0;
        $pointsToDeduct = 0;
        if ($validated['use_points']) {
            $maxPossibleDiscount = max(0, $subtotal - $discount);
            $pointsDiscount = min($maxPossibleDiscount, $user->hany_points * 1000);
            $pointsToDeduct = (int) ceil($pointsDiscount / 1000);
        }

        $total = max(0, $subtotal + $shippingFee + $protectionFee - $discount - $pointsDiscount);

        // Payment validation for HanyPay
        if ($validated['payment_method'] === 'HanyPay') {
            if ($user->hanypay_balance < $total) {
                return back()->withErrors(['checkout' => 'Insufficient HanyPay balance.']);
            }
        }

        // Execute transactions safely
        DB::transaction(function () use ($user, $cartItems, $address, $validated, $subtotal, $shippingFee, $protectionFee, $discount, $pointsDiscount, $pointsToDeduct, $total) {
            
            // Deduct HanyPay balance if applicable
            if ($validated['payment_method'] === 'HanyPay') {
                $user->decrement('hanypay_balance', $total);
            }

            // Deduct points
            if ($pointsToDeduct > 0) {
                $user->decrement('hany_points', $pointsToDeduct);
            }

            // Create Order
            $order = Order::create([
                'user_id' => $user->id,
                'recipient_name' => $address->recipient_name,
                'phone_number' => $address->phone_number,
                'address_line' => $address->address_line,
                'city' => $address->city,
                'postal_code' => $address->postal_code,
                'shipping_method' => $validated['shipping_method'],
                'protection_enabled' => $validated['protection_enabled'],
                'payment_method' => $validated['payment_method'],
                'subtotal' => $subtotal,
                'protection_fee' => $protectionFee,
                'shipping_fee' => $shippingFee,
                'discount' => $discount,
                'points_discount' => $pointsDiscount,
                'total' => $total,
                'status' => 'completed'
            ]);

            // Save order items & decrement stock
            foreach ($cartItems as $item) {
                $product = $item->product;
                $product->decrement('stock', $item->quantity);

                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $product->id,
                    'product_name' => app()->getLocale() === 'id' ? $product->name_id : $product->name_en,
                    'quantity' => $item->quantity,
                    'price' => $product->sale_price ?? $product->price,
                    'color' => $item->color,
                    'size' => $item->size,
                ]);
            }

            // Clear Cart
            $user->cartItems()->delete();
        });

        return redirect()->route('dashboard')->with('success', 'Order placed successfully!');
    }
}

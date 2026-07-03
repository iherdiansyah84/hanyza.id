<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Services\NotificationService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OrderController extends Controller
{
    /**
     * Display listing of orders for buyers/sellers.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        $mode = $request->query('mode');

        if ($user->role === 'master') {
            if ($mode === 'buyer') {
                $orders = Order::where('user_id', $user->id)
                    ->with('items')
                    ->orderBy('id', 'desc')
                    ->get();
            } else {
                $orders = Order::with(['items', 'user'])
                    ->orderBy('id', 'desc')
                    ->get();
            }
        } elseif ($user->role === 'seller') {
            $orders = Order::with(['items', 'user'])
                ->orderBy('id', 'desc')
                ->get();
        } else {
            $orders = Order::where('user_id', $user->id)
                ->with('items')
                ->orderBy('id', 'desc')
                ->get();
        }

        return Inertia::render('orders/index', [
            'orders' => $orders,
        ]);
    }

    /**
     * Confirm/Simulate payment proof submission.
     */
    public function pay(Order $order): RedirectResponse
    {
        // Enforce ownership
        if ($order->user_id !== auth()->id()) {
            abort(403);
        }

        if ($order->status === 'pending') {
            $order->update([
                'status' => 'processing'
            ]);

            // Trigger payment received notification
            NotificationService::sendPaymentReceived($order);
        }

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Payment proof submitted! Seller notified.'
        ]);

        return back();
    }

    /**
     * Update order status & tracking number (Sellers only).
     */
    public function updateStatus(Request $request, Order $order): RedirectResponse
    {
        // Enforce seller role
        if (!auth()->user()->isSeller()) {
            abort(403);
        }

        $validated = $request->validate([
            'status' => 'required|in:pending,processing,shipped,delivered,cancelled',
            'tracking_number' => 'nullable|string|max:100',
        ]);

        $oldStatus = $order->status;
        $order->update($validated);

        // Send notifications based on new status
        if ($validated['status'] === 'shipped' && !empty($validated['tracking_number'])) {
            NotificationService::sendShippingUpdated($order, $validated['tracking_number']);
        } elseif ($validated['status'] === 'delivered') {
            NotificationService::sendDeliveryNotice($order);
        }

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Order status updated successfully!'
        ]);

        return back();
    }
}

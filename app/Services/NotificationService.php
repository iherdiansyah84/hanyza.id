<?php

namespace App\Services;

use App\Models\Order;
use Illuminate\Support\Facades\Log;

class NotificationService
{
    /**
     * Send Email and WhatsApp when payment proof is submitted / payment verified.
     */
    public static function sendPaymentReceived(Order $order): void
    {
        $user = $order->user;
        $amount = number_format($order->total, 0, ',', '.');
        
        $emailSubject = "Hanyza Store: Payment Received for Order #{$order->id}";
        $emailBody = "Hi {$user->name},\n\nWe have received your payment of Rp {$amount} for Order #{$order->id}.\nOur seller is preparing your package.\n\nThank you for shopping at Hanyza!";

        $waMessage = "📢 *Hanyza Notification* 📢\n\nHi *{$user->name}*,\nPayment of *Rp {$amount}* for Order *#{$order->id}* has been successfully received! \nOur seller is packaging your items. We will notify you when it ships.";

        self::logNotification($user->email, $user->phone ?? 'WhatsApp User', $emailSubject, $emailBody, $waMessage);
        self::flashToSession($emailSubject, $waMessage);
    }

    /**
     * Send Email and WhatsApp when shipping status / tracking number is updated.
     */
    public static function sendShippingUpdated(Order $order, string $trackingNumber): void
    {
        $user = $order->user;
        $carrier = strtoupper($order->shipping_method);
        
        $emailSubject = "Hanyza Store: Order #{$order->id} Has Been Shipped!";
        $emailBody = "Hi {$user->name},\n\nYour order #{$order->id} has been shipped via {$carrier}.\nYour Tracking Number (Resi) is: {$trackingNumber}.\nYou can monitor your delivery status in your dashboard.\n\nBest regards,\nHanyza Team";

        $waMessage = "🚚 *Hanyza Shipping Update* 🚚\n\nHi *{$user->name}*,\nYour Order *#{$order->id}* has been shipped!\nCourier: *{$carrier}*\nTracking Number (Resi): *{$trackingNumber}*\nTrack your package here: https://hanyza.id/orders";

        self::logNotification($user->email, $user->phone ?? 'WhatsApp User', $emailSubject, $emailBody, $waMessage);
        self::flashToSession($emailSubject, $waMessage);
    }

    /**
     * Send Email and WhatsApp when order has arrived.
     * Tells dropshipper/buyer to submit delivery verification proof.
     */
    public static function sendDeliveryNotice(Order $order): void
    {
        $user = $order->user;
        
        $emailSubject = "Hanyza Store: Package Arrived! Verify Receipt of Order #{$order->id}";
        $emailBody = "Hi {$user->name},\n\nYour package for Order #{$order->id} has arrived!\nIf you are a dropshipper, please notify your buyer and request them to verify the receipt by uploading a photo/proof of delivery.\n\nUpload proof here: http://hanyza.id/orders";

        $waMessage = "🎁 *Hanyza Delivery Notification* 🎁\n\nHi *{$user->name}*,\nYour package for Order *#{$order->id}* has arrived at the destination!\n*Attention Dropshipper:* Please request the buyer to check the contents and upload delivery proof at http://hanyza.id/orders to finalize the transaction.";

        self::logNotification($user->email, $user->phone ?? 'WhatsApp User', $emailSubject, $emailBody, $waMessage);
        self::flashToSession($emailSubject, $waMessage);
    }

    /**
     * Internal helper to log the notifications to storage/logs/notifications.log
     */
    private static function logNotification(string $email, string $phone, string $subject, string $emailBody, string $waMessage): void
    {
        $logPath = storage_path('logs/notifications.log');
        $logContent = "[" . date('Y-m-d H:i:s') . "] =========================================\n" .
                     "📧 SENDING EMAIL:\n" .
                     "To: {$email}\n" .
                     "Subject: {$subject}\n" .
                     "Body:\n{$emailBody}\n\n" .
                     "🟢 SENDING WHATSAPP:\n" .
                     "To: {$phone}\n" .
                     "Message:\n{$waMessage}\n" .
                     "=========================================\n\n";
                     
        file_put_contents($logPath, $logContent, FILE_APPEND);
        Log::info("Simulated Email and WhatsApp sent for {$email}. Logged to storage/logs/notifications.log");
    }

    /**
     * Flash notification message to session so we can display it dynamically as a beautiful toast in React
     */
    private static function flashToSession(string $emailSubject, string $waMessage): void
    {
        session()->flash('notification_sent', [
            'email_subject' => $emailSubject,
            'wa_message' => $waMessage
        ]);
    }
}

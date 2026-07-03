<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Update users table for HanyPay balance & Hany Points
        Schema::table('users', function (Blueprint $table) {
            $table->decimal('hanypay_balance', 15, 2)->default(1000000.00);
            $table->integer('hany_points')->default(0);
            $table->timestamp('last_points_claimed_at')->nullable();
            $table->integer('consecutive_claim_days')->default(0);
        });

        // Addresses Table
        Schema::create('addresses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('recipient_name');
            $table->string('phone_number');
            $table->text('address_line');
            $table->string('city');
            $table->string('postal_code');
            $table->boolean('is_default')->default(false);
            $table->timestamps();
        });

        // Vouchers Table
        Schema::create('vouchers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('seller_id')->constrained('users')->cascadeOnDelete();
            $table->string('code')->unique();
            $table->decimal('discount_amount', 15, 2);
            $table->decimal('min_spend', 15, 2)->default(0.00);
            $table->timestamps();
        });

        // Cart Items Table
        Schema::create('cart_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->integer('quantity')->default(1);
            $table->string('color')->nullable();
            $table->string('size')->nullable();
            $table->timestamps();
        });

        // Orders Table
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('recipient_name');
            $table->string('phone_number');
            $table->text('address_line');
            $table->string('city');
            $table->string('postal_code');
            $table->string('shipping_method'); // reguler, express
            $table->boolean('protection_enabled')->default(false);
            $table->string('payment_method'); // COD, HanyPay, QRIS
            $table->decimal('subtotal', 15, 2);
            $table->decimal('protection_fee', 15, 2)->default(0.00);
            $table->decimal('shipping_fee', 15, 2)->default(0.00);
            $table->decimal('discount', 15, 2)->default(0.00);
            $table->decimal('points_discount', 15, 2)->default(0.00);
            $table->decimal('total', 15, 2);
            $table->string('status')->default('completed');
            $table->timestamps();
        });

        // Order Items Table
        Schema::create('order_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_id')->nullable()->constrained()->nullOnDelete();
            $table->string('product_name');
            $table->integer('quantity');
            $table->decimal('price', 15, 2);
            $table->string('color')->nullable();
            $table->string('size')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('order_items');
        Schema::dropIfExists('orders');
        Schema::dropIfExists('cart_items');
        Schema::dropIfExists('vouchers');
        Schema::dropIfExists('addresses');
        
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['hanypay_balance', 'hany_points', 'last_points_claimed_at', 'consecutive_claim_days']);
        });
    }
};

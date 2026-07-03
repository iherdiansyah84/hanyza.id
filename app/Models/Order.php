<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'recipient_name',
        'phone_number',
        'address_line',
        'city',
        'postal_code',
        'shipping_method',
        'protection_enabled',
        'payment_method',
        'subtotal',
        'protection_fee',
        'shipping_fee',
        'discount',
        'points_discount',
        'total',
        'status'
    ];

    protected $casts = [
        'protection_enabled' => 'boolean'
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }
}

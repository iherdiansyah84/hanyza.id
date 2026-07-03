<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'product_id',
    'vendor_id',
    'purchase_price',
    'selling_price',
    'notes'
])]
class PurchasePricing extends Model
{
    use HasFactory;

    protected $appends = ['profit'];

    protected function casts(): array
    {
        return [
            'purchase_price' => 'decimal:2',
            'selling_price' => 'decimal:2',
        ];
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class, 'product_id');
    }

    public function vendor(): BelongsTo
    {
        return $this->belongsTo(Vendor::class, 'vendor_id');
    }

    /**
     * Calculate profit margin.
     */
    public function getProfitAttribute(): float
    {
        return (float) $this->selling_price - (float) $this->purchase_price;
    }
}

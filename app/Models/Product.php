<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'name_en',
    'name_id',
    'slug',
    'sku',
    'description_en',
    'description_id',
    'price',
    'sale_price',
    'stock',
    'category_id',
    'image',
    'specs',
    'status',
    'colors',
    'sizes'
])]
class Product extends Model
{
    use HasFactory;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'specs' => 'array',
            'colors' => 'array',
            'sizes' => 'array',
            'price' => 'decimal:2',
            'sale_price' => 'decimal:2',
            'stock' => 'integer',
        ];
    }

    /**
     * Get the category that owns the product.
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class, 'category_id');
    }

    /**
     * Get the variants for the product.
     */
    public function variants(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Variant::class);
    }

    /**
     * Get the sub products for the product.
     */
    public function subProducts(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(SubProduct::class);
    }

    /**
     * Get the purchase pricing records for the product.
     */
    public function purchasePricings(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(PurchasePricing::class);
    }

    /**
     * Get the cart items for the product.
     */
    public function cartItems(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(CartItem::class);
    }

    /**
     * Get the order items for the product.
     */
    public function orderItems(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(OrderItem::class);
    }
}

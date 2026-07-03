<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'name',
    'vendor_category_id',
    'contact_name',
    'phone',
    'email'
])]
class Vendor extends Model
{
    use HasFactory;

    public function category(): BelongsTo
    {
        return $this->belongsTo(VendorCategory::class, 'vendor_category_id');
    }

    public function purchasePricings(): HasMany
    {
        return $this->hasMany(PurchasePricing::class);
    }
}

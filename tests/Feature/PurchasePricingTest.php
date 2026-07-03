<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Product;
use App\Models\Category;
use App\Models\VendorCategory;
use App\Models\Vendor;
use App\Models\PurchasePricing;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PurchasePricingTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_cannot_access_vendors_or_purchase_pricings()
    {
        $this->get(route('vendors.index'))->assertRedirect(route('login'));
        $this->get(route('purchase-pricings.index'))->assertRedirect(route('login'));
    }

    public function test_buyers_cannot_access_vendors_or_purchase_pricings()
    {
        $buyer = User::factory()->create(['role' => 'buyer']);
        $this->actingAs($buyer);

        $this->get(route('vendors.index'))->assertStatus(403);
        $this->get(route('purchase-pricings.index'))->assertStatus(403);
    }

    public function test_sellers_cannot_access_vendors_or_purchase_pricings()
    {
        $seller = User::factory()->create(['role' => 'seller']);
        $this->actingAs($seller);

        $this->get(route('vendors.index'))->assertStatus(403);
        $this->get(route('purchase-pricings.index'))->assertStatus(403);
    }

    public function test_masters_can_manage_vendors()
    {
        $master = User::factory()->create(['role' => 'master']);
        $this->actingAs($master);

        $cat = VendorCategory::create(['name' => 'Distributor', 'code' => 'DST']);

        // Store
        $response = $this->post(route('vendors.store'), [
            'name' => 'PT Vendor Abadi',
            'vendor_category_id' => $cat->id,
            'contact_name' => 'Andi',
            'phone' => '08123',
            'email' => 'andi@vendor.com'
        ]);
        $response->assertRedirect(route('vendors.index'));
        $this->assertDatabaseHas('vendors', ['name' => 'PT Vendor Abadi']);

        // Update
        $vendor = Vendor::first();
        $response = $this->put(route('vendors.update', $vendor), [
            'name' => 'PT Vendor Baru',
            'vendor_category_id' => $cat->id,
            'contact_name' => 'Budi',
            'phone' => '08321',
            'email' => 'budi@vendor.com'
        ]);
        $response->assertRedirect(route('vendors.index'));
        $this->assertDatabaseHas('vendors', ['name' => 'PT Vendor Baru', 'contact_name' => 'Budi']);

        // Delete
        $response = $this->delete(route('vendors.destroy', $vendor));
        $response->assertRedirect(route('vendors.index'));
        $this->assertDatabaseMissing('vendors', ['id' => $vendor->id]);
    }

    public function test_masters_can_manage_purchase_pricings()
    {
        $master = User::factory()->create(['role' => 'master']);
        $this->actingAs($master);

        $cat = Category::create(['name' => 'Clothing', 'slug' => 'clothing']);
        $product = Product::create([
            'name_en' => 'T-Shirt',
            'name_id' => 'Kaos',
            'slug' => 't-shirt',
            'sku' => 'TSHIRT-1',
            'price' => 150000,
            'stock' => 20,
            'category_id' => $cat->id,
            'status' => 'active'
        ]);

        $vendorCat = VendorCategory::create(['name' => 'Supplier', 'code' => 'SPL']);
        $vendor = Vendor::create([
            'name' => 'Vendor Kaos',
            'vendor_category_id' => $vendorCat->id
        ]);

        // Store
        $response = $this->post(route('purchase-pricings.store'), [
            'product_id' => $product->id,
            'vendor_id' => $vendor->id,
            'purchase_price' => 50000,
            'selling_price' => 120000,
            'notes' => 'Bulk discount pricing'
        ]);
        $response->assertRedirect(route('purchase-pricings.index'));
        $this->assertDatabaseHas('purchase_pricings', [
            'product_id' => $product->id,
            'purchase_price' => 50000,
            'selling_price' => 120000
        ]);

        // Update
        $pricing = PurchasePricing::first();
        $response = $this->put(route('purchase-pricings.update', $pricing), [
            'product_id' => $product->id,
            'vendor_id' => $vendor->id,
            'purchase_price' => 45000,
            'selling_price' => 110000,
            'notes' => 'Updated discount notes'
        ]);
        $response->assertRedirect(route('purchase-pricings.index'));
        $this->assertDatabaseHas('purchase_pricings', [
            'purchase_price' => 45000,
            'selling_price' => 110000
        ]);

        // Delete
        $response = $this->delete(route('purchase-pricings.destroy', $pricing));
        $response->assertRedirect(route('purchase-pricings.index'));
        $this->assertDatabaseMissing('purchase_pricings', ['id' => $pricing->id]);
    }
}

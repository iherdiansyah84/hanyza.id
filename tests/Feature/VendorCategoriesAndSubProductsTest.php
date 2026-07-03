<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Product;
use App\Models\Category;
use App\Models\VendorCategory;
use App\Models\SubProduct;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class VendorCategoriesAndSubProductsTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_cannot_access_vendor_categories_or_sub_products()
    {
        $this->get(route('vendor-categories.index'))->assertRedirect(route('login'));
        $this->get(route('sub-products.index'))->assertRedirect(route('login'));
    }

    public function test_buyers_cannot_access_vendor_categories_or_sub_products()
    {
        $buyer = User::factory()->create(['role' => 'buyer']);
        $this->actingAs($buyer);

        $this->get(route('vendor-categories.index'))->assertStatus(403);
        $this->get(route('sub-products.index'))->assertStatus(403);
    }

    public function test_sellers_cannot_access_vendor_categories_or_sub_products()
    {
        $seller = User::factory()->create(['role' => 'seller']);
        $this->actingAs($seller);

        $this->get(route('vendor-categories.index'))->assertStatus(403);
        $this->get(route('sub-products.index'))->assertStatus(403);
    }

    public function test_masters_can_manage_vendor_categories()
    {
        $master = User::factory()->create(['role' => 'master']);
        $this->actingAs($master);

        // Store
        $response = $this->post(route('vendor-categories.store'), [
            'name' => 'Supplier Vendor',
            'code' => 'SUP',
            'description' => 'Supplier description',
        ]);
        $response->assertRedirect(route('vendor-categories.index'));
        $this->assertDatabaseHas('vendor_categories', ['code' => 'SUP']);

        // Update
        $category = VendorCategory::first();
        $response = $this->put(route('vendor-categories.update', $category), [
            'name' => 'Updated Vendor Name',
            'code' => 'SUP-UPD',
            'description' => 'New description',
        ]);
        $response->assertRedirect(route('vendor-categories.index'));
        $this->assertDatabaseHas('vendor_categories', ['code' => 'SUP-UPD', 'name' => 'Updated Vendor Name']);

        // Destroy
        $response = $this->delete(route('vendor-categories.destroy', $category));
        $response->assertRedirect(route('vendor-categories.index'));
        $this->assertDatabaseMissing('vendor_categories', ['id' => $category->id]);
    }

    public function test_masters_can_manage_sub_products()
    {
        $master = User::factory()->create(['role' => 'master']);
        $this->actingAs($master);

        $category = Category::create(['name' => 'Electronics', 'slug' => 'electronics']);
        $product = Product::create([
            'name_en' => 'Test Product',
            'name_id' => 'Produk Tes',
            'slug' => 'test-product',
            'sku' => 'PROD-1',
            'price' => 100000,
            'stock' => 10,
            'category_id' => $category->id,
            'status' => 'active'
        ]);

        // Store
        $response = $this->post(route('sub-products.store'), [
            'product_id' => $product->id,
            'name' => 'Sub Product A',
            'sku' => 'SUB-A',
            'price' => 50000,
            'stock' => 5,
        ]);
        $response->assertRedirect(route('sub-products.index'));
        $this->assertDatabaseHas('sub_products', ['sku' => 'SUB-A']);

        // Update
        $sub = SubProduct::first();
        $response = $this->put(route('sub-products.update', $sub), [
            'product_id' => $product->id,
            'name' => 'Updated Sub A',
            'sku' => 'SUB-A-UPD',
            'price' => 60000,
            'stock' => 8,
        ]);
        $response->assertRedirect(route('sub-products.index'));
        $this->assertDatabaseHas('sub_products', ['sku' => 'SUB-A-UPD', 'name' => 'Updated Sub A']);

        // Destroy
        $response = $this->delete(route('sub-products.destroy', $sub));
        $response->assertRedirect(route('sub-products.index'));
        $this->assertDatabaseMissing('sub_products', ['id' => $sub->id]);
    }
}

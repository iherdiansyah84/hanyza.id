<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Category;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): Response
    {
        $products = Product::with('category.parent.parent')
            ->orderBy('id', 'desc')
            ->get();

        // Get subcategories (categories with parents) to assign products to them
        $categories = Category::whereNotNull('parent_id')
            ->with('parent.parent')
            ->orderBy('name', 'asc')
            ->get();

        return Inertia::render('products/index', [
            'products' => $products,
            'categories' => $categories,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name_en' => 'required|string|max:255',
            'name_id' => 'required|string|max:255',
            'sku' => 'nullable|string|max:100|unique:products,sku',
            'description_en' => 'nullable|string',
            'description_id' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'sale_price' => 'nullable|numeric|min:0|lte:price',
            'stock' => 'required|integer|min:0',
            'category_id' => 'nullable|exists:categories,id',
            'image' => 'nullable|string|max:255',
            'status' => 'required|in:active,draft,archived',
            'specs_en_names' => 'nullable|array',
            'specs_en_values' => 'nullable|array',
            'specs_id_names' => 'nullable|array',
            'specs_id_values' => 'nullable|array',
            'color_codes' => 'nullable|array',
            'color_names_en' => 'nullable|array',
            'color_names_id' => 'nullable|array',
            'sizes' => 'nullable|array',
        ]);

        // Process specs array if provided
        $specs = null;
        if (!empty($validated['specs_en_names']) && !empty($validated['specs_en_values'])) {
            $enSpecs = [];
            $idSpecs = [];
            foreach ($validated['specs_en_names'] as $index => $name) {
                if (!empty($name)) {
                    $enSpecs[] = [
                        'name' => $name,
                        'val' => $validated['specs_en_values'][$index] ?? '',
                    ];
                    $idSpecs[] = [
                        'name' => $validated['specs_id_names'][$index] ?? $name,
                        'val' => $validated['specs_id_values'][$index] ?? ($validated['specs_en_values'][$index] ?? ''),
                    ];
                }
            }
            $specs = [
                'en' => $enSpecs,
                'id' => $idSpecs,
            ];
        }

        // Process colors
        $colors = null;
        if (!empty($validated['color_codes'])) {
            $colors = [];
            foreach ($validated['color_codes'] as $index => $code) {
                if (!empty($code)) {
                    $colors[] = [
                        'code' => $code,
                        'name_en' => $validated['color_names_en'][$index] ?? '',
                        'name_id' => $validated['color_names_id'][$index] ?? '',
                    ];
                }
            }
        }

        // Process sizes
        $sizes = !empty($validated['sizes']) ? array_values(array_filter($validated['sizes'])) : null;

        // Generate dynamic unique slug from English name
        $slug = Str::slug($validated['name_en']);
        $originalSlug = $slug;
        $count = 1;
        while (Product::where('slug', $slug)->exists()) {
            $slug = $originalSlug . '-' . $count++;
        }

        $product = Product::create([
            'name_en' => $validated['name_en'],
            'name_id' => $validated['name_id'],
            'slug' => $slug,
            'sku' => $validated['sku'],
            'description_en' => $validated['description_en'],
            'description_id' => $validated['description_id'],
            'price' => $validated['price'],
            'sale_price' => $validated['sale_price'],
            'stock' => $validated['stock'],
            'category_id' => $validated['category_id'] ?: null,
            'image' => $validated['image'] ?: '/images/logo.png', // default image
            'specs' => $specs,
            'colors' => $colors,
            'sizes' => $sizes,
            'status' => $validated['status'],
        ]);

        if ($colors) {
            foreach ($colors as $color) {
                $product->variants()->create([
                    'type' => 'color',
                    'color_code' => $color['code'],
                    'color_name_en' => $color['name_en'],
                    'color_name_id' => $color['name_id'],
                ]);
            }
        }

        if ($sizes) {
            foreach ($sizes as $size) {
                $product->variants()->create([
                    'type' => 'size',
                    'size' => $size,
                ]);
            }
        }

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Product created successfully!'
        ]);

        return redirect()->route('products.index');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Product $product): RedirectResponse
    {
        $validated = $request->validate([
            'name_en' => 'required|string|max:255',
            'name_id' => 'required|string|max:255',
            'sku' => 'nullable|string|max:100|unique:products,sku,' . $product->id,
            'description_en' => 'nullable|string',
            'description_id' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'sale_price' => 'nullable|numeric|min:0|lte:price',
            'stock' => 'required|integer|min:0',
            'category_id' => 'nullable|exists:categories,id',
            'image' => 'nullable|string|max:255',
            'status' => 'required|in:active,draft,archived',
            'specs_en_names' => 'nullable|array',
            'specs_en_values' => 'nullable|array',
            'specs_id_names' => 'nullable|array',
            'specs_id_values' => 'nullable|array',
            'color_codes' => 'nullable|array',
            'color_names_en' => 'nullable|array',
            'color_names_id' => 'nullable|array',
            'sizes' => 'nullable|array',
        ]);

        // Process specs array if provided
        $specs = null;
        if (!empty($validated['specs_en_names']) && !empty($validated['specs_en_values'])) {
            $enSpecs = [];
            $idSpecs = [];
            foreach ($validated['specs_en_names'] as $index => $name) {
                if (!empty($name)) {
                    $enSpecs[] = [
                        'name' => $name,
                        'val' => $validated['specs_en_values'][$index] ?? '',
                    ];
                    $idSpecs[] = [
                        'name' => $validated['specs_id_names'][$index] ?? $name,
                        'val' => $validated['specs_id_values'][$index] ?? ($validated['specs_en_values'][$index] ?? ''),
                    ];
                }
            }
            $specs = [
                'en' => $enSpecs,
                'id' => $idSpecs,
            ];
        }

        // Process colors
        $colors = null;
        if (!empty($validated['color_codes'])) {
            $colors = [];
            foreach ($validated['color_codes'] as $index => $code) {
                if (!empty($code)) {
                    $colors[] = [
                        'code' => $code,
                        'name_en' => $validated['color_names_en'][$index] ?? '',
                        'name_id' => $validated['color_names_id'][$index] ?? '',
                    ];
                }
            }
        }

        // Process sizes
        $sizes = !empty($validated['sizes']) ? array_values(array_filter($validated['sizes'])) : null;

        // If English name changed, update slug
        if ($product->name_en !== $validated['name_en']) {
            $slug = Str::slug($validated['name_en']);
            $originalSlug = $slug;
            $count = 1;
            while (Product::where('slug', $slug)->where('id', '!=', $product->id)->exists()) {
                $slug = $originalSlug . '-' . $count++;
            }
            $product->slug = $slug;
        }

        $product->name_en = $validated['name_en'];
        $product->name_id = $validated['name_id'];
        $product->sku = $validated['sku'];
        $product->description_en = $validated['description_en'];
        $product->description_id = $validated['description_id'];
        $product->price = $validated['price'];
        $product->sale_price = $validated['sale_price'];
        $product->stock = $validated['stock'];
        $product->category_id = $validated['category_id'] ?: null;
        if ($validated['image']) {
            $product->image = $validated['image'];
        }
        $product->specs = $specs;
        $product->colors = $colors;
        $product->sizes = $sizes;
        $product->status = $validated['status'];
        $product->save();

        $product->variants()->delete();

        if ($colors) {
            foreach ($colors as $color) {
                $product->variants()->create([
                    'type' => 'color',
                    'color_code' => $color['code'],
                    'color_name_en' => $color['name_en'],
                    'color_name_id' => $color['name_id'],
                ]);
            }
        }

        if ($sizes) {
            foreach ($sizes as $size) {
                $product->variants()->create([
                    'type' => 'size',
                    'size' => $size,
                ]);
            }
        }

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Product updated successfully!'
        ]);

        return redirect()->route('products.index');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Product $product): RedirectResponse
    {
        $product->delete();

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Product deleted successfully!'
        ]);

        return redirect()->route('products.index');
    }
}

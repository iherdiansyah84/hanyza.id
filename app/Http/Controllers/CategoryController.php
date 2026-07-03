<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class CategoryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): Response
    {
        // Get all categories loaded with their parent
        $categories = Category::with('parent')
            ->orderByRaw('CASE WHEN parent_id IS NULL THEN id ELSE parent_id END')
            ->orderByRaw('parent_id NULLS FIRST')
            ->orderBy('name', 'asc')
            ->get();

        // Get potential parent categories (level 1 and level 2 categories)
        $parentCategories = Category::with('parent')
            ->where(function($query) {
                $query->whereNull('parent_id')
                      ->orWhereIn('parent_id', function($subQuery) {
                          $subQuery->select('id')->from('categories')->whereNull('parent_id');
                      });
            })
            ->orderBy('name', 'asc')
            ->get();

        return Inertia::render('categories/index', [
            'categories' => $categories,
            'parentCategories' => $parentCategories,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'parent_id' => 'nullable|exists:categories,id',
            'description' => 'nullable|string|max:1000',
        ]);

        // Generate dynamic unique slug
        $slug = Str::slug($validated['name']);
        $originalSlug = $slug;
        $count = 1;
        while (Category::where('slug', $slug)->exists()) {
            $slug = $originalSlug . '-' . $count++;
        }

        Category::create([
            'name' => $validated['name'],
            'slug' => $slug,
            'parent_id' => $validated['parent_id'] ?: null,
            'description' => $validated['description'],
        ]);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Category created successfully!'
        ]);

        return redirect()->route('categories.index');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Category $category): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'parent_id' => 'nullable|exists:categories,id',
            'description' => 'nullable|string|max:1000',
        ]);

        // Avoid self-parenting
        if ($validated['parent_id'] == $category->id) {
            return back()->withErrors(['parent_id' => 'A category cannot be its own parent.']);
        }

        // Avoid parenting to its own subcategory (cycle check)
        if ($validated['parent_id']) {
            $parent = Category::find($validated['parent_id']);
            if ($parent && $parent->parent_id == $category->id) {
                return back()->withErrors(['parent_id' => 'A category cannot be parented to its own subcategory.']);
            }
        }

        // If name changed, update slug
        if ($category->name !== $validated['name']) {
            $slug = Str::slug($validated['name']);
            $originalSlug = $slug;
            $count = 1;
            while (Category::where('slug', $slug)->where('id', '!=', $category->id)->exists()) {
                $slug = $originalSlug . '-' . $count++;
            }
            $category->slug = $slug;
        }

        $category->name = $validated['name'];
        $category->parent_id = $validated['parent_id'] ?: null;
        $category->description = $validated['description'];
        $category->save();

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Category updated successfully!'
        ]);

        return redirect()->route('categories.index');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Category $category): RedirectResponse
    {
        $category->delete();

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Category deleted successfully!'
        ]);

        return redirect()->route('categories.index');
    }
}

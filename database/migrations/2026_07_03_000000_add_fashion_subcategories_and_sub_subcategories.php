<?php

use Illuminate\Database\Migrations\Migration;
use App\Models\Category;
use Illuminate\Support\Str;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $fashion = Category::where('slug', 'fashion')->first();

        if (!$fashion) {
            $fashion = Category::create([
                'name' => 'Fashion',
                'slug' => 'fashion',
                'description' => 'Fashion and wear category'
            ]);
        }

        $targetGroups = ['Laki-laki', 'Perempuan', 'Newborn', 'Child', 'Teenager', 'Adult'];
        $newSubSubs = [
            'Atasan',
            'Bawahan',
            'Pakaian Khusus',
            'Fashion Muslim',
            'Alas Kaki (Casual)',
            'Alas Kaki (Formal)',
            'Alas Kaki (Sandal)',
            'Alas Kaki (Boots)',
            'Aksesoris'
        ];

        foreach ($targetGroups as $group) {
            $subSlug = Str::slug($group);
            $subCategory = Category::where('slug', $subSlug)->first();

            if (!$subCategory) {
                $subCategory = Category::create([
                    'name' => $group,
                    'slug' => $subSlug,
                    'parent_id' => $fashion->id,
                    'description' => $group . ' fashion subcategory'
                ]);
            }

            foreach ($newSubSubs as $subSubName) {
                $subSubSlug = Str::slug($subSlug . '-' . $subSubName);
                if (!Category::where('slug', $subSubSlug)->exists()) {
                    Category::create([
                        'name' => $subSubName,
                        'slug' => $subSubSlug,
                        'parent_id' => $subCategory->id,
                        'description' => $subSubName . ' sub-subcategory under ' . $group
                    ]);
                }
            }
        }

        // Clean up the old unneeded 'gender' subcategory and its children
        $oldGender = Category::where('slug', 'gender')->first();
        if ($oldGender) {
            Category::where('parent_id', $oldGender->id)->delete();
            $oldGender->delete();
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $targetGroups = ['laki-laki', 'perempuan', 'newborn', 'child', 'teenager', 'adult'];
        $newSubSubs = [
            'Atasan',
            'Bawahan',
            'Pakaian Khusus',
            'Fashion Muslim',
            'Alas Kaki (Casual)',
            'Alas Kaki (Formal)',
            'Alas Kaki (Sandal)',
            'Alas Kaki (Boots)',
            'Aksesoris'
        ];

        $slugsToDelete = [];
        foreach ($targetGroups as $group) {
            foreach ($newSubSubs as $subSubName) {
                $slugsToDelete[] = Str::slug($group . '-' . $subSubName);
            }
        }

        Category::whereIn('slug', $slugsToDelete)->delete();
        Category::whereIn('slug', ['laki-laki', 'perempuan'])->delete();
    }
};

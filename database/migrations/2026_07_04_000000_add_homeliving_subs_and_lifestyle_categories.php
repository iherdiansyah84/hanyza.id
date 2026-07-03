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
        // 1. Home Living updates
        $homeLiving = Category::where('slug', 'home-living')->first();
        if (!$homeLiving) {
            $homeLiving = Category::create([
                'name' => 'Home Living',
                'slug' => 'home-living',
                'description' => 'Home decoration & furniture category'
            ]);
        }

        $newHomeSubs = ['Furnitur', 'Electronic', 'Storage', 'Dekorasi Rumah'];
        foreach ($newHomeSubs as $sub) {
            $slug = Str::slug($sub);
            if (!Category::where('slug', $slug)->exists()) {
                Category::create([
                    'name' => $sub,
                    'slug' => $slug,
                    'parent_id' => $homeLiving->id,
                    'description' => $sub . ' subcategory under Home Living'
                ]);
            }
        }

        // 2. Lifestyle parent and subcategories
        $lifestyle = Category::where('slug', 'lifestyle')->first();
        if (!$lifestyle) {
            $lifestyle = Category::create([
                'name' => 'Lifestyle',
                'slug' => 'lifestyle',
                'description' => 'Lifestyle, hobbies, and sports category'
            ]);
        }

        $newLifeSubs = [
            'Koleksi Hobi',
            'Alat Olahraga',
            'Souvenir dan Perlengkapan',
            'Buku dan Alat Tulis',
            'Fotografi'
        ];
        foreach ($newLifeSubs as $sub) {
            $slug = Str::slug($sub);
            if (!Category::where('slug', $slug)->exists()) {
                Category::create([
                    'name' => $sub,
                    'slug' => $slug,
                    'parent_id' => $lifestyle->id,
                    'description' => $sub . ' subcategory under Lifestyle'
                ]);
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $slugsToDelete = [
            'furnitur', 'electronic', 'storage', 'dekorasi-rumah',
            'koleksi-hobi', 'alat-olahraga', 'souvenir-dan-perlengkapan', 'buku-dan-alat-tulis', 'fotografi',
            'lifestyle'
        ];

        Category::whereIn('slug', $slugsToDelete)->delete();
    }
};

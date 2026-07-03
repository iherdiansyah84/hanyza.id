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
        if ($homeLiving) {
            $newHomeSubs = ['Makanan & Minuman', 'Perlengkapan Rumah'];
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
        }

        // 2. Lifestyle updates
        $lifestyle = Category::where('slug', 'lifestyle')->first();
        if ($lifestyle) {
            $newLifeSubs = [
                'Komputer & Aksesoris',
                'Handphone & Aksesoris',
                'Perawatan & Kecantikan',
                'Otomotif'
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
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $slugsToDelete = [
            'makanan-minuman', 'perlengkapan-rumah',
            'komputer-aksesoris', 'handphone-aksesoris', 'perawatan-kecantikan', 'otomotif'
        ];

        Category::whereIn('slug', $slugsToDelete)->delete();
    }
};

<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'role' => 'master',
        ]);

        // Create a Master User
        User::factory()->create([
            'name' => 'Master User',
            'email' => 'master@example.com',
            'role' => 'master',
        ]);

        // Create a Buyer User
        $buyer = User::factory()->create([
            'name' => 'John Buyer',
            'email' => 'buyer@example.com',
            'role' => 'buyer',
            'hanypay_balance' => 500000,
            'hany_points' => 50,
        ]);

        // Seed Categories
        $fashion = \App\Models\Category::firstOrCreate(
            ['slug' => 'fashion'],
            [
                'name' => 'Fashion',
                'description' => 'Fashion and wear category'
            ]
        );

        $fashionSubs = ['Laki-laki', 'Perempuan', 'Newborn', 'Child', 'Teenager', 'Adult'];
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

        foreach ($fashionSubs as $sub) {
            $subCategory = \App\Models\Category::firstOrCreate(
                ['slug' => \Illuminate\Support\Str::slug($sub)],
                [
                    'name' => ucfirst($sub),
                    'parent_id' => $fashion->id,
                    'description' => ucfirst($sub) . ' fashion subcategory'
                ]
            );

            foreach ($newSubSubs as $subSubName) {
                \App\Models\Category::firstOrCreate(
                    ['slug' => \Illuminate\Support\Str::slug($subCategory->slug . '-' . $subSubName)],
                    [
                        'name' => $subSubName,
                        'parent_id' => $subCategory->id,
                        'description' => $subSubName . ' sub-subcategory under ' . $subCategory->name
                    ]
                );
            }
        }

        $homeLiving = \App\Models\Category::firstOrCreate(
            ['slug' => 'home-living'],
            [
                'name' => 'Home Living',
                'description' => 'Home decoration & furniture category'
            ]
        );

        $homeSubs = ['Living Room', 'Bath Room', 'Bed Room', 'Kitchen', 'Dining Room', 'Furnitur', 'Electronic', 'Storage', 'Dekorasi Rumah', 'Makanan & Minuman', 'Perlengkapan Rumah'];
        foreach ($homeSubs as $sub) {
            \App\Models\Category::firstOrCreate(
                ['slug' => \Illuminate\Support\Str::slug($sub)],
                [
                    'name' => $sub,
                    'parent_id' => $homeLiving->id,
                    'description' => $sub . ' subcategory'
                ]
            );
        }

        $lifestyle = \App\Models\Category::firstOrCreate(
            ['slug' => 'lifestyle'],
            [
                'name' => 'Lifestyle',
                'description' => 'Lifestyle, hobbies, and sports category'
            ]
        );

        $lifestyleSubs = ['Koleksi Hobi', 'Alat Olahraga', 'Souvenir dan Perlengkapan', 'Buku dan Alat Tulis', 'Fotografi', 'Komputer & Aksesoris', 'Handphone & Aksesoris', 'Perawatan & Kecantikan', 'Otomotif'];
        foreach ($lifestyleSubs as $sub) {
            \App\Models\Category::firstOrCreate(
                ['slug' => \Illuminate\Support\Str::slug($sub)],
                [
                    'name' => $sub,
                    'parent_id' => $lifestyle->id,
                    'description' => $sub . ' subcategory'
                ]
            );
        }

        // Seed Products
        $newbornCat = \App\Models\Category::where('slug', 'newborn')->first();
        $livingRoomCat = \App\Models\Category::where('slug', 'living-room')->first();
        $adultCat = \App\Models\Category::where('slug', 'adult')->first();
        $bathRoomCat = \App\Models\Category::where('slug', 'bath-room')->first();

        \App\Models\Product::create([
            'name_en' => 'Organic Cotton Sleepsuit',
            'name_id' => 'Baju Tidur Katun Organik',
            'slug' => 'organic-cotton-sleepsuit',
            'sku' => 'FSH-NB-SLP01',
            'description_en' => 'Super soft, breathable organic cotton sleepsuit with a two-way zip for easy diaper changes and fold-over mitts to prevent scratching.',
            'description_id' => 'Baju tidur katun organik yang sangat lembut dan sejuk dengan ritsleting dua arah untuk memudahkan penggantian popok, serta sarung tangan lipat untuk mencegah garukan.',
            'price' => 149000,
            'stock' => 50,
            'category_id' => $newbornCat ? $newbornCat->id : null,
            'image' => '/images/organic_cotton_sleepsuit.png',
            'specs' => [
                'en' => [
                    ['name' => 'Material', 'val' => '100% GOTS-certified Organic Cotton.'],
                    ['name' => 'Fit', 'val' => 'Relaxed fit for maximum baby movement.'],
                    ['name' => 'Care', 'val' => 'Machine wash cold, tumble dry low.']
                ],
                'id' => [
                    ['name' => 'Material', 'val' => '100% Katun Organik bersertifikat GOTS.'],
                    ['name' => 'Kecocokan', 'val' => 'Kecocokan longgar untuk keleluasaan bergerak bayi.'],
                    ['name' => 'Perawatan', 'val' => 'Cuci dengan mesin air dingin, pengeringan putaran rendah.']
                ]
            ],
            'colors' => [
                ['code' => '#A66E53', 'name_en' => 'Earthy Brown', 'name_id' => 'Cokelat Tanah'],
                ['code' => '#D9C8B2', 'name_en' => 'Beige', 'name_id' => 'Krem'],
                ['code' => '#465662', 'name_en' => 'Slate Grey', 'name_id' => 'Abu-abu']
            ],
            'sizes' => ['Newborn', '3-6 Months', '6-12 Months'],
            'status' => 'active'
        ]);

        \App\Models\Product::create([
            'name_en' => 'Earthy Ceramic Vase',
            'name_id' => 'Vas Keramik Earthy',
            'slug' => 'earthy-ceramic-vase',
            'sku' => 'HOM-LV-VSE01',
            'description_en' => 'Hand-thrown terracotta clay vase with a matte organic finish. Perfect for minimalist homes and dried floral arrangements.',
            'description_id' => 'Vas keramik buaman tangan ini memberikan sentuhan organik pada ruangan Anda. Dibuat dengan teknik tradisional untuk memastikan keunikan pada setiap sisinya.',
            'price' => 285000,
            'stock' => 15,
            'category_id' => $livingRoomCat ? $livingRoomCat->id : null,
            'image' => '/images/earthy_ceramic_vase.png',
            'specs' => [
                'en' => [
                    ['name' => 'Material', 'val' => '100% High-quality Terracotta Clay.'],
                    ['name' => 'Dimensions', 'val' => 'Height 24cm, Diameter 15cm.'],
                    ['name' => 'Finishing', 'val' => 'Natural unglazed matte (not recommended for holding water directly for long periods).']
                ],
                'id' => [
                    ['name' => 'Material', 'val' => '100% Terracotta Clay berkualitas tinggi.'],
                    ['name' => 'Dimensi', 'val' => 'Tinggi 24cm, Diameter 15cm.'],
                    ['name' => 'Finishing', 'val' => 'Matte alami tanpa glasir (tidak direkomendasikan untuk menampung air langsung dalam waktu lama).']
                ]
            ],
            'colors' => [
                ['code' => '#D9C8B2', 'name_en' => 'Beige', 'name_id' => 'Krem'],
                ['code' => '#A66E53', 'name_en' => 'Earthy Brown', 'name_id' => 'Cokelat Tanah']
            ],
            'sizes' => ['Small', 'Medium', 'Large'],
            'status' => 'active'
        ]);

        \App\Models\Product::create([
            'name_en' => 'Classic Linen Shirt',
            'name_id' => 'Kemeja Linen Klasik',
            'slug' => 'classic-linen-shirt',
            'sku' => 'FSH-AD-SHR01',
            'description_en' => 'Breathable organic linen shirt with a modern tailored cut, perfect for warm days and effortless smart-casual style.',
            'description_id' => 'Kemeja linen organik yang sejuk dengan potongan modis, sangat cocok untuk cuaca hangat dan gaya kasual elegan sehari-hari.',
            'price' => 320000,
            'stock' => 30,
            'category_id' => $adultCat ? $adultCat->id : null,
            'image' => '/images/classic_linen_shirt.png',
            'specs' => [
                'en' => [
                    ['name' => 'Material', 'val' => '100% French Organic Linen.'],
                    ['name' => 'Weave', 'val' => 'Classic lightweight slub texture.'],
                    ['name' => 'Fit', 'val' => 'Regular fit, true to size.']
                ],
                'id' => [
                    ['name' => 'Material', 'val' => '100% Linen Organik Prancis.'],
                    ['name' => 'Tenun', 'val' => 'Tekstur slub ringan klasik.'],
                    ['name' => 'Kecocokan', 'val' => 'Ukuran standar (fit reguler).']
                ]
            ],
            'colors' => [
                ['code' => '#465662', 'name_en' => 'Slate Grey', 'name_id' => 'Abu-abu'],
                ['code' => '#D9C8B2', 'name_en' => 'Beige', 'name_id' => 'Krem']
            ],
            'sizes' => ['S', 'M', 'L', 'XL'],
            'status' => 'active'
        ]);

        \App\Models\Product::create([
            'name_en' => 'Premium Bath Towel Set',
            'name_id' => 'Set Handuk Mandi Premium',
            'slug' => 'premium-bath-towel-set',
            'sku' => 'HOM-BT-TWL01',
            'description_en' => 'Plush, ultra-absorbent organic cotton bath towel set. Bring a spa-like comfort to your daily bathroom routine.',
            'description_id' => 'Set handuk mandi katun organik yang tebal dan sangat menyerap. Bawa kenyamanan ala spa ke rutinitas kamar mandi harian Anda.',
            'price' => 195000,
            'stock' => 25,
            'category_id' => $bathRoomCat ? $bathRoomCat->id : null,
            'image' => '/images/premium_bath_towel_set.png',
            'specs' => [
                'en' => [
                    ['name' => 'Material', 'val' => '100% Organic Cotton Terry Cloth.'],
                    ['name' => 'Set Includes', 'val' => '2 Bath towels (70x140cm), 2 Hand towels (40x70cm).'],
                    ['name' => 'Weight', 'val' => '600 GSM (Grams per Square Meter).']
                ],
                'id' => [
                    ['name' => 'Material', 'val' => '100% Kain Terry Katun Organik.'],
                    ['name' => 'Isi Set', 'val' => '2 Handuk mandi (70x140cm), 2 Handuk tangan (40x70cm).'],
                    ['name' => 'Berat', 'val' => '600 GSM (Gram per Meter Persegi).']
                ]
            ],
            'colors' => [
                ['code' => '#D9C8B2', 'name_en' => 'Beige', 'name_id' => 'Krem'],
                ['code' => '#465662', 'name_en' => 'Slate Grey', 'name_id' => 'Abu-abu']
            ],
            'sizes' => ['Standard Set'],
            'status' => 'active'
        ]);

        \App\Models\Product::create([
            'name_en' => 'Ribbed Ceramic Vase',
            'name_id' => 'Vas Keramik Ribbed',
            'slug' => 'ribbed-ceramic-vase',
            'sku' => 'HOM-LV-VSE02',
            'description_en' => 'Modern minimalist collection',
            'description_id' => 'Koleksi minimalis modern',
            'price' => 195000,
            'stock' => 20,
            'category_id' => $livingRoomCat ? $livingRoomCat->id : null,
            'image' => '/images/ribbed_ceramic_vase.png',
            'specs' => [
                'en' => [['name' => 'Material', 'val' => 'Ceramic']],
                'id' => [['name' => 'Bahan', 'val' => 'Keramik']]
            ],
            'colors' => [['code' => '#D9C8B2', 'name_en' => 'Beige', 'name_id' => 'Krem']],
            'sizes' => ['Medium'],
            'status' => 'active'
        ]);

        \App\Models\Product::create([
            'name_en' => 'Sculptural Knot Decor',
            'name_id' => 'Dekorasi Simpul Skulptural',
            'slug' => 'sculptural-knot-decor',
            'sku' => 'HOM-LV-KNT01',
            'description_en' => 'Abstract decor accent',
            'description_id' => 'Aksen dekorasi abstrak',
            'price' => 320000,
            'stock' => 10,
            'category_id' => $livingRoomCat ? $livingRoomCat->id : null,
            'image' => '/images/sculptural_knot.png',
            'specs' => [
                'en' => [['name' => 'Material', 'val' => 'Ceramic']],
                'id' => [['name' => 'Bahan', 'val' => 'Keramik']]
            ],
            'colors' => [['code' => '#111111', 'name_en' => 'Black', 'name_id' => 'Hitam']],
            'sizes' => ['One Size'],
            'status' => 'active'
        ]);

        \App\Models\Product::create([
            'name_en' => 'Organic Terracotta Bowl',
            'name_id' => 'Mangkuk Terracotta Organik',
            'slug' => 'organic-terracotta-bowl',
            'sku' => 'HOM-LV-BWL01',
            'description_en' => 'Versatile decorative bowl',
            'description_id' => 'Mangkuk hias serbaguna',
            'price' => 145000,
            'stock' => 30,
            'category_id' => $livingRoomCat ? $livingRoomCat->id : null,
            'image' => '/images/terracotta_bowl.png',
            'specs' => [
                'en' => [['name' => 'Material', 'val' => 'Terracotta']],
                'id' => [['name' => 'Bahan', 'val' => 'Terracotta']]
            ],
            'colors' => [['code' => '#A66E53', 'name_en' => 'Earthy Brown', 'name_id' => 'Cokelat Tanah']],
            'sizes' => ['Standard'],
            'status' => 'active'
        ]);

        \App\Models\Product::create([
            'name_en' => 'Dried Pampas Grass (Set)',
            'name_id' => 'Set Rumput Pampas Kering',
            'slug' => 'dried-pampas-grass-set',
            'sku' => 'HOM-LV-PMP01',
            'description_en' => 'Natural vase complement',
            'description_id' => 'Pelengkap vas natural',
            'price' => 85000,
            'stock' => 100,
            'category_id' => $livingRoomCat ? $livingRoomCat->id : null,
            'image' => '/images/pampas_grass.png',
            'specs' => [
                'en' => [['name' => 'Material', 'val' => 'Dried Grass']],
                'id' => [['name' => 'Bahan', 'val' => 'Rumput Kering']]
            ],
            'colors' => [['code' => '#FAF7EE', 'name_en' => 'Natural Beige', 'name_id' => 'Krem Alami']],
            'sizes' => ['One Size'],
            'status' => 'active'
        ]);

        // Loop through all created products and seed their variants to lock relations
        foreach (\App\Models\Product::all() as $product) {
            if ($product->colors) {
                foreach ($product->colors as $color) {
                    $product->variants()->create([
                        'type' => 'color',
                        'color_code' => $color['code'],
                        'color_name_en' => $color['name_en'],
                        'color_name_id' => $color['name_id'],
                    ]);
                }
            }
            if ($product->sizes) {
                foreach ($product->sizes as $size) {
                    $product->variants()->create([
                        'type' => 'size',
                        'size' => $size,
                    ]);
                }
            }
        }

        // Retrieve buyer John Buyer
        $buyer = \App\Models\User::where('email', 'buyer@example.com')->first();
        if ($buyer) {
            // Seed shipping address
            $address = \App\Models\Address::create([
                'user_id' => $buyer->id,
                'recipient_name' => 'John Buyer',
                'phone_number' => '081234567890',
                'address_line' => 'Jl. Kemang Raya No. 10',
                'city' => 'Jakarta Selatan',
                'postal_code' => '12730',
                'is_default' => true,
            ]);

            // Seed mock order
            $order = \App\Models\Order::create([
                'user_id' => $buyer->id,
                'recipient_name' => 'John Buyer',
                'phone_number' => '081234567890',
                'address_line' => 'Jl. Kemang Raya No. 10',
                'city' => 'Jakarta Selatan',
                'postal_code' => '12730',
                'shipping_method' => 'reguler',
                'protection_enabled' => true,
                'payment_method' => 'HanyPay',
                'subtotal' => 149000,
                'protection_fee' => 10000,
                'shipping_fee' => 10000,
                'discount' => 0,
                'points_discount' => 0,
                'total' => 169000,
                'status' => 'pending',
            ]);

            // Add item to order
            $sleepsuit = \App\Models\Product::where('slug', 'organic-cotton-sleepsuit')->first();
            \App\Models\OrderItem::create([
                'order_id' => $order->id,
                'product_id' => $sleepsuit ? $sleepsuit->id : null,
                'product_name' => 'Organic Cotton Sleepsuit',
                'quantity' => 1,
                'price' => 149000,
                'color' => 'Earthy Brown',
                'size' => 'Newborn',
            ]);
        }
    }
}

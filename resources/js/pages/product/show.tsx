'use no memo';
import { Head, Link, usePage, router } from '@inertiajs/react';
import { ShoppingBag, User, ArrowRight, Menu, X, Heart, Star, ChevronDown, ChevronUp, Truck, ShieldCheck, RefreshCw, CheckCircle } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { dashboard, login } from '@/routes';
import { CallCenterDialog } from '@/components/call-center-dialog';

interface PageProps {
    slug: string;
    locale?: string;
    auth: {
        user: any;
    };
    [key: string]: any;
}

// Complete Product Information Dictionary for Bilingual Display
const productData = {
    'organic-cotton-sleepsuit': {
        title: { en: "Organic Cotton Sleepsuit", id: "Baju Tidur Katun Organik" },
        price: "Rp 149.000",
        badge: { en: "New Born", id: "Bayi Baru Lahir" },
        image: "/images/organic_cotton_sleepsuit.png",
        thumbnails: [
            "/images/organic_cotton_sleepsuit.png",
            "/images/classic_linen_shirt.png",
            "/images/premium_bath_towel_set.png",
            "/images/earthy_ceramic_vase.png"
        ],
        desc: {
            en: "Super soft, breathable organic cotton sleepsuit with a two-way zip for easy diaper changes and fold-over mitts to prevent scratching.",
            id: "Baju tidur katun organik yang sangat lembut dan sejuk dengan ritsleting dua arah untuk memudahkan penggantian popok, serta sarung tangan lipat untuk mencegah garukan."
        },
        specs: {
            en: [
                { name: "Material", val: "100% GOTS-certified Organic Cotton." },
                { name: "Fit", val: "Relaxed fit for maximum baby movement." },
                { name: "Care", val: "Machine wash cold, tumble dry low." }
            ],
            id: [
                { name: "Material", val: "100% Katun Organik bersertifikat GOTS." },
                { name: "Kecocokan", val: "Kecocokan longgar untuk keleluasaan bergerak bayi." },
                { name: "Perawatan", val: "Cuci dengan mesin air dingin, pengeringan putaran rendah." }
            ]
        }
    },
    'earthy-ceramic-vase': {
        title: { en: "Earthy Ceramic Vase", id: "Vas Keramik Earthy" },
        price: "Rp 285.000",
        badge: { en: "Best Seller", id: "Terlaris" },
        image: "/images/earthy_ceramic_vase.png",
        thumbnails: [
            "/images/earthy_ceramic_vase.png",
            "/images/organic_cotton_sleepsuit.png",
            "/images/classic_linen_shirt.png",
            "/images/premium_bath_towel_set.png"
        ],
        desc: {
            en: "Hand-thrown terracotta clay vase with a matte organic finish. Perfect for minimalist homes and dried floral arrangements.",
            id: "Vas keramik buatan tangan ini memberikan sentuhan organik pada ruangan Anda. Dibuat dengan teknik tradisional untuk memastikan keunikan pada setiap sisinya."
        },
        specs: {
            en: [
                { name: "Material", val: "100% High-quality Terracotta Clay." },
                { name: "Dimensions", val: "Height 24cm, Diameter 15cm." },
                { name: "Finishing", val: "Natural unglazed matte (not recommended for holding water directly for long periods)." }
            ],
            id: [
                { name: "Material", val: "100% Terracotta Clay berkualitas tinggi." },
                { name: "Dimensi", val: "Tinggi 24cm, Diameter 15cm." },
                { name: "Finishing", val: "Matte alami tanpa glasir (tidak direkomendasikan untuk menampung air langsung dalam waktu lama)." }
            ]
        }
    },
    'classic-linen-shirt': {
        title: { en: "Classic Linen Shirt", id: "Kemeja Linen Klasik" },
        price: "Rp 320.000",
        badge: { en: "Premium", id: "Premium" },
        image: "/images/classic_linen_shirt.png",
        thumbnails: [
            "/images/classic_linen_shirt.png",
            "/images/organic_cotton_sleepsuit.png",
            "/images/premium_bath_towel_set.png",
            "/images/earthy_ceramic_vase.png"
        ],
        desc: {
            en: "Breathable organic linen shirt with a modern tailored cut, perfect for warm days and effortless smart-casual style.",
            id: "Kemeja linen organik yang sejuk dengan potongan modis, sangat cocok untuk cuaca hangat dan gaya kasual elegan sehari-hari."
        },
        specs: {
            en: [
                { name: "Material", val: "100% French Organic Linen." },
                { name: "Weave", val: "Classic lightweight slub texture." },
                { name: "Fit", val: "Regular fit, true to size." }
            ],
            id: [
                { name: "Material", val: "100% Linen Organik Prancis." },
                { name: "Tenun", val: "Tekstur slub ringan klasik." },
                { name: "Kecocokan", val: "Ukuran standar (fit reguler)." }
            ]
        }
    },
    'premium-bath-towel-set': {
        title: { en: "Premium Bath Towel Set", id: "Set Handuk Mandi Premium" },
        price: "Rp 195.000",
        badge: { en: "Soft & Cozy", id: "Sangat Lembut" },
        image: "/images/premium_bath_towel_set.png",
        thumbnails: [
            "/images/premium_bath_towel_set.png",
            "/images/organic_cotton_sleepsuit.png",
            "/images/classic_linen_shirt.png",
            "/images/earthy_ceramic_vase.png"
        ],
        desc: {
            en: "Plush, extra-absorbent bath towels made of organic combed cotton, providing a spa-like feel in your own home.",
            id: "Handuk mandi tebal dan berdaya serap tinggi dari katun organik pilihan, menghadirkan nuansa spa mewah di rumah Anda."
        },
        specs: {
            en: [
                { name: "Material", val: "100% Organic Combed Cotton." },
                { name: "Weight", val: "650 GSM (ultra-thick and absorbent)." },
                { name: "Set includes", val: "2 Bath Towels (70cm x 140cm)." }
            ],
            id: [
                { name: "Material", val: "100% Katun Pilihan Organik." },
                { name: "Ketebalan", val: "650 GSM (sangat tebal dan menyerap)." },
                { name: "Set termasuk", val: "2 Handuk Mandi (70cm x 140cm)." }
            ]
        }
    }
};

export default function Show({ product, relatedProducts = [] }: { product: any; relatedProducts?: any[] }) {
    const { locale = 'en', auth } = usePage<any>().props;
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsProfileDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    
    const productTitle = locale === 'id' ? product.name_id : product.name_en;

    const colors = product.colors && product.colors.length > 0 
        ? product.colors.map((c: any) => ({
            name: c.name_en || c.name || '',
            value: c.code || '',
            label: {
                en: c.name_en || c.name || '',
                id: c.name_id || c.name || ''
            }
        }))
        : [];

    const sizes = product.sizes && product.sizes.length > 0
        ? product.sizes
        : [];

    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const cartCount = auth?.cartCount ?? 0;
    const [quantity, setQuantity] = useState(1);
    const [selectedColor, setSelectedColor] = useState(
        colors.length > 0 ? colors[0].name : ''
    );
    const [selectedSize, setSelectedSize] = useState(
        sizes.length > 0 ? sizes[0] : ''
    );
    const [liked, setLiked] = useState(false);
    const [addedToCart, setAddedToCart] = useState(false);
    const [isSupportOpen, setIsSupportOpen] = useState(false);

    // Sync selected color and size when product changes
    useEffect(() => {
        if (colors.length > 0) {
            setSelectedColor(colors[0].name);
        } else {
            setSelectedColor('');
        }
        if (sizes.length > 0) {
            setSelectedSize(sizes[0]);
        } else {
            setSelectedSize('');
        }
    }, [product]);

    // Collapsible states for accordions
    const [detailOpen, setDetailOpen] = useState(true);
    const [careOpen, setCareOpen] = useState(false);
    const [shippingOpen, setShippingOpen] = useState(false);

    // Main image state
    const [mainImage, setMainImage] = useState(product.image || '/images/logo.png');

    // Update main image state when product changes
    useEffect(() => {
        setMainImage(product.image || '/images/logo.png');
    }, [product]);

    const formatPrice = (value: number | string) => {
        const num = typeof value === 'number' ? value : parseFloat(value);
        if (isNaN(num)) return value;
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(num);
    };

    const thumbnails = [
        product.image || '/images/logo.png',
        "/images/organic_cotton_sleepsuit.png",
        "/images/classic_linen_shirt.png",
        "/images/premium_bath_towel_set.png"
    ];

    const translations = {
        en: {
            breadcrumbs: {
                home: "Home",
                category: "Home Living",
                subcategory: "Decor"
            },
            colorLabel: "Color",
            sizeLabel: "Size",
            sizeGuide: "Size Guide",
            qtyLabel: "Quantity",
            btnAddToCart: "Add to Cart",
            btnBuyNow: "Buy Now",
            btnAdded: "Added to Cart!",
            trustBadges: {
                freeShipping: "Free Shipping",
                originalProduct: "Genuine Product",
                returnGuarantee: "Returns Guarantee"
            },
            accordions: {
                details: {
                    title: "Product Details"
                },
                care: {
                    title: "Care Instructions",
                    desc: "Wipe clean with a soft, dry cloth. Avoid using harsh chemical cleaners. To wash, hand wash with warm soapy water and dry thoroughly immediately."
                },
                shipping: {
                    title: "Shipping & Returns",
                    desc: "Enjoy free standard shipping on orders over Rp 500.000. Returns are accepted within 7 days of delivery in original, unused condition."
                }
            },
            related: {
                title: "You May Also Like",
                viewAll: "View All"
            },
            footer: {
                tagline: "Nurturing Professionalism. Bridging everyday comfort with elegant design for you and your home."
            }
        },
        id: {
            breadcrumbs: {
                home: "Beranda",
                category: "Home Living",
                subcategory: "Dekorasi"
            },
            colorLabel: "Warna",
            sizeLabel: "Ukuran",
            sizeGuide: "Panduan Ukuran",
            qtyLabel: "Jumlah",
            btnAddToCart: "Tambah ke Keranjang",
            btnBuyNow: "Beli Sekarang",
            btnAdded: "Berhasil Ditambahkan!",
            trustBadges: {
                freeShipping: "Gratis Ongkir",
                originalProduct: "Produk Asli",
                returnGuarantee: "Garansi Retur"
            },
            accordions: {
                details: {
                    title: "Detail Produk"
                },
                care: {
                    title: "Instruksi Perawatan",
                    desc: "Bersihkan dengan kain lembut yang kering. Hindari bahan kimia pembersih yang keras. Untuk mencuci, gunakan sabun lembut dan air hangat, lalu langsung keringkan dengan kain bersih."
                },
                shipping: {
                    title: "Pengiriman & Pengembalian",
                    desc: "Nikmati gratis ongkos kirim standar untuk pembelian di atas Rp 500.000. Pengembalian barang dilayani dalam kurun 7 hari setelah pengiriman dalam kondisi baru dan belum terpakai."
                }
            },
            related: {
                title: "Anda Mungkin Juga Suka",
                viewAll: "Lihat Semua"
            },
            footer: {
                tagline: "Nurturing Professionalism. Menghadirkan kenyamanan sehari-hari dengan desain elegan untuk Anda dan rumah Anda."
            }
        }
    };

    const t = translations[locale as 'en' | 'id'] || translations.en;

    const handleRecommendedClick = (p: any) => {
        router.visit(`/product/${p.slug}`);
    };

    const switchLocale = (newLocale: 'en' | 'id') => {
        if (newLocale === locale) return;
        router.post('/locale', { locale: newLocale }, {
            preserveScroll: true
        });
    };

    const handleAddToCart = () => {
        if (!auth?.user) {
            router.visit('/login');
            return;
        }
        
        router.post('/cart', {
            product_id: product.id,
            quantity: quantity,
            color: selectedColor,
            size: selectedSize
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setAddedToCart(true);
                setTimeout(() => setAddedToCart(false), 2000);
            }
        });
    };

    const handleBuyNow = () => {
        if (!auth?.user) {
            router.visit('/login');
            return;
        }

        router.post('/cart', {
            product_id: product.id,
            quantity: quantity,
            color: selectedColor,
            size: selectedSize
        }, {
            preserveScroll: true,
            onSuccess: () => {
                router.visit('/cart');
            }
        });
    };

    return (
        <div className="min-h-screen bg-[#FAF7EE] font-sans antialiased text-[#2E2C28]">
            <Head>
                <title>{`${productTitle} | Hanyza.id`}</title>
                <meta name="description" content={locale === 'id' ? product.description_id : product.description_en} />
            </Head>

            {/* STICKY GLASSMORPHIC HEADER */}
            <header className="sticky top-0 z-50 w-full border-b border-stone-200/50 bg-[#FFFFFF]/90 backdrop-blur-md transition-all duration-300">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
                    {/* Brand Logo */}
                    <Link href="/" className="flex items-center hover:opacity-90 transition-opacity">
                        <img src="/images/logo.png" alt="Hanyza" className="h-10 w-auto object-contain sm:h-12" />
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden lg:flex items-center space-x-8 text-sm font-medium">
                        <Link href="/" className="text-stone-600 hover:text-[#E06D53] transition-colors">
                            Shop
                        </Link>
                        <Link href="/" className="text-stone-600 hover:text-[#E06D53] transition-colors">
                            New Arrivals
                        </Link>
                        <Link href="/" className="relative py-1 text-[#E06D53] after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:bg-[#E06D53] after:rounded-full">
                            Home Living
                        </Link>
                        <Link href="/" className="text-stone-600 hover:text-[#E06D53] transition-colors">
                            Sale
                        </Link>
                        <button
                            onClick={() => setIsSupportOpen(true)}
                            className="text-stone-600 hover:text-[#E06D53] transition-colors cursor-pointer"
                        >
                            Call Center
                        </button>
                    </nav>

                     {/* Header Controls */}
                    <div className="hidden lg:flex items-center space-x-6">
                        {/* Elegant Language Pill Toggle */}
                        <div className="flex items-center rounded-full border border-stone-200/80 bg-stone-100/50 p-0.5">
                            <button
                                onClick={() => switchLocale('id')}
                                className={`rounded-full px-3 py-1 text-xs font-semibold transition-all duration-300 ${
                                    locale === 'id'
                                        ? 'bg-[#E06D53] text-white shadow-sm'
                                        : 'text-stone-500 hover:text-stone-800'
                                }`}
                            >
                                ID
                            </button>
                            <button
                                onClick={() => switchLocale('en')}
                                className={`rounded-full px-3 py-1 text-xs font-semibold transition-all duration-300 ${
                                    locale === 'en'
                                        ? 'bg-[#E06D53] text-white shadow-sm'
                                        : 'text-stone-500 hover:text-stone-800'
                                }`}
                            >
                                EN
                            </button>
                        </div>

                        {/* Cart */}
                        <Link href="/cart" className="relative p-2 text-stone-700 hover:text-[#E06D53] transition-colors">
                            <ShoppingBag className="h-5 w-5 stroke-[1.8]" />
                            {cartCount > 0 && (
                                <span className="absolute -top-0.5 -right-0.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-[#E06D53] text-[10px] font-bold text-white shadow-sm animate-scaleIn">
                                    {cartCount}
                                </span>
                            )}
                        </Link>

                        {/* User */}
                        {auth?.user ? (
                            <div className="relative" ref={dropdownRef}>
                                <button
                                    onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                                    className="flex items-center space-x-1 p-2 text-stone-700 hover:text-[#E06D53] transition-colors cursor-pointer focus:outline-hidden"
                                >
                                    <User className="h-5 w-5 stroke-[1.8]" />
                                    {auth?.user?.name && (
                                        <span className="hidden lg:inline text-xs font-semibold text-stone-600 truncate max-w-[80px]">
                                            {auth?.user?.name}
                                        </span>
                                    )}
                                </button>
                                
                                {isProfileDropdownOpen && (
                                    <div className="absolute right-0 mt-2 w-48 rounded-xl border border-stone-200/80 bg-white p-2.5 shadow-lg ring-1 ring-black/5 z-50">
                                        <Link
                                            href={auth?.user?.role !== 'buyer' ? '/dashboard' : '/settings/profile'}
                                            onClick={() => setIsProfileDropdownOpen(false)}
                                            className="flex w-full items-center px-3.5 py-2.5 text-xs font-semibold text-stone-700 hover:bg-stone-50 hover:text-[#E06D53] rounded-lg transition-colors cursor-pointer"
                                        >
                                            Akun Saya
                                        </Link>
                                        
                                        <Link
                                            href="/orders"
                                            onClick={() => setIsProfileDropdownOpen(false)}
                                            className="flex w-full items-center px-3.5 py-2.5 text-xs font-semibold text-stone-700 hover:bg-stone-50 hover:text-[#E06D53] rounded-lg transition-colors cursor-pointer"
                                        >
                                            Pesanan Saya
                                        </Link>
                                        
                                        <hr className="border-stone-100 my-1.5" />
                                        
                                        <Link
                                            href="/logout"
                                            method="post"
                                            as="button"
                                            type="button"
                                            onClick={() => setIsProfileDropdownOpen(false)}
                                            className="flex w-full items-center px-3.5 py-2.5 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer text-left font-sans"
                                        >
                                            Log Out
                                        </Link>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center space-x-2">
                                <Link href={login.url()} className="text-sm font-medium text-stone-600 hover:text-[#E06D53] transition-colors">
                                    Masuk
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile Controls */}
                    <div className="flex items-center space-x-4 lg:hidden">
                        <Link href="/cart" className="relative p-2 text-stone-700 hover:text-[#E06D53] transition-colors">
                            <ShoppingBag className="h-5 w-5 stroke-[1.8]" />
                            {cartCount > 0 && (
                                <span className="absolute -top-0.5 -right-0.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-[#E06D53] text-[9px] font-bold text-white">
                                    {cartCount}
                                </span>
                            )}
                        </Link>
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="p-2 text-stone-700 hover:text-[#E06D53] transition-colors"
                        >
                            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="lg:hidden border-t border-stone-100 bg-[#FFFFFF] px-6 py-6 shadow-lg animate-slideDown">
                        <nav className="flex flex-col space-y-4 text-base font-medium">
                            <Link href="/" className="text-stone-600 hover:text-[#E06D53] py-1 border-b border-stone-50">Shop</Link>
                            <Link href="/" className="text-stone-600 hover:text-[#E06D53] py-1 border-b border-stone-50">New Arrivals</Link>
                            <Link href="/" className="text-[#E06D53] py-1 border-b border-stone-50">Home Living</Link>
                            <Link href="/" className="text-stone-600 hover:text-[#E06D53] py-1">Sale</Link>
                            <button
                                onClick={() => {
                                    setMobileMenuOpen(false);
                                    setIsSupportOpen(true);
                                }}
                                className="text-left text-stone-600 hover:text-[#E06D53] py-1 cursor-pointer"
                            >
                                Call Center
                            </button>
                        </nav>
                        <div className="mt-6 flex flex-col space-y-4 border-t border-stone-100 pt-6">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-stone-500 font-medium font-sans">Language</span>
                                <div className="flex items-center rounded-full border border-stone-200 bg-stone-100 p-0.5">
                                    <button onClick={() => switchLocale('id')} className={`rounded-full px-3 py-1 text-xs font-semibold ${locale === 'id' ? 'bg-[#E06D53] text-white' : 'text-stone-500'}`}>ID</button>
                                    <button onClick={() => switchLocale('en')} className={`rounded-full px-3 py-1 text-xs font-semibold ${locale === 'en' ? 'bg-[#E06D53] text-white' : 'text-stone-500'}`}>EN</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </header>

            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {/* BREADCRUMB */}
                <nav className="flex items-center space-x-2 text-xs font-semibold tracking-wider uppercase text-stone-400 mb-8 overflow-x-auto whitespace-nowrap scrollbar-none">
                    <Link href="/" className="hover:text-stone-600 transition-colors">{t.breadcrumbs.home}</Link>
                    <span>&rsaquo;</span>
                    <Link href="/" className="hover:text-stone-600 transition-colors">{t.breadcrumbs.category}</Link>
                    <span>&rsaquo;</span>
                    <Link href="/" className="hover:text-stone-600 transition-colors">{t.breadcrumbs.subcategory}</Link>
                    <span>&rsaquo;</span>
                    <span className="text-[#E06D53]">{productTitle}</span>
                </nav>

                {/* PRODUCT CONFIGURATOR GRID */}
                <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 mb-16">
                    
                    {/* LEFT COLUMN: Gallery */}
                    <div className="lg:col-span-6 flex flex-col space-y-4">
                        <div className="relative aspect-square w-full overflow-hidden rounded-3xl bg-white border border-stone-200/30 shadow-sm">
                            <img
                                src={mainImage}
                                alt={productTitle}
                                className="h-full w-full object-cover object-center transition-all duration-300"
                            />
                            {/* Like / Wishlist Heart */}
                            <button
                                onClick={() => setLiked(!liked)}
                                className="absolute top-4 right-4 flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-md text-stone-500 hover:text-red-550 transition-colors border border-stone-100"
                            >
                                <Heart className={`h-5 w-5 ${liked ? 'fill-red-550 stroke-red-550' : 'stroke-[1.8]'}`} />
                            </button>
                        </div>

                        {/* Thumbnails list */}
                        <div className="grid grid-cols-4 gap-4">
                            {thumbnails.map((thumb, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setMainImage(thumb)}
                                    className={`relative aspect-square overflow-hidden rounded-xl bg-white border shadow-sm transition-all duration-200 ${
                                        mainImage === thumb ? 'border-[#E06D53] ring-1 ring-[#E06D53]' : 'border-stone-200/40 hover:border-stone-400'
                                    }`}
                                >
                                    <img src={thumb} className="h-full w-full object-cover object-center" alt="" />
                                    {idx === 3 && (
                                        <div className="absolute inset-0 bg-stone-900/40 flex items-center justify-center text-white text-xs font-bold font-sans">
                                            +2
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Configurator Options */}
                    <div className="lg:col-span-6 flex flex-col space-y-6">
                        <div>
                            {/* Tag */}
                            <span className="inline-block rounded-full bg-[#FAF7EE] border border-stone-200 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-stone-700 shadow-sm mb-3">
                                {product.category ? product.category.name : (locale === 'id' ? 'Umum' : 'General')}
                            </span>
                            <h1 className="text-3xl font-bold tracking-tight text-stone-950 font-sans">
                                {productTitle}
                            </h1>

                            <div className="mt-3 flex items-center space-x-3">
                                <span className="text-[#E06D53] text-2xl font-bold font-sans">
                                    {formatPrice(product.price)}
                                </span>
                                <div className="flex items-center text-stone-300">
                                    <div className="flex items-center text-amber-400 mr-1.5">
                                        <Star className="h-4 w-4 fill-current text-amber-400 stroke-none" />
                                        <Star className="h-4 w-4 fill-current text-amber-400 stroke-none" />
                                        <Star className="h-4 w-4 fill-current text-amber-400 stroke-none" />
                                        <Star className="h-4 w-4 fill-current text-amber-400 stroke-none" />
                                        <Star className="h-4 w-4 fill-current text-amber-400 stroke-none" />
                                    </div>
                                    <span className="text-xs font-semibold text-stone-500 underline underline-offset-2 cursor-pointer hover:text-stone-800">
                                        4.8 (124 {locale === 'id' ? 'Ulasan' : 'Reviews'})
                                    </span>
                                </div>
                            </div>
                        </div>

                        <p className="text-sm text-stone-600 leading-relaxed max-w-xl">
                            {locale === 'id' ? product.description_id : product.description_en}
                        </p>

                        <div className="border-t border-stone-200/60 pt-6 space-y-6">
                            {/* Color Selector */}
                            {colors.length > 0 && (
                                <div>
                                    <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                                        {t.colorLabel}: <span className="text-stone-800 font-semibold">{selectedColor}</span>
                                    </span>
                                    <div className="mt-3 flex items-center space-x-3">
                                        {colors.map((color: any) => (
                                            <button
                                                key={color.name}
                                                onClick={() => setSelectedColor(color.name)}
                                                style={{ backgroundColor: color.value }}
                                                className={`h-8 w-8 rounded-full border shadow-sm transition-all duration-200 cursor-pointer ${
                                                    selectedColor === color.name ? 'ring-2 ring-offset-2 ring-[#E06D53] border-white' : 'border-stone-200/60'
                                                }`}
                                                title={locale === 'id' ? color.label.id : color.label.en}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Size Selector */}
                            {sizes.length > 0 && (
                                <div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                                            {t.sizeLabel}: <span className="text-stone-800 font-semibold">{selectedSize}</span>
                                        </span>
                                        <a href="#size-guide" className="text-xs font-semibold text-[#E06D53] hover:underline underline-offset-2">
                                            {t.sizeGuide}
                                        </a>
                                    </div>
                                    <div className="mt-3 flex items-center space-x-3">
                                        {sizes.map((size: string) => (
                                            <button
                                                key={size}
                                                onClick={() => setSelectedSize(size)}
                                                className={`rounded-xl border px-5 py-2.5 text-xs font-semibold shadow-sm transition-all duration-200 cursor-pointer ${
                                                    selectedSize === size
                                                        ? 'border-[#E06D53] bg-white text-[#E06D53] ring-1 ring-[#E06D53]'
                                                        : 'border-stone-200/50 bg-white text-stone-700 hover:border-stone-400'
                                                }`}
                                            >
                                                {size}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Quantity */}
                            <div>
                                <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                                    {t.qtyLabel}
                                </span>
                                <div className="mt-3 flex items-center max-w-[120px] rounded-xl border border-stone-200/60 bg-white p-1">
                                    <button
                                        onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                                        className="w-8 h-8 flex items-center justify-center text-stone-500 hover:text-stone-800 font-bold"
                                    >
                                        &minus;
                                    </button>
                                    <span className="flex-1 text-center text-sm font-semibold font-sans">
                                        {quantity}
                                    </span>
                                    <button
                                        onClick={() => setQuantity(prev => prev + 1)}
                                        className="w-8 h-8 flex items-center justify-center text-stone-500 hover:text-stone-800 font-bold"
                                    >
                                        &#43;
                                    </button>
                                </div>
                            </div>

                            {/* Buttons */}
                            <div className="flex flex-col sm:flex-row gap-4 pt-2">
                                <button
                                    onClick={handleAddToCart}
                                    className={`flex-1 flex items-center justify-center rounded-xl py-3 text-sm font-bold text-white shadow-md hover:shadow-lg transform hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 cursor-pointer ${
                                        addedToCart
                                            ? 'bg-emerald-550 hover:bg-emerald-600'
                                            : 'bg-[#E06D53] hover:bg-[#C85B43]'
                                    }`}
                                >
                                    {addedToCart ? (
                                        <>
                                            <CheckCircle className="mr-2 h-4 w-4 stroke-[2.5] animate-scaleIn" />
                                            {t.btnAdded}
                                        </>
                                    ) : (
                                        <>
                                            <ShoppingBag className="mr-2 h-4 w-4 stroke-[2]" />
                                            {t.btnAddToCart}
                                        </>
                                    )}
                                </button>
                                 <button 
                                    onClick={handleBuyNow}
                                    className="flex-1 rounded-xl border border-[#E06D53] bg-white py-3 text-sm font-bold text-[#E06D53] shadow-sm hover:bg-stone-50/50 hover:shadow transition-all duration-200 cursor-pointer"
                                >
                                    {t.btnBuyNow}
                                </button>
                            </div>
                        </div>

                        {/* ACCORDIONS */}
                        <div className="border-t border-stone-200/60 pt-4 space-y-1">
                            {/* Detail Produk */}
                            <div className="border-b border-stone-200/40 py-3">
                                <button
                                    onClick={() => setDetailOpen(!detailOpen)}
                                    className="flex w-full items-center justify-between text-left font-bold text-stone-800 text-sm py-1 font-sans"
                                >
                                    <span>{t.accordions.details.title}</span>
                                    {detailOpen ? <ChevronUp className="h-4 w-4 text-stone-500" /> : <ChevronDown className="h-4 w-4 text-stone-500" />}
                                </button>
                                {detailOpen && (
                                    <div className="mt-3 text-xs text-stone-600 space-y-3 leading-relaxed animate-fadeIn">
                                        <p>{locale === 'id' ? product.description_id : product.description_en}</p>
                                        <ul className="list-disc pl-4 space-y-1 font-medium">
                                            {(locale === 'id' ? (product.specs?.id || []) : (product.specs?.en || [])).map((bullet: any, idx: number) => (
                                                <li key={idx}>
                                                    <strong>{bullet.name}:</strong> {bullet.val}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>

                            {/* Instruksi Perawatan */}
                            <div className="border-b border-stone-200/40 py-3">
                                <button
                                    onClick={() => setCareOpen(!careOpen)}
                                    className="flex w-full items-center justify-between text-left font-bold text-stone-800 text-sm py-1 font-sans"
                                >
                                    <span>{t.accordions.care.title}</span>
                                    {careOpen ? <ChevronUp className="h-4 w-4 text-stone-500" /> : <ChevronDown className="h-4 w-4 text-stone-500" />}
                                </button>
                                {careOpen && (
                                    <div className="mt-3 text-xs text-stone-600 leading-relaxed animate-fadeIn">
                                        <p>{t.accordions.care.desc}</p>
                                    </div>
                                )}
                            </div>

                            {/* Pengiriman & Pengembalian */}
                            <div className="border-b border-stone-200/40 py-3">
                                <button
                                    onClick={() => setShippingOpen(!shippingOpen)}
                                    className="flex w-full items-center justify-between text-left font-bold text-stone-800 text-sm py-1 font-sans"
                                >
                                    <span>{t.accordions.shipping.title}</span>
                                    {shippingOpen ? <ChevronUp className="h-4 w-4 text-stone-500" /> : <ChevronDown className="h-4 w-4 text-stone-500" />}
                                </button>
                                {shippingOpen && (
                                    <div className="mt-3 text-xs text-stone-600 leading-relaxed animate-fadeIn">
                                        <p>{t.accordions.shipping.desc}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* TRUST BADGES */}
                        <div className="grid grid-cols-3 gap-4 rounded-2xl border border-stone-200/60 bg-stone-50/50 p-4 text-center text-[10px] font-bold text-stone-700 mt-2">
                            <div className="flex flex-col items-center space-y-1">
                                <Truck className="h-5 w-5 text-[#E06D53] stroke-[1.8]" />
                                <span>{t.trustBadges.freeShipping}</span>
                            </div>
                            <div className="flex flex-col items-center space-y-1 border-x border-stone-200/60">
                                <ShieldCheck className="h-5 w-5 text-[#E06D53] stroke-[1.8]" />
                                <span>{t.trustBadges.originalProduct}</span>
                            </div>
                            <div className="flex flex-col items-center space-y-1">
                                <RefreshCw className="h-5 w-5 text-[#E06D53] stroke-[1.8]" />
                                <span>{t.trustBadges.returnGuarantee}</span>
                            </div>
                        </div>

                    </div>
                </div>

                {/* "YOU MAY ALSO LIKE" RELATED PRODUCTS SECTION */}
                <section className="border-t border-stone-200/60 pt-16 mb-8">
                    <div className="flex items-end justify-between mb-8">
                        <div>
                            <h2 className="text-2xl font-bold tracking-tight text-stone-900 font-sans">
                                {t.related.title}
                            </h2>
                        </div>
                        <Link
                            href="/"
                            className="group inline-flex items-center text-sm font-semibold text-[#E06D53] hover:opacity-85 transition-opacity"
                        >
                            {t.related.viewAll}
                            <ArrowRight className="ml-1 h-4 w-4 transform group-hover:translate-x-1 transition-transform stroke-[2.2]" />
                        </Link>
                    </div>

                    {/* Cards Grid */}
                    <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
                        {relatedProducts.map((p) => (
                            <div
                                key={p.id}
                                onClick={() => handleRecommendedClick(p)}
                                className="group relative flex flex-col overflow-hidden rounded-2xl border border-stone-200/40 bg-white shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                            >
                                <div className="relative aspect-square w-full overflow-hidden bg-stone-100">
                                    {p.image ? (
                                        <img
                                            src={p.image.startsWith('/images') ? p.image : `/storage/${p.image}`}
                                            alt={locale === 'id' ? p.name_id : p.name_en}
                                            className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
                                            loading="lazy"
                                        />
                                    ) : (
                                        <div className="h-full w-full bg-stone-150 flex items-center justify-center text-xs text-stone-400">
                                            No image
                                        </div>
                                    )}
                                    {p.stock <= 0 && (
                                        <span className="absolute top-3 left-3 rounded-full bg-red-600 px-3 py-1 text-[9px] font-bold tracking-wider text-white shadow-sm">
                                            OUT OF STOCK
                                        </span>
                                    )}
                                </div>
                                <div className="flex flex-1 flex-col p-5">
                                    <h3 className="text-sm font-semibold text-stone-800 group-hover:text-[#E06D53] transition-colors line-clamp-1 font-sans">
                                        {locale === 'id' ? p.name_id : p.name_en}
                                    </h3>
                                    <p className="text-xs text-stone-400 mt-1 font-medium leading-relaxed line-clamp-2">
                                        {locale === 'id' ? p.description_id : p.description_en}
                                    </p>
                                    <p className="mt-2 text-base font-bold text-[#E06D53] font-sans">
                                        {formatPrice(p.price)}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </main>

            {/* PREMIUM FOOTER */}
            <footer className="border-t border-stone-200/60 bg-[#FFFFFF] py-12 text-sm text-stone-600">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-4">
                        <div className="flex flex-col space-y-4">
                            <span className="text-lg font-bold tracking-tight text-[#E06D53] font-sans">
                                Hanyza.id
                            </span>
                            <p className="text-stone-500 max-w-xs leading-relaxed">
                                {t.footer.tagline}
                            </p>
                            <p className="text-xs text-stone-400 mt-auto">
                                &copy; 2026 Hanyza.id. All rights reserved.
                            </p>
                        </div>
                        <div>
                            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-900 mb-4 font-sans">Shop</h4>
                            <ul className="space-y-3 font-medium">
                                <li><Link href="/" className="hover:text-[#E06D53] transition-colors">Shop</Link></li>
                                <li><Link href="/" className="hover:text-[#E06D53] text-[#E06D53] transition-colors">Home Decor</Link></li>
                                <li><Link href="/" className="hover:text-[#E06D53] transition-colors">Apparel</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-900 mb-4 font-sans">Customer Service</h4>
                            <ul className="space-y-3 font-medium">
                                <li><a href="#support" className="hover:text-[#E06D53] transition-colors">Support</a></li>
                                <li><a href="#faq" className="hover:text-[#E06D53] transition-colors">FAQ</a></li>
                                <li><a href="#shipping" className="hover:text-[#E06D53] transition-colors">Shipping</a></li>
                                <li><a href="#returns" className="hover:text-[#E06D53] transition-colors">Returns</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-900 mb-4 font-sans">Stay Updated</h4>
                            <ul className="space-y-3 font-medium">
                                <li><a href="#newsletter" className="hover:text-[#E06D53] transition-colors">Newsletter</a></li>
                                <li><a href="#journal" className="hover:text-[#E06D53] transition-colors">Journal</a></li>
                            </ul>
                        </div>
                    </div>
                </div>
            </footer>
            <CallCenterDialog open={isSupportOpen} onOpenChange={setIsSupportOpen} />
        </div>
    );
}

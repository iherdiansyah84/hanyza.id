'use no memo';
import { Head, Link, usePage, router } from '@inertiajs/react';
import { dashboard, login } from '@/routes';
import { ShoppingBag, User, ArrowRight, Menu, X, ChevronDown, CheckCircle, Search, Gift, Coins } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { CallCenterDialog } from '@/components/call-center-dialog';

interface PageProps {
    locale?: string;
    auth: {
        user: any;
    };
    [key: string]: any;
}

export default function Welcome({ products = [], vouchers = [] }: { products?: any[]; vouchers?: any[] }) {
    const { locale = 'en', auth } = usePage<any>().props;
    const { url } = usePage();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const cartCount = auth?.cartCount ?? 0;
    const [addedToCartId, setAddedToCartId] = useState<number | null>(null);
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [isSupportOpen, setIsSupportOpen] = useState(false);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsProfileDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<'all' | 'fashion' | 'home-living' | 'lifestyle' | 'discount'>('all');
    const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
    const [selectedSubSubcategory, setSelectedSubSubcategory] = useState<string | null>(null);

    // Sync categories and search queries from the URL parameters
    useEffect(() => {
        const queryStr = url.includes('?') ? url.split('?')[1] : '';
        const params = new URLSearchParams(queryStr);
        const categoryParam = params.get('category');
        const searchParam = params.get('search');

        if (categoryParam) {
            if (['all', 'fashion', 'home-living', 'lifestyle', 'discount'].includes(categoryParam)) {
                setSelectedCategory(categoryParam as any);
            }
        } else {
            setSelectedCategory('all');
        }

        setSelectedSubcategory(null);
        setSelectedSubSubcategory(null);

        if (searchParam !== null) {
            setSearchQuery(searchParam);
        } else {
            setSearchQuery('');
        }
    }, [url]);

    const [showRecommendation, setShowRecommendation] = useState(false);
    const [recommendedProduct, setRecommendedProduct] = useState<any>(null);

    // Set 5-seconds recommendation
    useEffect(() => {
        const timer = setTimeout(() => {
            let choice = products[0]; // default: organic cotton sleepsuit
            if (searchQuery) {
                const matched = products.find(p => 
                    p.name_en.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    p.name_id.toLowerCase().includes(searchQuery.toLowerCase())
                );
                if (matched) choice = matched;
            } else if (products.length > 2) {
                choice = products[2]; // Earthy Ceramic Vase
            }

            if (choice) {
                setRecommendedProduct(choice);
                setShowRecommendation(true);
            }
        }, 5000);

        return () => clearTimeout(timer);
    }, [searchQuery, products]);

    // Multi-Language Dictionary
    const translations = {
        en: {
            meta: {
                title: "Quality & Comfort for Your Family",
                description: "Discover our latest collection of premium home living essentials and thoughtfully designed apparel."
            },
            nav: {
                fashion: "Fashion",
                homeLiving: "Home Living",
                lifestyle: "Lifestyle",
                newArrivals: "New Arrivals",
                sale: "Sale",
                login: "Log in",
                register: "Register",
                dashboard: "Dashboard"
            },
            hero: {
                title: "Quality & Comfort for Your Family",
                subtitle: "Discover our latest collection of premium home living essentials and thoughtfully designed apparel.",
                cta: "Shop Collection"
            },
            newArrivals: {
                title: "New Arrivals",
                subtitle: "Fresh designs blending utility with a warm, human touch.",
                viewAll: "View All",
                addToCart: "Add to Cart",
                added: "Added!",
                badges: {
                    newBorn: "New Born",
                    homeDecor: "Home Decor"
                }
            },
            footer: {
                tagline: "Quality and Comfort for your Family.",
                shop: "Shop",
                support: "Support",
                stayUpdated: "Stay Updated",
                customerService: "Customer Service",
                privacyPolicy: "Privacy Policy",
                newsletter: "Newsletter"
            }
        },
        id: {
            meta: {
                title: "Kualitas & Kenyamanan untuk Keluarga Anda",
                description: "Temukan koleksi terbaru perlengkapan rumah premium dan pakaian yang dirancang dengan cermat."
            },
            nav: {
                fashion: "Fashion",
                homeLiving: "Home Living",
                lifestyle: "Gaya Hidup",
                newArrivals: "Produk Terbaru",
                sale: "Diskon",
                login: "Masuk",
                register: "Daftar",
                dashboard: "Dasbor"
            },
            hero: {
                title: "Kualitas & Kenyamanan untuk Keluarga Anda",
                subtitle: "Temukan koleksi terbaru perlengkapan rumah premium dan pakaian yang dirancang dengan cermat.",
                cta: "Belanja Sekarang"
            },
            newArrivals: {
                title: "Produk Terbaru",
                subtitle: "Desain segar yang memadukan kegunaan dengan sentuhan manusia yang hangat.",
                viewAll: "Lihat Semua",
                addToCart: "Keranjang",
                added: "Tersimpan!",
                badges: {
                    newBorn: "Bayi Baru Lahir",
                    homeDecor: "Dekorasi Rumah"
                }
            },
            footer: {
                tagline: "Kualitas dan Kenyamanan untuk Keluarga Anda.",
                shop: "Belanja",
                support: "Dukungan",
                stayUpdated: "Ikuti Info Terbaru",
                customerService: "Layanan Pelanggan",
                privacyPolicy: "Kebijakan Privasi",
                newsletter: "Buletin"
            }
        }
    };

    const t = translations[locale as 'en' | 'id'] || translations.en;

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

    const switchLocale = (newLocale: 'en' | 'id') => {
        if (newLocale === locale) return;
        router.post('/locale', { locale: newLocale }, {
            preserveScroll: true
        });
    };

    const handleAddToCart = (id: number, slug: string) => {
        router.visit(`/product/${slug}`);
    };

    const scrollToShop = (e: React.MouseEvent) => {
        e.preventDefault();
        document.getElementById('new-arrivals')?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleAddRecommendedToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!auth?.user) {
            router.visit('/login');
            return;
        }

        const color = recommendedProduct.colors && recommendedProduct.colors.length > 0 
            ? (locale === 'id' ? recommendedProduct.colors[0].name_id : recommendedProduct.colors[0].name_en) 
            : '';
        const size = recommendedProduct.sizes && recommendedProduct.sizes.length > 0 
            ? recommendedProduct.sizes[0] 
            : '';

        router.post('/cart', {
            product_id: recommendedProduct.id,
            quantity: 1,
            color: color,
            size: size
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setShowRecommendation(false);
                toast.success(locale === 'id' ? 'Barang rekomendasi berhasil dimasukkan ke keranjang!' : 'Added recommendation to cart!');
            }
        });
    };

    // Filter products dynamically
    const filteredProducts = products.filter(product => {
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            const matchesName = 
                product.name_en.toLowerCase().includes(query) ||
                product.name_id.toLowerCase().includes(query);
            if (!matchesName) return false;
        }

        if (selectedCategory !== 'all') {
            const categoryName = product.category?.name?.toLowerCase() || '';
            const parentName = product.category?.parent?.name?.toLowerCase() || '';
            const grandparentName = product.category?.parent?.parent?.name?.toLowerCase() || '';
            
            if (selectedCategory === 'fashion') {
                const isFashion = categoryName === 'fashion' || parentName === 'fashion' || grandparentName === 'fashion';
                if (!isFashion) return false;
            } else if (selectedCategory === 'home-living') {
                const isHomeLiving = 
                    categoryName === 'home living' || parentName === 'home-living' || grandparentName === 'home-living' ||
                    categoryName === 'home-living' || parentName === 'home living' || grandparentName === 'home living';
                if (!isHomeLiving) return false;
            } else if (selectedCategory === 'lifestyle') {
                const isLifestyle = categoryName === 'lifestyle' || parentName === 'lifestyle' || grandparentName === 'lifestyle';
                if (!isLifestyle) return false;
            }
        }

        if (selectedSubcategory) {
            const subName = product.category?.name?.toLowerCase() || '';
            const parentSubName = product.category?.parent?.name?.toLowerCase() || '';
            const isMatch = 
                subName === selectedSubcategory.toLowerCase() || 
                parentSubName === selectedSubcategory.toLowerCase();
            if (!isMatch) return false;

            if (selectedSubSubcategory) {
                if (subName !== selectedSubSubcategory.toLowerCase()) return false;
            }
        }

        return true;
    });

    return (
        <div className="min-h-screen bg-[#FAF7EE] font-sans antialiased text-[#2E2C28]">
            <Head>
                <title>{t.meta.title}</title>
                <meta name="description" content={t.meta.description} />
            </Head>

            {/* STICKY GLASSMORPHIC HEADER */}
            <header className="sticky top-0 z-50 w-full border-b border-stone-200/50 bg-[#FFFFFF]/90 backdrop-blur-md transition-all duration-300">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
                    {/* Brand Logo */}
                    <Link href="/" className="flex items-center hover:opacity-90 transition-opacity">
                        <img src="/images/logo.png" alt="Hanyza" className="h-10 w-auto object-contain sm:h-12" />
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden lg:flex items-center space-x-8 text-sm font-bold">
                        <button
                            onClick={(e) => {
                                setSelectedCategory('fashion');
                                setSelectedSubcategory(null);
                                setSelectedSubSubcategory(null);
                                scrollToShop(e);
                            }}
                            className={`cursor-pointer transition-colors relative py-1 ${
                                selectedCategory === 'fashion'
                                    ? 'text-[#E06D53] after:absolute after:bottom-[-4px] after:left-0 after:h-[2px] after:w-full after:bg-[#E06D53] after:rounded-full'
                                    : 'text-stone-600 hover:text-[#E06D53]'
                            }`}
                        >
                            {t.nav.fashion}
                        </button>
                        <button
                            onClick={(e) => {
                                setSelectedCategory('home-living');
                                setSelectedSubcategory(null);
                                setSelectedSubSubcategory(null);
                                scrollToShop(e);
                            }}
                            className={`cursor-pointer transition-colors relative py-1 ${
                                selectedCategory === 'home-living'
                                    ? 'text-[#E06D53] after:absolute after:bottom-[-4px] after:left-0 after:h-[2px] after:w-full after:bg-[#E06D53] after:rounded-full'
                                    : 'text-stone-600 hover:text-[#E06D53]'
                            }`}
                        >
                            {t.nav.homeLiving}
                        </button>
                        <button
                            onClick={(e) => {
                                setSelectedCategory('lifestyle');
                                setSelectedSubcategory(null);
                                setSelectedSubSubcategory(null);
                                scrollToShop(e);
                            }}
                            className={`cursor-pointer transition-colors relative py-1 ${
                                selectedCategory === 'lifestyle'
                                    ? 'text-[#E06D53] after:absolute after:bottom-[-4px] after:left-0 after:h-[2px] after:w-full after:bg-[#E06D53] after:rounded-full'
                                    : 'text-stone-600 hover:text-[#E06D53]'
                            }`}
                        >
                            {t.nav.lifestyle}
                        </button>
                        <button
                            onClick={(e) => {
                                setSelectedCategory('all');
                                setSelectedSubcategory(null);
                                setSelectedSubSubcategory(null);
                                scrollToShop(e);
                            }}
                            className={`cursor-pointer transition-colors relative py-1 ${
                                selectedCategory === 'all'
                                    ? 'text-[#E06D53] after:absolute after:bottom-[-4px] after:left-0 after:h-[2px] after:w-full after:bg-[#E06D53] after:rounded-full'
                                    : 'text-stone-600 hover:text-[#E06D53]'
                            }`}
                        >
                            {t.nav.newArrivals}
                        </button>
                        <button
                            onClick={(e) => {
                                setSelectedCategory('discount');
                                setSelectedSubcategory(null);
                                setSelectedSubSubcategory(null);
                                scrollToShop(e);
                            }}
                            className={`cursor-pointer transition-colors relative py-1 ${
                                selectedCategory === 'discount'
                                    ? 'text-[#E06D53] after:absolute after:bottom-[-4px] after:left-0 after:h-[2px] after:w-full after:bg-[#E06D53] after:rounded-full'
                                    : 'text-stone-600 hover:text-[#E06D53]'
                            }`}
                        >
                            {t.nav.sale}
                        </button>
                        <button
                            onClick={() => setIsSupportOpen(true)}
                            className="cursor-pointer transition-colors relative py-1 text-stone-600 hover:text-[#E06D53]"
                        >
                            Call Center
                        </button>
                    </nav>

                    {/* Desktop Search bar */}
                    <div className="relative mx-4 hidden lg:block w-48 xl:w-60">
                        <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-stone-400" />
                        <input
                            type="text"
                            placeholder={locale === 'id' ? 'Cari barang...' : 'Search catalog...'}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-1.5 text-xs rounded-full border border-stone-200 bg-stone-50/60 focus:outline-hidden focus:ring-1 focus:ring-[#E06D53] focus:border-[#E06D53] transition-all"
                        />
                    </div>

                     {/* Header Controls (Language, Cart, Auth) */}
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

                        {/* Cart Icon with count badge */}
                        <Link href="/cart" className="relative p-2 text-stone-700 hover:text-[#E06D53] transition-colors">
                            <ShoppingBag className="h-5 w-5 stroke-[1.8]" />
                            {cartCount > 0 && (
                                <span className="absolute -top-0.5 -right-0.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-[#E06D53] text-[10px] font-bold text-white shadow-sm animate-scaleIn">
                                    {cartCount}
                                </span>
                            )}
                        </Link>

                        {/* User Account / Auth Links */}
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
                                <Link
                                    href={login.url()}
                                    className="text-sm font-medium text-stone-600 hover:text-[#E06D53] transition-colors"
                                >
                                    {t.nav.login}
                                </Link>
                                <span className="text-stone-300">|</span>
                                <Link
                                    href="/register"
                                    className="text-sm font-medium text-stone-600 hover:text-[#E06D53] transition-colors"
                                >
                                    {t.nav.register}
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu & Controls */}
                    <div className="flex items-center space-x-4 lg:hidden">
                        {/* Cart */}
                        <Link href="/cart" className="relative p-2 text-stone-700 hover:text-[#E06D53] transition-colors">
                            <ShoppingBag className="h-5 w-5 stroke-[1.8]" />
                            {cartCount > 0 && (
                                <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#E06D53] text-[9px] font-bold text-white">
                                    {cartCount}
                                </span>
                            )}
                        </Link>

                        {/* Hamburger */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="p-2 text-stone-700 hover:text-[#E06D53] transition-colors"
                        >
                            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>

                {/* MOBILE MENU DROPDOWN */}
                {mobileMenuOpen && (
                    <div className="lg:hidden border-t border-stone-100 bg-[#FFFFFF] px-6 py-6 shadow-lg animate-slideDown">
                        {/* Mobile Search input */}
                        <div className="relative w-full mb-4">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-stone-400" />
                            <input
                                type="text"
                                placeholder={locale === 'id' ? 'Cari barang...' : 'Search catalog...'}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-stone-200 bg-stone-50 focus:outline-hidden"
                            />
                        </div>

                        <nav className="flex flex-col space-y-3 font-semibold text-sm">
                            <button
                                onClick={(e) => {
                                    setSelectedCategory('fashion');
                                    setSelectedSubcategory(null);
                                    setMobileMenuOpen(false);
                                    scrollToShop(e);
                                }}
                                className="text-left text-stone-600 hover:text-[#E06D53] py-1 cursor-pointer"
                            >
                                {t.nav.fashion}
                            </button>
                            <button
                                onClick={(e) => {
                                    setSelectedCategory('home-living');
                                    setSelectedSubcategory(null);
                                    setSelectedSubSubcategory(null);
                                    setMobileMenuOpen(false);
                                    scrollToShop(e);
                                }}
                                className="text-left text-stone-600 hover:text-[#E06D53] py-1 cursor-pointer"
                            >
                                {t.nav.homeLiving}
                            </button>
                            <button
                                onClick={(e) => {
                                    setSelectedCategory('lifestyle');
                                    setSelectedSubcategory(null);
                                    setSelectedSubSubcategory(null);
                                    setMobileMenuOpen(false);
                                    scrollToShop(e);
                                }}
                                className="text-left text-stone-600 hover:text-[#E06D53] py-1 cursor-pointer"
                            >
                                {t.nav.lifestyle}
                            </button>
                            <button
                                onClick={(e) => {
                                    setSelectedCategory('all');
                                    setSelectedSubcategory(null);
                                    setMobileMenuOpen(false);
                                    scrollToShop(e);
                                }}
                                className="text-left text-[#E06D53] py-1 border-b border-stone-50 cursor-pointer"
                            >
                                {t.nav.newArrivals}
                            </button>
                            <button
                                onClick={(e) => {
                                    setSelectedCategory('discount');
                                    setSelectedSubcategory(null);
                                    setMobileMenuOpen(false);
                                    scrollToShop(e);
                                }}
                                className="text-left text-stone-600 hover:text-[#E06D53] py-1 cursor-pointer"
                            >
                                {t.nav.sale}
                            </button>
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
                            {/* Mobile Language Selector */}
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-stone-500 font-medium">Language / Bahasa</span>
                                <div className="flex items-center rounded-full border border-stone-200 bg-stone-100 p-0.5">
                                    <button
                                        onClick={() => switchLocale('id')}
                                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                            locale === 'id' ? 'bg-[#E06D53] text-white shadow-sm' : 'text-stone-500'
                                        }`}
                                    >
                                        ID
                                    </button>
                                    <button
                                        onClick={() => switchLocale('en')}
                                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                            locale === 'en' ? 'bg-[#E06D53] text-white shadow-sm' : 'text-stone-500'
                                        }`}
                                    >
                                        EN
                                    </button>
                                </div>
                            </div>

                            {/* Mobile Auth */}
                            {auth?.user ? (
                                <Link
                                    href={dashboard.url()}
                                    className="flex w-full items-center justify-center rounded-lg bg-stone-100 py-2.5 text-sm font-medium text-stone-800"
                                >
                                    {t.nav.dashboard}
                                </Link>
                            ) : (
                                <div className="grid grid-cols-2 gap-3">
                                    <Link
                                        href={login.url()}
                                        className="flex items-center justify-center rounded-lg border border-stone-200 py-2.5 text-sm font-medium text-stone-800"
                                    >
                                        {t.nav.login}
                                    </Link>
                                    <Link
                                        href="/register"
                                        className="flex items-center justify-center rounded-lg bg-[#E06D53] py-2.5 text-sm font-medium text-white shadow-sm hover:bg-[#C85B43]"
                                    >
                                        {t.nav.register}
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </header>

            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {/* HERO BANNER CONTAINER */}
                <section 
                    onClick={scrollToShop}
                    className="relative overflow-hidden rounded-[2rem] lg:rounded-[2.5rem] bg-[#FAF7EE] shadow-sm mb-16 cursor-pointer"
                >
                    <div className="relative aspect-[16/10] md:aspect-[2.1/1] w-full overflow-hidden">
                        <img
                            src="/images/hero_banner.png"
                            alt="Hanyza Home Living Lifestyle"
                            className="h-full w-full object-cover object-center transform scale-102 hover:scale-100 transition-transform duration-1000 ease-out"
                        />
                        {/* Dark/Warm gradient overlay to boost text contrast */}
                        <div className="absolute inset-0 bg-gradient-to-r from-stone-900/50 via-stone-900/25 to-transparent md:bg-gradient-to-r md:from-stone-900/40 md:via-stone-900/10 md:to-transparent" />

                        {/* Absolute positioned content text */}
                        <div className="absolute inset-y-0 left-0 flex items-center px-8 sm:px-16 md:w-[60%] lg:w-[50%]">
                            <div className="flex flex-col items-start text-white">
                                <h1 className="text-3xl font-bold leading-tight sm:text-4xl md:text-5xl lg:text-6xl tracking-tight text-white mb-4 drop-shadow-sm font-sans">
                                    {t.hero.title}
                                </h1>
                                <p className="text-sm sm:text-base md:text-lg text-stone-100/90 max-w-md mb-8 font-normal leading-relaxed">
                                    {t.hero.subtitle}
                                </p>
                                <button 
                                    onClick={scrollToShop}
                                    className="inline-flex items-center justify-center rounded-full bg-[#E06D53] px-6 py-3 text-sm sm:text-base font-semibold text-white shadow-md hover:bg-[#C85B43] hover:shadow-lg transform hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 cursor-pointer"
                                >
                                    {t.hero.cta}
                                    <ArrowRight className="ml-2 h-4 w-4 stroke-[2]" />
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* NEW ARRIVALS GRID SECTION */}
                <section id="new-arrivals" className="mb-16 scroll-mt-24">
                    {/* Header and Subcategory selector */}
                    <div className="mb-8 space-y-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-100 pb-4">
                            <div>
                                <h2 className="text-2xl font-bold tracking-tight text-stone-900 sm:text-3xl font-sans capitalize">
                                    {selectedCategory === 'all' && t.newArrivals.title}
                                    {selectedCategory === 'fashion' && (locale === 'id' ? 'Koleksi Fashion' : 'Fashion Collection')}
                                    {selectedCategory === 'home-living' && (locale === 'id' ? 'Koleksi Home Living' : 'Home Living Collection')}
                                    {selectedCategory === 'lifestyle' && (locale === 'id' ? 'Koleksi Gaya Hidup' : 'Lifestyle Collection')}
                                    {selectedCategory === 'discount' && (locale === 'id' ? 'Produk Diskon Spesial' : 'Special Discount Products')}
                                </h2>
                                <p className="mt-1.5 text-sm text-stone-500">
                                    {selectedCategory === 'all' && t.newArrivals.subtitle}
                                    {selectedCategory === 'fashion' && (locale === 'id' ? 'Pakaian & aksesoris keluarga pilihan terbaik.' : 'Curated premium fashion and accessories.')}
                                    {selectedCategory === 'home-living' && (locale === 'id' ? 'Peralatan rumah & ruang tamu estetik.' : 'Elegant bedding, pottery, and living room styling.')}
                                    {selectedCategory === 'lifestyle' && (locale === 'id' ? 'Hobi, peralatan olahraga, souvenir, dan fotografi.' : 'Hobbies, sports gear, stationery, and photography essentials.')}
                                    {selectedCategory === 'discount' && (locale === 'id' ? 'Penawaran harga terbaik untuk waktu terbatas.' : 'Time-limited promotional deals for you.')}
                                </p>
                            </div>

                            {/* Additional search bar on mobile for convenience */}
                            <div className="relative w-full md:max-w-xs shrink-0 md:hidden">
                                <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-stone-400" />
                                <input
                                    type="text"
                                    placeholder={locale === 'id' ? 'Cari barang...' : 'Search catalog...'}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-stone-200 bg-white focus:outline-hidden"
                                />
                            </div>
                        </div>

                        {/* Level 2 Subcategory Pills - displayed when Fashion, Home Living, or Lifestyle is selected */}
                        {(selectedCategory === 'fashion' || selectedCategory === 'home-living' || selectedCategory === 'lifestyle') && (
                            <div className="space-y-3">
                                <div className="flex flex-wrap gap-1.5 animate-fadeIn">
                                    {((() => {
                                        if (selectedCategory === 'fashion') {
                                            return ['Laki-laki', 'Perempuan', 'Newborn', 'Child', 'Teenager', 'Adult'];
                                        } else if (selectedCategory === 'home-living') {
                                            return ['Living Room', 'Bath Room', 'Bed Room', 'Kitchen', 'Dining Room', 'Furnitur', 'Electronic', 'Storage', 'Dekorasi Rumah', 'Makanan & Minuman', 'Perlengkapan Rumah'];
                                        } else {
                                            return ['Koleksi Hobi', 'Alat Olahraga', 'Souvenir dan Perlengkapan', 'Buku dan Alat Tulis', 'Fotografi', 'Komputer & Aksesoris', 'Handphone & Aksesoris', 'Perawatan & Kecantikan', 'Otomotif'];
                                        }
                                    })()).map((sub) => (
                                        <button
                                            key={sub}
                                            onClick={() => {
                                                setSelectedSubcategory(selectedSubcategory === sub ? null : sub);
                                                setSelectedSubSubcategory(null);
                                            }}
                                            className={`px-3 py-1 text-[10px] uppercase tracking-wider font-bold rounded-lg transition-all cursor-pointer ${
                                                selectedSubcategory === sub
                                                    ? 'bg-[#E06D53]/10 text-[#E06D53] border border-[#E06D53]/30 shadow-2xs'
                                                    : 'bg-white border border-stone-200 text-stone-500 hover:border-stone-400'
                                            }`}
                                        >
                                            {sub}
                                        </button>
                                    ))}
                                </div>

                                {/* Dynamic Sub-subcategory selection displayed when any target group subcategory is active */}
                                {selectedCategory === 'fashion' && selectedSubcategory && (
                                    <div className="flex flex-wrap gap-1.5 pt-1.5 pl-4 border-l-2 border-[#E06D53]/30 animate-slideDown">
                                        {[
                                            'Atasan',
                                            'Bawahan',
                                            'Pakaian Khusus',
                                            'Fashion Muslim',
                                            'Alas Kaki (Casual)',
                                            'Alas Kaki (Formal)',
                                            'Alas Kaki (Sandal)',
                                            'Alas Kaki (Boots)',
                                            'Aksesoris'
                                        ].map((subSub) => (
                                            <button
                                                key={subSub}
                                                onClick={() => setSelectedSubSubcategory(selectedSubSubcategory === subSub ? null : subSub)}
                                                className={`px-2.5 py-0.5 rounded-lg text-[9px] uppercase tracking-wider font-bold transition-all cursor-pointer ${
                                                    selectedSubSubcategory === subSub
                                                        ? 'bg-[#E06D53] text-white shadow-2xs'
                                                        : 'bg-white border border-stone-200 text-stone-500 hover:border-stone-400'
                                                }`}
                                            >
                                                {subSub}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Active Vouchers Promotion */}
                    {vouchers && vouchers.length > 0 && (
                        <div id="vouchers-section" className="mb-10 animate-fadeIn bg-gradient-to-br from-[#E06D53]/[0.02] via-[#FAF9F6] to-white border border-[#E06D53]/15 rounded-2xl p-5 shadow-2xs">
                            <div className="flex items-center gap-2 mb-4">
                                <Gift className="size-5 text-[#E06D53] shrink-0" />
                                <h3 className="text-xs font-bold text-stone-850 uppercase tracking-widest">
                                    {locale === 'id' ? 'Voucher Belanja Toko' : 'Store Vouchers & Coupons'}
                                </h3>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                {vouchers.map((voucher: any) => (
                                    <div 
                                        key={voucher.id}
                                        className="relative flex items-center bg-white border border-stone-200/80 rounded-xl overflow-hidden shadow-3xs hover:shadow-2xs transition-all duration-300 h-[88px]"
                                    >
                                        {/* Left part: Discount Badge */}
                                        <div className="bg-[#E06D53] text-white py-4 px-3 flex flex-col items-center justify-center min-w-[90px] text-center shrink-0 h-full relative">
                                            <span className="text-[8px] font-bold uppercase tracking-wider opacity-90">Potongan</span>
                                            <span className="text-xs font-black tracking-tight">{formatPrice(voucher.discount_amount)}</span>
                                            {/* Shopee-style dashed line divider on the right */}
                                            <div className="absolute right-0 top-0 bottom-0 w-0 border-r border-dashed border-white/40 h-full"></div>
                                        </div>
                                        {/* Right part: Code and Copy Action */}
                                        <div className="p-3 flex-1 flex flex-col justify-between min-w-0 text-left h-full">
                                            <div className="space-y-0.5">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-[9px] font-black text-stone-850 bg-stone-100 border border-stone-200 px-1.5 py-0.5 rounded select-all font-mono tracking-wider">
                                                        {voucher.code}
                                                    </span>
                                                </div>
                                                <p className="text-[9px] text-stone-400 font-medium truncate mt-1">
                                                    {locale === 'id' 
                                                        ? `Min: ${formatPrice(voucher.min_spend)}` 
                                                        : `Min Spend: ${formatPrice(voucher.min_spend)}`
                                                    }
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    navigator.clipboard.writeText(voucher.code);
                                                    toast.success(locale === 'id' ? 'Kode voucher berhasil disalin!' : 'Voucher code copied to clipboard!');
                                                }}
                                                className="mt-2 text-center bg-[#E06D53]/10 hover:bg-[#E06D53] hover:text-white text-[#E06D53] text-[9px] font-bold py-1 px-2.5 rounded-lg transition-all duration-300 uppercase tracking-widest cursor-pointer w-fit"
                                            >
                                                {locale === 'id' ? 'Salin' : 'Copy'}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Products Grid (4 items) */}
                    <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
                        {filteredProducts.map((product) => (
                            <div
                                key={product.id}
                                className="group relative flex flex-col overflow-hidden rounded-2xl border border-stone-200/40 bg-white shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300"
                            >
                                <Link href={`/product/${product.slug}`} className="flex flex-col flex-1">
                                    {/* Image Container */}
                                    <div className="relative aspect-square w-full overflow-hidden bg-stone-100">
                                        <img
                                            src={product.image && (product.image.startsWith('/') || product.image.startsWith('http')) ? product.image : `/storage/${product.image}`}
                                            alt={locale === 'id' ? product.name_id : product.name_en}
                                            className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
                                            loading="lazy"
                                        />
                                        {/* Category tag */}
                                        {product.category && (
                                            <span className="absolute top-3 left-3 rounded-full bg-[#FAF7EE] border border-stone-200/50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-stone-700 shadow-sm">
                                                {product.category.name}
                                            </span>
                                        )}
                                    </div>

                                    {/* Body info */}
                                    <div className="flex flex-1 flex-col px-5 pt-5 pb-1">
                                        <h3 className="text-sm font-semibold text-stone-800 group-hover:text-[#E06D53] transition-colors line-clamp-1">
                                            {locale === 'id' ? product.name_id : product.name_en}
                                        </h3>
                                        <p className="mt-1 text-base font-bold text-stone-900">
                                            {formatPrice(product.price)}
                                        </p>
                                    </div>
                                </Link>

                                <div className="px-5 pb-5">
                                    {/* terracotta checkout / add to cart button */}
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            handleAddToCart(product.id, product.slug);
                                        }}
                                        className={`w-full flex items-center justify-center rounded-xl py-2.5 text-xs font-semibold shadow-sm transition-all duration-300 cursor-pointer ${
                                            addedToCartId === product.id
                                                ? 'bg-emerald-550 text-white hover:bg-emerald-600 shadow-sm border border-emerald-550'
                                                : 'bg-[#E06D53] text-white hover:bg-[#C85B43]'
                                        }`}
                                    >
                                        {addedToCartId === product.id ? (
                                            <>
                                                <CheckCircle className="mr-1.5 h-3.5 w-3.5 stroke-[2.5] animate-scaleIn" />
                                                {t.newArrivals.added}
                                            </>
                                        ) : (
                                            <>
                                                <ShoppingBag className="mr-1.5 h-3.5 w-3.5 stroke-[2]" />
                                                {t.newArrivals.addToCart}
                                            </>
                                        )}
                                    </button>
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
                        {/* Logo and Tagline */}
                        <div className="flex flex-col space-y-4">
                            <img src="/images/logo.png" alt="Hanyza" className="h-10 w-auto object-contain self-start" />
                            <p className="text-stone-500 max-w-xs leading-relaxed">
                                {t.footer.tagline}
                            </p>
                            <p className="text-xs text-stone-400 mt-auto">
                                &copy; 2026 Hanyza.id. All rights reserved.
                            </p>
                        </div>

                        {/* Shop category */}
                        <div>
                            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-900 mb-4">
                                {t.footer.shop}
                            </h4>
                            <ul className="space-y-3 font-medium">
                                <li>
                                    <a href="#fashion" className="hover:text-[#E06D53] transition-colors">
                                        {t.nav.fashion}
                                    </a>
                                </li>
                                <li>
                                    <a href="#home-living" className="hover:text-[#E06D53] transition-colors">
                                        {t.nav.homeLiving}
                                    </a>
                                </li>
                            </ul>
                        </div>

                        {/* Support category */}
                        <div>
                            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-900 mb-4">
                                {t.footer.support}
                            </h4>
                            <ul className="space-y-3 font-medium">
                                <li>
                                    <a href="#customer-service" className="hover:text-[#E06D53] transition-colors">
                                        {t.footer.customerService}
                                    </a>
                                </li>
                                <li>
                                    <a href="#privacy-policy" className="hover:text-[#E06D53] transition-colors">
                                        {t.footer.privacyPolicy}
                                    </a>
                                </li>
                            </ul>
                        </div>

                        {/* Newsletter category */}
                        <div>
                            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-900 mb-4">
                                {t.footer.stayUpdated}
                            </h4>
                            <ul className="space-y-3 font-medium">
                                <li>
                                    <a href="#newsletter" className="hover:text-[#E06D53] transition-colors">
                                        {t.footer.newsletter}
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </footer>

            {/* Dynamic 5-Second Recommendation Popup */}
            {showRecommendation && recommendedProduct && (
                <div className="fixed bottom-6 right-6 z-50 max-w-sm rounded-2xl bg-white border border-stone-200/50 shadow-2xl p-4 flex gap-4 animate-slideInRight">
                    {/* Thumbnail */}
                    <div className="size-16 rounded-xl bg-stone-100 overflow-hidden border border-stone-150 shrink-0">
                        <img src={recommendedProduct.image} alt="" className="size-full object-cover" />
                    </div>
                    {/* Content */}
                    <div className="flex-1 space-y-1.5">
                        <div className="flex justify-between items-start">
                            <span className="text-[9px] font-black text-[#E06D53] tracking-widest uppercase">
                                {locale === 'id' ? 'Direkomendasikan untuk Anda' : 'Recommended for you'}
                            </span>
                            <button onClick={() => setShowRecommendation(false)} className="text-stone-400 hover:text-stone-600 transition-colors cursor-pointer">
                                <X className="size-3.5" />
                            </button>
                        </div>
                        <h4 className="text-xs font-bold text-stone-850 line-clamp-1">
                            {locale === 'id' ? recommendedProduct.name_id : recommendedProduct.name_en}
                        </h4>
                        <div className="flex items-center justify-between gap-3 pt-1">
                            <span className="text-xs font-bold text-stone-900">{formatPrice(recommendedProduct.price)}</span>
                            <button 
                                onClick={handleAddRecommendedToCart}
                                className="bg-[#E06D53] hover:bg-[#C85B43] text-white text-[10px] font-bold px-3 py-1.5 rounded-lg shadow-md transition-all cursor-pointer uppercase tracking-wider"
                            >
                                {locale === 'id' ? '+ Keranjang' : '+ Add to Cart'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <CallCenterDialog open={isSupportOpen} onOpenChange={setIsSupportOpen} />
        </div>
    );
}

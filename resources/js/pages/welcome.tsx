'use no memo';
import { Head, Link, usePage, router } from '@inertiajs/react';
import { dashboard, login } from '@/routes';
import { ShoppingBag, User, ArrowRight, Menu, X, ChevronDown, CheckCircle } from 'lucide-react';
import { useState } from 'react';

interface PageProps {
    locale?: string;
    auth: {
        user: any;
    };
    [key: string]: any;
}

export default function Welcome() {
    const { locale = 'en', auth } = usePage<PageProps>().props;
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [cartCount, setCartCount] = useState(0);
    const [addedToCartId, setAddedToCartId] = useState<number | null>(null);

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

    const products = [
        {
            id: 1,
            slug: "organic-cotton-sleepsuit",
            title: {
                en: "Organic Cotton Sleepsuit",
                id: "Baju Tidur Katun Organik"
            },
            tag: t.newArrivals.badges.newBorn,
            price: "Rp 149.000",
            image: "/images/organic_cotton_sleepsuit.png"
        },
        {
            id: 2,
            slug: "earthy-ceramic-vase",
            title: {
                en: "Earthy Ceramic Vase",
                id: "Vas Keramik Earthy"
            },
            tag: t.newArrivals.badges.homeDecor,
            price: "Rp 285.000",
            image: "/images/earthy_ceramic_vase.png"
        },
        {
            id: 3,
            slug: "classic-linen-shirt",
            title: {
                en: "Classic Linen Shirt",
                id: "Kemeja Linen Klasik"
            },
            tag: null,
            price: "Rp 320.000",
            image: "/images/classic_linen_shirt.png"
        },
        {
            id: 4,
            slug: "premium-bath-towel-set",
            title: {
                en: "Premium Bath Towel Set",
                id: "Set Handuk Mandi Premium"
            },
            tag: null,
            price: "Rp 195.000",
            image: "/images/premium_bath_towel_set.png"
        }
    ];

    const switchLocale = (newLocale: 'en' | 'id') => {
        if (newLocale === locale) return;
        router.post('/locale', { locale: newLocale }, {
            preserveScroll: true
        });
    };

    const handleAddToCart = (id: number) => {
        setCartCount(prev => prev + 1);
        setAddedToCartId(id);
        setTimeout(() => {
            setAddedToCartId(null);
        }, 1500);
    };

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
                    <nav className="hidden md:flex items-center space-x-8 text-sm font-medium">
                        <a href="#fashion" className="text-stone-600 hover:text-[#E06D53] transition-colors">
                            {t.nav.fashion}
                        </a>
                        <a href="#home-living" className="text-stone-600 hover:text-[#E06D53] transition-colors">
                            {t.nav.homeLiving}
                        </a>
                        <a href="#new-arrivals" className="relative py-1 text-[#E06D53] after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:bg-[#E06D53] after:rounded-full">
                            {t.nav.newArrivals}
                        </a>
                        <a href="#sale" className="text-stone-600 hover:text-[#E06D53] transition-colors">
                            {t.nav.sale}
                        </a>
                    </nav>

                    {/* Header Controls (Language, Cart, Auth) */}
                    <div className="hidden md:flex items-center space-x-6">
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
                        <button className="relative p-2 text-stone-700 hover:text-[#E06D53] transition-colors">
                            <ShoppingBag className="h-5 w-5 stroke-[1.8]" />
                            {cartCount > 0 && (
                                <span className="absolute -top-0.5 -right-0.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-[#E06D53] text-[10px] font-bold text-white shadow-sm animate-scaleIn">
                                    {cartCount}
                                </span>
                            )}
                        </button>

                        {/* User Account / Auth Links */}
                        {auth.user ? (
                            <Link
                                href={dashboard.url()}
                                className="flex items-center space-x-1 p-2 text-stone-700 hover:text-[#E06D53] transition-colors"
                            >
                                <User className="h-5 w-5 stroke-[1.8]" />
                            </Link>
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
                    <div className="flex items-center space-x-4 md:hidden">
                        {/* Cart */}
                        <button className="relative p-2 text-stone-700 hover:text-[#E06D53] transition-colors">
                            <ShoppingBag className="h-5 w-5 stroke-[1.8]" />
                            {cartCount > 0 && (
                                <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#E06D53] text-[9px] font-bold text-white">
                                    {cartCount}
                                </span>
                            )}
                        </button>

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
                    <div className="md:hidden border-t border-stone-100 bg-[#FFFFFF] px-6 py-6 shadow-lg animate-slideDown">
                        <nav className="flex flex-col space-y-4 text-base font-medium">
                            <a
                                href="#fashion"
                                onClick={() => setMobileMenuOpen(false)}
                                className="text-stone-600 hover:text-[#E06D53] py-1 border-b border-stone-50"
                            >
                                {t.nav.fashion}
                            </a>
                            <a
                                href="#home-living"
                                onClick={() => setMobileMenuOpen(false)}
                                className="text-stone-600 hover:text-[#E06D53] py-1 border-b border-stone-50"
                            >
                                {t.nav.homeLiving}
                            </a>
                            <a
                                href="#new-arrivals"
                                onClick={() => setMobileMenuOpen(false)}
                                className="text-[#E06D53] py-1 border-b border-stone-50"
                            >
                                {t.nav.newArrivals}
                            </a>
                            <a
                                href="#sale"
                                onClick={() => setMobileMenuOpen(false)}
                                className="text-stone-600 hover:text-[#E06D53] py-1"
                            >
                                {t.nav.sale}
                            </a>
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
                            {auth.user ? (
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
                <section className="relative overflow-hidden rounded-[2rem] lg:rounded-[2.5rem] bg-[#FAF7EE] shadow-sm mb-16">
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
                                <button className="inline-flex items-center justify-center rounded-full bg-[#E06D53] px-6 py-3 text-sm sm:text-base font-semibold text-white shadow-md hover:bg-[#C85B43] hover:shadow-lg transform hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 cursor-pointer">
                                    {t.hero.cta}
                                    <ArrowRight className="ml-2 h-4 w-4 stroke-[2]" />
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* NEW ARRIVALS GRID SECTION */}
                <section id="new-arrivals" className="mb-16 scroll-mt-24">
                    {/* Header */}
                    <div className="mb-8 flex flex-col md:flex-row md:items-end md:justify-between">
                        <div>
                            <h2 className="text-2xl font-bold tracking-tight text-stone-900 sm:text-3xl font-sans">
                                {t.newArrivals.title}
                            </h2>
                            <p className="mt-1.5 text-sm text-stone-500">
                                {t.newArrivals.subtitle}
                            </p>
                        </div>
                        <a
                            href="#view-all"
                            className="group mt-4 inline-flex items-center text-sm font-semibold text-[#E06D53] hover:opacity-85 md:mt-0 transition-opacity"
                        >
                            {t.newArrivals.viewAll}
                            <ArrowRight className="ml-1 h-4 w-4 transform group-hover:translate-x-1 transition-transform stroke-[2.2]" />
                        </a>
                    </div>

                    {/* Products Grid (4 items) */}
                    <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
                        {products.map((product) => (
                            <div
                                key={product.id}
                                className="group relative flex flex-col overflow-hidden rounded-2xl border border-stone-200/40 bg-white shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300"
                            >
                                <Link href={`/product/${product.slug}`} className="flex flex-col flex-1">
                                    {/* Image Container */}
                                    <div className="relative aspect-square w-full overflow-hidden bg-stone-100">
                                        <img
                                            src={product.image}
                                            alt={locale === 'id' ? product.title.id : product.title.en}
                                            className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
                                        />
                                        {/* Category tag */}
                                        {product.tag && (
                                            <span className="absolute top-3 left-3 rounded-full bg-[#FAF7EE] border border-stone-200/50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-stone-700 shadow-sm">
                                                {product.tag}
                                            </span>
                                        )}
                                    </div>

                                    {/* Body info */}
                                    <div className="flex flex-1 flex-col px-5 pt-5 pb-1">
                                        <h3 className="text-sm font-semibold text-stone-800 group-hover:text-[#E06D53] transition-colors line-clamp-1">
                                            {locale === 'id' ? product.title.id : product.title.en}
                                        </h3>
                                        <p className="mt-1 text-base font-bold text-stone-900">
                                            {product.price}
                                        </p>
                                    </div>
                                </Link>

                                <div className="px-5 pb-5">
                                    {/* terracotta checkout / add to cart button */}
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            handleAddToCart(product.id);
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
        </div>
    );
}

import { Link, usePage, router } from '@inertiajs/react';
import { useState, useEffect, useRef, type PropsWithChildren } from 'react';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { cn, toUrl } from '@/lib/utils';
import { edit as editAppearance } from '@/routes/appearance';
import { edit } from '@/routes/profile';
import { edit as editSecurity } from '@/routes/security';
import { index as addressesIndex } from '@/routes/addresses';
import type { NavItem } from '@/types';
import { 
    ShoppingBag, User, ArrowRight, Menu, X, ChevronDown, CheckCircle, 
    Search, Gift, Coins, MapPin, ShieldCheck, KeyRound, Palette, LayoutGrid,
    FolderTree, Tag, Package, Users, Bell, CreditCard, Boxes, Store, DollarSign
} from 'lucide-react';
import { CallCenterDialog } from '@/components/call-center-dialog';


const sidebarNavItems: NavItem[] = [
    {
        title: 'Profile',
        href: edit(),
        icon: null,
    },
    {
        title: 'Security',
        href: editSecurity(),
        icon: null,
    },
    {
        title: 'Appearance',
        href: editAppearance(),
        icon: null,
    },
    {
        title: 'Addresses',
        href: addressesIndex(),
        icon: null,
    },
];

export default function SettingsLayout({ children }: PropsWithChildren) {
    const { isCurrentOrParentUrl } = useCurrentUrl();
    const page = usePage<any>();
    const { auth, locale = 'en' } = page.props;
    const { url } = page;
    const cartCount = auth?.cartCount ?? 0;

    const hasPermission = (permission: string) => {
        const user = auth?.user;
        if (!user) return false;
        if (user.role === 'master') return true;
        
        // If employee (seller), check the permissions array
        if (user.role === 'seller') {
            if (!user.permissions) return false;
            return user.permissions.includes(permission);
        }
        
        return false;
    };

    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSupportOpen, setIsSupportOpen] = useState(false);
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

    const switchLocale = (newLocale: 'en' | 'id') => {
        if (newLocale === locale) return;
        router.post('/locale', { locale: newLocale }, {
            preserveScroll: true
        });
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.visit(`/?search=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    // Bilingual dictionary for layout
    const translations = {
        en: {
            title: "My Profile Settings",
            desc: "Manage your profile information and account security details.",
            footer: {
                tagline: "Nurturing Professionalism. Menghadirkan kenyamanan sehari-hari dengan desain elegan untuk Anda dan rumah Anda.",
                shop: "Shop",
                support: "Support",
                customerService: "Customer Service",
                privacyPolicy: "Privacy Policy",
                stayUpdated: "Stay Updated",
                newsletter: "Newsletter Subscription"
            }
        },
        id: {
            title: "Pengaturan Profil Saya",
            desc: "Kelola informasi profil dan detail keamanan akun Anda.",
            footer: {
                tagline: "Nurturing Professionalism. Menghadirkan kenyamanan sehari-hari dengan desain elegan untuk Anda dan rumah Anda.",
                shop: "Belanja",
                support: "Bantuan",
                customerService: "Layanan Pelanggan",
                privacyPolicy: "Kebijakan Privasi",
                stayUpdated: "Tetap Terhubung",
                newsletter: "Berlangganan Newsletter"
            }
        }
    };

    const t = translations[locale as 'en' | 'id'] || translations.en;

    // Check if user is buyer. If not, use standard dashboard settings layout.
    const isBuyer = auth?.user && auth.user.role === 'buyer';
    const isSeller = auth?.user && (auth.user.role === 'seller' || auth.user.role === 'master');
    const isEmployee = auth?.user && auth.user.role === 'seller';

    // Determine dynamic title and description based on current URL path
    const getDynamicHeadings = () => {
        const path = new URL(url, 'http://localhost').pathname;
        if (path === '/cart') {
            return {
                title: locale === 'id' ? 'Pesanan Saya (Keranjang Belanja)' : 'My Orders (Shopping Cart)',
                desc: locale === 'id' ? 'Tinjau pesanan Anda dan selesaikan pembayaran.' : 'Review your order and complete your payment.'
            };
        }
        if (path === '/dashboard') {
            return {
                title: isSeller
                    ? (locale === 'id' ? 'Dasbor Toko' : 'Store Dashboard')
                    : (locale === 'id' ? 'Dasbor Akun' : 'Account Dashboard'),
                desc: isSeller
                    ? (locale === 'id' ? 'Kelola toko Anda, lihat performa penjualan, dan aktivitas toko.' : 'Manage your store, view sales performance, and store activity.')
                    : (locale === 'id' ? 'Ringkasan aktivitas belanja, saldo, dan poin Anda.' : 'Summary of your shopping activity, balance, and points.')
            };
        }
        if (path.startsWith('/categories')) {
            return {
                title: locale === 'id' ? 'Kelola Kategori' : 'Manage Categories',
                desc: locale === 'id' ? 'Atur dan kelola kategori produk di toko Anda.' : 'Organize and manage your store\'s product categories.'
            };
        }
        if (path.startsWith('/products')) {
            return {
                title: locale === 'id' ? 'Daftar Produk Toko' : 'Store Product Catalog',
                desc: locale === 'id' ? 'Kelola katalog produk, tambah produk baru, edit detail, dan atur stok.' : 'Manage your product catalog, add new products, edit details, and track stock.'
            };
        }
        if (path.startsWith('/vouchers')) {
            return {
                title: locale === 'id' ? 'Kelola Voucher' : 'Manage Vouchers',
                desc: locale === 'id' ? 'Buat dan atur voucher diskon belanja untuk pelanggan Anda.' : 'Create and configure shopping discount vouchers for your customers.'
            };
        }
        if (path === '/users') {
            return {
                title: locale === 'id' ? 'Master Data User' : 'Master Data Users',
                desc: locale === 'id' ? 'Kelola data pengguna, role akses, dan status keaktifan user.' : 'Manage user data, access roles, and user active status.'
            };
        }
        if (path.startsWith('/orders')) {
            return {
                title: isSeller
                    ? (locale === 'id' ? 'Kelola Pesanan Pelanggan' : 'Manage Customer Orders')
                    : (locale === 'id' ? 'Pesanan Saya' : 'My Orders'),
                desc: isSeller
                    ? (locale === 'id' ? 'Proses pesanan masuk, pantau status pengiriman barang pelanggan.' : 'Process incoming orders, track delivery status of customer shipments.')
                    : (locale === 'id' ? 'Pantau status pengiriman dan riwayat pembelian Anda.' : 'Track your shipping status and purchase history.')
            };
        }
        if (path.startsWith('/settings/addresses')) {
            return {
                title: locale === 'id' ? 'Alamat Pengiriman Saya' : 'My Shipping Addresses',
                desc: locale === 'id' ? 'Kelola lokasi pengiriman untuk pesanan Anda.' : 'Manage your delivery locations for orders.'
            };
        }
        if (path.startsWith('/settings/security')) {
            return {
                title: locale === 'id' ? 'Keamanan Akun' : 'Account Security',
                desc: locale === 'id' ? 'Perbarui kata sandi dan amankan akun Anda.' : 'Update your password and secure your account.'
            };
        }
        if (path.startsWith('/settings/appearance')) {
            return {
                title: locale === 'id' ? 'Tampilan Aplikasi' : 'App Appearance',
                desc: locale === 'id' ? 'Sesuaikan tema warna dan visual aplikasi Anda.' : 'Adjust your application color theme and visuals.'
            };
        }
        return {
            title: isSeller
                ? (locale === 'id' ? 'Profil Toko' : 'Store Profile')
                : (locale === 'id' ? 'Profil Saya' : 'My Profile'),
            desc: isSeller
                ? (locale === 'id' ? 'Kelola informasi profil toko dan akun penjual Anda.' : 'Manage your store profile information and seller account.')
                : (locale === 'id' ? 'Kelola informasi profil lengkap Anda di sini.' : 'Manage your full profile information here.')
        };
    };

    const headings = getDynamicHeadings();

    if (!isBuyer && !isSeller) {
        return (
            <div className="px-4 py-6">
                <Heading
                    title="Settings"
                    description="Manage your profile and account settings"
                />

                <div className="flex flex-col lg:flex-row lg:space-x-12">
                    <aside className="w-full max-w-xl lg:w-48">
                        <nav
                            className="flex flex-col space-y-1 space-x-0"
                            aria-label="Settings"
                        >
                            {sidebarNavItems.map((item, index) => (
                                <Button
                                    key={`${toUrl(item.href)}-${index}`}
                                    size="sm"
                                    variant="ghost"
                                    asChild
                                    className={cn('w-full justify-start', {
                                        'bg-muted': isCurrentOrParentUrl(item.href),
                                    })}
                                >
                                    <Link href={item.href}>
                                        {item.icon && (
                                            <item.icon className="h-4 w-4" />
                                        )}
                                        {item.title}
                                    </Link>
                                </Button>
                            ))}
                        </nav>
                    </aside>

                    <Separator className="my-6 lg:hidden" />

                    <div className="flex-1 md:max-w-2xl">
                        <section className="max-w-xl space-y-12">
                            {children}
                        </section>
                    </div>
                </div>
            </div>
        );
    }

    // Otherwise, render gorgeous Shopee storefront-style layout for buyers
    return (
        <div className="min-h-screen bg-[#FAF9F6] text-stone-850 flex flex-col font-sans">
            {/* STOREFRONT HEADER */}
            <header className="sticky top-0 z-50 w-full border-b border-stone-200/50 bg-[#FFFFFF]/90 backdrop-blur-md transition-all duration-300">
                <div className="mx-auto flex max-w-7xl h-20 items-center justify-between px-6 lg:px-8">
                    {/* Header Logo */}
                    <div className="flex items-center space-x-10">
                        <Link href="/" className="flex items-center shrink-0">
                            <img src="/images/logo.png" alt="Hanyza" className="h-10 w-auto object-contain" />
                        </Link>
                        
                        {/* Storefront Nav Links */}
                        <nav className="hidden lg:flex items-center space-x-8 font-semibold text-xs text-stone-500">
                            {!isEmployee && (
                                <>
                                    <Link href="/?category=fashion" className="hover:text-[#E06D53] transition-colors">
                                        Fashion
                                    </Link>
                                    <Link href="/?category=home-living" className="hover:text-[#E06D53] transition-colors">
                                        Home Living
                                    </Link>
                                    <Link href="/?category=lifestyle" className="hover:text-[#E06D53] transition-colors">
                                        Lifestyle
                                    </Link>
                                    <Link href="/?category=discount" className="hover:text-[#E06D53] transition-colors">
                                        {locale === 'id' ? 'Voucher' : 'Vouchers'}
                                    </Link>
                                </>
                            )}
                            <button
                                onClick={() => setIsSupportOpen(true)}
                                className="hover:text-[#E06D53] transition-colors cursor-pointer"
                            >
                                Call Center
                            </button>
                        </nav>
                    </div>

                    {/* Search bar */}
                    {!isEmployee && (
                        <form onSubmit={handleSearchSubmit} className="relative mx-4 hidden lg:block w-48 xl:w-60">
                            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-stone-400" />
                            <input
                                type="text"
                                placeholder={locale === 'id' ? 'Cari barang...' : 'Search catalog...'}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-4 py-1.5 text-xs rounded-full border border-stone-200 bg-stone-50/60 focus:outline-hidden focus:ring-1 focus:ring-[#E06D53] focus:border-[#E06D53] transition-all"
                            />
                        </form>
                    )}

                    {/* Controls */}
                    <div className="hidden lg:flex items-center space-x-6">
                        {/* Language Toggle */}
                        <div className="flex items-center rounded-full border border-stone-200/80 bg-stone-100/50 p-0.5">
                            <button
                                onClick={() => switchLocale('id')}
                                className={`rounded-full px-3 py-1 text-xs font-semibold transition-all duration-300 ${
                                    locale === 'id'
                                        ? 'bg-[#E06D53] text-white shadow-sm'
                                        : 'text-stone-500 hover:text-stone-850'
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

                        {/* Cart Link */}
                        {!isEmployee && (
                            <Link href="/cart" className="relative p-2 text-stone-700 hover:text-[#E06D53] transition-colors">
                                <ShoppingBag className="h-5 w-5 stroke-[1.8]" />
                                {cartCount > 0 && (
                                    <span className="absolute -top-0.5 -right-0.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-[#E06D53] text-[10px] font-bold text-white shadow-sm animate-scaleIn">
                                        {cartCount}
                                    </span>
                                )}
                            </Link>
                        )}

                        {/* User Account / Profile dropdown */}
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
                                        href="/settings/profile"
                                        onClick={() => setIsProfileDropdownOpen(false)}
                                        className="flex w-full items-center px-3.5 py-2.5 text-xs font-semibold text-stone-700 hover:bg-stone-50 hover:text-[#E06D53] rounded-lg transition-colors cursor-pointer"
                                    >
                                        {isSeller 
                                            ? (locale === 'id' ? 'Profil Toko' : 'Store Profile')
                                            : (locale === 'id' ? 'Akun Saya' : 'My Account')
                                        }
                                    </Link>
                                    
                                    <Link
                                        href="/orders"
                                        onClick={() => setIsProfileDropdownOpen(false)}
                                        className="flex w-full items-center px-3.5 py-2.5 text-xs font-semibold text-stone-700 hover:bg-stone-50 hover:text-[#E06D53] rounded-lg transition-colors cursor-pointer"
                                    >
                                        {isSeller
                                            ? (locale === 'id' ? 'Kelola Pesanan' : 'Manage Orders')
                                            : (locale === 'id' ? 'Pesanan Saya' : 'My Orders')
                                        }
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
                    </div>

                    {/* Mobile Menu & Controls */}
                    <div className="flex items-center space-x-4 lg:hidden">
                        {/* Cart */}
                        {!isEmployee && (
                            <Link href="/cart" className="relative p-2 text-stone-700 hover:text-[#E06D53] transition-colors">
                                <ShoppingBag className="h-5 w-5 stroke-[1.8]" />
                                {cartCount > 0 && (
                                    <span className="absolute -top-0.5 -right-0.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-[#E06D53] text-[9px] font-bold text-white shadow-sm">
                                        {cartCount}
                                    </span>
                                )}
                            </Link>
                        )}

                        {/* Hamburger */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="p-2 text-stone-700 hover:text-[#E06D53] transition-colors"
                        >
                            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </header>

            {/* MOBILE MENU DROPDOWN */}
            {mobileMenuOpen && (
                <div className="lg:hidden border-t border-stone-100 bg-[#FFFFFF] px-6 py-6 shadow-lg animate-slideDown">
                    <nav className="flex flex-col space-y-3 font-semibold text-sm">
                        {!isEmployee && (
                            <>
                                <Link href="/?category=fashion" onClick={() => setMobileMenuOpen(false)} className="text-left text-stone-600 hover:text-[#E06D53] py-1 cursor-pointer">
                                    Fashion
                                </Link>
                                <Link href="/?category=home-living" onClick={() => setMobileMenuOpen(false)} className="text-left text-stone-600 hover:text-[#E06D53] py-1 cursor-pointer">
                                    Home Living
                                </Link>
                                <Link href="/?category=lifestyle" onClick={() => setMobileMenuOpen(false)} className="text-left text-stone-600 hover:text-[#E06D53] py-1 cursor-pointer">
                                    Lifestyle
                                </Link>
                                <Link href="/?category=discount" onClick={() => setMobileMenuOpen(false)} className="text-left text-stone-600 hover:text-[#E06D53] py-1 cursor-pointer">
                                    {locale === 'id' ? 'Voucher' : 'Vouchers'}
                                </Link>
                            </>
                        )}
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
                        <div className="flex flex-col space-y-2 border-t border-stone-100 pt-4">
                            <Link
                                href="/settings/profile"
                                onClick={() => setMobileMenuOpen(false)}
                                className="text-sm font-medium text-stone-600 hover:text-[#E06D53] transition-colors"
                            >
                                {isSeller 
                                    ? (locale === 'id' ? 'Profil Toko' : 'Store Profile')
                                    : (locale === 'id' ? 'Akun Saya' : 'My Account')
                                }
                            </Link>
                            <Link
                                href="/orders"
                                onClick={() => setMobileMenuOpen(false)}
                                className="text-sm font-medium text-stone-600 hover:text-[#E06D53] transition-colors"
                            >
                                {isSeller
                                    ? (locale === 'id' ? 'Kelola Pesanan' : 'Manage Orders')
                                    : (locale === 'id' ? 'Pesanan Saya' : 'My Orders')
                                }
                            </Link>
                            <hr className="border-stone-100 my-1" />
                            <Link
                                href="/logout"
                                method="post"
                                as="button"
                                type="button"
                                onClick={() => setMobileMenuOpen(false)}
                                className="text-left text-sm font-medium text-red-650 hover:text-red-700 transition-colors cursor-pointer"
                            >
                                Log Out
                            </Link>
                        </div>
                    </div>
                </div>
            )}

            {/* MAIN LAYOUT BODY */}
            <main className="flex-1 mx-auto max-w-7xl w-full px-6 lg:px-8 py-10">
                <div className="flex flex-col lg:flex-row gap-8 items-start">
                    
                    {/* Left Sidebar Menu */}
                    <aside className="w-full lg:w-64 shrink-0 bg-white border border-stone-200/50 rounded-2xl p-5 shadow-sm space-y-6">
                        {/* Profile header */}
                        <div className="flex items-center space-x-3.5 pb-4 border-b border-stone-100">
                            <div className="size-11 rounded-full bg-stone-100 border border-stone-200 flex items-center justify-center font-bold text-stone-700 overflow-hidden shadow-inner text-sm uppercase shrink-0">
                                {auth?.user?.name ? auth.user.name.substring(0,2) : 'US'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="text-xs font-bold text-stone-850 truncate">{auth?.user?.name}</h4>
                                <Link href="/settings/profile" className="text-[10px] font-semibold text-stone-400 hover:text-[#E06D53] flex items-center gap-1 transition-colors mt-0.5">
                                    <svg className="size-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                    {locale === 'id' ? 'Ubah Profil' : 'Edit Profile'}
                                </Link>
                            </div>
                        </div>

                        {/* Navigation Options */}
                        <nav className="space-y-1">
                            {isSeller ? (
                                <>
                                    <div className="text-[10px] font-black tracking-widest text-stone-400 uppercase py-2">
                                        {locale === 'id' ? 'Panel Penjual' : 'Seller Panel'}
                                    </div>
                                    {hasPermission('dashboard') && (
                                        <Link
                                            href="/dashboard"
                                            className={`flex items-center gap-2.5 px-3 py-2 text-xs font-bold rounded-xl transition-all ${
                                                isCurrentOrParentUrl('/dashboard')
                                                    ? 'bg-[#E06D53]/5 text-[#E06D53]'
                                                    : 'text-stone-600 hover:bg-stone-50 hover:text-stone-850'
                                            }`}
                                        >
                                            <LayoutGrid className="size-4 shrink-0" />
                                            {locale === 'id' ? 'Dasbor Toko' : 'Store Dashboard'}
                                        </Link>
                                    )}
                                    {hasPermission('categories') && (
                                        <Link
                                            href="/categories"
                                            className={`flex items-center gap-2.5 px-3 py-2 text-xs font-bold rounded-xl transition-all ${
                                                isCurrentOrParentUrl('/categories')
                                                    ? 'bg-[#E06D53]/5 text-[#E06D53]'
                                                    : 'text-stone-600 hover:bg-stone-50 hover:text-stone-850'
                                            }`}
                                        >
                                            <FolderTree className="size-4 shrink-0" />
                                            {locale === 'id' ? 'Kategori' : 'Categories'}
                                        </Link>
                                    )}
                                    {hasPermission('products') && (
                                        <Link
                                            href="/products"
                                            className={`flex items-center gap-2.5 px-3 py-2 text-xs font-bold rounded-xl transition-all ${
                                                isCurrentOrParentUrl('/products')
                                                    ? 'bg-[#E06D53]/5 text-[#E06D53]'
                                                    : 'text-stone-600 hover:bg-stone-50 hover:text-stone-850'
                                            }`}
                                        >
                                            <Package className="size-4 shrink-0" />
                                            {locale === 'id' ? 'Produk' : 'Products'}
                                        </Link>
                                    )}
                                    {hasPermission('vouchers') && (
                                        <Link
                                            href="/vouchers"
                                            className={`flex items-center gap-2.5 px-3 py-2 text-xs font-bold rounded-xl transition-all ${
                                                isCurrentOrParentUrl('/vouchers')
                                                    ? 'bg-[#E06D53]/5 text-[#E06D53]'
                                                    : 'text-stone-600 hover:bg-stone-50 hover:text-stone-850'
                                            }`}
                                        >
                                            <Tag className="size-4 shrink-0" />
                                            {locale === 'id' ? 'Voucher' : 'Vouchers'}
                                        </Link>
                                    )}
                                    {hasPermission('orders') && (
                                        <Link
                                            href="/orders"
                                            className={`flex items-center gap-2.5 px-3 py-2 text-xs font-bold rounded-xl transition-all ${
                                                isCurrentOrParentUrl('/orders') && !url.includes('mode=buyer')
                                                    ? 'bg-[#E06D53]/5 text-[#E06D53]'
                                                    : 'text-stone-600 hover:bg-stone-50 hover:text-stone-850'
                                            }`}
                                        >
                                            <ShoppingBag className="size-4 shrink-0" />
                                            {locale === 'id' ? 'Kelola Pesanan' : 'Manage Orders'}
                                        </Link>
                                    )}

                                    {auth.user?.role === 'master' && (
                                        <>
                                            <div className="text-[10px] font-black tracking-widest text-stone-400 uppercase py-2 mt-4">
                                                {locale === 'id' ? 'Panel Master' : 'Master Panel'}
                                            </div>
                                            <Link
                                                href="/users"
                                                className={`flex items-center gap-2.5 px-3 py-2 text-xs font-bold rounded-xl transition-all ${
                                                    isCurrentOrParentUrl('/users')
                                                        ? 'bg-[#E06D53]/5 text-[#E06D53]'
                                                        : 'text-stone-600 hover:bg-stone-50 hover:text-stone-850'
                                                }`}
                                            >
                                                <Users className="size-4 shrink-0" />
                                                {locale === 'id' ? 'Master Data User' : 'Master Data Users'}
                                            </Link>
                                            <Link
                                                href="/vendor-categories"
                                                className={`flex items-center gap-2.5 px-3 py-2 text-xs font-bold rounded-xl transition-all ${
                                                    isCurrentOrParentUrl('/vendor-categories')
                                                        ? 'bg-[#E06D53]/5 text-[#E06D53]'
                                                        : 'text-stone-600 hover:bg-stone-50 hover:text-stone-850'
                                                }`}
                                            >
                                                <FolderTree className="size-4 shrink-0" />
                                                {locale === 'id' ? 'Kategori Vendor' : 'Vendor Categories'}
                                            </Link>
                                            <Link
                                                href="/sub-products"
                                                className={`flex items-center gap-2.5 px-3 py-2 text-xs font-bold rounded-xl transition-all ${
                                                    isCurrentOrParentUrl('/sub-products')
                                                        ? 'bg-[#E06D53]/5 text-[#E06D53]'
                                                        : 'text-stone-600 hover:bg-stone-50 hover:text-stone-850'
                                                }`}
                                            >
                                                <Boxes className="size-4 shrink-0" />
                                                {locale === 'id' ? 'Sub Data Barang' : 'Sub Products'}
                                            </Link>
                                            <Link
                                                href="/vendors"
                                                className={`flex items-center gap-2.5 px-3 py-2 text-xs font-bold rounded-xl transition-all ${
                                                    isCurrentOrParentUrl('/vendors')
                                                        ? 'bg-[#E06D53]/5 text-[#E06D53]'
                                                        : 'text-stone-600 hover:bg-stone-50 hover:text-stone-850'
                                                }`}
                                            >
                                                <Store className="size-4 shrink-0" />
                                                {locale === 'id' ? 'Data Vendor' : 'Data Vendor'}
                                            </Link>
                                            <Link
                                                href="/purchase-pricings"
                                                className={`flex items-center gap-2.5 px-3 py-2 text-xs font-bold rounded-xl transition-all ${
                                                    isCurrentOrParentUrl('/purchase-pricings')
                                                        ? 'bg-[#E06D53]/5 text-[#E06D53]'
                                                        : 'text-stone-600 hover:bg-stone-50 hover:text-stone-850'
                                                }`}
                                            >
                                                <DollarSign className="size-4 shrink-0" />
                                                {locale === 'id' ? 'Metode Pembelian' : 'Metode Pembelian'}
                                            </Link>
                                        </>
                                    )}

                                    <div className="text-[10px] font-black tracking-widest text-stone-400 uppercase py-2 mt-4">
                                        {locale === 'id' ? 'Akun Saya' : 'My Account'}
                                    </div>
                                    <Link
                                        href="/settings/profile"
                                        className={`flex items-center gap-2.5 px-3 py-2 text-xs font-bold rounded-xl transition-all ${
                                            isCurrentOrParentUrl('/settings/profile')
                                                ? 'bg-[#E06D53]/5 text-[#E06D53]'
                                                : 'text-stone-600 hover:bg-stone-50 hover:text-stone-850'
                                        }`}
                                    >
                                        <User className="size-4 shrink-0" />
                                        {locale === 'id' ? 'Profil' : 'Profile'}
                                    </Link>
                                    <Link
                                        href="#"
                                        onClick={(e) => e.preventDefault()}
                                        className="flex items-center gap-2.5 px-3 py-2 text-xs font-bold rounded-xl text-stone-300 pointer-events-none"
                                    >
                                        <CreditCard className="size-4 shrink-0" />
                                        {locale === 'id' ? 'Bank & Kartu' : 'Bank & Cards'}
                                    </Link>
                                    <Link
                                        href="/settings/addresses"
                                        className={`flex items-center gap-2.5 px-3 py-2 text-xs font-bold rounded-xl transition-all ${
                                            isCurrentOrParentUrl('/settings/addresses')
                                                ? 'bg-[#E06D53]/5 text-[#E06D53]'
                                                : 'text-stone-600 hover:bg-stone-50 hover:text-stone-850'
                                        }`}
                                    >
                                        <MapPin className="size-4 shrink-0" />
                                        {locale === 'id' ? 'Alamat' : 'Addresses'}
                                    </Link>
                                    <Link
                                        href="/settings/security"
                                        className={`flex items-center gap-2.5 px-3 py-2 text-xs font-bold rounded-xl transition-all ${
                                            isCurrentOrParentUrl('/settings/security')
                                                ? 'bg-[#E06D53]/5 text-[#E06D53]'
                                                : 'text-stone-600 hover:bg-stone-50 hover:text-stone-850'
                                        }`}
                                    >
                                        <KeyRound className="size-4 shrink-0" />
                                        {locale === 'id' ? 'Ubah Password' : 'Change Password'}
                                    </Link>
                                    <Link
                                        href="#"
                                        onClick={(e) => e.preventDefault()}
                                        className="flex items-center gap-2.5 px-3 py-2 text-xs font-bold rounded-xl text-stone-300 pointer-events-none"
                                    >
                                        <Bell className="size-4 shrink-0" />
                                        {locale === 'id' ? 'Pengaturan Notifikasi' : 'Notification Settings'}
                                    </Link>
                                    <Link
                                        href="#"
                                        onClick={(e) => e.preventDefault()}
                                        className="flex items-center gap-2.5 px-3 py-2 text-xs font-bold rounded-xl text-stone-300 pointer-events-none"
                                    >
                                        <ShieldCheck className="size-4 shrink-0" />
                                        {locale === 'id' ? 'Pengaturan Privasi' : 'Privacy Settings'}
                                    </Link>
                                    <Link
                                        href="/settings/appearance"
                                        className={`flex items-center gap-2.5 px-3 py-2 text-xs font-bold rounded-xl transition-all ${
                                            isCurrentOrParentUrl('/settings/appearance')
                                                ? 'bg-[#E06D53]/5 text-[#E06D53]'
                                                : 'text-stone-600 hover:bg-stone-50 hover:text-stone-850'
                                        }`}
                                    >
                                        <Palette className="size-4 shrink-0" />
                                        {locale === 'id' ? 'Tampilan' : 'Appearance'}
                                    </Link>

                                    <div className="h-px bg-stone-100 my-3" />

                                    <Link
                                        href="/orders?mode=buyer"
                                        className={`flex items-center gap-2.5 px-3 py-2 text-xs font-bold rounded-xl transition-all ${
                                            url.includes('mode=buyer')
                                                ? 'bg-[#E06D53]/5 text-[#E06D53]'
                                                : 'text-stone-600 hover:bg-stone-50 hover:text-stone-850'
                                        }`}
                                    >
                                        <ShoppingBag className="size-4 shrink-0" />
                                        {locale === 'id' ? 'Pesanan Saya' : 'My Orders'}
                                    </Link>
                                    <Link
                                        href="#"
                                        onClick={(e) => e.preventDefault()}
                                        className="flex items-center gap-2.5 px-3 py-2 text-xs font-bold rounded-xl text-stone-300 pointer-events-none"
                                    >
                                        <Bell className="size-4 shrink-0" />
                                        {locale === 'id' ? 'Notifikasi' : 'Notifications'}
                                    </Link>
                                    <Link
                                        href="#"
                                        onClick={(e) => e.preventDefault()}
                                        className="flex items-center gap-2.5 px-3 py-2 text-xs font-bold rounded-xl text-stone-300 pointer-events-none"
                                    >
                                        <Gift className="size-4 shrink-0" />
                                        {locale === 'id' ? 'Voucher Saya' : 'My Vouchers'}
                                    </Link>
                                    <Link
                                        href="#"
                                        onClick={(e) => e.preventDefault()}
                                        className="flex items-center gap-2.5 px-3 py-2 text-xs font-bold rounded-xl text-stone-300 pointer-events-none"
                                    >
                                        <Coins className="size-4 shrink-0" />
                                        {locale === 'id' ? 'Koin Hany Saya' : 'My Hany Coins'}
                                    </Link>
                                </>
                            ) : (
                                <>
                                    <Link
                                        href="/dashboard"
                                        className={`flex items-center gap-2.5 px-3 py-2 text-xs font-bold rounded-xl transition-all ${
                                            isCurrentOrParentUrl('/dashboard')
                                                ? 'bg-[#E06D53]/5 text-[#E06D53]'
                                                : 'text-stone-600 hover:bg-stone-50 hover:text-stone-850'
                                        }`}
                                    >
                                        <LayoutGrid className="size-4 shrink-0" />
                                        {locale === 'id' ? 'Dasbor' : 'Dashboard'}
                                    </Link>

                                    <div className="text-[10px] font-black tracking-widest text-stone-400 uppercase py-2">
                                        {locale === 'id' ? 'Akun Saya' : 'My Account'}
                                    </div>
                                    <Link
                                        href="/settings/profile"
                                        className={`flex items-center gap-2.5 px-3 py-2 text-xs font-bold rounded-xl transition-all ${
                                            isCurrentOrParentUrl('/settings/profile')
                                                ? 'bg-[#E06D53]/5 text-[#E06D53]'
                                                : 'text-stone-600 hover:bg-stone-50 hover:text-stone-850'
                                        }`}
                                    >
                                        <User className="size-4 shrink-0" />
                                        {locale === 'id' ? 'Profil' : 'Profile'}
                                    </Link>
                                    <Link
                                        href="/settings/addresses"
                                        className={`flex items-center gap-2.5 px-3 py-2 text-xs font-bold rounded-xl transition-all ${
                                            isCurrentOrParentUrl('/settings/addresses')
                                                ? 'bg-[#E06D53]/5 text-[#E06D53]'
                                                : 'text-stone-600 hover:bg-stone-50 hover:text-stone-850'
                                        }`}
                                    >
                                        <MapPin className="size-4 shrink-0" />
                                        {locale === 'id' ? 'Alamat' : 'Addresses'}
                                    </Link>
                                    <Link
                                        href="/settings/security"
                                        className={`flex items-center gap-2.5 px-3 py-2 text-xs font-bold rounded-xl transition-all ${
                                            isCurrentOrParentUrl('/settings/security')
                                                ? 'bg-[#E06D53]/5 text-[#E06D53]'
                                                : 'text-stone-600 hover:bg-stone-50 hover:text-stone-850'
                                        }`}
                                    >
                                        <KeyRound className="size-4 shrink-0" />
                                        {locale === 'id' ? 'Ubah Password' : 'Change Password'}
                                    </Link>
                                    <Link
                                        href="/settings/appearance"
                                        className={`flex items-center gap-2.5 px-3 py-2 text-xs font-bold rounded-xl transition-all ${
                                            isCurrentOrParentUrl('/settings/appearance')
                                                ? 'bg-[#E06D53]/5 text-[#E06D53]'
                                                : 'text-stone-600 hover:bg-stone-50 hover:text-[#E06D53]'
                                        }`}
                                    >
                                        <Palette className="size-4 shrink-0" />
                                        {locale === 'id' ? 'Tampilan' : 'Appearance'}
                                    </Link>

                                    <div className="h-px bg-stone-100 my-4" />

                                    <Link
                                        href="/orders"
                                        className={`flex items-center gap-2.5 px-3 py-2 text-xs font-bold rounded-xl transition-all ${
                                            isCurrentOrParentUrl('/orders')
                                                ? 'bg-[#E06D53]/5 text-[#E06D53]'
                                                : 'text-stone-600 hover:bg-stone-50 hover:text-stone-850'
                                        }`}
                                    >
                                        <ShoppingBag className="size-4 shrink-0" />
                                        {locale === 'id' ? 'Pesanan Saya' : 'My Orders'}
                                    </Link>
                                    
                                    <div className="flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-stone-500 rounded-xl cursor-default bg-stone-50/50">
                                        <Coins className="size-4 shrink-0 text-[#E06D53]" />
                                        <span>Point Hany: <strong className="text-stone-800">{auth?.user?.hany_points ?? 0} pts</strong></span>
                                    </div>
                                </>
                            )}
                        </nav>
                    </aside>

                    {/* Right side form card */}
                    <div className="flex-1 w-full bg-white border border-stone-200/50 rounded-2xl p-6 sm:p-8 shadow-sm text-stone-950 dark:text-stone-950">
                        <Heading
                            title={headings.title}
                            description={headings.desc}
                        />
                        <div className="h-px bg-stone-100 my-6" />
                        <div className="text-stone-950 dark:text-stone-950 [&_label]:text-stone-950 [&_label]:dark:text-stone-950 [&_input]:text-stone-950 [&_input]:dark:text-stone-950 [&_p]:text-stone-750 [&_p]:dark:text-stone-750 [&_select]:text-stone-950 [&_select]:dark:text-stone-950 [&_option]:text-stone-950 [&_option]:dark:text-stone-950">
                            {children}
                        </div>
                    </div>
                </div>
            </main>

            {/* PREMIUM FOOTER */}
            <footer className="border-t border-stone-200/60 bg-[#FFFFFF] py-12 text-sm text-stone-600 mt-auto">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-4">
                        <div className="flex flex-col space-y-4">
                            <img src="/images/logo.png" alt="Hanyza" className="h-10 w-auto object-contain self-start" />
                            <p className="text-stone-500 max-w-xs leading-relaxed text-xs">
                                {t.footer.tagline}
                            </p>
                            <p className="text-xs text-stone-400">
                                &copy; 2026 Hanyza.id. All rights reserved.
                            </p>
                        </div>

                        <div>
                            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-900 mb-4">
                                {t.footer.shop}
                            </h4>
                            <ul className="space-y-3 font-semibold text-xs">
                                <li>
                                    <Link href="/" className="hover:text-[#E06D53] transition-colors">
                                        Fashion
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/" className="hover:text-[#E06D53] transition-colors">
                                        Home Living
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-900 mb-4">
                                {t.footer.support}
                            </h4>
                            <ul className="space-y-3 font-semibold text-xs">
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

                        <div>
                            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-900 mb-4">
                                {t.footer.stayUpdated}
                            </h4>
                            <ul className="space-y-3 font-semibold text-xs">
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
            <CallCenterDialog open={isSupportOpen} onOpenChange={setIsSupportOpen} />
        </div>
    );
}

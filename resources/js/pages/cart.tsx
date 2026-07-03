import { Form, Head, Link, usePage, router } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';
import { ShoppingBag, MapPin, ShieldCheck, Trash2, QrCode, Wallet, DollarSign, Truck, Gift, Coins, ChevronRight, Info, User, Menu, X, CheckCircle, ArrowRight } from 'lucide-react';
import CartController from '@/actions/App/Http/Controllers/CartController';
import { CallCenterDialog } from '@/components/call-center-dialog';
import CheckoutController from '@/actions/App/Http/Controllers/CheckoutController';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { dashboard, login } from '@/routes';
import { Input } from '@/components/ui/input';
import { index as addressesIndex } from '@/routes/addresses';
import { home } from '@/routes';

interface Product {
    id: number;
    name_en: string;
    name_id: string;
    price: number;
    sale_price: number | null;
    image: string | null;
    stock: number;
    slug: string;
}

interface CartItem {
    id: number;
    product_id: number;
    quantity: number;
    color: string | null;
    size: string | null;
    product: Product;
}

interface Address {
    id: number;
    recipient_name: string;
    phone_number: string;
    address_line: string;
    city: string;
    postal_code: string;
    is_default: boolean;
    latitude?: number;
    longitude?: number;
}

interface Voucher {
    id: number;
    code: string;
    discount_amount: number;
    min_spend: number;
    seller?: {
        name: string;
    };
}

interface Props {
    cartItems: CartItem[];
    addresses: Address[];
    vouchers: Voucher[];
    userPoints: number;
    hanypayBalance: number;
}

export default function Cart({ cartItems, addresses, vouchers, userPoints, hanypayBalance }: Props) {
    const { locale = 'en', auth } = usePage<any>().props;
    const cartCount = auth?.cartCount ?? 0;
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
    
    const [selectedAddressId, setSelectedAddressId] = useState<string>('');
    const [shippingMethod, setShippingMethod] = useState<'reguler' | 'express'>('reguler');
    const [protectionEnabled, setProtectionEnabled] = useState<boolean>(false);
    const [selectedVoucherId, setSelectedVoucherId] = useState<string>('');
    const [usePoints, setUsePoints] = useState<boolean>(false);
    const [paymentMethod, setPaymentMethod] = useState<'COD' | 'HanyPay' | 'QRIS'>('COD');
    const [showQrisModal, setShowQrisModal] = useState<boolean>(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Multi-Language Translations
    const translations = {
        en: {
            title: "Shopping Cart",
            reviewItems: "Review Items",
            shippingAddr: "Shipping Address",
            deliveryMethod: "Delivery Method",
            protection: "Product Protection",
            protectionDesc: "Add insurance cover to protect your packages against damage, loss, or theft during shipping.",
            summary: "Payment Summary",
            subtotal: "Subtotal",
            shippingFee: "Shipping Fee",
            voucherDiscount: "Voucher Discount",
            pointsDiscount: "Point Hany Discount",
            totalPayment: "Total Payment",
            applyVoucher: "Apply Store Voucher",
            noVoucher: "No voucher selected",
            redeemPoints: "Redeem Point Hany",
            pointsDesc: "You have {points} points (Worth {worth} discount).",
            paymentMethod: "Select Payment Method",
            placeOrder: "Place Order & Pay",
            cartEmpty: "Your cart is empty!",
            cartEmptyDesc: "Go to our home page to find premium fashion items, bedding, pottery, or living room catalog products.",
            browse: "Browse Products",
            breadcrumbs: {
                home: "Home",
                cart: "Shopping Cart"
            },
            nav: {
                login: "Log in",
                register: "Register",
                dashboard: "Dashboard"
            }
        },
        id: {
            title: "Keranjang Belanja",
            reviewItems: "Tinjau Barang",
            shippingAddr: "Alamat Pengiriman",
            deliveryMethod: "Metode Pengiriman",
            protection: "Proteksi Barang",
            protectionDesc: "Tambahkan perlindungan asuransi untuk melindungi paket Anda dari kerusakan atau kehilangan selama pengiriman.",
            summary: "Rincian Pembayaran",
            subtotal: "Subtotal",
            shippingFee: "Biaya Pengiriman",
            voucherDiscount: "Diskon Voucher",
            pointsDiscount: "Diskon Point Hany",
            totalPayment: "Total Pembayaran",
            applyVoucher: "Gunakan Voucher Toko",
            noVoucher: "Tidak ada voucher dipilih",
            redeemPoints: "Tukarkan Point Hany",
            pointsDesc: "Anda memiliki {points} poin (Setara diskon {worth}).",
            paymentMethod: "Pilih Metode Pembayaran",
            placeOrder: "Buat Pesanan & Bayar",
            cartEmpty: "Keranjang belanja Anda kosong!",
            cartEmptyDesc: "Pergi ke halaman utama untuk menemukan koleksi pakaian premium, perlengkapan tidur, atau katalog ruang tamu kami.",
            browse: "Jelajahi Produk",
            breadcrumbs: {
                home: "Beranda",
                cart: "Keranjang Belanja"
            },
            nav: {
                login: "Masuk",
                register: "Daftar",
                dashboard: "Dasbor"
            }
        }
    };

    const t = translations[locale as 'en' | 'id'] || translations.en;

    // Set default address
    useEffect(() => {
        const defaultAddr = addresses.find(a => a.is_default);
        if (defaultAddr) {
            setSelectedAddressId(defaultAddr.id.toString());
        } else if (addresses.length > 0) {
            setSelectedAddressId(addresses[0].id.toString());
        }
    }, [addresses]);

    // Format currency (IDR)
    const formatPrice = (value: number | string): string => {
        const num = typeof value === 'number' ? value : parseFloat(value);
        if (isNaN(num)) return value.toString();
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(num);
    };

    // Calculations
    const subtotal = cartItems.reduce((sum, item) => {
        const price = item.product.sale_price ?? item.product.price;
        return sum + (price * item.quantity);
    }, 0);

    const shippingFee = shippingMethod === 'express' ? 25000 : 10000;
    const protectionFee = protectionEnabled ? 10000 : 0;

    // Voucher Discount
    let voucherDiscount = 0;
    const selectedVoucher = vouchers.find(v => v.id.toString() === selectedVoucherId);
    if (selectedVoucher) {
        if (subtotal >= selectedVoucher.min_spend) {
            voucherDiscount = Number(selectedVoucher.discount_amount);
        }
    }

    // Points Discount (1 point = Rp 1.000)
    let pointsDiscount = 0;
    if (usePoints) {
        const maxPossibleDiscount = Math.max(0, subtotal - voucherDiscount);
        pointsDiscount = Math.min(maxPossibleDiscount, userPoints * 1000);
    }

    const total = Math.max(0, subtotal + shippingFee + protectionFee - voucherDiscount - pointsDiscount);
    const address = addresses.find(a => a.id.toString() === selectedAddressId);

    const handleFormSubmit = (e: React.FormEvent, submitFormFn: () => void) => {
        e.preventDefault();
        
        if (!selectedAddressId) {
            alert(locale === 'id' ? 'Silakan pilih alamat pengiriman terlebih dahulu.' : 'Please select a shipping address first.');
            return;
        }

        if (paymentMethod === 'HanyPay' && hanypayBalance < total) {
            alert(locale === 'id' ? 'Saldo HanyPay Anda tidak mencukupi.' : 'Insufficient HanyPay balance.');
            return;
        }

        if (paymentMethod === 'QRIS') {
            setShowQrisModal(true);
        } else {
            submitFormFn();
        }
    };

    const switchLocale = (newLocale: 'en' | 'id') => {
        if (newLocale === locale) return;
        router.post('/locale', { locale: newLocale }, {
            preserveScroll: true
        });
    };

    return (
        <div className="min-h-screen bg-[#FAF7EE] font-sans antialiased text-[#2E2C28] flex flex-col justify-between">
            <Head>
                <title>{`${t.title} | Hanyza.id`}</title>
                <meta name="description" content="Manage your Hanyza shopping cart and configure delivery preferences." />
            </Head>

            {/* STICKY GLASSMORPHIC HEADER */}
            <header className="sticky top-0 z-50 w-full border-b border-stone-200/50 bg-[#FFFFFF]/90 backdrop-blur-md transition-all duration-300">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
                    {/* Brand Logo */}
                    <Link href="/" className="flex items-center hover:opacity-90 transition-opacity">
                        <img src="/images/logo.png" alt="Hanyza" className="h-10 w-auto object-contain sm:h-12" />
                    </Link>

                    <div className="hidden lg:flex items-center space-x-6">
                        <button
                            onClick={() => setIsSupportOpen(true)}
                            className="text-xs font-semibold text-stone-600 hover:text-[#E06D53] transition-colors cursor-pointer"
                        >
                            Call Center
                        </button>
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
                                <span className="absolute -top-0.5 -right-0.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-[#E06D53] text-[9px] font-bold text-white shadow-sm">
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
                        <div className="flex flex-col space-y-4">
                            <button
                                onClick={() => {
                                    setMobileMenuOpen(false);
                                    setIsSupportOpen(true);
                                }}
                                className="text-left text-sm font-semibold text-stone-600 hover:text-[#E06D53] py-1 cursor-pointer border-b border-stone-150"
                            >
                                Call Center
                            </button>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-stone-500 font-medium">Language / Bahasa</span>
                                <div className="flex items-center rounded-full border border-stone-200 bg-stone-100 p-0.5">
                                    <button
                                        onClick={() => switchLocale('id')}
                                        className={`rounded-full px-3 py-1 text-xs font-semibold ${locale === 'id' ? 'bg-[#E06D53] text-white' : 'text-stone-500'}`}
                                    >
                                        ID
                                    </button>
                                    <button
                                        onClick={() => switchLocale('en')}
                                        className={`rounded-full px-3 py-1 text-xs font-semibold ${locale === 'en' ? 'bg-[#E06D53] text-white' : 'text-stone-500'}`}
                                    >
                                        EN
                                    </button>
                                </div>
                            </div>
                            {auth?.user ? (
                                <div className="flex flex-col space-y-2 border-t border-stone-100 pt-4">
                                    <Link 
                                        href={auth?.user?.role !== 'buyer' ? '/dashboard' : '/settings/profile'} 
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="text-sm font-medium text-stone-600 hover:text-[#E06D53] transition-colors py-2"
                                    >
                                        Akun Saya
                                    </Link>
                                    <Link 
                                        href="/orders" 
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="text-sm font-medium text-stone-600 hover:text-[#E06D53] transition-colors py-2"
                                    >
                                        Pesanan Saya
                                    </Link>
                                    <hr className="border-stone-100 my-1" />
                                    <Link
                                        href="/logout"
                                        method="post"
                                        as="button"
                                        type="button"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="text-left text-sm font-medium text-red-655 hover:text-red-700 transition-colors cursor-pointer"
                                    >
                                        Log Out
                                    </Link>
                                </div>
                            ) : (
                                <div className="flex flex-col space-y-2 border-t border-stone-100 pt-4">
                                    <Link href={login.url()} className="text-sm font-medium text-stone-600 hover:text-[#E06D53] transition-colors">
                                        {t.nav.login}
                                    </Link>
                                    <Link href="/register" className="text-sm font-medium text-stone-600 hover:text-[#E06D53] transition-colors">
                                        {t.nav.register}
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </header>

            {/* MAIN CONTENT AREA */}
            <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 flex-1">
                {/* BREADCRUMB */}
                <nav className="flex items-center space-x-2 text-xs font-semibold tracking-wider uppercase text-stone-400 mb-8">
                    <Link href="/" className="hover:text-stone-600 transition-colors">{t.breadcrumbs.home}</Link>
                    <span>&rsaquo;</span>
                    <span className="text-[#E06D53]">{t.breadcrumbs.cart}</span>
                </nav>

                {cartItems.length > 0 ? (
                    <div className="grid gap-8 lg:grid-cols-12 items-start">
                        {/* Cart items list and shipping choices (Left column) */}
                        <div className="lg:col-span-8 space-y-6">
                            
                            {/* 1. Review Items */}
                            <div className="bg-white rounded-2xl border border-stone-200/40 p-6 space-y-6 shadow-xs">
                                <h3 className="font-bold text-lg text-stone-850 flex items-center gap-2 border-b border-stone-100 pb-3 font-sans">
                                    <ShoppingBag className="size-5 text-[#E06D53]" /> {t.reviewItems}
                                </h3>
                                
                                <div className="divide-y divide-stone-100">
                                    {cartItems.map((item) => {
                                        const price = item.product.sale_price ?? item.product.price;
                                        return (
                                            <div key={item.id} className="py-4 flex gap-4 first:pt-0 last:pb-0">
                                                {item.product.image ? (
                                                    <img
                                                        src={item.product.image.startsWith('/images') ? item.product.image : `/storage/${item.product.image}`}
                                                        alt={locale === 'id' ? item.product.name_id : item.product.name_en}
                                                        className="size-20 object-cover rounded-xl border border-stone-200/60 shadow-2xs"
                                                    />
                                                ) : (
                                                    <div className="size-20 bg-stone-100 rounded-xl border border-stone-200/60 flex items-center justify-center text-stone-400 text-xs">
                                                        No image
                                                    </div>
                                                )}

                                                <div className="flex-1 space-y-1">
                                                    <h4 className="font-bold text-sm text-stone-800 leading-snug hover:text-[#E06D53] transition-colors">
                                                        <Link href={`/product/${item.product.slug}`}>
                                                            {locale === 'id' ? item.product.name_id : item.product.name_en}
                                                        </Link>
                                                    </h4>
                                                    
                                                    {/* Variant details */}
                                                    <div className="flex flex-wrap gap-2 text-[10px] font-semibold uppercase tracking-wider">
                                                        {item.color && (
                                                            <span className="bg-[#FAF7EE] border border-stone-200/65 px-2 py-0.5 rounded-md text-stone-600">
                                                                Color: {item.color}
                                                            </span>
                                                        )}
                                                        {item.size && (
                                                            <span className="bg-[#FAF7EE] border border-stone-200/65 px-2 py-0.5 rounded-md text-stone-600">
                                                                Size: {item.size}
                                                            </span>
                                                        )}
                                                    </div>

                                                    <div className="flex items-center justify-between pt-2">
                                                        <div className="flex items-center gap-3">
                                                            <Form
                                                                {...CartController.update.form({ cartItem: item.id })}
                                                                options={{ preserveScroll: true }}
                                                            >
                                                                {({ processing }) => (
                                                                    <div className="flex items-center gap-1 border border-stone-200/60 rounded-xl p-0.5 bg-[#FAF7EE]/50">
                                                                        <input type="hidden" name="quantity" value={Math.max(1, item.quantity - 1)} />
                                                                        <Button 
                                                                            type="submit" 
                                                                            variant="ghost" 
                                                                            size="icon" 
                                                                            className="size-7 h-7 w-7 text-xs font-bold text-stone-600 hover:text-[#E06D53]" 
                                                                            disabled={item.quantity <= 1 || processing}
                                                                        >
                                                                            -
                                                                        </Button>
                                                                    </div>
                                                                )}
                                                            </Form>
                                                            
                                                            <span className="text-xs font-bold text-stone-850">{item.quantity} pcs</span>

                                                            <Form
                                                                {...CartController.update.form({ cartItem: item.id })}
                                                                options={{ preserveScroll: true }}
                                                            >
                                                                {({ processing }) => (
                                                                    <div className="flex items-center gap-1 border border-stone-200/60 rounded-xl p-0.5 bg-[#FAF7EE]/50">
                                                                        <input type="hidden" name="quantity" value={item.quantity + 1} />
                                                                        <Button 
                                                                            type="submit" 
                                                                            variant="ghost" 
                                                                            size="icon" 
                                                                            className="size-7 h-7 w-7 text-xs font-bold text-stone-600 hover:text-[#E06D53]" 
                                                                            disabled={item.product.stock <= item.quantity || processing}
                                                                        >
                                                                            +
                                                                        </Button>
                                                                    </div>
                                                                )}
                                                            </Form>
                                                        </div>

                                                        <div className="flex items-center gap-3">
                                                            <span className="font-bold text-sm text-[#E06D53]">
                                                                {formatPrice(price * item.quantity)}
                                                            </span>
                                                            
                                                            <Form
                                                                {...CartController.destroy.form({ cartItem: item.id })}
                                                                options={{ preserveScroll: true }}
                                                            >
                                                                {({ processing }) => (
                                                                    <Button
                                                                        type="submit"
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="size-8 text-red-500 hover:bg-red-50"
                                                                        disabled={processing}
                                                                    >
                                                                        <Trash2 className="size-4" />
                                                                    </Button>
                                                                )}
                                                            </Form>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* 2. Shipping Address */}
                            <div className="bg-white rounded-2xl border border-stone-200/40 p-6 space-y-4 shadow-xs">
                                <div className="flex justify-between items-center border-b border-stone-100 pb-3">
                                    <h3 className="font-bold text-lg text-stone-850 flex items-center gap-2 font-sans">
                                        <MapPin className="size-5 text-[#E06D53]" /> {t.shippingAddr}
                                    </h3>
                                    <Button asChild variant="outline" size="sm" className="h-8 gap-1 rounded-lg border-stone-200 hover:bg-stone-50">
                                        <Link href={addressesIndex.url()}>
                                            Manage Addresses <ChevronRight className="size-3" />
                                        </Link>
                                    </Button>
                                </div>

                                {addresses.length > 0 ? (
                                    <div className="space-y-3">
                                        <select
                                            value={selectedAddressId}
                                            onChange={(e) => setSelectedAddressId(e.target.value)}
                                            className="flex h-10 w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm shadow-2xs focus-visible:outline-hidden"
                                        >
                                            {addresses.map(a => (
                                                <option key={a.id} value={a.id}>
                                                    {a.recipient_name} - {a.city} ({a.postal_code})
                                                </option>
                                            ))}
                                        </select>

                                        {address && (
                                            <div className="bg-[#FAF7EE]/50 p-4 rounded-xl border border-stone-200/60 text-xs space-y-1">
                                                <div className="font-bold text-stone-800">{address.recipient_name} ({address.phone_number})</div>
                                                <div className="text-stone-600 leading-normal">{address.address_line}, {address.city}, {address.postal_code}</div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="p-4 border border-dashed border-red-200 bg-red-50/30 text-red-700 rounded-xl text-xs space-y-2">
                                        <div className="font-bold flex items-center gap-1.5">
                                            <Info className="size-4" /> No shipping addresses registered!
                                        </div>
                                        <p>You must add a shipping address before you can complete your purchase.</p>
                                        <Button asChild variant="destructive" size="sm" className="h-8 rounded-lg">
                                            <Link href={addressesIndex.url()}>+ Add Shipping Address</Link>
                                        </Button>
                                    </div>
                                )}
                            </div>

                            {/* 3. Shipping Options */}
                            <div className="bg-white rounded-2xl border border-stone-200/40 p-6 space-y-4 shadow-xs">
                                <h3 className="font-bold text-lg text-stone-850 flex items-center gap-2 border-b border-stone-100 pb-3 font-sans">
                                    <Truck className="size-5 text-[#E06D53]" /> {t.deliveryMethod}
                                </h3>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div 
                                        onClick={() => setShippingMethod('reguler')}
                                        className={`p-4 rounded-xl border cursor-pointer flex justify-between items-start transition-all ${
                                            shippingMethod === 'reguler'
                                                ? 'bg-[#E06D53]/5 border-[#E06D53] shadow-xs'
                                                : 'bg-white border-stone-200 hover:border-stone-400'
                                        }`}
                                    >
                                        <div className="space-y-1">
                                            <div className="font-bold text-sm text-stone-800">Reguler Shipping</div>
                                            <div className="text-xs text-stone-500">Standard drop-shipping (2-5 days)</div>
                                        </div>
                                        <div className="font-black text-sm text-[#E06D53]">{formatPrice(10000)}</div>
                                    </div>

                                    <div 
                                        onClick={() => setShippingMethod('express')}
                                        className={`p-4 rounded-xl border cursor-pointer flex justify-between items-start transition-all ${
                                            shippingMethod === 'express'
                                                ? 'bg-[#E06D53]/5 border-[#E06D53] shadow-xs'
                                                : 'bg-white border-stone-200 hover:border-stone-400'
                                        }`}
                                    >
                                        <div className="space-y-1">
                                            <div className="font-bold text-sm text-stone-800">Express Shipping</div>
                                            <div className="text-xs text-stone-500">Priority express delivery (1-2 days)</div>
                                        </div>
                                        <div className="font-black text-sm text-[#E06D53]">{formatPrice(25000)}</div>
                                    </div>
                                </div>
                            </div>

                            {/* 4. Product Protection */}
                            <div className="bg-white rounded-2xl border border-stone-200/40 p-6 flex items-center justify-between gap-4 shadow-xs">
                                <div className="space-y-1">
                                    <h3 className="font-bold text-lg text-stone-850 flex items-center gap-1.5 font-sans">
                                        <ShieldCheck className="size-5 text-[#E06D53]" /> {t.protection}
                                    </h3>
                                    <p className="text-xs text-stone-500 max-w-md leading-relaxed">
                                        {t.protectionDesc}
                                    </p>
                                </div>
                                <div className="flex items-center gap-3 shrink-0">
                                    <span className="font-black text-sm text-[#E06D53]">{formatPrice(10000)}</span>
                                    <input 
                                        type="checkbox"
                                        checked={protectionEnabled}
                                        onChange={(e) => setProtectionEnabled(e.target.checked)}
                                        className="rounded border-stone-300 text-[#E06D53] focus:ring-[#E06D53] h-5 w-5 cursor-pointer"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Order Summary & Payment (Right column) */}
                        <div className="lg:col-span-4 space-y-6">
                            
                            {/* Payment Summary */}
                            <div className="bg-white rounded-2xl border border-stone-200/40 p-6 space-y-6 shadow-xs">
                                <h3 className="font-bold text-lg text-stone-850 border-b border-stone-100 pb-3 font-sans">{t.summary}</h3>
                                
                                <div className="space-y-3.5 text-xs font-medium">
                                    <div className="flex justify-between">
                                        <span className="text-stone-500">{t.subtotal} ({cartItems.length} products)</span>
                                        <span className="text-stone-800">{formatPrice(subtotal)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-stone-500">{t.shippingFee} ({shippingMethod})</span>
                                        <span className="text-stone-800">{formatPrice(shippingFee)}</span>
                                    </div>
                                    {protectionEnabled && (
                                        <div className="flex justify-between">
                                            <span className="text-red-500">{t.protection}</span>
                                            <span className="text-stone-850">{formatPrice(10000)}</span>
                                        </div>
                                    )}
                                    {voucherDiscount > 0 && (
                                        <div className="flex justify-between text-green-600">
                                            <span>{t.voucherDiscount}</span>
                                            <span>-{formatPrice(voucherDiscount)}</span>
                                        </div>
                                    )}
                                    {pointsDiscount > 0 && (
                                        <div className="flex justify-between text-green-600">
                                            <span>{t.pointsDiscount}</span>
                                            <span>-{formatPrice(pointsDiscount)}</span>
                                        </div>
                                    )}

                                    <div className="border-t border-stone-100 pt-4 flex justify-between text-sm font-black text-stone-900">
                                        <span>{t.totalPayment}</span>
                                        <span className="text-xl text-[#E06D53]">{formatPrice(total)}</span>
                                    </div>
                                </div>

                                {/* Voucher & Points Section */}
                                <div className="space-y-4 pt-4 border-t border-stone-100">
                                    {/* Voucher Selector */}
                                    <div className="space-y-1.5">
                                        <Label htmlFor="voucher" className="text-xs font-bold text-stone-700 flex items-center gap-1"><Gift className="size-3.5" /> {t.applyVoucher}</Label>
                                        <select
                                            id="voucher"
                                            value={selectedVoucherId}
                                            onChange={(e) => setSelectedVoucherId(e.target.value)}
                                            className="flex h-9 w-full rounded-xl border border-stone-200 bg-white px-3 py-1.5 text-xs focus-visible:outline-hidden"
                                        >
                                            <option value="">{t.noVoucher}</option>
                                            {vouchers.map(v => {
                                                const isValid = subtotal >= v.min_spend;
                                                return (
                                                    <option key={v.id} value={v.id} disabled={!isValid}>
                                                        {v.code} (-{formatPrice(v.discount_amount)}) {isValid ? '' : `[Min: ${formatPrice(v.min_spend)}]`}
                                                    </option>
                                                );
                                            })}
                                        </select>
                                    </div>

                                    {/* Points claim checkbox */}
                                    <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-500/5 border border-amber-500/15">
                                        <input 
                                            type="checkbox"
                                            id="use_points"
                                            checked={usePoints}
                                            onChange={(e) => setUsePoints(e.target.checked)}
                                            disabled={userPoints <= 0}
                                            className="mt-0.5 rounded border-amber-300 text-amber-600 focus:ring-amber-500 h-4 w-4 cursor-pointer"
                                        />
                                        <div className="space-y-0.5">
                                            <Label htmlFor="use_points" className="text-xs font-bold text-amber-800 flex items-center gap-1 cursor-pointer">
                                                <Coins className="size-3.5" /> {t.redeemPoints}
                                            </Label>
                                            <p className="text-[10px] text-amber-700/80 leading-normal">
                                                {t.pointsDesc.replace('{points}', userPoints.toString()).replace('{worth}', formatPrice(userPoints * 1000))}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Payment Gateways */}
                                <div className="space-y-3 pt-4 border-t border-stone-100">
                                    <Label className="text-xs font-bold text-stone-700">{t.paymentMethod}</Label>
                                    
                                    <div className="grid gap-2">
                                        <div 
                                            onClick={() => setPaymentMethod('COD')}
                                            className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between text-xs transition-all ${
                                                paymentMethod === 'COD'
                                                    ? 'bg-[#E06D53]/5 border-[#E06D53] shadow-xs'
                                                    : 'bg-white border-stone-200 hover:border-stone-400'
                                            }`}
                                        >
                                            <div className="flex items-center gap-2">
                                                <DollarSign className="size-4 text-stone-500" />
                                                <span className="font-bold text-stone-700">COD (Cash on Delivery)</span>
                                            </div>
                                            <span className="text-[10px] text-stone-500 font-semibold">Pay on arrival</span>
                                        </div>

                                        <div 
                                            onClick={() => setPaymentMethod('HanyPay')}
                                            className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between text-xs transition-all ${
                                                paymentMethod === 'HanyPay'
                                                    ? 'bg-[#E06D53]/5 border-[#E06D53] shadow-xs'
                                                    : 'bg-white border-stone-200 hover:border-stone-400'
                                            }`}
                                        >
                                            <div className="flex items-center gap-2">
                                                <Wallet className="size-4 text-stone-500" />
                                                <span className="font-bold text-stone-700">Saldo HanyPay</span>
                                            </div>
                                            <div className="text-right">
                                                <span className="block font-black text-stone-850">{formatPrice(hanypayBalance)}</span>
                                            </div>
                                        </div>

                                        <div 
                                            onClick={() => setPaymentMethod('QRIS')}
                                            className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between text-xs transition-all ${
                                                paymentMethod === 'QRIS'
                                                    ? 'bg-[#E06D53]/5 border-[#E06D53] shadow-xs'
                                                    : 'bg-white border-stone-200 hover:border-stone-400'
                                            }`}
                                        >
                                            <div className="flex items-center gap-2">
                                                <QrCode className="size-4 text-stone-500" />
                                                <span className="font-bold text-stone-700">QRIS Gateway</span>
                                            </div>
                                            <span className="text-[10px] text-stone-500 font-semibold">Instant Scan QR</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Order Checkout Form */}
                                <Form
                                    {...CheckoutController.store.form()}
                                    options={{ preserveScroll: true }}
                                >
                                    {({ processing, submit }) => (
                                        <form onSubmit={(e) => handleFormSubmit(e, submit)} className="space-y-3 pt-2">
                                            <input type="hidden" name="address_id" value={selectedAddressId} />
                                            <input type="hidden" name="shipping_method" value={shippingMethod} />
                                            <input type="hidden" name="protection_enabled" value={protectionEnabled ? '1' : '0'} />
                                            <input type="hidden" name="payment_method" value={paymentMethod} />
                                            <input type="hidden" name="voucher_id" value={selectedVoucherId} />
                                            <input type="hidden" name="use_points" value={usePoints ? '1' : '0'} />
                                            
                                            <Button 
                                                type="submit" 
                                                disabled={processing || !selectedAddressId} 
                                                className="w-full h-12 bg-[#E06D53] hover:bg-[#C85B43] text-white font-bold rounded-xl shadow-md transition-all text-sm uppercase tracking-wider"
                                            >
                                                {t.placeOrder}
                                            </Button>

                                            {/* QRIS Simulated Payment Modal */}
                                            <Dialog open={showQrisModal} onOpenChange={setShowQrisModal}>
                                                <DialogContent className="sm:max-w-[360px] text-center bg-white rounded-2xl p-6">
                                                    <DialogHeader>
                                                        <DialogTitle className="flex items-center justify-center gap-2 font-sans font-black text-stone-850">
                                                            <QrCode className="size-5 text-[#E06D53]" /> QRIS Payment Gateway
                                                        </DialogTitle>
                                                        <DialogDescription className="text-xs text-stone-500">
                                                            Scan the mock QR code below to complete your payment.
                                                        </DialogDescription>
                                                    </DialogHeader>

                                                    <div className="py-6 flex flex-col items-center justify-center space-y-4">
                                                        <div className="border-4 border-stone-800 p-4 rounded-2xl bg-white shadow-md flex items-center justify-center">
                                                            {/* Mock QR Code Drawing */}
                                                            <svg width="180" height="180" viewBox="0 0 100 100" className="text-stone-900">
                                                                <rect width="20" height="20" fill="currentColor"/>
                                                                <rect x="80" width="20" height="20" fill="currentColor"/>
                                                                <rect y="80" width="20" height="20" fill="currentColor"/>
                                                                <rect x="25" y="25" width="50" height="50" fill="none" stroke="currentColor" strokeWidth="5"/>
                                                                <rect x="40" y="40" width="20" height="20" fill="currentColor"/>
                                                                <rect x="70" y="70" width="10" height="10" fill="currentColor"/>
                                                                <rect x="50" y="10" width="10" height="20" fill="currentColor"/>
                                                                <rect x="10" y="50" width="20" height="10" fill="currentColor"/>
                                                            </svg>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <span className="text-[10px] text-stone-500 uppercase tracking-widest font-black block">Total Amount</span>
                                                            <span className="text-2xl font-black text-[#E06D53]">{formatPrice(total)}</span>
                                                        </div>
                                                        <p className="text-[10px] text-stone-400 max-w-[240px] leading-normal font-medium">
                                                            GPN / Hanyza QRIS Standard. Payment will be finalized upon scanning.
                                                        </p>
                                                    </div>

                                                    <DialogFooter className="grid grid-cols-2 gap-3 sm:space-x-0">
                                                        <Button 
                                                            type="button" 
                                                            variant="outline" 
                                                            onClick={() => setShowQrisModal(false)}
                                                            className="rounded-xl border-stone-200"
                                                        >
                                                            Cancel
                                                        </Button>
                                                        <Button 
                                                            type="button" 
                                                            disabled={processing}
                                                            onClick={() => {
                                                                setShowQrisModal(false);
                                                                submit();
                                                            }}
                                                            className="bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl"
                                                        >
                                                            Confirm Pay
                                                        </Button>
                                                    </DialogFooter>
                                                </DialogContent>
                                            </Dialog>
                                        </form>
                                    )}
                                </Form>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-24 border border-dashed border-stone-200 rounded-3xl bg-white shadow-2xs max-w-3xl mx-auto">
                        <ShoppingBag className="size-16 text-stone-300 mx-auto mb-5" />
                        <h3 className="font-bold text-xl text-stone-850 font-sans">{t.cartEmpty}</h3>
                        <p className="text-sm text-stone-500 max-w-sm mx-auto mt-2.5 mb-8 leading-relaxed font-medium">
                            {t.cartEmptyDesc}
                        </p>
                        <Button asChild className="bg-[#E06D53] text-white hover:bg-[#C85B43] font-bold px-8 h-12 rounded-xl shadow-md uppercase tracking-wider text-xs">
                            <Link href="/">{t.browse}</Link>
                        </Button>
                    </div>
                )}
            </main>

            {/* PREMIUM FOOTER */}
            <footer className="border-t border-stone-200/60 bg-[#FFFFFF] py-12 text-sm text-stone-600 mt-20">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div className="space-y-4">
                            <img src="/images/logo.png" alt="Hanyza" className="h-10 w-auto object-contain" />
                            <p className="text-xs text-stone-500 leading-relaxed font-medium">
                                Nurturing Professionalism. Bridging everyday comfort with elegant design for you and your home.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-bold text-stone-800 mb-3 font-sans">Shop</h4>
                            <ul className="space-y-2 text-xs font-semibold">
                                <li><Link href="/" className="hover:text-[#E06D53] transition-colors">Fashion</Link></li>
                                <li><Link href="/" className="hover:text-[#E06D53] transition-colors">Home Living</Link></li>
                                <li><Link href="/" className="hover:text-[#E06D53] transition-colors">New Arrivals</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold text-stone-800 mb-3 font-sans">Support</h4>
                            <ul className="space-y-2 text-xs font-semibold">
                                <li><Link href="/" className="hover:text-[#E06D53] transition-colors">Customer Service</Link></li>
                                <li><Link href="/" className="hover:text-[#E06D53] transition-colors">Privacy Policy</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold text-stone-800 mb-3 font-sans">Stay Updated</h4>
                            <p className="text-xs text-stone-500 mb-3 font-medium">Subscribe to receive special offers and updates.</p>
                            <div className="flex gap-2">
                                <Input placeholder="Email Address" className="h-9 text-xs rounded-lg border-stone-200 bg-stone-50" />
                                <Button size="sm" className="bg-[#E06D53] hover:bg-[#C85B43] h-9 text-xs rounded-lg">Subscribe</Button>
                            </div>
                        </div>
                    </div>
                    <div className="border-t border-stone-100 mt-8 pt-8 text-center text-xs text-stone-400 font-semibold">
                        &copy; 2026 Hanyza.id. All rights reserved.
                    </div>
                </div>
            </footer>
            <CallCenterDialog open={isSupportOpen} onOpenChange={setIsSupportOpen} />
        </div>
    );
}

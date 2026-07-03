import { Head, usePage, Link, Form } from '@inertiajs/react';
import { 
    ShoppingBag, FolderTree, ShieldCheck, Sparkles, ShoppingCart, Lock, ArrowRight, 
    LayoutDashboard, KeyRound, CalendarCheck, Coins, Wallet, Tag, Package, Users, Gift
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { dashboard, home } from '@/routes';
import { index as categoriesIndex } from '@/routes/categories';
import { index as productsIndex } from '@/routes/products';
import { edit as editSecurity } from '@/routes/security';
import PointsController from '@/actions/App/Http/Controllers/PointsController';
import { cn } from '@/lib/utils';

export default function Dashboard() {
    const { auth } = usePage<any>().props;
    const user = auth.user;
    const isSeller = user?.role === 'seller' || user?.role === 'master';

    // Format currency (IDR)
    const formatPrice = (value: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value);
    };

    // Check if claimed today
    const lastClaimedDate = user?.last_points_claimed_at ? new Date(user.last_points_claimed_at) : null;
    const isClaimedToday = lastClaimedDate 
        ? lastClaimedDate.toDateString() === new Date().toDateString() 
        : false;

    const hasPermission = (permission: string) => {
        if (!user) return false;
        if (user.role === 'master') return true;
        if (user.role === 'seller') {
            if (!user.permissions) return false;
            return user.permissions.includes(permission);
        }
        return false;
    };

    return (
        <>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Welcome Banner */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#E06D53]/10 via-[#FAF9F6] to-white p-6 border border-[#E06D53]/20 shadow-xs">
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="space-y-1.5">
                            <h2 className="text-2xl font-black tracking-tight flex items-center gap-2 text-stone-850">
                                <Sparkles className="size-6 text-[#E06D53] animate-pulse" />
                                Hello, {user?.name}!
                            </h2>
                            <p className="text-stone-500 text-sm max-w-xl font-medium">
                                Welcome to your dashboard. You are logged in as a{' '}
                                <span className="font-bold text-[#E06D53] uppercase text-xs tracking-wider px-2.5 py-0.5 rounded-full bg-[#E06D53]/10 border border-[#E06D53]/20">
                                    {user?.role === 'master' ? 'Master (Admin)' : (user?.role === 'seller' ? 'Karyawan (Seller)' : 'Buyer / Pembeli')}
                                </span>
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <Button asChild variant="outline" className="gap-2 border-stone-200 hover:bg-[#E06D53]/5 hover:text-[#E06D53] transition-colors font-bold text-xs">
                                <Link href={home.url()}>
                                    <ShoppingCart className="size-4" /> Go to Shop
                                </Link>
                            </Button>
                        </div>
                    </div>
                    <div className="absolute right-0 top-0 -mt-6 -mr-6 size-48 rounded-full bg-[#E06D53]/5 blur-3xl" />
                </div>

                {/* HanyPay & Point Hany Status Cards */}
                <div className="grid gap-6 md:grid-cols-2">
                    {/* HanyPay Balance Card */}
                    <Card className="border border-[#E06D53]/20 bg-gradient-to-tr from-[#E06D53] to-[#ef8872] text-white relative overflow-hidden group shadow-md hover:shadow-lg transition-all duration-300 rounded-2xl">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <div className="space-y-1">
                                <CardTitle className="text-xs font-bold text-white/80 uppercase tracking-widest">HanyPay Wallet</CardTitle>
                                <div className="text-3xl font-black tracking-tight text-white">{formatPrice(user?.hanypay_balance ?? 0)}</div>
                            </div>
                            <div className="p-2 bg-white/10 rounded-xl">
                                <Wallet className="size-6 text-white group-hover:scale-110 transition-transform duration-300" />
                            </div>
                        </CardHeader>
                        <CardContent className="pt-2 text-xs text-[#FFF0EC]/90 font-medium leading-relaxed">
                            Use your HanyPay balance for instant checkout discounts and payments.
                        </CardContent>
                    </Card>

                    {/* Point Hany Balance Card */}
                    <Card className="border border-amber-500/20 bg-gradient-to-tr from-amber-500 to-amber-600 text-white relative overflow-hidden group shadow-md hover:shadow-lg transition-all duration-300 rounded-2xl flex flex-col justify-between">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <div className="space-y-1">
                                <CardTitle className="text-xs font-bold text-white/80 uppercase tracking-widest">Point Hany Balance</CardTitle>
                                <div className="text-3xl font-black tracking-tight text-white flex items-center gap-1.5">
                                    <Coins className="size-6 text-white" />
                                    {user?.hany_points ?? 0} <span className="text-xs font-medium text-white/80">points</span>
                                </div>
                            </div>
                            <div className="p-2 bg-white/10 rounded-xl">
                                <Gift className="size-6 text-white group-hover:scale-110 transition-transform duration-300" />
                            </div>
                        </CardHeader>
                        <CardContent className="pt-2 flex flex-col gap-2">
                            <div className="flex justify-between items-center text-xs text-amber-50/90 font-medium">
                                <span>Consecutive claims: {user?.consecutive_claim_days ?? 0} days</span>
                                <span className="font-bold text-yellow-300">Next reward: {((user?.consecutive_claim_days ?? 0) + (isClaimedToday ? 0 : 1)) * 2} points</span>
                            </div>
                            
                            <Form
                                {...PointsController.claim.form()}
                                options={{ preserveScroll: true }}
                            >
                                {({ processing }) => (
                                    <Button 
                                        type="submit" 
                                        disabled={isClaimedToday || processing} 
                                        className={cn(
                                            "w-full h-9 gap-1.5 flex items-center justify-center font-bold text-xs rounded-xl shadow-xs transition-all duration-300",
                                            isClaimedToday 
                                                ? "bg-white/20 text-white/80 cursor-not-allowed border border-white/10" 
                                                : "bg-white text-amber-600 hover:bg-amber-50 active:scale-98"
                                        )}
                                    >
                                        <Coins className="size-4" />
                                        {isClaimedToday ? 'Point Hany Claimed Today' : 'Claim Daily Point Hany'}
                                    </Button>
                                )}
                            </Form>
                        </CardContent>
                    </Card>
                </div>

                {/* Dashboard Mode Content */}
                {isSeller ? (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {/* Products Quick Link */}
                        {hasPermission('products') && (
                            <Card className="hover:shadow-md transition-all duration-300 border border-indigo-500/20 bg-gradient-to-br from-indigo-500/[0.03] via-white to-white group rounded-2xl">
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <div className="space-y-1 text-left">
                                        <CardTitle className="text-base font-bold text-stone-850">Products Catalog</CardTitle>
                                        <CardDescription className="text-stone-500 text-xs">Create, edit, and control your store listings</CardDescription>
                                    </div>
                                    <div className="p-2 bg-indigo-500/10 rounded-xl group-hover:bg-indigo-500/20 transition-colors">
                                        <Package className="size-5 text-indigo-600" />
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-3">
                                    <Button asChild className="w-full gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs">
                                        <Link href={productsIndex.url()}>
                                            Manage Products <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
                                        </Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        )}

                        {/* Categories Quick Link */}
                        {hasPermission('categories') && (
                            <Card className="hover:shadow-md transition-all duration-300 border border-emerald-500/20 bg-gradient-to-br from-emerald-500/[0.03] via-white to-white group rounded-2xl">
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <div className="space-y-1 text-left">
                                        <CardTitle className="text-base font-bold text-stone-850">Categories</CardTitle>
                                        <CardDescription className="text-stone-500 text-xs">Manage your product categories & structure</CardDescription>
                                    </div>
                                    <div className="p-2 bg-emerald-500/10 rounded-xl group-hover:bg-emerald-500/20 transition-colors">
                                        <FolderTree className="size-5 text-emerald-600" />
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-3">
                                    <Button asChild className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs">
                                        <Link href={categoriesIndex.url()}>
                                            Manage Categories <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
                                        </Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        )}

                        {/* Store Vouchers Quick Link */}
                        {hasPermission('vouchers') && (
                            <Card className="hover:shadow-md transition-all duration-300 border border-[#E06D53]/20 bg-gradient-to-br from-[#E06D53]/[0.03] via-white to-white group rounded-2xl">
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <div className="space-y-1 text-left">
                                        <CardTitle className="text-base font-bold text-stone-850">Store Vouchers</CardTitle>
                                        <CardDescription className="text-stone-500 text-xs">Create discount vouchers for store promotions</CardDescription>
                                    </div>
                                    <div className="p-2 bg-[#E06D53]/10 rounded-xl group-hover:bg-[#E06D53]/20 transition-colors">
                                        <Tag className="size-5 text-[#E06D53]" />
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-3">
                                    <Button asChild className="w-full gap-2 bg-[#E06D53] hover:bg-[#d05d45] text-white font-bold text-xs rounded-xl shadow-xs">
                                        <Link href="/vouchers">
                                            Manage Vouchers <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
                                        </Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        )}

                        {/* Customer Orders Quick Link */}
                        {hasPermission('orders') && (
                            <Card className="hover:shadow-md transition-all duration-300 border border-violet-500/20 bg-gradient-to-br from-violet-500/[0.03] via-white to-white group rounded-2xl">
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <div className="space-y-1 text-left">
                                        <CardTitle className="text-base font-bold text-stone-850">Customer Orders</CardTitle>
                                        <CardDescription className="text-stone-500 text-xs">Fulfill incoming orders and track shipment</CardDescription>
                                    </div>
                                    <div className="p-2 bg-violet-500/10 rounded-xl group-hover:bg-violet-500/20 transition-colors">
                                        <ShoppingBag className="size-5 text-violet-600" />
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-3">
                                    <Button asChild className="w-full gap-2 bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs rounded-xl shadow-xs">
                                        <Link href="/orders">
                                            Manage Orders <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
                                        </Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        )}

                        {/* Master User Control Panel Card */}
                        {user?.role === 'master' && (
                            <Card className="hover:shadow-md transition-all duration-300 border border-sky-500/20 bg-gradient-to-br from-sky-500/[0.03] via-white to-white group rounded-2xl">
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <div className="space-y-1 text-left">
                                        <CardTitle className="text-base font-bold text-stone-850">Master Data User</CardTitle>
                                        <CardDescription className="text-stone-500 text-xs">Manage system users, access roles, and status</CardDescription>
                                    </div>
                                    <div className="p-2 bg-sky-500/10 rounded-xl group-hover:bg-sky-500/20 transition-colors">
                                        <Users className="size-5 text-sky-600" />
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-3">
                                    <Button asChild className="w-full gap-2 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-xs">
                                        <Link href="/users">
                                            Manage Users <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
                                        </Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        )}

                        {/* Security Booster Card */}
                        <Card className="hover:shadow-md transition-all duration-300 border-dashed border-2 border-amber-500/30 bg-gradient-to-br from-amber-500/[0.03] via-white to-white group rounded-2xl flex flex-col justify-between">
                            <CardHeader className="flex flex-row items-start justify-between pb-2">
                                <div className="space-y-1 text-left">
                                    <CardTitle className="text-base font-bold flex items-center gap-1.5 text-amber-600">
                                        <Lock className="size-4" /> Secure Account (2FA)
                                    </CardTitle>
                                    <CardDescription className="text-stone-500 text-xs">Enable Multi-Factor Authentication & Passkeys</CardDescription>
                                </div>
                                <div className="p-2 bg-amber-500/10 rounded-xl">
                                    <ShieldCheck className="size-5 text-amber-600" />
                                </div>
                            </CardHeader>
                            <CardContent className="pt-3">
                                <Button asChild variant="outline" className="w-full gap-2 border-amber-500/40 text-amber-600 hover:bg-amber-50 font-bold text-xs rounded-xl">
                                    <Link href={editSecurity.url()}>
                                        <KeyRound className="size-4" /> Authenticator Settings
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Buyer Greeting Card */}
                        <Card className="border border-[#E06D53]/20 bg-gradient-to-br from-[#E06D53]/[0.02] via-white to-white rounded-2xl shadow-xs hover:shadow-md transition-all duration-300">
                            <CardHeader className="space-y-1 text-left">
                                <CardTitle className="text-lg font-bold flex items-center gap-2 text-stone-850">
                                    <LayoutDashboard className="size-5 text-[#E06D53]" />
                                    Buyer Mode / Mode Pembeli
                                </CardTitle>
                                <CardDescription className="text-stone-500 text-xs">Explore our catalog of fine products</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p className="text-sm text-stone-600 leading-relaxed font-medium text-left">
                                    Discover a premium shopping experience at Hanyza. Explore categories like Fashion (Gender, Newborn, Child, Teenager, Adult) and Home Living (Living Room, Bathroom, Bedroom, Kitchen, Dining Room).
                                </p>
                                <Button asChild className="gap-2 bg-[#E06D53] hover:bg-[#d05d45] text-white font-bold text-xs rounded-xl shadow-xs">
                                    <Link href={home.url()}>
                                        Start Shopping <ArrowRight className="size-4" />
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Security Booster Card for Buyers */}
                        <Card className="border-dashed border-2 border-primary/30 bg-gradient-to-br from-primary/[0.02] via-white to-white rounded-2xl shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between">
                            <CardHeader className="space-y-1 text-left">
                                <CardTitle className="text-lg font-bold flex items-center gap-2 text-primary">
                                    <Lock className="size-5" />
                                    Security Shield / Pengaman Akun
                                </CardTitle>
                                <CardDescription className="text-stone-500 text-xs">Prevent unauthorized logins and safeguard your transactions.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p className="text-sm text-stone-600 leading-relaxed font-medium text-left">
                                    Protect your account from hackers and password compromises. Activate Multi-Factor Authentication (2FA) or setup ultra-secure browser Passkeys to log in securely.
                                </p>
                                <Button asChild variant="outline" className="w-full gap-2 border-primary/40 text-primary hover:bg-primary/5 font-bold text-xs rounded-xl">
                                    <Link href={editSecurity.url()}>
                                        <KeyRound className="size-4" /> Set Up Authenticator (MFA / 2FA)
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
    ],
};

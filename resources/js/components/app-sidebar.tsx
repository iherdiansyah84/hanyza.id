import { Link, usePage } from '@inertiajs/react';
import { BookOpen, FolderGit2, LayoutGrid, FolderTree, ShoppingBag, Tag, ShoppingCart, MapPin, Package } from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import { index as categoriesIndex } from '@/routes/categories';
import { index as productsIndex } from '@/routes/products';
import { index as vouchersIndex } from '@/routes/vouchers';
import { index as cartIndex } from '@/routes/cart';
import { index as addressesIndex } from '@/routes/addresses';
import { index as ordersIndex } from '@/routes/orders';
import type { NavItem } from '@/types';

const footerNavItems: NavItem[] = [
    {
        title: 'Repository',
        href: 'https://github.com/laravel/react-starter-kit',
        icon: FolderGit2,
    },
    {
        title: 'Documentation',
        href: 'https://laravel.com/docs/starter-kits#react',
        icon: BookOpen,
    },
];

export function AppSidebar() {
    const { auth } = usePage<any>().props;
    const isSeller = auth.user?.role === 'seller' || auth.user?.role === 'master';

    const mainNavItems: NavItem[] = isSeller ? [
        {
            title: 'Dashboard',
            href: dashboard(),
            icon: LayoutGrid,
        },
        {
            title: 'Categories',
            href: categoriesIndex.url(),
            icon: FolderTree,
        },
        {
            title: 'Products',
            href: productsIndex.url(),
            icon: ShoppingBag,
        },
        {
            title: 'Vouchers',
            href: vouchersIndex.url(),
            icon: Tag,
        },
        {
            title: 'Orders Control',
            href: ordersIndex.url(),
            icon: Package,
        },
    ] : [
        {
            title: 'Dashboard',
            href: dashboard(),
            icon: LayoutGrid,
        },
        {
            title: 'Shopping Cart',
            href: cartIndex.url(),
            icon: ShoppingCart,
        },
        {
            title: 'My Addresses',
            href: addressesIndex.url(),
            icon: MapPin,
        },
        {
            title: 'My Purchases',
            href: ordersIndex.url(),
            icon: Package,
        },
    ];

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}

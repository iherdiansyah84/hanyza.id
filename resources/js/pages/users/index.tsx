import { Form, Head, Link, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Users, Search, ShieldAlert, Key, UserCheck, UserX } from 'lucide-react';
import UserController from '@/actions/App/Http/Controllers/UserController';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface User {
    id: number;
    name: string;
    email: string;
    role: 'buyer' | 'seller' | 'master';
    status: 'active' | 'inactive';
    permissions?: string[];
    created_at: string;
}

interface PaginatedUsers {
    data: User[];
    current_page: number;
    last_page: number;
    prev_page_url: string | null;
    next_page_url: string | null;
    links: { url: string | null; label: string; active: boolean }[];
}

interface Props {
    users: PaginatedUsers;
    filters: {
        search?: string;
        role?: string;
        status?: string;
    };
    auth: {
        user: User;
    };
    locale?: string;
}

export default function UsersIndex({ users, filters, auth, locale = 'id' }: Props) {
    const [isOpen, setIsOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [editUser, setEditUser] = useState<User | null>(null);
    const [activeUser, setActiveUser] = useState<User | null>(null);

    const [searchTerm, setSearchTerm] = useState(filters.search ?? '');
    const [selectedRole, setSelectedRole] = useState(filters.role ?? '');
    const [selectedStatus, setSelectedStatus] = useState(filters.status ?? '');

    // Form modal active states
    const [selectedFormRole, setSelectedFormRole] = useState<'buyer' | 'seller' | 'master'>('buyer');
    const [permissions, setPermissions] = useState<string[]>([]);

    // Sync form states when editUser or dialog open status changes
    useEffect(() => {
        if (isOpen) {
            if (editUser) {
                setSelectedFormRole(editUser.role);
                setPermissions(editUser.permissions || []);
            } else {
                setSelectedFormRole('buyer');
                setPermissions([]);
            }
        }
    }, [editUser, isOpen]);

    const handleFilterChange = (key: string, value: string) => {
        const newFilters = { 
            search: searchTerm, 
            role: selectedRole, 
            status: selectedStatus, 
            [key]: value 
        };

        // Remove empty values
        Object.keys(newFilters).forEach(k => {
            if (!newFilters[k as keyof typeof newFilters]) {
                delete newFilters[k as keyof typeof newFilters];
            }
        });

        router.get('/users', newFilters, { preserveState: true, replace: true });
    };

    const handleResetFilters = () => {
        setSearchTerm('');
        setSelectedRole('');
        setSelectedStatus('');
        router.get('/users', {}, { preserveState: true, replace: true });
    };

    const handleOpenCreate = () => {
        setEditUser(null);
        setIsOpen(true);
    };

    const handleOpenEdit = (user: User) => {
        setEditUser(user);
        setIsOpen(true);
    };

    const handleOpenDelete = (user: User) => {
        setActiveUser(user);
        setIsDeleteOpen(true);
    };

    return (
        <>
            <Head title="Master Data User" />

            <div className="flex h-full flex-col gap-6">
                {/* Header Section */}
                <div className="flex flex-col justify-between gap-4 border-b border-stone-100 pb-5 sm:flex-row sm:items-center">
                    <Heading 
                        title={locale === 'id' ? 'Master Data User' : 'Master Data Users'} 
                        description={locale === 'id' ? 'Kelola seluruh data pengguna, role akses, kata sandi, dan status keaktifan user.' : 'Manage all system user data, access authorization roles, passwords, and status.'}
                    />
                    <Button 
                        onClick={handleOpenCreate} 
                        className="w-full sm:w-auto bg-[#E06D53] hover:bg-[#c85b43] text-white gap-2 flex items-center justify-center font-bold text-xs rounded-xl shadow-xs"
                    >
                        <Plus className="size-4" /> {locale === 'id' ? 'Tambah User' : 'Add User'}
                    </Button>
                </div>

                {/* Filter and Search Bar */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between bg-white p-4 rounded-2xl border border-stone-200/60 shadow-xs">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-2.5 size-4 text-stone-400" />
                        <Input
                            placeholder={locale === 'id' ? 'Cari user (nama atau email)...' : 'Search users (name or email)...'}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleFilterChange('search', searchTerm)}
                            className="pl-9 w-full rounded-xl border-stone-200"
                        />
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <select
                            id="role-filter"
                            value={selectedRole}
                            onChange={(e) => {
                                setSelectedRole(e.target.value);
                                handleFilterChange('role', e.target.value);
                            }}
                            className="h-10 w-[140px] rounded-xl border border-stone-200 bg-white px-3 py-1.5 text-xs font-bold text-stone-600 shadow-xs focus:ring-1 focus:ring-[#E06D53] focus:border-[#E06D53]"
                        >
                            <option value="">{locale === 'id' ? 'Semua Role' : 'All Roles'}</option>
                            <option value="buyer">Pembeli (Buyer)</option>
                            <option value="seller">Penjual (Seller)</option>
                            <option value="master">Master (Admin)</option>
                        </select>
                        <select
                            id="status-filter"
                            value={selectedStatus}
                            onChange={(e) => {
                                setSelectedStatus(e.target.value);
                                handleFilterChange('status', e.target.value);
                            }}
                            className="h-10 w-[140px] rounded-xl border border-stone-200 bg-white px-3 py-1.5 text-xs font-bold text-stone-600 shadow-xs focus:ring-1 focus:ring-[#E06D53] focus:border-[#E06D53]"
                        >
                            <option value="">{locale === 'id' ? 'Semua Status' : 'All Status'}</option>
                            <option value="active">Active</option>
                            <option value="inactive">{locale === 'id' ? 'Dinonaktifkan' : 'Deactivated'}</option>
                        </select>
                        {(filters.search || filters.role || filters.status) && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleResetFilters}
                                className="text-xs font-bold text-[#E06D53] hover:text-[#C85B43] hover:bg-[#E06D53]/5 rounded-xl h-10 px-3"
                            >
                                Reset
                            </Button>
                        )}
                    </div>
                </div>

                {/* Users List Table */}
                {users.data.length > 0 ? (
                    <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-xs">
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse text-left text-sm text-stone-500">
                                <thead className="bg-stone-50 text-[10px] font-black uppercase tracking-widest text-stone-400 border-b border-stone-100">
                                    <tr>
                                        <th scope="col" className="px-6 py-4">User</th>
                                        <th scope="col" className="px-6 py-4">Role</th>
                                        <th scope="col" className="px-6 py-4">Status</th>
                                        <th scope="col" className="px-6 py-4">Joined Date / Bergabung</th>
                                        <th scope="col" className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-stone-100 border-t border-stone-100">
                                    {users.data.map((user) => (
                                        <tr key={user.id} className="hover:bg-stone-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="size-9 rounded-full bg-stone-100 border border-stone-200/60 flex items-center justify-center font-bold text-stone-700 uppercase shrink-0 text-xs shadow-inner">
                                                        {user.name.substring(0,2)}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-stone-850 flex items-center gap-1.5">
                                                            {user.name}
                                                            {user.id === auth.user.id && (
                                                                <span className="text-[9px] bg-stone-100 text-stone-500 font-bold px-1.5 py-0.5 rounded-sm">You</span>
                                                            )}
                                                        </div>
                                                        <div className="text-xs text-stone-400 font-medium">{user.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {user.role === 'master' ? (
                                                    <span className="inline-flex items-center gap-1 rounded-md bg-sky-500/10 px-2.5 py-1 text-xs font-bold text-sky-750 border border-sky-500/20">
                                                        Master (Admin)
                                                    </span>
                                                ) : user.role === 'seller' ? (
                                                    <div className="flex flex-col items-start gap-1">
                                                        <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/10 px-2.5 py-1 text-xs font-bold text-amber-700 border border-amber-500/20">
                                                            Penjual (Seller)
                                                        </span>
                                                        {user.permissions && user.permissions.length > 0 ? (
                                                            <div className="flex flex-wrap gap-1 mt-1 max-w-[200px]">
                                                                {user.permissions.map((perm) => (
                                                                    <span key={perm} className="text-[9px] font-black text-stone-500 bg-stone-100 border border-stone-200 rounded px-1.5 py-0.5 uppercase tracking-wider">
                                                                        {perm}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <span className="text-[9px] text-stone-400 font-semibold italic mt-0.5">No Permissions</span>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 rounded-md bg-stone-100 px-2.5 py-1 text-xs font-bold text-stone-600 border border-stone-200">
                                                        Pembeli (Buyer)
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                {user.status === 'active' ? (
                                                    <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2.5 py-1 text-xs font-bold text-emerald-700 border border-emerald-500/20">
                                                        <UserCheck className="size-3" /> Active
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 rounded-md bg-rose-500/10 px-2.5 py-1 text-xs font-bold text-rose-700 border border-rose-500/20">
                                                        <UserX className="size-3" /> {locale === 'id' ? 'Dinonaktifkan' : 'Deactivated'}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-xs font-bold text-stone-500">
                                                {new Date(user.created_at).toLocaleDateString('id-ID', {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric'
                                                })}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="size-8 rounded-lg text-stone-600 hover:bg-stone-50"
                                                        onClick={() => handleOpenEdit(user)}
                                                    >
                                                        <Edit2 className="size-3.5" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="size-8 rounded-lg text-red-600 hover:bg-red-50"
                                                        onClick={() => handleOpenDelete(user)}
                                                        disabled={user.id === auth.user.id}
                                                    >
                                                        <Trash2 className="size-3.5" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination Links */}
                        {users.links && users.links.length > 3 && (
                            <div className="flex items-center justify-between border-t border-stone-100 bg-white px-6 py-4">
                                <div className="flex flex-1 justify-between sm:hidden">
                                    <Button
                                        asChild
                                        variant="outline"
                                        disabled={!users.prev_page_url}
                                        className="rounded-xl text-xs font-bold border-stone-200"
                                    >
                                        <Link href={users.prev_page_url || '#'}>Previous</Link>
                                    </Button>
                                    <Button
                                        asChild
                                        variant="outline"
                                        disabled={!users.next_page_url}
                                        className="rounded-xl text-xs font-bold border-stone-200"
                                    >
                                        <Link href={users.next_page_url || '#'}>Next</Link>
                                    </Button>
                                </div>
                                <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                                    <div>
                                        <p className="text-xs text-stone-500 font-semibold">
                                            Showing page <span className="font-bold text-stone-700">{users.current_page}</span> of{' '}
                                            <span className="font-bold text-stone-700">{users.last_page}</span>
                                        </p>
                                    </div>
                                    <div>
                                        <nav className="isolate inline-flex -space-x-px gap-1.5" aria-label="Pagination">
                                            {users.links.map((link, idx) => (
                                                <Link
                                                    key={idx}
                                                    href={link.url || '#'}
                                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                                    className={`relative inline-flex items-center px-3.5 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                                                        link.active
                                                            ? 'z-10 bg-[#E06D53] border-[#E06D53] text-white shadow-sm'
                                                            : 'bg-white border-stone-200 text-stone-500 hover:bg-stone-50'
                                                    } ${!link.url ? 'pointer-events-none opacity-40' : ''}`}
                                                />
                                            ))}
                                        </nav>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="text-center py-16 border border-dashed border-stone-200 bg-white rounded-2xl">
                        <Users className="size-10 text-stone-400 mx-auto mb-3" />
                        <p className="text-sm font-bold text-stone-700">No users found.</p>
                        <p className="text-xs text-stone-400 mt-1">Try resetting filters or search terms.</p>
                    </div>
                )}
            </div>

            {/* Create & Edit Modal Dialog */}
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="sm:max-w-[420px] rounded-2xl bg-white p-6 shadow-xl">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-bold text-stone-850">
                            {editUser ? (locale === 'id' ? 'Ubah Data User' : 'Edit User') : (locale === 'id' ? 'Tambah User Baru' : 'Add New User')}
                        </DialogTitle>
                        <DialogDescription className="text-xs text-stone-400 mt-1">
                            {locale === 'id' ? 'Masukkan detail informasi profil pengguna dan role autentikasinya di bawah ini.' : 'Configure user profile details and their authentication access levels.'}
                        </DialogDescription>
                    </DialogHeader>

                    <Form
                        {...(editUser
                            ? UserController.update.form({ user: editUser.id })
                            : UserController.store.form()
                        )}
                        onSuccess={() => setIsOpen(false)}
                        options={{
                            preserveScroll: true,
                        }}
                        resetOnSuccess
                    >
                        {({ processing, errors }) => (
                            <div className="space-y-4 pt-3">
                                <div className="grid gap-1.5">
                                    <Label htmlFor="name" className="text-xs font-bold text-stone-600">Name / Nama Lengkap</Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        defaultValue={editUser?.name ?? ''}
                                        placeholder="e.g. A.D. Alviansyah"
                                        required
                                        className="rounded-xl border-stone-200"
                                    />
                                    <InputError message={errors.name} />
                                </div>

                                <div className="grid gap-1.5">
                                    <Label htmlFor="email" className="text-xs font-bold text-stone-600">Email Address / Email</Label>
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        defaultValue={editUser?.email ?? ''}
                                        placeholder="e.g. user@example.com"
                                        required
                                        className="rounded-xl border-stone-200"
                                    />
                                    <InputError message={errors.email} />
                                </div>

                                <div className="grid gap-1.5">
                                    <Label htmlFor="password" className="text-xs font-bold text-stone-600 flex items-center justify-between">
                                        <span>Password</span>
                                        {editUser && <span className="text-[10px] text-stone-400 font-semibold">(Leave blank to keep current)</span>}
                                    </Label>
                                    <Input
                                        id="password"
                                        name="password"
                                        type="password"
                                        placeholder={editUser ? "••••••••" : "Minimum 8 characters"}
                                        required={!editUser}
                                        className="rounded-xl border-stone-200"
                                    />
                                    <InputError message={errors.password} />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-1.5">
                                        <Label htmlFor="role" className="text-xs font-bold text-stone-600">Role / Hak Akses</Label>
                                        <select
                                            id="role"
                                            name="role"
                                            value={selectedFormRole}
                                            onChange={(e) => setSelectedFormRole(e.target.value as any)}
                                            className="h-10 rounded-xl border border-stone-200 bg-white px-3 py-1.5 text-xs font-bold text-stone-600 shadow-xs focus:ring-1 focus:ring-[#E06D53] focus:border-[#E06D53]"
                                            disabled={editUser?.id === auth.user.id}
                                        >
                                            <option value="buyer">Pembeli (Buyer)</option>
                                            <option value="seller">Penjual (Seller)</option>
                                            <option value="master">Master (Admin)</option>
                                        </select>
                                        <InputError message={errors.role} />
                                    </div>

                                    <div className="grid gap-1.5">
                                        <Label htmlFor="status" className="text-xs font-bold text-stone-600">Status Keaktifan</Label>
                                        <select
                                            id="status"
                                            name="status"
                                            defaultValue={editUser?.status ?? 'active'}
                                            className="h-10 rounded-xl border border-stone-200 bg-white px-3 py-1.5 text-xs font-bold text-stone-600 shadow-xs focus:ring-1 focus:ring-[#E06D53] focus:border-[#E06D53]"
                                            disabled={editUser?.id === auth.user.id}
                                        >
                                            <option value="active">Active</option>
                                            <option value="inactive">{locale === 'id' ? 'Dinonaktifkan' : 'Deactivated'}</option>
                                        </select>
                                        <InputError message={errors.status} />
                                    </div>
                                </div>

                                {selectedFormRole === 'seller' && (
                                    <div className="border border-stone-200/85 rounded-2xl p-4 bg-stone-50/50 space-y-3.5 text-left">
                                        <div className="text-xs font-bold text-stone-700 border-b border-stone-200 pb-1.5 flex items-center justify-between">
                                            <span>Otorisasi Hak Akses (Permissions)</span>
                                            <span className="text-[10px] text-stone-400 font-semibold">(Hanya untuk Karyawan/Seller)</span>
                                        </div>

                                        <div className="space-y-3">
                                            {/* Dashboard Permission */}
                                            <label className="flex items-start gap-2.5 cursor-pointer group select-none">
                                                <input
                                                    type="checkbox"
                                                    name="permissions[]"
                                                    value="dashboard"
                                                    checked={permissions.includes('dashboard')}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setPermissions([...permissions, 'dashboard']);
                                                        } else {
                                                            setPermissions(permissions.filter(p => p !== 'dashboard'));
                                                        }
                                                    }}
                                                    className="rounded border-stone-300 text-[#E06D53] focus:ring-[#E06D53] h-4 w-4 mt-0.5"
                                                />
                                                <div className="space-y-0.5">
                                                    <span className="text-xs font-bold text-stone-700 group-hover:text-stone-850 transition-colors">Dasbor Toko</span>
                                                    <p className="text-[10px] text-stone-400 leading-normal font-medium">Mengakses rangkuman statistik penjualan dan Point Hany.</p>
                                                </div>
                                            </label>

                                            {/* Categories Permission */}
                                            <label className="flex items-start gap-2.5 cursor-pointer group select-none">
                                                <input
                                                    type="checkbox"
                                                    name="permissions[]"
                                                    value="categories"
                                                    checked={permissions.includes('categories')}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setPermissions([...permissions, 'categories']);
                                                        } else {
                                                            setPermissions(permissions.filter(p => p !== 'categories'));
                                                        }
                                                    }}
                                                    className="rounded border-stone-300 text-[#E06D53] focus:ring-[#E06D53] h-4 w-4 mt-0.5"
                                                />
                                                <div className="space-y-0.5">
                                                    <span className="text-xs font-bold text-stone-700 group-hover:text-stone-850 transition-colors">Kelola Kategori</span>
                                                    <p className="text-[10px] text-stone-400 leading-normal font-medium">Mengelola struktur kategori produk di toko.</p>
                                                </div>
                                            </label>

                                            {/* Products Permission */}
                                            <label className="flex items-start gap-2.5 cursor-pointer group select-none">
                                                <input
                                                    type="checkbox"
                                                    name="permissions[]"
                                                    value="products"
                                                    checked={permissions.includes('products')}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setPermissions([...permissions, 'products']);
                                                        } else {
                                                            setPermissions(permissions.filter(p => p !== 'products'));
                                                        }
                                                    }}
                                                    className="rounded border-stone-300 text-[#E06D53] focus:ring-[#E06D53] h-4 w-4 mt-0.5"
                                                />
                                                <div className="space-y-0.5">
                                                    <span className="text-xs font-bold text-stone-700 group-hover:text-stone-850 transition-colors">Kelola Produk</span>
                                                    <p className="text-[10px] text-stone-400 leading-normal font-medium">Tambah, ubah, hapus, dan atur stok/harga katalog produk.</p>
                                                </div>
                                            </label>

                                            {/* Vouchers Permission */}
                                            <label className="flex items-start gap-2.5 cursor-pointer group select-none">
                                                <input
                                                    type="checkbox"
                                                    name="permissions[]"
                                                    value="vouchers"
                                                    checked={permissions.includes('vouchers')}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setPermissions([...permissions, 'vouchers']);
                                                        } else {
                                                            setPermissions(permissions.filter(p => p !== 'vouchers'));
                                                        }
                                                    }}
                                                    className="rounded border-stone-300 text-[#E06D53] focus:ring-[#E06D53] h-4 w-4 mt-0.5"
                                                />
                                                <div className="space-y-0.5">
                                                    <span className="text-xs font-bold text-stone-700 group-hover:text-stone-850 transition-colors">Kelola Voucher Toko</span>
                                                    <p className="text-[10px] text-stone-400 leading-normal font-medium">Membuat voucher diskon dan promosi belanja.</p>
                                                </div>
                                            </label>

                                            {/* Orders Permission */}
                                            <label className="flex items-start gap-2.5 cursor-pointer group select-none">
                                                <input
                                                    type="checkbox"
                                                    name="permissions[]"
                                                    value="orders"
                                                    checked={permissions.includes('orders')}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setPermissions([...permissions, 'orders']);
                                                        } else {
                                                            setPermissions(permissions.filter(p => p !== 'orders'));
                                                        }
                                                    }}
                                                    className="rounded border-stone-300 text-[#E06D53] focus:ring-[#E06D53] h-4 w-4 mt-0.5"
                                                />
                                                <div className="space-y-0.5">
                                                    <span className="text-xs font-bold text-stone-700 group-hover:text-stone-850 transition-colors">Kelola Pesanan Masuk</span>
                                                    <p className="text-[10px] text-stone-400 leading-normal font-medium">Memproses pesanan baru pelanggan dan melacak pengiriman.</p>
                                                </div>
                                            </label>
                                        </div>
                                    </div>
                                )}

                                <DialogFooter className="pt-4 border-t border-stone-100 mt-6 gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setIsOpen(false)}
                                        className="rounded-xl font-bold text-xs border-stone-200 h-10"
                                    >
                                        Cancel
                                    </Button>
                                    <Button 
                                        type="submit" 
                                        disabled={processing}
                                        className="rounded-xl font-bold text-xs bg-[#E06D53] hover:bg-[#c85b43] text-white h-10 px-4"
                                    >
                                        {editUser ? 'Save Changes' : 'Create User'}
                                    </Button>
                                </DialogFooter>
                            </div>
                        )}
                    </Form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <DialogContent className="sm:max-w-[400px] rounded-2xl bg-white p-6 shadow-xl">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-bold text-red-650 flex items-center gap-2">
                            <ShieldAlert className="size-5 shrink-0" /> {locale === 'id' ? 'Hapus User?' : 'Delete User?'}
                        </DialogTitle>
                        <DialogDescription className="text-xs text-stone-400 mt-1">
                            {locale === 'id' 
                                ? 'Apakah Anda yakin ingin menghapus akun ini secara permanen? Seluruh data riwayat pesanan dan relasi akan ikut terpengaruh.' 
                                : 'Are you sure you want to permanently delete this user account? All order history and related database relations will be affected.'
                            }
                        </DialogDescription>
                    </DialogHeader>

                    {activeUser && (
                        <Form
                            {...UserController.destroy.form({ user: activeUser.id })}
                            onSuccess={() => {
                                setIsDeleteOpen(false);
                                setActiveUser(null);
                            }}
                        >
                            {({ processing, errors }) => (
                                <div className="space-y-4 pt-2">
                                    <div className="bg-stone-50 border border-stone-100 rounded-xl p-3.5 text-xs text-stone-600">
                                        <div className="font-bold text-stone-850">{activeUser.name}</div>
                                        <div className="text-stone-400 mt-0.5">{activeUser.email}</div>
                                    </div>
                                    
                                    <InputError message={errors.error} />

                                    <DialogFooter className="pt-2 border-t border-stone-100 mt-4 gap-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => {
                                                setIsDeleteOpen(false);
                                                setActiveUser(null);
                                            }}
                                            className="rounded-xl font-bold text-xs border-stone-200 h-10"
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            type="submit"
                                            variant="destructive"
                                            disabled={processing}
                                            className="rounded-xl font-bold text-xs bg-red-600 hover:bg-red-700 text-white h-10 px-4"
                                        >
                                            Delete User
                                        </Button>
                                    </DialogFooter>
                                </div>
                            )}
                        </Form>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}

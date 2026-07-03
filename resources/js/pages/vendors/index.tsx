import { Head, usePage, router } from '@inertiajs/react';
import { useState } from 'react';
import { Plus, Edit2, Trash2, Search, Store } from 'lucide-react';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface Category {
    id: number;
    name: string;
    code: string;
}

interface Vendor {
    id: number;
    name: string;
    vendor_category_id: number | null;
    contact_name: string | null;
    phone: string | null;
    email: string | null;
    category?: Category;
    created_at: string;
}

interface PaginatedVendors {
    data: Vendor[];
    current_page: number;
    last_page: number;
    total: number;
    links: any[];
}

export default function VendorsIndex({ 
    vendors, 
    categories, 
    filters 
}: { 
    vendors: PaginatedVendors; 
    categories: Category[]; 
    filters: { search?: string } 
}) {
    const { locale = 'en' } = usePage<any>().props;

    const [searchTerm, setSearchTerm] = useState(filters.search ?? '');
    const [isOpen, setIsOpen] = useState(false);
    const [editVendor, setEditVendor] = useState<Vendor | null>(null);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [activeVendor, setActiveVendor] = useState<Vendor | null>(null);

    // Form inputs state
    const [name, setName] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [contactName, setContactName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [errors, setErrors] = useState<any>({});
    const [processing, setProcessing] = useState(false);

    const handleSearch = () => {
        router.get('/vendors', { search: searchTerm }, { preserveState: true, replace: true });
    };

    const handleClearFilters = () => {
        setSearchTerm('');
        router.get('/vendors', {}, { preserveState: true, replace: true });
    };

    const handleOpenCreate = () => {
        setEditVendor(null);
        setName('');
        setCategoryId(categories.length > 0 ? categories[0].id.toString() : '');
        setContactName('');
        setPhone('');
        setEmail('');
        setErrors({});
        setIsOpen(true);
    };

    const handleOpenEdit = (v: Vendor) => {
        setEditVendor(v);
        setName(v.name);
        setCategoryId(v.vendor_category_id?.toString() ?? '');
        setContactName(v.contact_name ?? '');
        setPhone(v.phone ?? '');
        setEmail(v.email ?? '');
        setErrors({});
        setIsOpen(true);
    };

    const handleOpenDelete = (v: Vendor) => {
        setActiveVendor(v);
        setIsDeleteOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);
        setErrors({});

        const url = editVendor 
            ? `/vendors/${editVendor.id}` 
            : '/vendors';

        const data = {
            name,
            vendor_category_id: categoryId || null,
            contact_name: contactName,
            phone,
            email
        };

        if (editVendor) {
            router.put(url, data, {
                onSuccess: () => {
                    setIsOpen(false);
                    setProcessing(false);
                },
                onError: (err) => {
                    setErrors(err);
                    setProcessing(false);
                }
            });
        } else {
            router.post(url, data, {
                onSuccess: () => {
                    setIsOpen(false);
                    setProcessing(false);
                },
                onError: (err) => {
                    setErrors(err);
                    setProcessing(false);
                }
            });
        }
    };

    const handleDelete = (e: React.FormEvent) => {
        e.preventDefault();
        if (!activeVendor) return;

        setProcessing(true);
        router.delete(`/vendors/${activeVendor.id}`, {
            onSuccess: () => {
                setIsDeleteOpen(false);
                setActiveVendor(null);
                setProcessing(false);
            },
            onError: (err) => {
                setErrors(err);
                setProcessing(false);
            }
        });
    };

    return (
        <>
            <Head title={locale === 'id' ? 'Master Vendor' : 'Vendors List'} />

            <div className="flex h-full flex-col gap-6">
                {/* Header Section */}
                <div className="flex flex-col justify-between gap-4 border-b border-stone-100 pb-5 sm:flex-row sm:items-center">
                    <Heading 
                        title={locale === 'id' ? 'Data Vendor' : 'Vendors List'} 
                        description={locale === 'id' ? 'Kelola master data supplier, mitra, dan vendor pasokan barang.' : 'Manage supplier contact cards, partners, and merchandise vendors.'}
                    />
                    <Button 
                        onClick={handleOpenCreate} 
                        className="w-full sm:w-auto bg-[#E06D53] hover:bg-[#c85b43] text-white gap-2 flex items-center justify-center font-bold text-xs rounded-xl shadow-xs cursor-pointer h-10 px-4"
                    >
                        <Plus className="size-4" /> {locale === 'id' ? 'Tambah Vendor' : 'Add Vendor'}
                    </Button>
                </div>

                {/* Filter and Search Bar */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between bg-white p-4 rounded-2xl border border-stone-200/60 shadow-xs">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-2.5 size-4 text-stone-400" />
                        <Input
                            placeholder={locale === 'id' ? 'Cari berdasarkan nama, kontak, email...' : 'Search by name, contact, email...'}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            className="pl-9 w-full rounded-xl border-stone-200"
                        />
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <Button 
                            onClick={handleSearch} 
                            className="bg-stone-850 hover:bg-stone-900 text-white font-bold text-xs rounded-xl h-10 px-4 cursor-pointer"
                        >
                            {locale === 'id' ? 'Cari' : 'Search'}
                        </Button>
                        {filters.search && (
                            <Button 
                                onClick={handleClearFilters} 
                                variant="outline"
                                className="rounded-xl font-bold text-xs border-stone-200 h-10 px-4 cursor-pointer text-stone-650 hover:text-stone-850"
                            >
                                {locale === 'id' ? 'Bersihkan' : 'Clear'}
                            </Button>
                        )}
                    </div>
                </div>

                {/* Table Section */}
                <div className="overflow-hidden bg-white border border-stone-200/60 rounded-2xl shadow-xs">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-stone-100 bg-stone-50/50 text-[10px] font-black uppercase tracking-widest text-stone-400">
                                    <th className="p-4 pl-6">Vendor Name</th>
                                    <th className="p-4">Category</th>
                                    <th className="p-4">Contact Person</th>
                                    <th className="p-4">Phone</th>
                                    <th className="p-4">Email</th>
                                    <th className="p-4 pr-6 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-100 text-xs text-stone-600">
                                {vendors.data.length > 0 ? (
                                    vendors.data.map((v) => (
                                        <tr key={v.id} className="hover:bg-stone-50/30 transition-colors">
                                            <td className="p-4 pl-6 font-bold text-stone-850">
                                                {v.name}
                                            </td>
                                            <td className="p-4">
                                                {v.category ? (
                                                    <span className="bg-stone-100 text-stone-700 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border border-stone-200/40">
                                                        {v.category.name}
                                                    </span>
                                                ) : '-'}
                                            </td>
                                            <td className="p-4 font-semibold text-stone-700">
                                                {v.contact_name || '-'}
                                            </td>
                                            <td className="p-4 text-stone-500 font-mono">
                                                {v.phone || '-'}
                                            </td>
                                            <td className="p-4 text-stone-500">
                                                {v.email || '-'}
                                            </td>
                                            <td className="p-4 pr-6 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button
                                                        onClick={() => handleOpenEdit(v)}
                                                        variant="ghost"
                                                        size="icon"
                                                        className="size-8 rounded-lg text-stone-400 hover:text-stone-800 hover:bg-stone-100 transition-colors cursor-pointer"
                                                    >
                                                        <Edit2 className="size-3.5" />
                                                    </Button>
                                                    <Button
                                                        onClick={() => handleOpenDelete(v)}
                                                        variant="ghost"
                                                        size="icon"
                                                        className="size-8 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                                                    >
                                                        <Trash2 className="size-3.5" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="p-10 text-center">
                                            <div className="flex flex-col items-center justify-center gap-2">
                                                <Store className="size-8 text-stone-300" />
                                                <p className="text-stone-400 font-bold text-xs">
                                                    {locale === 'id' ? 'Tidak ada vendor ditemukan.' : 'No vendors found.'}
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {vendors.last_page > 1 && (
                        <div className="flex items-center justify-between border-t border-stone-100 p-4 px-6 bg-stone-50/20 text-xs">
                            <span className="font-bold text-stone-400">
                                Page {vendors.current_page} of {vendors.last_page}
                            </span>
                            <div className="flex items-center gap-1">
                                {vendors.links.map((link, idx) => {
                                    if (link.url === null) return null;
                                    return (
                                        <Button
                                            key={idx}
                                            variant={link.active ? 'default' : 'outline'}
                                            onClick={() => router.get(link.url, {}, { preserveState: true })}
                                            className={`rounded-lg font-bold text-xs h-8 px-3 cursor-pointer ${
                                                link.active 
                                                    ? 'bg-[#E06D53] hover:bg-[#c85b43] text-white' 
                                                    : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                                            }`}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* CREATE / EDIT DIALOG */}
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="max-w-md rounded-2xl bg-white p-6 shadow-xl border border-stone-100">
                    <DialogHeader className="border-b border-stone-150 pb-4">
                        <DialogTitle className="text-base font-black text-stone-850">
                            {editVendor ? (locale === 'id' ? 'Ubah Vendor' : 'Edit Vendor') : (locale === 'id' ? 'Tambah Vendor' : 'Add Vendor')}
                        </DialogTitle>
                        <DialogDescription className="text-xs text-stone-400">
                            {locale === 'id' ? 'Masukkan detail informasi kontak vendor di bawah ini.' : 'Configure vendor contact details below.'}
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                        <div className="grid gap-1.5">
                            <Label htmlFor="name" className="text-xs font-bold text-stone-700">Vendor Name</Label>
                            <Input
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g. PT Sinar Indah Jaya"
                                disabled={processing}
                                className="rounded-xl border-stone-200 text-xs font-bold"
                                required
                            />
                            {errors.name && <InputError message={errors.name} />}
                        </div>

                        <div className="grid gap-1.5">
                            <Label htmlFor="vendor_category_id" className="text-xs font-bold text-stone-700">Vendor Category</Label>
                            <select
                                id="vendor_category_id"
                                value={categoryId}
                                onChange={(e) => setCategoryId(e.target.value)}
                                disabled={processing}
                                className="w-full rounded-xl border border-stone-200 bg-white p-2.5 text-xs font-bold text-stone-800 shadow-xs focus:ring-1 focus:ring-[#E06D53] focus:border-[#E06D53]"
                            >
                                <option value="">No Category...</option>
                                {categories.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.name} ({c.code})
                                    </option>
                                ))}
                            </select>
                            {errors.vendor_category_id && <InputError message={errors.vendor_category_id} />}
                        </div>

                        <div className="grid gap-1.5">
                            <Label htmlFor="contact_name" className="text-xs font-bold text-stone-700">Contact Person Name</Label>
                            <Input
                                id="contact_name"
                                value={contactName}
                                onChange={(e) => setContactName(e.target.value)}
                                placeholder="e.g. Budi Santoso"
                                disabled={processing}
                                className="rounded-xl border-stone-200 text-xs font-bold"
                            />
                            {errors.contact_name && <InputError message={errors.contact_name} />}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-1.5">
                                <Label htmlFor="phone" className="text-xs font-bold text-stone-700">Phone</Label>
                                <Input
                                    id="phone"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="e.g. 0812345678"
                                    disabled={processing}
                                    className="rounded-xl border-stone-200 text-xs font-mono font-bold"
                                />
                                {errors.phone && <InputError message={errors.phone} />}
                            </div>

                            <div className="grid gap-1.5">
                                <Label htmlFor="email" className="text-xs font-bold text-stone-700">Email Address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="e.g. info@vendor.com"
                                    disabled={processing}
                                    className="rounded-xl border-stone-200 text-xs font-bold"
                                />
                                {errors.email && <InputError message={errors.email} />}
                            </div>
                        </div>

                        <DialogFooter className="pt-4 border-t border-stone-100 mt-4 gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsOpen(false)}
                                disabled={processing}
                                className="rounded-xl font-bold text-xs border-stone-200 h-10 px-4 cursor-pointer"
                            >
                                {locale === 'id' ? 'Batal' : 'Cancel'}
                            </Button>
                            <Button
                                type="submit"
                                disabled={processing}
                                className="rounded-xl font-bold text-xs bg-[#E06D53] hover:bg-[#c85b43] text-white h-10 px-4 cursor-pointer"
                            >
                                {locale === 'id' ? 'Simpan' : 'Save'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* DELETE DIALOG */}
            <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <DialogContent className="max-w-md rounded-2xl bg-white p-6 shadow-xl border border-stone-100">
                    <DialogHeader className="border-b border-stone-150 pb-4">
                        <DialogTitle className="text-base font-black text-stone-850">
                            {locale === 'id' ? 'Hapus Vendor' : 'Delete Vendor'}
                        </DialogTitle>
                        <DialogDescription className="text-xs text-stone-400">
                            {locale === 'id' ? 'Apakah Anda yakin ingin menghapus vendor ini?' : 'Are you sure you want to delete this vendor?'}
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleDelete} className="pt-4 space-y-4">
                        <p className="text-xs text-stone-500 font-medium">
                            {locale === 'id' 
                                ? `Tindakan ini akan menghapus vendor "${activeVendor?.name}" secara permanen.` 
                                : `This action will permanently delete the vendor "${activeVendor?.name}".`}
                        </p>

                        <DialogFooter className="pt-4 border-t border-stone-100 mt-4 gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setIsDeleteOpen(false);
                                    setActiveVendor(null);
                                }}
                                disabled={processing}
                                className="rounded-xl font-bold text-xs border-stone-200 h-10 px-4 cursor-pointer"
                            >
                                {locale === 'id' ? 'Batal' : 'Cancel'}
                            </Button>
                            <Button
                                type="submit"
                                variant="destructive"
                                disabled={processing}
                                className="rounded-xl font-bold text-xs bg-red-600 hover:bg-red-700 text-white h-10 px-4 cursor-pointer"
                            >
                                {locale === 'id' ? 'Hapus' : 'Delete'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}

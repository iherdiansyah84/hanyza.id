import { Head, usePage, router } from '@inertiajs/react';
import { useState } from 'react';
import { Plus, Edit2, Trash2, Search, FolderTree } from 'lucide-react';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface VendorCategory {
    id: number;
    name: string;
    code: string;
    description: string | null;
    created_at: string;
}

interface PaginatedCategories {
    data: VendorCategory[];
    current_page: number;
    last_page: number;
    total: number;
    links: any[];
}

export default function VendorCategoriesIndex({ 
    categories, 
    filters 
}: { 
    categories: PaginatedCategories; 
    filters: { search?: string } 
}) {
    const { locale = 'en' } = usePage<any>().props;

    const [searchTerm, setSearchTerm] = useState(filters.search ?? '');
    const [isOpen, setIsOpen] = useState(false);
    const [editCategory, setEditCategory] = useState<VendorCategory | null>(null);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [activeCategory, setActiveCategory] = useState<VendorCategory | null>(null);

    // Form inputs state
    const [name, setName] = useState('');
    const [code, setCode] = useState('');
    const [description, setDescription] = useState('');
    const [errors, setErrors] = useState<any>({});
    const [processing, setProcessing] = useState(false);

    const handleSearch = () => {
        router.get('/vendor-categories', { search: searchTerm }, { preserveState: true, replace: true });
    };

    const handleClearFilters = () => {
        setSearchTerm('');
        router.get('/vendor-categories', {}, { preserveState: true, replace: true });
    };

    const handleOpenCreate = () => {
        setEditCategory(null);
        setName('');
        setCode('');
        setDescription('');
        setErrors({});
        setIsOpen(true);
    };

    const handleOpenEdit = (category: VendorCategory) => {
        setEditCategory(category);
        setName(category.name);
        setCode(category.code);
        setDescription(category.description ?? '');
        setErrors({});
        setIsOpen(true);
    };

    const handleOpenDelete = (category: VendorCategory) => {
        setActiveCategory(category);
        setIsDeleteOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);
        setErrors({});

        const url = editCategory 
            ? `/vendor-categories/${editCategory.id}` 
            : '/vendor-categories';

        const data = { name, code, description };

        if (editCategory) {
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
        if (!activeCategory) return;

        setProcessing(true);
        router.delete(`/vendor-categories/${activeCategory.id}`, {
            onSuccess: () => {
                setIsDeleteOpen(false);
                setActiveCategory(null);
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
            <Head title={locale === 'id' ? 'Kategori Vendor' : 'Vendor Categories'} />

            <div className="flex h-full flex-col gap-6">
                {/* Header Section */}
                <div className="flex flex-col justify-between gap-4 border-b border-stone-100 pb-5 sm:flex-row sm:items-center">
                    <Heading 
                        title={locale === 'id' ? 'Kategori Vendor' : 'Vendor Categories'} 
                        description={locale === 'id' ? 'Kelola master data klasifikasi vendor dan supplier.' : 'Manage vendor classifications and supplier categories.'}
                    />
                    <Button 
                        onClick={handleOpenCreate} 
                        className="w-full sm:w-auto bg-[#E06D53] hover:bg-[#c85b43] text-white gap-2 flex items-center justify-center font-bold text-xs rounded-xl shadow-xs cursor-pointer h-10 px-4"
                    >
                        <Plus className="size-4" /> {locale === 'id' ? 'Tambah Kategori' : 'Add Category'}
                    </Button>
                </div>

                {/* Filter and Search Bar */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between bg-white p-4 rounded-2xl border border-stone-200/60 shadow-xs">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-2.5 size-4 text-stone-400" />
                        <Input
                            placeholder={locale === 'id' ? 'Cari berdasarkan nama atau kode...' : 'Search by name or code...'}
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
                                    <th className="p-4 pl-6">Code</th>
                                    <th className="p-4">Name</th>
                                    <th className="p-4">Description</th>
                                    <th className="p-4 pr-6 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-100 text-xs text-stone-600">
                                {categories.data.length > 0 ? (
                                    categories.data.map((category) => (
                                        <tr key={category.id} className="hover:bg-stone-50/30 transition-colors">
                                            <td className="p-4 pl-6 font-mono font-bold text-stone-850 uppercase">
                                                {category.code}
                                            </td>
                                            <td className="p-4 font-bold text-stone-850">
                                                {category.name}
                                            </td>
                                            <td className="p-4 text-stone-500 max-w-xs truncate">
                                                {category.description || '-'}
                                            </td>
                                            <td className="p-4 pr-6 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button
                                                        onClick={() => handleOpenEdit(category)}
                                                        variant="ghost"
                                                        size="icon"
                                                        className="size-8 rounded-lg text-stone-400 hover:text-stone-800 hover:bg-stone-100 transition-colors cursor-pointer"
                                                    >
                                                        <Edit2 className="size-3.5" />
                                                    </Button>
                                                    <Button
                                                        onClick={() => handleOpenDelete(category)}
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
                                        <td colSpan={4} className="p-10 text-center">
                                            <div className="flex flex-col items-center justify-center gap-2">
                                                <FolderTree className="size-8 text-stone-300" />
                                                <p className="text-stone-400 font-bold text-xs">
                                                    {locale === 'id' ? 'Tidak ada kategori vendor ditemukan.' : 'No vendor categories found.'}
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {categories.last_page > 1 && (
                        <div className="flex items-center justify-between border-t border-stone-100 p-4 px-6 bg-stone-50/20 text-xs">
                            <span className="font-bold text-stone-400">
                                Page {categories.current_page} of {categories.last_page}
                            </span>
                            <div className="flex items-center gap-1">
                                {categories.links.map((link, idx) => {
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
                            {editCategory ? (locale === 'id' ? 'Ubah Kategori' : 'Edit Category') : (locale === 'id' ? 'Tambah Kategori' : 'Add Category')}
                        </DialogTitle>
                        <DialogDescription className="text-xs text-stone-400">
                            {locale === 'id' ? 'Masukkan detail kategori vendor di bawah ini.' : 'Configure vendor category details below.'}
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                        <div className="grid gap-1.5">
                            <Label htmlFor="code" className="text-xs font-bold text-stone-700">Code</Label>
                            <Input
                                id="code"
                                value={code}
                                onChange={(e) => setCode(e.target.value.toUpperCase())}
                                placeholder="e.g. SUP"
                                disabled={processing}
                                className="rounded-xl border-stone-200 text-xs font-mono font-bold uppercase"
                                required
                            />
                            {errors.code && <InputError message={errors.code} />}
                        </div>

                        <div className="grid gap-1.5">
                            <Label htmlFor="name" className="text-xs font-bold text-stone-700">Name</Label>
                            <Input
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g. Supplier"
                                disabled={processing}
                                className="rounded-xl border-stone-200 text-xs font-bold"
                                required
                            />
                            {errors.name && <InputError message={errors.name} />}
                        </div>

                        <div className="grid gap-1.5">
                            <Label htmlFor="description" className="text-xs font-bold text-stone-700">Description</Label>
                            <textarea
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="e.g. Supplier of goods and merchandise"
                                disabled={processing}
                                className="w-full rounded-xl border border-stone-200 bg-white p-2.5 text-xs focus:outline-hidden focus:ring-1 focus:ring-[#E06D53] focus:border-[#E06D53] transition-all min-h-[80px]"
                            />
                            {errors.description && <InputError message={errors.description} />}
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
                            {locale === 'id' ? 'Hapus Kategori' : 'Delete Category'}
                        </DialogTitle>
                        <DialogDescription className="text-xs text-stone-400">
                            {locale === 'id' ? 'Apakah Anda yakin ingin menghapus kategori ini?' : 'Are you sure you want to delete this category?'}
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleDelete} className="pt-4 space-y-4">
                        <p className="text-xs text-stone-500 font-medium">
                            {locale === 'id' 
                                ? `Tindakan ini akan menghapus kategori vendor "${activeCategory?.name}" secara permanen.` 
                                : `This action will permanently delete the vendor category "${activeCategory?.name}".`}
                        </p>

                        <DialogFooter className="pt-4 border-t border-stone-100 mt-4 gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setIsDeleteOpen(false);
                                    setActiveCategory(null);
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

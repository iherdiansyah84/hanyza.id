import { Head, usePage, router } from '@inertiajs/react';
import { useState } from 'react';
import { Plus, Edit2, Trash2, Search, Boxes } from 'lucide-react';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface Product {
    id: number;
    name_en: string;
    name_id: string;
}

interface SubProduct {
    id: number;
    product_id: number;
    name: string;
    sku: string;
    price: number | string;
    stock: number;
    product?: Product;
    created_at: string;
}

interface PaginatedSubProducts {
    data: SubProduct[];
    current_page: number;
    last_page: number;
    total: number;
    links: any[];
}

export default function SubProductsIndex({ 
    subProducts, 
    products, 
    filters 
}: { 
    subProducts: PaginatedSubProducts; 
    products: Product[]; 
    filters: { search?: string } 
}) {
    const { locale = 'en' } = usePage<any>().props;

    const [searchTerm, setSearchTerm] = useState(filters.search ?? '');
    const [isOpen, setIsOpen] = useState(false);
    const [editSubProduct, setEditSubProduct] = useState<SubProduct | null>(null);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [activeSubProduct, setActiveSubProduct] = useState<SubProduct | null>(null);

    // Form inputs state
    const [productId, setProductId] = useState('');
    const [name, setName] = useState('');
    const [sku, setSku] = useState('');
    const [price, setPrice] = useState('');
    const [stock, setStock] = useState('');
    const [errors, setErrors] = useState<any>({});
    const [processing, setProcessing] = useState(false);

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

    const handleSearch = () => {
        router.get('/sub-products', { search: searchTerm }, { preserveState: true, replace: true });
    };

    const handleClearFilters = () => {
        setSearchTerm('');
        router.get('/sub-products', {}, { preserveState: true, replace: true });
    };

    const handleOpenCreate = () => {
        setEditSubProduct(null);
        setProductId(products.length > 0 ? products[0].id.toString() : '');
        setName('');
        setSku('');
        setPrice('0');
        setStock('0');
        setErrors({});
        setIsOpen(true);
    };

    const handleOpenEdit = (subProd: SubProduct) => {
        setEditSubProduct(subProd);
        setProductId(subProd.product_id.toString());
        setName(subProd.name);
        setSku(subProd.sku);
        setPrice(subProd.price.toString());
        setStock(subProd.stock.toString());
        setErrors({});
        setIsOpen(true);
    };

    const handleOpenDelete = (subProd: SubProduct) => {
        setActiveSubProduct(subProd);
        setIsDeleteOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);
        setErrors({});

        const url = editSubProduct 
            ? `/sub-products/${editSubProduct.id}` 
            : '/sub-products';

        const data = {
            product_id: productId,
            name,
            sku,
            price,
            stock
        };

        if (editSubProduct) {
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
        if (!activeSubProduct) return;

        setProcessing(true);
        router.delete(`/sub-products/${activeSubProduct.id}`, {
            onSuccess: () => {
                setIsDeleteOpen(false);
                setActiveSubProduct(null);
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
            <Head title={locale === 'id' ? 'Sub Data Barang' : 'Sub Products'} />

            <div className="flex h-full flex-col gap-6">
                {/* Header Section */}
                <div className="flex flex-col justify-between gap-4 border-b border-stone-100 pb-5 sm:flex-row sm:items-center">
                    <Heading 
                        title={locale === 'id' ? 'Sub Data Barang' : 'Sub Products'} 
                        description={locale === 'id' ? 'Kelola data barang turunan, komponen, SKU sub-item, harga, dan stok.' : 'Manage child items, components, sub-SKUs, pricing, and stock levels.'}
                    />
                    <Button 
                        onClick={handleOpenCreate} 
                        className="w-full sm:w-auto bg-[#E06D53] hover:bg-[#c85b43] text-white gap-2 flex items-center justify-center font-bold text-xs rounded-xl shadow-xs cursor-pointer h-10 px-4"
                    >
                        <Plus className="size-4" /> {locale === 'id' ? 'Tambah Sub Barang' : 'Add Sub Product'}
                    </Button>
                </div>

                {/* Filter and Search Bar */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between bg-white p-4 rounded-2xl border border-stone-200/60 shadow-xs">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-2.5 size-4 text-stone-400" />
                        <Input
                            placeholder={locale === 'id' ? 'Cari berdasarkan nama, SKU, atau barang induk...' : 'Search by name, SKU, or parent product...'}
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
                                    <th className="p-4 pl-6">Parent Product</th>
                                    <th className="p-4">Sub Item Name</th>
                                    <th className="p-4">SKU</th>
                                    <th className="p-4">Price</th>
                                    <th className="p-4">Stock</th>
                                    <th className="p-4 pr-6 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-100 text-xs text-stone-600">
                                {subProducts.data.length > 0 ? (
                                    subProducts.data.map((subProd) => (
                                        <tr key={subProd.id} className="hover:bg-stone-50/30 transition-colors">
                                            <td className="p-4 pl-6 font-bold text-stone-850">
                                                {locale === 'id' ? subProd.product?.name_id : subProd.product?.name_en}
                                            </td>
                                            <td className="p-4 font-semibold text-stone-850">
                                                {subProd.name}
                                            </td>
                                            <td className="p-4 font-mono text-[10px] tracking-wider text-stone-500 uppercase">
                                                {subProd.sku}
                                            </td>
                                            <td className="p-4 text-stone-800 font-bold">
                                                {formatPrice(subProd.price)}
                                            </td>
                                            <td className="p-4">
                                                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                                    subProd.stock > 0 
                                                        ? 'bg-green-50 text-green-700 border border-green-100' 
                                                        : 'bg-red-50 text-red-700 border border-red-100'
                                                }`}>
                                                    {subProd.stock}
                                                </span>
                                            </td>
                                            <td className="p-4 pr-6 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button
                                                        onClick={() => handleOpenEdit(subProd)}
                                                        variant="ghost"
                                                        size="icon"
                                                        className="size-8 rounded-lg text-stone-400 hover:text-stone-800 hover:bg-stone-100 transition-colors cursor-pointer"
                                                    >
                                                        <Edit2 className="size-3.5" />
                                                    </Button>
                                                    <Button
                                                        onClick={() => handleOpenDelete(subProd)}
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
                                                <Boxes className="size-8 text-stone-300" />
                                                <p className="text-stone-400 font-bold text-xs">
                                                    {locale === 'id' ? 'Tidak ada sub data barang ditemukan.' : 'No sub products found.'}
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {subProducts.last_page > 1 && (
                        <div className="flex items-center justify-between border-t border-stone-100 p-4 px-6 bg-stone-50/20 text-xs">
                            <span className="font-bold text-stone-400">
                                Page {subProducts.current_page} of {subProducts.last_page}
                            </span>
                            <div className="flex items-center gap-1">
                                {subProducts.links.map((link, idx) => {
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
                            {editSubProduct ? (locale === 'id' ? 'Ubah Sub Barang' : 'Edit Sub Product') : (locale === 'id' ? 'Tambah Sub Barang' : 'Add Sub Product')}
                        </DialogTitle>
                        <DialogDescription className="text-xs text-stone-400">
                            {locale === 'id' ? 'Masukkan detail sub-barang di bawah ini.' : 'Configure sub-product details below.'}
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                        <div className="grid gap-1.5">
                            <Label htmlFor="product_id" className="text-xs font-bold text-stone-700">Barang Induk (Parent Product)</Label>
                            <select
                                id="product_id"
                                value={productId}
                                onChange={(e) => setProductId(e.target.value)}
                                disabled={processing}
                                className="w-full rounded-xl border border-stone-200 bg-white p-2.5 text-xs font-bold text-stone-800 shadow-xs focus:ring-1 focus:ring-[#E06D53] focus:border-[#E06D53]"
                                required
                            >
                                <option value="" disabled>Select parent product...</option>
                                {products.map((p) => (
                                    <option key={p.id} value={p.id}>
                                        {locale === 'id' ? p.name_id : p.name_en}
                                    </option>
                                ))}
                            </select>
                            {errors.product_id && <InputError message={errors.product_id} />}
                        </div>

                        <div className="grid gap-1.5">
                            <Label htmlFor="name" className="text-xs font-bold text-stone-700">Sub Item Name</Label>
                            <Input
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g. Size M, Red Color, etc."
                                disabled={processing}
                                className="rounded-xl border-stone-200 text-xs font-bold"
                                required
                            />
                            {errors.name && <InputError message={errors.name} />}
                        </div>

                        <div className="grid gap-1.5">
                            <Label htmlFor="sku" className="text-xs font-bold text-stone-700">Sub SKU</Label>
                            <Input
                                id="sku"
                                value={sku}
                                onChange={(e) => setSku(e.target.value.toUpperCase())}
                                placeholder="e.g. TSHIRT-M-RED"
                                disabled={processing}
                                className="rounded-xl border-stone-200 text-xs font-mono font-bold uppercase"
                                required
                            />
                            {errors.sku && <InputError message={errors.sku} />}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-1.5">
                                <Label htmlFor="price" className="text-xs font-bold text-stone-700">Price (IDR)</Label>
                                <Input
                                    id="price"
                                    type="number"
                                    min="0"
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                    placeholder="0"
                                    disabled={processing}
                                    className="rounded-xl border-stone-200 text-xs font-bold"
                                    required
                                />
                                {errors.price && <InputError message={errors.price} />}
                            </div>

                            <div className="grid gap-1.5">
                                <Label htmlFor="stock" className="text-xs font-bold text-stone-700">Stock</Label>
                                <Input
                                    id="stock"
                                    type="number"
                                    min="0"
                                    value={stock}
                                    onChange={(e) => setStock(e.target.value)}
                                    placeholder="0"
                                    disabled={processing}
                                    className="rounded-xl border-stone-200 text-xs font-bold"
                                    required
                                />
                                {errors.stock && <InputError message={errors.stock} />}
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
                            {locale === 'id' ? 'Hapus Sub Barang' : 'Delete Sub Product'}
                        </DialogTitle>
                        <DialogDescription className="text-xs text-stone-400">
                            {locale === 'id' ? 'Apakah Anda yakin ingin menghapus sub-barang ini?' : 'Are you sure you want to delete this sub product?'}
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleDelete} className="pt-4 space-y-4">
                        <p className="text-xs text-stone-500 font-medium">
                            {locale === 'id' 
                                ? `Tindakan ini akan menghapus sub data barang "${activeSubProduct?.name}" secara permanen.` 
                                : `This action will permanently delete the sub-product "${activeSubProduct?.name}".`}
                        </p>

                        <DialogFooter className="pt-4 border-t border-stone-100 mt-4 gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setIsDeleteOpen(false);
                                    setActiveSubProduct(null);
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

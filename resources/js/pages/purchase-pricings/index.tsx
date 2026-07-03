import { Head, usePage, router } from '@inertiajs/react';
import { useState } from 'react';
import { Plus, Edit2, Trash2, Search, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
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

interface Vendor {
    id: number;
    name: string;
}

interface PurchasePricing {
    id: number;
    product_id: number;
    vendor_id: number;
    purchase_price: number | string;
    selling_price: number | string;
    profit: number;
    notes: string | null;
    product?: Product;
    vendor?: Vendor;
    created_at: string;
}

interface PaginatedPricings {
    data: PurchasePricing[];
    current_page: number;
    last_page: number;
    total: number;
    links: any[];
}

export default function PurchasePricingsIndex({ 
    pricings, 
    products, 
    vendors, 
    filters 
}: { 
    pricings: PaginatedPricings; 
    products: Product[]; 
    vendors: Vendor[]; 
    filters: { search?: string } 
}) {
    const { locale = 'en' } = usePage<any>().props;

    const [searchTerm, setSearchTerm] = useState(filters.search ?? '');
    const [isOpen, setIsOpen] = useState(false);
    const [editPricing, setEditPricing] = useState<PurchasePricing | null>(null);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [activePricing, setActivePricing] = useState<PurchasePricing | null>(null);

    // Form inputs state
    const [productId, setProductId] = useState('');
    const [vendorId, setVendorId] = useState('');
    const [purchasePrice, setPurchasePrice] = useState('');
    const [sellingPrice, setSellingPrice] = useState('');
    const [notes, setNotes] = useState('');
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
        router.get('/purchase-pricings', { search: searchTerm }, { preserveState: true, replace: true });
    };

    const handleClearFilters = () => {
        setSearchTerm('');
        router.get('/purchase-pricings', {}, { preserveState: true, replace: true });
    };

    const handleOpenCreate = () => {
        setEditPricing(null);
        setProductId(products.length > 0 ? products[0].id.toString() : '');
        setVendorId(vendors.length > 0 ? vendors[0].id.toString() : '');
        setPurchasePrice('0');
        setSellingPrice('0');
        setNotes('');
        setErrors({});
        setIsOpen(true);
    };

    const handleOpenEdit = (p: PurchasePricing) => {
        setEditPricing(p);
        setProductId(p.product_id.toString());
        setVendorId(p.vendor_id.toString());
        setPurchasePrice(p.purchase_price.toString());
        setSellingPrice(p.selling_price.toString());
        setNotes(p.notes ?? '');
        setErrors({});
        setIsOpen(true);
    };

    const handleOpenDelete = (p: PurchasePricing) => {
        setActivePricing(p);
        setIsDeleteOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);
        setErrors({});

        const url = editPricing 
            ? `/purchase-pricings/${editPricing.id}` 
            : '/purchase-pricings';

        const data = {
            product_id: productId,
            vendor_id: vendorId,
            purchase_price: purchasePrice,
            selling_price: sellingPrice,
            notes
        };

        if (editPricing) {
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
        if (!activePricing) return;

        setProcessing(true);
        router.delete(`/purchase-pricings/${activePricing.id}`, {
            onSuccess: () => {
                setIsDeleteOpen(false);
                setActivePricing(null);
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
            <Head title={locale === 'id' ? 'Metode Pembelian / Manajemen Harga' : 'Purchase & Profit Margin Management'} />

            <div className="flex h-full flex-col gap-6">
                {/* Header Section */}
                <div className="flex flex-col justify-between gap-4 border-b border-stone-100 pb-5 sm:flex-row sm:items-center">
                    <Heading 
                        title={locale === 'id' ? 'Metode Pembelian / Manajemen Harga' : 'Purchase & Profit Margin Management'} 
                        description={locale === 'id' ? 'Lacak modal pembelian dari vendor, tentukan harga jual, dan kelola keuntungan otomatis.' : 'Track purchase costs from vendors, configure sales pricing, and monitor profit margins.'}
                    />
                    <Button 
                        onClick={handleOpenCreate} 
                        className="w-full sm:w-auto bg-[#E06D53] hover:bg-[#c85b43] text-white gap-2 flex items-center justify-center font-bold text-xs rounded-xl shadow-xs cursor-pointer h-10 px-4"
                    >
                        <Plus className="size-4" /> {locale === 'id' ? 'Tambah Catatan Harga' : 'Add Price Record'}
                    </Button>
                </div>

                {/* Filter and Search Bar */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between bg-white p-4 rounded-2xl border border-stone-200/60 shadow-xs">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-2.5 size-4 text-stone-400" />
                        <Input
                            placeholder={locale === 'id' ? 'Cari berdasarkan barang atau nama vendor...' : 'Search by product name or vendor...'}
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
                                    <th className="p-4 pl-6">Product</th>
                                    <th className="p-4">Vendor</th>
                                    <th className="p-4">Harga Beli (Modal)</th>
                                    <th className="p-4">Harga Jual</th>
                                    <th className="p-4">Estimasi Keuntungan</th>
                                    <th className="p-4">Indikator Profit</th>
                                    <th className="p-4 pr-6 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-100 text-xs text-stone-600">
                                {pricings.data.length > 0 ? (
                                    pricings.data.map((p) => {
                                        const profit = Number(p.selling_price) - Number(p.purchase_price);
                                        return (
                                            <tr key={p.id} className="hover:bg-stone-50/30 transition-colors">
                                                <td className="p-4 pl-6 font-bold text-stone-850">
                                                    {locale === 'id' ? p.product?.name_id : p.product?.name_en}
                                                </td>
                                                <td className="p-4 font-semibold text-stone-700">
                                                    {p.vendor?.name || '-'}
                                                </td>
                                                <td className="p-4 text-stone-500 font-mono font-bold">
                                                    {formatPrice(p.purchase_price)}
                                                </td>
                                                <td className="p-4 text-stone-850 font-mono font-bold">
                                                    {formatPrice(p.selling_price)}
                                                </td>
                                                <td className={`p-4 font-mono font-black ${
                                                    profit > 0 ? 'text-green-600' : profit < 0 ? 'text-red-600' : 'text-stone-500'
                                                }`}>
                                                    {profit > 0 ? `+${formatPrice(profit)}` : formatPrice(profit)}
                                                </td>
                                                <td className="p-4">
                                                    {profit > 0 ? (
                                                        <span className="flex items-center gap-1 bg-green-50 border border-green-200/50 text-green-700 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider w-fit shadow-3xs animate-fadeIn">
                                                            <TrendingUp className="size-3" />
                                                            {locale === 'id' ? 'Untung' : 'Profit'}
                                                        </span>
                                                    ) : profit < 0 ? (
                                                        <span className="flex items-center gap-1 bg-red-50 border border-red-200/50 text-red-700 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider w-fit shadow-3xs animate-fadeIn">
                                                            <TrendingDown className="size-3" />
                                                            {locale === 'id' ? 'Rugi' : 'Loss'}
                                                        </span>
                                                    ) : (
                                                        <span className="flex items-center gap-1 bg-stone-50 border border-stone-200/50 text-stone-600 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider w-fit shadow-3xs">
                                                            {locale === 'id' ? 'Impas' : 'Break Even'}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="p-4 pr-6 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Button
                                                            onClick={() => handleOpenEdit(p)}
                                                            variant="ghost"
                                                            size="icon"
                                                            className="size-8 rounded-lg text-stone-400 hover:text-stone-800 hover:bg-stone-100 transition-colors cursor-pointer"
                                                        >
                                                            <Edit2 className="size-3.5" />
                                                        </Button>
                                                        <Button
                                                            onClick={() => handleOpenDelete(p)}
                                                            variant="ghost"
                                                            size="icon"
                                                            className="size-8 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                                                        >
                                                            <Trash2 className="size-3.5" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={7} className="p-10 text-center">
                                            <div className="flex flex-col items-center justify-center gap-2">
                                                <DollarSign className="size-8 text-stone-300" />
                                                <p className="text-stone-400 font-bold text-xs">
                                                    {locale === 'id' ? 'Tidak ada catatan margin harga ditemukan.' : 'No price records found.'}
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {pricings.last_page > 1 && (
                        <div className="flex items-center justify-between border-t border-stone-100 p-4 px-6 bg-stone-50/20 text-xs">
                            <span className="font-bold text-stone-400">
                                Page {pricings.current_page} of {pricings.last_page}
                            </span>
                            <div className="flex items-center gap-1">
                                {pricings.links.map((link, idx) => {
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
                            {editPricing ? (locale === 'id' ? 'Ubah Catatan Harga' : 'Edit Price Record') : (locale === 'id' ? 'Tambah Catatan Harga' : 'Add Price Record')}
                        </DialogTitle>
                        <DialogDescription className="text-xs text-stone-400">
                            {locale === 'id' ? 'Masukkan detail modal pembelian dan harga jual barang.' : 'Configure purchase cost and sale pricing details below.'}
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                        <div className="grid gap-1.5">
                            <Label htmlFor="product_id" className="text-xs font-bold text-stone-700">Barang (Product)</Label>
                            <select
                                id="product_id"
                                value={productId}
                                onChange={(e) => setProductId(e.target.value)}
                                disabled={processing}
                                className="w-full rounded-xl border border-stone-200 bg-white p-2.5 text-xs font-bold text-stone-800 shadow-xs focus:ring-1 focus:ring-[#E06D53] focus:border-[#E06D53]"
                                required
                            >
                                <option value="" disabled>Select product...</option>
                                {products.map((p) => (
                                    <option key={p.id} value={p.id}>
                                        {locale === 'id' ? p.name_id : p.name_en}
                                    </option>
                                ))}
                            </select>
                            {errors.product_id && <InputError message={errors.product_id} />}
                        </div>

                        <div className="grid gap-1.5">
                            <Label htmlFor="vendor_id" className="text-xs font-bold text-stone-700">Vendor / Supplier</Label>
                            <select
                                id="vendor_id"
                                value={vendorId}
                                onChange={(e) => setVendorId(e.target.value)}
                                disabled={processing}
                                className="w-full rounded-xl border border-stone-200 bg-white p-2.5 text-xs font-bold text-stone-800 shadow-xs focus:ring-1 focus:ring-[#E06D53] focus:border-[#E06D53]"
                                required
                            >
                                <option value="" disabled>Select vendor...</option>
                                {vendors.map((v) => (
                                    <option key={v.id} value={v.id}>
                                        {v.name}
                                    </option>
                                ))}
                            </select>
                            {errors.vendor_id && <InputError message={errors.vendor_id} />}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-1.5">
                                <Label htmlFor="purchase_price" className="text-xs font-bold text-stone-700">Harga Beli (Modal)</Label>
                                <Input
                                    id="purchase_price"
                                    type="number"
                                    min="0"
                                    value={purchasePrice}
                                    onChange={(e) => setPurchasePrice(e.target.value)}
                                    placeholder="0"
                                    disabled={processing}
                                    className="rounded-xl border-stone-200 text-xs font-bold"
                                    required
                                />
                                {errors.purchase_price && <InputError message={errors.purchase_price} />}
                            </div>

                            <div className="grid gap-1.5">
                                <Label htmlFor="selling_price" className="text-xs font-bold text-stone-700">Harga Jual</Label>
                                <Input
                                    id="selling_price"
                                    type="number"
                                    min="0"
                                    value={sellingPrice}
                                    onChange={(e) => setSellingPrice(e.target.value)}
                                    placeholder="0"
                                    disabled={processing}
                                    className="rounded-xl border-stone-200 text-xs font-bold"
                                    required
                                />
                                {errors.selling_price && <InputError message={errors.selling_price} />}
                            </div>
                        </div>

                        <div className="grid gap-1.5">
                            <Label htmlFor="notes" className="text-xs font-bold text-stone-700">Notes (Optional)</Label>
                            <textarea
                                id="notes"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="e.g. Special bundle cost details or purchase volume pricing notes"
                                disabled={processing}
                                className="w-full rounded-xl border border-stone-200 bg-white p-2.5 text-xs focus:outline-hidden focus:ring-1 focus:ring-[#E06D53] focus:border-[#E06D53] transition-all min-h-[60px]"
                            />
                            {errors.notes && <InputError message={errors.notes} />}
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
                            {locale === 'id' ? 'Hapus Catatan' : 'Delete Record'}
                        </DialogTitle>
                        <DialogDescription className="text-xs text-stone-400">
                            {locale === 'id' ? 'Apakah Anda yakin ingin menghapus catatan harga ini?' : 'Are you sure you want to delete this price record?'}
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleDelete} className="pt-4 space-y-4">
                        <p className="text-xs text-stone-500 font-medium">
                            {locale === 'id' 
                                ? `Tindakan ini akan menghapus catatan harga barang secara permanen.` 
                                : `This action will permanently delete this price record.`}
                        </p>

                        <DialogFooter className="pt-4 border-t border-stone-100 mt-4 gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setIsDeleteOpen(false);
                                    setActivePricing(null);
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

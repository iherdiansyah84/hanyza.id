import { Head, Form, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, ShoppingBag, DollarSign, Layers, Tag, X, ListPlus, Palette, Ruler } from 'lucide-react';
import ProductController from '@/actions/App/Http/Controllers/ProductController';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import Heading from '@/components/heading';

interface Category {
    id: number;
    name: string;
    slug: string;
    parent_id: number | null;
    parent?: Category | null;
}

interface SpecItem {
    name: string;
    val: string;
}

interface Product {
    id: number;
    name_en: string;
    name_id: string;
    slug: string;
    sku: string | null;
    description_en: string | null;
    description_id: string | null;
    price: number;
    sale_price: number | null;
    stock: number;
    category_id: number | null;
    image: string | null;
    specs: {
        en: SpecItem[];
        id: SpecItem[];
    } | null;
    status: 'active' | 'draft' | 'archived';
    category?: Category | null;
    colors: { code: string; name_en: string; name_id: string; }[] | null;
    sizes: string[] | null;
}

interface PageProps {
    products: Product[];
    categories: Category[];
    [key: string]: any;
}

export default function ProductsIndex() {
    const { products, categories } = usePage<PageProps>().props;

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');

    // Modals visibility
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);

    // Selected product for actions
    const [activeProduct, setActiveProduct] = useState<Product | null>(null);

    // Dynamic specification rows state for forms
    const [specsRows, setSpecsRows] = useState<{ enName: string; enVal: string; idName: string; idVal: string }[]>([]);

    // Colors state for forms
    interface ColorRow {
        code: string;
        enName: string;
        idName: string;
    }
    const [colorsRows, setColorsRows] = useState<ColorRow[]>([]);

    // Sizes state for forms
    const [sizesList, setSizesList] = useState<string[]>([]);
    const [customSizeInput, setCustomSizeInput] = useState('');

    // Filter products based on search and category filter
    const filteredProducts = products.filter(product => {
        const matchesSearch = 
            product.name_en.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.name_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (product.sku && product.sku.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (product.description_en && product.description_en.toLowerCase().includes(searchQuery.toLowerCase()));
        
        const matchesCategory = 
            selectedCategoryId === 'all' ||
            (product.category_id !== null && product.category_id.toString() === selectedCategoryId);

        return matchesSearch && matchesCategory;
    });

    const handleAddSpecRow = () => {
        setSpecsRows(prev => [...prev, { enName: '', enVal: '', idName: '', idVal: '' }]);
    };

    const handleRemoveSpecRow = (index: number) => {
        setSpecsRows(prev => prev.filter((_, i) => i !== index));
    };

    const handleSpecChange = (index: number, field: 'enName' | 'enVal' | 'idName' | 'idVal', value: string) => {
        setSpecsRows(prev => {
            const updated = [...prev];
            updated[index][field] = value;
            // Auto-fill ID name if it matches EN name and is empty
            if (field === 'enName' && updated[index].idName === '') {
                updated[index].idName = value;
            }
            // Auto-fill ID value if it matches EN value and is empty
            if (field === 'enVal' && updated[index].idVal === '') {
                updated[index].idVal = value;
            }
            return updated;
        });
    };

    const handleAddColorRow = () => {
        setColorsRows(prev => [...prev, { code: '#465662', enName: '', idName: '' }]);
    };

    const handleRemoveColorRow = (index: number) => {
        setColorsRows(prev => prev.filter((_, i) => i !== index));
    };

    const handleColorChange = (index: number, field: keyof ColorRow, value: string) => {
        setColorsRows(prev => {
            const updated = [...prev];
            updated[index][field] = value;
            if (field === 'enName' && updated[index].idName === '') {
                updated[index].idName = value;
            }
            return updated;
        });
    };

    const handleToggleSize = (size: string) => {
        setSizesList(prev => 
            prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
        );
    };

    const handleAddCustomSize = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = customSizeInput.trim();
        if (trimmed && !sizesList.includes(trimmed)) {
            setSizesList(prev => [...prev, trimmed]);
            setCustomSizeInput('');
        }
    };

    const handleRemoveCustomSize = (size: string) => {
        setSizesList(prev => prev.filter(s => s !== size));
    };

    const handleOpenEdit = (product: Product) => {
        setActiveProduct(product);
        
        // Parse specifications for the edit form
        if (product.specs && product.specs.en) {
            const parsedSpecs = product.specs.en.map((item, idx) => {
                const idItem = product.specs?.id?.[idx] || { name: item.name, val: item.val };
                return {
                    enName: item.name,
                    enVal: item.val,
                    idName: idItem.name,
                    idVal: idItem.val
                };
            });
            setSpecsRows(parsedSpecs);
        } else {
            setSpecsRows([]);
        }

        // Parse colors
        if (product.colors) {
            setColorsRows(product.colors.map((c: any) => ({
                code: c.code || '#465662',
                enName: c.name_en || c.name || '',
                idName: c.name_id || c.name || ''
            })));
        } else {
            setColorsRows([]);
        }

        // Parse sizes
        if (product.sizes) {
            setSizesList(product.sizes);
        } else {
            setSizesList([]);
        }

        setIsEditOpen(true);
    };

    const handleOpenDelete = (product: Product) => {
        setActiveProduct(product);
        setIsDeleteOpen(true);
    };

    // Format currency (IDR)
    const formatPrice = (value: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value);
    };

    return (
        <>
            <Head title="Products" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header Section */}
                <div className="flex flex-col justify-between gap-4 border-b border-border pb-5 sm:flex-row sm:items-center">
                    <Heading 
                        title="Product Master Data" 
                        description="Manage your store catalog products, pricing, stock levels, and category mappings."
                    />
                    <Button 
                        onClick={() => {
                            setSpecsRows([]);
                            setColorsRows([]);
                            setSizesList([]);
                            setIsCreateOpen(true);
                        }} 
                        className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground gap-2 flex items-center justify-center"
                    >
                        <Plus className="size-4" /> Add Product
                    </Button>
                </div>

                {/* Filter and Search Bar */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-card p-4 rounded-xl border border-border">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                        <Input
                            placeholder="Search products by name, SKU, or description..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 w-full"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Label htmlFor="category-filter" className="text-sm text-muted-foreground shrink-0">Category:</Label>
                        <select
                            id="category-filter"
                            value={selectedCategoryId}
                            onChange={(e) => setSelectedCategoryId(e.target.value)}
                            className="h-9 w-[220px] rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
                        >
                            <option value="all">All Categories</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.parent ? `${cat.parent.name} › ` : ''}{cat.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Products Table Card */}
                <Card className="border border-border bg-card shadow-sm overflow-hidden">
                    <CardHeader className="p-4 border-b border-border bg-muted/20">
                        <CardTitle className="text-md flex items-center gap-2">
                            <ShoppingBag className="size-4 text-muted-foreground" /> Products Catalog ({filteredProducts.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 overflow-x-auto">
                        {filteredProducts.length > 0 ? (
                            <table className="w-full border-collapse text-left text-sm text-muted-foreground">
                                <thead className="bg-muted/40 text-xs font-semibold text-foreground border-b border-border">
                                    <tr>
                                        <th className="p-4">Product Info</th>
                                        <th className="p-4">SKU</th>
                                        <th className="p-4">Category</th>
                                        <th className="p-4">Price</th>
                                        <th className="p-4">Stock</th>
                                        <th className="p-4">Status</th>
                                        <th className="p-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {filteredProducts.map(product => (
                                        <tr key={product.id} className="hover:bg-muted/20 transition-colors">
                                            <td className="p-4 flex items-center gap-3">
                                                {product.image && (
                                                    <img 
                                                        src={product.image} 
                                                        alt={product.name_en} 
                                                        className="size-11 object-cover rounded-lg border border-border bg-muted"
                                                    />
                                                )}
                                                <div>
                                                    <div className="font-semibold text-foreground">{product.name_en}</div>
                                                    <div className="text-xs text-muted-foreground italic">{product.name_id}</div>
                                                </div>
                                            </td>
                                            <td className="p-4 font-mono text-xs">{product.sku || '-'}</td>
                                            <td className="p-4">
                                                {product.category ? (
                                                    <div className="flex flex-col">
                                                        <span className="font-medium text-foreground">{product.category.name}</span>
                                                        {product.category.parent && (
                                                            <span className="text-[10px] text-muted-foreground uppercase">{product.category.parent.name}</span>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-muted-foreground italic">Unassigned</span>
                                                )}
                                            </td>
                                            <td className="p-4 font-medium text-foreground">
                                                {product.sale_price ? (
                                                    <div className="flex flex-col">
                                                        <span className="text-red-500">{formatPrice(product.sale_price)}</span>
                                                        <span className="text-xs line-through opacity-60">{formatPrice(product.price)}</span>
                                                    </div>
                                                ) : (
                                                    formatPrice(product.price)
                                                )}
                                            </td>
                                            <td className="p-4">
                                                <span className={`font-semibold ${product.stock === 0 ? 'text-red-500' : product.stock < 10 ? 'text-amber-500' : 'text-foreground'}`}>
                                                    {product.stock} pcs
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <Badge 
                                                    variant={product.status === 'active' ? 'default' : product.status === 'draft' ? 'secondary' : 'destructive'}
                                                    className="capitalize"
                                                >
                                                    {product.status}
                                                </Badge>
                                            </td>
                                            <td className="p-4 text-right">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <Button 
                                                        variant="ghost" 
                                                        size="icon" 
                                                        onClick={() => handleOpenEdit(product)}
                                                        className="size-8 text-muted-foreground hover:text-foreground"
                                                    >
                                                        <Edit2 className="size-3.5" />
                                                    </Button>
                                                    <Button 
                                                        variant="ghost" 
                                                        size="icon" 
                                                        onClick={() => handleOpenDelete(product)}
                                                        className="size-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                                    >
                                                        <Trash2 className="size-3.5" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className="text-center py-12">
                                <ShoppingBag className="size-12 text-muted-foreground mx-auto mb-3 opacity-40" />
                                <h3 className="font-semibold text-base text-foreground">No Products Found</h3>
                                <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
                                    Try tweaking your search keywords or category filters, or click "Add Product" to populate new items.
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* CREATE PRODUCT MODAL */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Add New Product</DialogTitle>
                        <DialogDescription>Create a master catalog product. Group it under subcategories.</DialogDescription>
                    </DialogHeader>
                    <Form
                        {...ProductController.store.form()}
                        onSuccess={() => {
                            setIsCreateOpen(false);
                        }}
                    >
                        {({ processing, errors }) => {
                            return (
                                <div className="space-y-4 pt-2">
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="grid gap-1.5">
                                            <Label htmlFor="create-name-en">Name (English)</Label>
                                            <Input
                                                id="create-name-en"
                                                name="name_en"
                                                placeholder="e.g. Organic Cotton Sleepsuit"
                                                required
                                            />
                                            <InputError message={errors.name_en} />
                                        </div>
                                        <div className="grid gap-1.5">
                                            <Label htmlFor="create-name-id">Name (Indonesian)</Label>
                                            <Input
                                                id="create-name-id"
                                                name="name_id"
                                                placeholder="e.g. Baju Tidur Katun Organik"
                                                required
                                            />
                                            <InputError message={errors.name_id} />
                                        </div>
                                    </div>

                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="grid gap-1.5">
                                            <Label htmlFor="create-sku">SKU (Stock Keeping Unit)</Label>
                                            <Input
                                                id="create-sku"
                                                name="sku"
                                                placeholder="e.g. FSH-NB-SLP01"
                                            />
                                            <InputError message={errors.sku} />
                                        </div>
                                        <div className="grid gap-1.5">
                                            <Label htmlFor="create-category">Category</Label>
                                            <select
                                                id="create-category"
                                                name="category_id"
                                                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
                                            >
                                                <option value="">-- Unassigned (No Category) --</option>
                                                {categories.map(cat => (
                                                    <option key={cat.id} value={cat.id}>
                                                        {cat.parent?.parent ? `${cat.parent.parent.name} › ` : ''}{cat.parent ? `${cat.parent.name} › ` : ''}{cat.name}
                                                    </option>
                                                ))}
                                            </select>
                                            <InputError message={errors.category_id} />
                                        </div>
                                    </div>

                                    <div className="grid gap-4 sm:grid-cols-3">
                                        <div className="grid gap-1.5">
                                            <Label htmlFor="create-price">Price (IDR)</Label>
                                            <Input
                                                id="create-price"
                                                name="price"
                                                type="number"
                                                required
                                                placeholder="150000"
                                            />
                                            <InputError message={errors.price} />
                                        </div>
                                        <div className="grid gap-1.5">
                                            <Label htmlFor="create-sale-price">Sale Price (Optional)</Label>
                                            <Input
                                                id="create-sale-price"
                                                name="sale_price"
                                                type="number"
                                                placeholder="120000"
                                            />
                                            <InputError message={errors.sale_price} />
                                        </div>
                                        <div className="grid gap-1.5">
                                            <Label htmlFor="create-stock">Stock Quantity</Label>
                                            <Input
                                                id="create-stock"
                                                name="stock"
                                                type="number"
                                                required
                                                placeholder="50"
                                            />
                                            <InputError message={errors.stock} />
                                        </div>
                                    </div>

                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="grid gap-1.5">
                                            <Label htmlFor="create-image">Image path / URL</Label>
                                            <Input
                                                id="create-image"
                                                name="image"
                                                placeholder="e.g. /images/organic_cotton_sleepsuit.png"
                                            />
                                            <InputError message={errors.image} />
                                        </div>
                                        <div className="grid gap-1.5">
                                            <Label htmlFor="create-status">Status</Label>
                                            <select
                                                id="create-status"
                                                name="status"
                                                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
                                            >
                                                <option value="active">Active</option>
                                                <option value="draft">Draft</option>
                                                <option value="archived">Archived</option>
                                            </select>
                                            <InputError message={errors.status} />
                                        </div>
                                    </div>

                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="grid gap-1.5">
                                            <Label htmlFor="create-desc-en">Description (English)</Label>
                                            <textarea
                                                id="create-desc-en"
                                                name="description_en"
                                                rows={3}
                                                placeholder="Super soft and breathable..."
                                                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
                                            />
                                            <InputError message={errors.description_en} />
                                        </div>
                                        <div className="grid gap-1.5">
                                            <Label htmlFor="create-desc-id">Description (Indonesian)</Label>
                                            <textarea
                                                id="create-desc-id"
                                                name="description_id"
                                                rows={3}
                                                placeholder="Sangat lembut dan sejuk..."
                                                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
                                            />
                                            <InputError message={errors.description_id} />
                                        </div>
                                    </div>

                                    {/* Specifications dynamic fields */}
                                    <div className="border-t border-border pt-4">
                                        <div className="flex items-center justify-between mb-3">
                                            <Label className="text-sm font-semibold flex items-center gap-1.5">
                                                <ListPlus className="size-4" /> Technical Specifications
                                            </Label>
                                            <Button 
                                                type="button" 
                                                variant="outline" 
                                                size="sm" 
                                                onClick={handleAddSpecRow}
                                                className="h-8"
                                            >
                                                + Add Spec
                                            </Button>
                                        </div>

                                        {specsRows.length > 0 ? (
                                            <div className="space-y-3 bg-muted/30 p-3 rounded-lg border border-border">
                                                {specsRows.map((row, idx: number) => (
                                                    <div key={idx} className="grid gap-3 sm:grid-cols-5 items-end">
                                                        <div className="sm:col-span-2 space-y-1.5">
                                                            {idx === 0 && <span className="text-[10px] font-bold text-muted-foreground uppercase">English (Name / Value)</span>}
                                                            <div className="grid grid-cols-2 gap-2">
                                                                <Input 
                                                                    name="specs_en_names[]"
                                                                    placeholder="e.g. Material" 
                                                                    value={row.enName}
                                                                    onChange={(e) => handleSpecChange(idx, 'enName', e.target.value)}
                                                                />
                                                                <Input 
                                                                    name="specs_en_values[]"
                                                                    placeholder="e.g. 100% Linen" 
                                                                    value={row.enVal}
                                                                    onChange={(e) => handleSpecChange(idx, 'enVal', e.target.value)}
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="sm:col-span-2 space-y-1.5">
                                                            {idx === 0 && <span className="text-[10px] font-bold text-muted-foreground uppercase">Indonesian (Name / Value)</span>}
                                                            <div className="grid grid-cols-2 gap-2">
                                                                <Input 
                                                                    name="specs_id_names[]"
                                                                    placeholder="e.g. Bahan" 
                                                                    value={row.idName}
                                                                    onChange={(e) => handleSpecChange(idx, 'idName', e.target.value)}
                                                                />
                                                                <Input 
                                                                    name="specs_id_values[]"
                                                                    placeholder="e.g. 100% Linen" 
                                                                    value={row.idVal}
                                                                    onChange={(e) => handleSpecChange(idx, 'idVal', e.target.value)}
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="flex justify-end pb-0.5">
                                                            <Button 
                                                                type="button" 
                                                                variant="ghost" 
                                                                size="icon" 
                                                                className="text-destructive hover:bg-destructive/10 size-9"
                                                                onClick={() => handleRemoveSpecRow(idx)}
                                                            >
                                                                <X className="size-4" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-xs text-muted-foreground italic">No specifications added yet.</p>
                                        )}
                                    </div>

                                    {/* Colors dynamic fields */}
                                    <div className="border-t border-border pt-4">
                                        <div className="flex items-center justify-between mb-3">
                                            <Label className="text-sm font-semibold flex items-center gap-1.5">
                                                <Palette className="size-4" /> Product Colors
                                            </Label>
                                            <Button 
                                                type="button" 
                                                variant="outline" 
                                                size="sm" 
                                                onClick={handleAddColorRow}
                                                className="h-8"
                                            >
                                                + Add Color
                                            </Button>
                                        </div>

                                        {colorsRows.length > 0 ? (
                                            <div className="space-y-3 bg-muted/30 p-3 rounded-lg border border-border">
                                                {colorsRows.map((row, idx: number) => (
                                                    <div key={idx} className="grid gap-3 sm:grid-cols-12 items-end">
                                                        <div className="sm:col-span-2 space-y-1.5">
                                                            {idx === 0 && <span className="text-[10px] font-bold text-muted-foreground uppercase">Color</span>}
                                                            <div className="flex items-center gap-2">
                                                                <Input 
                                                                    type="color"
                                                                    name="color_codes[]"
                                                                    value={row.code}
                                                                    onChange={(e) => handleColorChange(idx, 'code', e.target.value)}
                                                                    className="h-9 w-12 p-0.5 cursor-pointer rounded-md border border-input"
                                                                />
                                                                <span className="text-xs font-mono select-all">{row.code}</span>
                                                            </div>
                                                        </div>
                                                        <div className="sm:col-span-5 space-y-1.5">
                                                            {idx === 0 && <span className="text-[10px] font-bold text-muted-foreground uppercase">Name (English)</span>}
                                                            <Input 
                                                                name="color_names_en[]"
                                                                placeholder="e.g. Earthy Brown" 
                                                                value={row.enName}
                                                                onChange={(e) => handleColorChange(idx, 'enName', e.target.value)}
                                                                required
                                                            />
                                                        </div>
                                                        <div className="sm:col-span-4 space-y-1.5">
                                                            {idx === 0 && <span className="text-[10px] font-bold text-muted-foreground uppercase">Name (Indonesian)</span>}
                                                            <Input 
                                                                name="color_names_id[]"
                                                                placeholder="e.g. Cokelat Tanah" 
                                                                value={row.idName}
                                                                onChange={(e) => handleColorChange(idx, 'idName', e.target.value)}
                                                                required
                                                            />
                                                        </div>
                                                        <div className="sm:col-span-1 flex justify-end pb-0.5">
                                                            <Button 
                                                                type="button" 
                                                                variant="ghost" 
                                                                size="icon" 
                                                                className="text-destructive hover:bg-destructive/10 size-9"
                                                                onClick={() => handleRemoveColorRow(idx)}
                                                            >
                                                                <X className="size-4" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-xs text-muted-foreground italic">No colors configured. Product will not display color selector.</p>
                                        )}
                                    </div>

                                    {/* Sizes checkboxes and custom fields */}
                                    <div className="border-t border-border pt-4">
                                        <div className="space-y-3">
                                            <Label className="text-sm font-semibold flex items-center gap-1.5">
                                                <Ruler className="size-4" /> Product Sizes
                                            </Label>
                                            
                                            <div className="flex flex-wrap gap-1.5 p-3 bg-muted/30 rounded-lg border border-border">
                                                {['Newborn', '3-6 Months', '6-12 Months', 'S', 'M', 'L', 'XL', 'XXL', 'Small', 'Medium', 'Large', 'Standard Set'].map((size) => {
                                                    const isSelected = sizesList.includes(size);
                                                    return (
                                                        <Button
                                                            key={size}
                                                            type="button"
                                                            variant={isSelected ? 'default' : 'outline'}
                                                            size="sm"
                                                            onClick={() => handleToggleSize(size)}
                                                            className="h-8 text-xs font-medium"
                                                        >
                                                            {size}
                                                        </Button>
                                                    );
                                                })}
                                            </div>

                                            <div className="flex items-center gap-2 mt-2">
                                                <Input 
                                                    placeholder="Custom size (e.g. XL, 100x150cm)" 
                                                    value={customSizeInput}
                                                    onChange={(e) => setCustomSizeInput(e.target.value)}
                                                    className="h-9 max-w-[240px]"
                                                />
                                                <Button 
                                                    type="button"
                                                    variant="secondary"
                                                    size="sm"
                                                    onClick={() => {
                                                        const trimmed = customSizeInput.trim();
                                                        if (trimmed && !sizesList.includes(trimmed)) {
                                                            setSizesList(prev => [...prev, trimmed]);
                                                            setCustomSizeInput('');
                                                        }
                                                    }}
                                                    className="h-9"
                                                >
                                                    + Add Size
                                                </Button>
                                            </div>

                                            {sizesList.length > 0 ? (
                                                <div className="flex flex-wrap gap-1.5 mt-2">
                                                    {sizesList.map((size) => (
                                                        <div key={size} className="flex items-center gap-1 bg-secondary text-secondary-foreground text-xs px-2.5 py-1 rounded-full border border-border">
                                                            <span>{size}</span>
                                                            <button 
                                                                type="button" 
                                                                onClick={() => handleRemoveCustomSize(size)}
                                                                className="text-muted-foreground hover:text-foreground ml-0.5"
                                                            >
                                                                &times;
                                                            </button>
                                                            <input type="hidden" name="sizes[]" value={size} />
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-xs text-muted-foreground italic mt-2">No sizes selected. Product will not display size selector.</p>
                                            )}
                                        </div>
                                    </div>

                                    <DialogFooter className="pt-4 border-t border-border mt-6">
                                        <Button 
                                            type="button" 
                                            variant="outline" 
                                            onClick={() => setIsCreateOpen(false)}
                                        >
                                            Cancel
                                        </Button>
                                        <Button type="submit" disabled={processing}>
                                            Create Product
                                        </Button>
                                    </DialogFooter>
                                </div>
                            );
                        }}
                    </Form>
                </DialogContent>
            </Dialog>

            {/* EDIT PRODUCT MODAL */}
            <Dialog open={isEditOpen} onOpenChange={(open) => {
                setIsEditOpen(open);
                if (!open) setActiveProduct(null);
            }}>
                <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Edit Product</DialogTitle>
                        <DialogDescription>Modify catalog details, stock, pricing, and specs.</DialogDescription>
                    </DialogHeader>
                    {activeProduct && (
                        <Form
                            {...ProductController.update.form(activeProduct)}
                            onSuccess={() => {
                                setIsEditOpen(false);
                                setActiveProduct(null);
                            }}
                        >
                            {({ processing, errors }) => {
                                return (
                                    <div className="space-y-4 pt-2">
                                        <div className="grid gap-4 sm:grid-cols-2">
                                            <div className="grid gap-1.5">
                                                <Label htmlFor="edit-name-en">Name (English)</Label>
                                                <Input
                                                    id="edit-name-en"
                                                    name="name_en"
                                                    required
                                                    defaultValue={activeProduct.name_en}
                                                />
                                                <InputError message={errors.name_en} />
                                            </div>
                                            <div className="grid gap-1.5">
                                                <Label htmlFor="edit-name-id">Name (Indonesian)</Label>
                                                <Input
                                                    id="edit-name-id"
                                                    name="name_id"
                                                    required
                                                    defaultValue={activeProduct.name_id}
                                                />
                                                <InputError message={errors.name_id} />
                                            </div>
                                        </div>

                                        <div className="grid gap-4 sm:grid-cols-2">
                                            <div className="grid gap-1.5">
                                                <Label htmlFor="edit-sku">SKU (Stock Keeping Unit)</Label>
                                                <Input
                                                    id="edit-sku"
                                                    name="sku"
                                                    defaultValue={activeProduct.sku || ''}
                                                />
                                                <InputError message={errors.sku} />
                                            </div>
                                            <div className="grid gap-1.5">
                                                <Label htmlFor="edit-category">Category</Label>
                                                <select
                                                    id="edit-category"
                                                    name="category_id"
                                                    defaultValue={activeProduct.category_id || ''}
                                                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
                                                >
                                                    <option value="">-- Unassigned (No Category) --</option>
                                                    {categories.map(cat => (
                                                        <option key={cat.id} value={cat.id}>
                                                            {cat.parent?.parent ? `${cat.parent.parent.name} › ` : ''}{cat.parent ? `${cat.parent.name} › ` : ''}{cat.name}
                                                        </option>
                                                    ))}
                                                </select>
                                                <InputError message={errors.category_id} />
                                            </div>
                                        </div>

                                        <div className="grid gap-4 sm:grid-cols-3">
                                            <div className="grid gap-1.5">
                                                <Label htmlFor="edit-price">Price (IDR)</Label>
                                                <Input
                                                    id="edit-price"
                                                    name="price"
                                                    type="number"
                                                    required
                                                    defaultValue={activeProduct.price}
                                                />
                                                <InputError message={errors.price} />
                                            </div>
                                            <div className="grid gap-1.5">
                                                <Label htmlFor="edit-sale-price">Sale Price (Optional)</Label>
                                                <Input
                                                    id="edit-sale-price"
                                                    name="sale_price"
                                                    type="number"
                                                    defaultValue={activeProduct.sale_price || ''}
                                                />
                                                <InputError message={errors.sale_price} />
                                            </div>
                                            <div className="grid gap-1.5">
                                                <Label htmlFor="edit-stock">Stock Quantity</Label>
                                                <Input
                                                    id="edit-stock"
                                                    name="stock"
                                                    type="number"
                                                    required
                                                    defaultValue={activeProduct.stock}
                                                />
                                                <InputError message={errors.stock} />
                                            </div>
                                        </div>

                                        <div className="grid gap-4 sm:grid-cols-2">
                                            <div className="grid gap-1.5">
                                                <Label htmlFor="edit-image">Image path / URL</Label>
                                                <Input
                                                    id="edit-image"
                                                    name="image"
                                                    defaultValue={activeProduct.image || ''}
                                                />
                                                <InputError message={errors.image} />
                                            </div>
                                            <div className="grid gap-1.5">
                                                <Label htmlFor="edit-status">Status</Label>
                                                <select
                                                    id="edit-status"
                                                    name="status"
                                                    defaultValue={activeProduct.status}
                                                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
                                                >
                                                    <option value="active">Active</option>
                                                    <option value="draft">Draft</option>
                                                    <option value="archived">Archived</option>
                                                </select>
                                                <InputError message={errors.status} />
                                            </div>
                                        </div>

                                        <div className="grid gap-4 sm:grid-cols-2">
                                            <div className="grid gap-1.5">
                                                <Label htmlFor="edit-desc-en">Description (English)</Label>
                                                <textarea
                                                    id="edit-desc-en"
                                                    name="description_en"
                                                    rows={3}
                                                    defaultValue={activeProduct.description_en || ''}
                                                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
                                                />
                                                <InputError message={errors.description_en} />
                                            </div>
                                            <div className="grid gap-1.5">
                                                <Label htmlFor="edit-desc-id">Description (Indonesian)</Label>
                                                <textarea
                                                    id="edit-desc-id"
                                                    name="description_id"
                                                    rows={3}
                                                    defaultValue={activeProduct.description_id || ''}
                                                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
                                                />
                                                <InputError message={errors.description_id} />
                                            </div>
                                        </div>

                                        {/* Specifications dynamic fields */}
                                        <div className="border-t border-border pt-4">
                                            <div className="flex items-center justify-between mb-3">
                                                <Label className="text-sm font-semibold flex items-center gap-1.5">
                                                    <ListPlus className="size-4" /> Technical Specifications
                                                </Label>
                                                <Button 
                                                    type="button" 
                                                    variant="outline" 
                                                    size="sm" 
                                                    onClick={handleAddSpecRow}
                                                    className="h-8"
                                                >
                                                    + Add Spec
                                                </Button>
                                            </div>

                                            {specsRows.length > 0 ? (
                                                <div className="space-y-3 bg-muted/30 p-3 rounded-lg border border-border">
                                                    {specsRows.map((row, idx: number) => (
                                                        <div key={idx} className="grid gap-3 sm:grid-cols-5 items-end">
                                                            <div className="sm:col-span-2 space-y-1.5">
                                                                {idx === 0 && <span className="text-[10px] font-bold text-muted-foreground uppercase">English (Name / Value)</span>}
                                                                <div className="grid grid-cols-2 gap-2">
                                                                    <Input 
                                                                        name="specs_en_names[]"
                                                                        placeholder="e.g. Material" 
                                                                        value={row.enName}
                                                                        onChange={(e) => handleSpecChange(idx, 'enName', e.target.value)}
                                                                    />
                                                                    <Input 
                                                                        name="specs_en_values[]"
                                                                        placeholder="e.g. 100% Linen" 
                                                                        value={row.enVal}
                                                                        onChange={(e) => handleSpecChange(idx, 'enVal', e.target.value)}
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div className="sm:col-span-2 space-y-1.5">
                                                                {idx === 0 && <span className="text-[10px] font-bold text-muted-foreground uppercase">Indonesian (Name / Value)</span>}
                                                                <div className="grid grid-cols-2 gap-2">
                                                                    <Input 
                                                                        name="specs_id_names[]"
                                                                        placeholder="e.g. Bahan" 
                                                                        value={row.idName}
                                                                        onChange={(e) => handleSpecChange(idx, 'idName', e.target.value)}
                                                                    />
                                                                    <Input 
                                                                        name="specs_id_values[]"
                                                                        placeholder="e.g. 100% Linen" 
                                                                        value={row.idVal}
                                                                        onChange={(e) => handleSpecChange(idx, 'idVal', e.target.value)}
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div className="flex justify-end pb-0.5">
                                                                    <Button 
                                                                        type="button" 
                                                                        variant="ghost" 
                                                                        size="icon" 
                                                                        className="text-destructive hover:bg-destructive/10 size-9"
                                                                        onClick={() => handleRemoveSpecRow(idx)}
                                                                    >
                                                                        <X className="size-4" />
                                                                    </Button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-xs text-muted-foreground italic">No specifications added yet.</p>
                                            )}
                                        </div>

                                        {/* Colors dynamic fields */}
                                        <div className="border-t border-border pt-4">
                                            <div className="flex items-center justify-between mb-3">
                                                <Label className="text-sm font-semibold flex items-center gap-1.5">
                                                    <Palette className="size-4" /> Product Colors
                                                </Label>
                                                <Button 
                                                    type="button" 
                                                    variant="outline" 
                                                    size="sm" 
                                                    onClick={handleAddColorRow}
                                                    className="h-8"
                                                >
                                                    + Add Color
                                                </Button>
                                            </div>

                                            {colorsRows.length > 0 ? (
                                                <div className="space-y-3 bg-muted/30 p-3 rounded-lg border border-border">
                                                    {colorsRows.map((row, idx: number) => (
                                                        <div key={idx} className="grid gap-3 sm:grid-cols-12 items-end">
                                                            <div className="sm:col-span-2 space-y-1.5">
                                                                {idx === 0 && <span className="text-[10px] font-bold text-muted-foreground uppercase">Color</span>}
                                                                <div className="flex items-center gap-2">
                                                                    <Input 
                                                                        type="color"
                                                                        name="color_codes[]"
                                                                        value={row.code}
                                                                        onChange={(e) => handleColorChange(idx, 'code', e.target.value)}
                                                                        className="h-9 w-12 p-0.5 cursor-pointer rounded-md border border-input"
                                                                    />
                                                                    <span className="text-xs font-mono select-all">{row.code}</span>
                                                                </div>
                                                            </div>
                                                            <div className="sm:col-span-5 space-y-1.5">
                                                                {idx === 0 && <span className="text-[10px] font-bold text-muted-foreground uppercase">Name (English)</span>}
                                                                <Input 
                                                                    name="color_names_en[]"
                                                                    placeholder="e.g. Earthy Brown" 
                                                                    value={row.enName}
                                                                    onChange={(e) => handleColorChange(idx, 'enName', e.target.value)}
                                                                    required
                                                                />
                                                            </div>
                                                            <div className="sm:col-span-4 space-y-1.5">
                                                                {idx === 0 && <span className="text-[10px] font-bold text-muted-foreground uppercase">Name (Indonesian)</span>}
                                                                <Input 
                                                                    name="color_names_id[]"
                                                                    placeholder="e.g. Cokelat Tanah" 
                                                                    value={row.idName}
                                                                    onChange={(e) => handleColorChange(idx, 'idName', e.target.value)}
                                                                    required
                                                                />
                                                            </div>
                                                            <div className="sm:col-span-1 flex justify-end pb-0.5">
                                                                <Button 
                                                                    type="button" 
                                                                    variant="ghost" 
                                                                    size="icon" 
                                                                    className="text-destructive hover:bg-destructive/10 size-9"
                                                                    onClick={() => handleRemoveColorRow(idx)}
                                                                >
                                                                    <X className="size-4" />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-xs text-muted-foreground italic">No colors configured. Product will not display color selector.</p>
                                            )}
                                        </div>

                                        {/* Sizes checkboxes and custom fields */}
                                        <div className="border-t border-border pt-4">
                                            <div className="space-y-3">
                                                <Label className="text-sm font-semibold flex items-center gap-1.5">
                                                    <Ruler className="size-4" /> Product Sizes
                                                </Label>
                                                
                                                <div className="flex flex-wrap gap-1.5 p-3 bg-muted/30 rounded-lg border border-border">
                                                    {['Newborn', '3-6 Months', '6-12 Months', 'S', 'M', 'L', 'XL', 'XXL', 'Small', 'Medium', 'Large', 'Standard Set'].map((size) => {
                                                        const isSelected = sizesList.includes(size);
                                                        return (
                                                            <Button
                                                                key={size}
                                                                type="button"
                                                                variant={isSelected ? 'default' : 'outline'}
                                                                size="sm"
                                                                onClick={() => handleToggleSize(size)}
                                                                className="h-8 text-xs font-medium"
                                                            >
                                                                {size}
                                                            </Button>
                                                        );
                                                    })}
                                                </div>

                                                <div className="flex items-center gap-2 mt-2">
                                                    <Input 
                                                        placeholder="Custom size (e.g. XL, 100x150cm)" 
                                                        value={customSizeInput}
                                                        onChange={(e) => setCustomSizeInput(e.target.value)}
                                                        className="h-9 max-w-[240px]"
                                                    />
                                                    <Button 
                                                        type="button"
                                                        variant="secondary"
                                                        size="sm"
                                                        onClick={() => {
                                                            const trimmed = customSizeInput.trim();
                                                            if (trimmed && !sizesList.includes(trimmed)) {
                                                                setSizesList(prev => [...prev, trimmed]);
                                                                setCustomSizeInput('');
                                                            }
                                                        }}
                                                        className="h-9"
                                                    >
                                                        + Add Size
                                                    </Button>
                                                </div>

                                                {sizesList.length > 0 ? (
                                                    <div className="flex flex-wrap gap-1.5 mt-2">
                                                        {sizesList.map((size) => (
                                                            <div key={size} className="flex items-center gap-1 bg-secondary text-secondary-foreground text-xs px-2.5 py-1 rounded-full border border-border">
                                                                <span>{size}</span>
                                                                <button 
                                                                    type="button" 
                                                                    onClick={() => handleRemoveCustomSize(size)}
                                                                    className="text-muted-foreground hover:text-foreground ml-0.5"
                                                                >
                                                                    &times;
                                                                </button>
                                                                <input type="hidden" name="sizes[]" value={size} />
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <p className="text-xs text-muted-foreground italic mt-2">No sizes selected. Product will not display size selector.</p>
                                                )}
                                            </div>
                                        </div>

                                        <DialogFooter className="pt-4 border-t border-border mt-6">
                                            <Button 
                                                type="button" 
                                                variant="outline" 
                                                onClick={() => {
                                                    setIsEditOpen(false);
                                                    setActiveProduct(null);
                                                }}
                                            >
                                                Cancel
                                            </Button>
                                            <Button type="submit" disabled={processing}>
                                                Save Changes
                                            </Button>
                                        </DialogFooter>
                                    </div>
                                );
                            }}
                        </Form>
                    )}
                </DialogContent>
            </Dialog>

            {/* DELETE CONFIRMATION MODAL */}
            <Dialog open={isDeleteOpen} onOpenChange={(open) => {
                setIsDeleteOpen(open);
                if (!open) setActiveProduct(null);
            }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="text-destructive flex items-center gap-2">
                            Delete Product
                        </DialogTitle>
                        <DialogDescription className="pt-2">
                            Are you sure you want to permanently delete <span className="font-bold">"{activeProduct?.name_en}"</span> from your catalog? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    {activeProduct && (
                        <Form
                            {...ProductController.destroy.form(activeProduct)}
                            onSuccess={() => {
                                setIsDeleteOpen(false);
                                setActiveProduct(null);
                            }}
                        >
                            {({ processing }) => (
                                <DialogFooter className="pt-4">
                                    <Button 
                                        type="button" 
                                        variant="outline" 
                                        onClick={() => {
                                            setIsDeleteOpen(false);
                                            setActiveProduct(null);
                                        }}
                                    >
                                        Cancel
                                    </Button>
                                    <Button 
                                        type="submit" 
                                        variant="destructive"
                                        disabled={processing}
                                    >
                                        Delete
                                    </Button>
                                </DialogFooter>
                            )}
                        </Form>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}

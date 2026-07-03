import { Head, Form, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { Plus, Search, Edit2, Trash2, FolderPlus, Tag, Layers, Database, CornerDownRight } from 'lucide-react';
import CategoryController from '@/actions/App/Http/Controllers/CategoryController';
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
    description: string | null;
    parent?: Category | null;
}

interface PageProps {
    categories: Category[];
    parentCategories: Category[];
    [key: string]: any;
}

export default function CategoriesIndex() {
    const { categories, parentCategories } = usePage<PageProps>().props;

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedParentId, setSelectedParentId] = useState<string>('all');

    // Modals visibility
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);

    // Selected category for actions
    const [activeCategory, setActiveCategory] = useState<Category | null>(null);

    // Filter categories based on search and parent filter
    const filteredCategories = categories.filter(category => {
        const matchesSearch = 
            category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (category.description && category.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
            category.slug.toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesParent = 
            selectedParentId === 'all' ||
            (selectedParentId === 'none' && category.parent_id === null) ||
            (category.parent_id !== null && category.parent_id.toString() === selectedParentId);

        return matchesSearch && matchesParent;
    });

    // Group categories by parent for hierarchical layout
    const parentGroups = parentCategories.map(parent => {
        const children = categories.filter(c => c.parent_id === parent.id);
        return {
            parent,
            children
        };
    });

    // Categories with no parents and no children (isolated top-level categories)
    const independentParents = parentCategories.filter(parent => {
        return !categories.some(c => c.parent_id === parent.id);
    });

    const handleOpenEdit = (category: Category) => {
        setActiveCategory(category);
        setIsEditOpen(true);
    };

    const handleOpenDelete = (category: Category) => {
        setActiveCategory(category);
        setIsDeleteOpen(true);
    };

    return (
        <>
            <Head title="Categories" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header Section */}
                <div className="flex flex-col justify-between gap-4 border-b border-border pb-5 sm:flex-row sm:items-center">
                    <Heading 
                        title="Category Master Data" 
                        description="Manage your dynamic categories and subcategories structure."
                    />
                    <Button 
                        onClick={() => setIsCreateOpen(true)} 
                        className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground gap-2 flex items-center justify-center"
                    >
                        <Plus className="size-4" /> Add Category
                    </Button>
                </div>

                {/* Statistics Cards */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card className="border border-border bg-card shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-sm font-medium">Total Categories</CardTitle>
                            <Database className="size-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{categories.length}</div>
                            <p className="text-xs text-muted-foreground">All active items</p>
                        </CardContent>
                    </Card>
                    <Card className="border border-border bg-card shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-sm font-medium">Parent Categories</CardTitle>
                            <Layers className="size-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{parentCategories.length}</div>
                            <p className="text-xs text-muted-foreground">Top-level groupings</p>
                        </CardContent>
                    </Card>
                    <Card className="border border-border bg-card shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-sm font-medium">Subcategories</CardTitle>
                            <Tag className="size-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {categories.filter(c => c.parent_id !== null).length}
                            </div>
                            <p className="text-xs text-muted-foreground">Nested categories</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Filter and Search Bar */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-card p-4 rounded-xl border border-border">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                        <Input
                            placeholder="Search categories..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 w-full"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Label htmlFor="parent-filter" className="text-sm text-muted-foreground shrink-0">Filter by Parent:</Label>
                        <select
                            id="parent-filter"
                            value={selectedParentId}
                            onChange={(e) => setSelectedParentId(e.target.value)}
                            className="h-9 w-[180px] rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
                        >
                            <option value="all">All Parents</option>
                            <option value="none">No Parent (Top-level)</option>
                            {parentCategories.map(parent => (
                                <option key={parent.id} value={parent.id}>{parent.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Main Views (Tabbed/Split design) */}
                <div className="space-y-6">
                    {/* Hierarchical View: Display Parent Groupings (e.g. Fashion, Home Living) */}
                    <div>
                        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <Layers className="size-4" /> Category Structure
                        </h2>
                        
                        <div className="grid gap-6 md:grid-cols-2">
                            {parentGroups.map(({ parent, children }) => {
                                // Filter children based on search query
                                const matchedChildren = children.filter(child => {
                                    const subSubs = categories.filter(c => c.parent_id === child.id);
                                    const childMatches = child.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                        (child.description && child.description.toLowerCase().includes(searchQuery.toLowerCase()));
                                    const subSubMatches = subSubs.some(subSub => 
                                        subSub.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                        (subSub.description && subSub.description.toLowerCase().includes(searchQuery.toLowerCase()))
                                    );
                                    return childMatches || subSubMatches;
                                });

                                // If filtering by search, skip parent card if it has no match and none of its children match
                                const parentMatches = parent.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                    (parent.description && parent.description.toLowerCase().includes(searchQuery.toLowerCase()));
                                
                                if (searchQuery && !parentMatches && matchedChildren.length === 0) {
                                    return null;
                                }

                                return (
                                    <Card key={parent.id} className="border border-border bg-card shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col justify-between">
                                        <div>
                                            <CardHeader className="bg-muted/50 border-b border-border flex flex-row items-start justify-between p-4 space-y-0">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        <CardTitle className="text-lg font-bold">{parent.name}</CardTitle>
                                                        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">Parent</Badge>
                                                    </div>
                                                    <CardDescription className="line-clamp-2">{parent.description || 'No description provided.'}</CardDescription>
                                                    <div className="text-xs text-muted-foreground mt-1">Slug: <code className="bg-muted px-1.5 py-0.5 rounded text-[11px]">{parent.slug}</code></div>
                                                </div>
                                                <div className="flex items-center gap-1.5 ml-2">
                                                    <Button 
                                                        variant="ghost" 
                                                        size="icon" 
                                                        onClick={() => handleOpenEdit(parent)}
                                                        className="size-8 text-muted-foreground hover:text-foreground"
                                                    >
                                                        <Edit2 className="size-3.5" />
                                                    </Button>
                                                    <Button 
                                                        variant="ghost" 
                                                        size="icon" 
                                                        onClick={() => handleOpenDelete(parent)}
                                                        className="size-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                                    >
                                                        <Trash2 className="size-3.5" />
                                                    </Button>
                                                </div>
                                            </CardHeader>
                                            
                                            <CardContent className="p-4 space-y-3">
                                                <div className="text-xs font-semibold text-muted-foreground tracking-wider uppercase">Subcategories</div>
                                                {matchedChildren.length > 0 ? (
                                                    <div className="space-y-3">
                                                        {matchedChildren.map(child => {
                                                            const subSubs = categories.filter(c => c.parent_id === child.id);
                                                            const matchedSubSubs = subSubs.filter(subSub => 
                                                                !searchQuery || 
                                                                subSub.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                                                (subSub.description && subSub.description.toLowerCase().includes(searchQuery.toLowerCase()))
                                                            );
                                                            return (
                                                                <div key={child.id} className="space-y-2">
                                                                    <div 
                                                                        className="flex items-center justify-between p-2.5 rounded-lg border border-border bg-background hover:bg-muted/30 transition-colors"
                                                                    >
                                                                        <div className="flex flex-col gap-0.5">
                                                                            <div className="font-semibold text-sm flex items-center gap-2">
                                                                                {child.name}
                                                                                <code className="text-[10px] text-muted-foreground font-mono bg-muted/60 px-1 py-0.2 rounded">{child.slug}</code>
                                                                            </div>
                                                                            {child.description && (
                                                                                <span className="text-xs text-muted-foreground line-clamp-1">{child.description}</span>
                                                                            )}
                                                                        </div>
                                                                        <div className="flex items-center gap-1">
                                                                            <Button 
                                                                                variant="ghost" 
                                                                                size="icon" 
                                                                                onClick={() => handleOpenEdit(child)}
                                                                                className="size-7 text-muted-foreground hover:text-foreground"
                                                                            >
                                                                                <Edit2 className="size-3" />
                                                                            </Button>
                                                                            <Button 
                                                                                variant="ghost" 
                                                                                size="icon" 
                                                                                onClick={() => handleOpenDelete(child)}
                                                                                className="size-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                                                                            >
                                                                                <Trash2 className="size-3" />
                                                                            </Button>
                                                                        </div>
                                                                    </div>

                                                                    {matchedSubSubs.length > 0 && (
                                                                        <div className="pl-6 space-y-1.5 border-l-2 border-muted ml-4">
                                                                            {matchedSubSubs.map(subSub => (
                                                                                <div 
                                                                                    key={subSub.id}
                                                                                    className="flex items-center justify-between p-2 rounded-md border border-border/60 bg-stone-50/45 hover:bg-stone-55 transition-colors"
                                                                                >
                                                                                    <div className="flex items-center gap-2">
                                                                                        <CornerDownRight className="size-3.5 text-muted-foreground shrink-0" />
                                                                                        <div className="flex flex-col">
                                                                                            <div className="font-medium text-xs flex items-center gap-1.5 text-stone-700">
                                                                                                {subSub.name}
                                                                                                <code className="text-[9px] text-muted-foreground font-mono bg-muted/50 px-1 rounded">{subSub.slug}</code>
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                    <div className="flex items-center gap-1">
                                                                                        <Button 
                                                                                            variant="ghost" 
                                                                                            size="icon" 
                                                                                            onClick={() => handleOpenEdit(subSub)}
                                                                                            className="size-6 text-muted-foreground hover:text-foreground animate-fadeIn"
                                                                                        >
                                                                                            <Edit2 className="size-2.5" />
                                                                                        </Button>
                                                                                        <Button 
                                                                                            variant="ghost" 
                                                                                            size="icon" 
                                                                                            onClick={() => handleOpenDelete(subSub)}
                                                                                            className="size-6 text-destructive hover:text-destructive hover:bg-destructive/10 animate-fadeIn"
                                                                                        >
                                                                                            <Trash2 className="size-2.5" />
                                                                                        </Button>
                                                                                    </div>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                ) : (
                                                    <div className="text-center py-6 text-xs text-muted-foreground border border-dashed border-border rounded-lg">
                                                        No subcategories matching search criteria.
                                                    </div>
                                                )}
                                            </CardContent>
                                        </div>
                                    </Card>
                                );
                            })}

                            {independentParents.length > 0 && (
                                <Card className="border border-border bg-card shadow-sm overflow-hidden flex flex-col justify-between">
                                    <div>
                                        <CardHeader className="bg-muted/30 border-b border-border p-4">
                                            <CardTitle className="text-md font-bold">Uncategorized / Independent Parents</CardTitle>
                                            <CardDescription>Top-level categories with no sub-items</CardDescription>
                                        </CardHeader>
                                        <CardContent className="p-4 space-y-2">
                                            {independentParents.map(parent => (
                                                <div 
                                                    key={parent.id}
                                                    className="flex items-center justify-between p-2.5 rounded-lg border border-border bg-background hover:bg-muted/30 transition-colors"
                                                >
                                                    <div className="flex flex-col gap-0.5">
                                                        <div className="font-semibold text-sm flex items-center gap-2">
                                                            {parent.name}
                                                            <Badge variant="secondary" className="text-[10px] px-1 py-0 bg-muted">Independent</Badge>
                                                        </div>
                                                        {parent.description && (
                                                            <span className="text-xs text-muted-foreground">{parent.description}</span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Button 
                                                            variant="ghost" 
                                                            size="icon" 
                                                            onClick={() => handleOpenEdit(parent)}
                                                            className="size-7"
                                                        >
                                                            <Edit2 className="size-3" />
                                                        </Button>
                                                        <Button 
                                                            variant="ghost" 
                                                            size="icon" 
                                                            onClick={() => handleOpenDelete(parent)}
                                                            className="size-7 text-destructive"
                                                        >
                                                            <Trash2 className="size-3" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                        </CardContent>
                                    </div>
                                </Card>
                            )}
                        </div>
                    </div>
                </div>

                {/* Empty State for Search */}
                {filteredCategories.length === 0 && (
                    <div className="text-center py-12 bg-card border border-dashed border-border rounded-xl">
                        <FolderPlus className="size-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                        <h3 className="font-semibold text-lg">No Categories Found</h3>
                        <p className="text-muted-foreground text-sm max-w-sm mx-auto mt-1">
                            We couldn't find any categories matching "{searchQuery}". Try a different keyword or add a new category.
                        </p>
                    </div>
                )}
            </div>

            {/* CREATE CATEGORY MODAL */}
            <Dialog open={isCreateOpen} onOpenChange={(open) => {
                setIsCreateOpen(open);
            }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add New Category</DialogTitle>
                        <DialogDescription>Create a new parent or subcategory. Slugs are generated automatically.</DialogDescription>
                    </DialogHeader>
                    <Form
                        {...CategoryController.store.form()}
                        onSuccess={() => {
                            setIsCreateOpen(false);
                        }}
                    >
                        {({ processing, errors }) => (
                            <div className="space-y-4">
                                <div className="grid gap-1.5">
                                    <Label htmlFor="create-name">Name</Label>
                                    <Input
                                        id="create-name"
                                        name="name"
                                        placeholder="e.g. Newborn, Kids Wear, Electronics"
                                        required
                                    />
                                    <InputError message={errors.name} />
                                </div>

                                <div className="grid gap-1.5">
                                    <Label htmlFor="create-parent">Parent Category (Optional)</Label>
                                    <select
                                        id="create-parent"
                                        name="parent_id"
                                        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
                                    >
                                        <option value="">-- No Parent (Top-level Category) --</option>
                                        {parentCategories.map(parent => {
                                            const label = parent.parent 
                                                ? `${parent.parent.name} > ${parent.name}` 
                                                : parent.name;
                                            return (
                                                <option key={parent.id} value={parent.id}>{label}</option>
                                            );
                                        })}
                                    </select>
                                    <InputError message={errors.parent_id} />
                                </div>

                                <div className="grid gap-1.5">
                                    <Label htmlFor="create-description">Description (Optional)</Label>
                                    <textarea
                                        id="create-description"
                                        name="description"
                                        placeholder="Describe this category..."
                                        rows={3}
                                        className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
                                    />
                                    <InputError message={errors.description} />
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
                                        Create Category
                                    </Button>
                                </DialogFooter>
                            </div>
                        )}
                    </Form>
                </DialogContent>
            </Dialog>

            {/* EDIT CATEGORY MODAL */}
            <Dialog open={isEditOpen} onOpenChange={(open) => {
                setIsEditOpen(open);
                if (!open) setActiveCategory(null);
            }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Category</DialogTitle>
                        <DialogDescription>Modify category name, parent, or description details.</DialogDescription>
                    </DialogHeader>
                    {activeCategory && (
                        <Form
                            {...CategoryController.update.form(activeCategory)}
                            onSuccess={() => {
                                setIsEditOpen(false);
                                setActiveCategory(null);
                            }}
                        >
                            {({ processing, errors }) => (
                                <div className="space-y-4">
                                    <div className="grid gap-1.5">
                                        <Label htmlFor="edit-name">Name</Label>
                                        <Input
                                            id="edit-name"
                                            name="name"
                                            required
                                            defaultValue={activeCategory.name}
                                        />
                                        <InputError message={errors.name} />
                                    </div>

                                    <div className="grid gap-1.5">
                                        <Label htmlFor="edit-parent">Parent Category (Optional)</Label>
                                        <select
                                            id="edit-parent"
                                            name="parent_id"
                                            defaultValue={activeCategory.parent_id || ''}
                                            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
                                        >
                                            <option value="">-- No Parent (Top-level Category) --</option>
                                            {/* Do not allow selecting current category as its own parent */}
                                            {parentCategories
                                                .filter(parent => parent.id !== activeCategory.id)
                                                .map(parent => {
                                                    const label = parent.parent 
                                                        ? `${parent.parent.name} > ${parent.name}` 
                                                        : parent.name;
                                                    return (
                                                        <option key={parent.id} value={parent.id}>{label}</option>
                                                    );
                                                })
                                            }
                                        </select>
                                        <InputError message={errors.parent_id} />
                                    </div>

                                    <div className="grid gap-1.5">
                                        <Label htmlFor="edit-description">Description (Optional)</Label>
                                        <textarea
                                            id="edit-description"
                                            name="description"
                                            rows={3}
                                            defaultValue={activeCategory.description || ''}
                                            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
                                        />
                                        <InputError message={errors.description} />
                                    </div>

                                    <DialogFooter className="pt-4 border-t border-border mt-6">
                                        <Button 
                                            type="button" 
                                            variant="outline" 
                                            onClick={() => {
                                                setIsEditOpen(false);
                                                setActiveCategory(null);
                                            }}
                                        >
                                            Cancel
                                        </Button>
                                        <Button type="submit" disabled={processing}>
                                            Save Changes
                                        </Button>
                                    </DialogFooter>
                                </div>
                            )}
                        </Form>
                    )}
                </DialogContent>
            </Dialog>

            {/* DELETE CONFIRMATION MODAL */}
            <Dialog open={isDeleteOpen} onOpenChange={(open) => {
                setIsDeleteOpen(open);
                if (!open) setActiveCategory(null);
            }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="text-destructive flex items-center gap-2">
                            Delete Category
                        </DialogTitle>
                        <DialogDescription className="pt-2">
                            Are you sure you want to delete the category <span className="font-bold">"{activeCategory?.name}"</span>?
                            {activeCategory?.parent_id === null && (
                                <span className="block mt-2 text-destructive font-semibold">
                                    Warning: Deleting this parent category will ALSO permanently delete all its subcategories (cascade delete).
                                </span>
                            )}
                        </DialogDescription>
                    </DialogHeader>
                    {activeCategory && (
                        <Form
                            {...CategoryController.destroy.form(activeCategory)}
                            onSuccess={() => {
                                setIsDeleteOpen(false);
                                setActiveCategory(null);
                            }}
                        >
                            {({ processing }) => (
                                <DialogFooter className="pt-4">
                                    <Button 
                                        type="button" 
                                        variant="outline" 
                                        onClick={() => {
                                            setIsDeleteOpen(false);
                                            setActiveCategory(null);
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

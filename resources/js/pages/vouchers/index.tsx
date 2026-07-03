import { Form, Head } from '@inertiajs/react';
import { useState } from 'react';
import { Plus, Edit2, Trash2, Tag, Percent, Receipt } from 'lucide-react';
import VoucherController from '@/actions/App/Http/Controllers/VoucherController';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { index as vouchersIndex } from '@/routes/vouchers';

interface Voucher {
    id: number;
    code: string;
    discount_amount: number;
    min_spend: number;
}

interface Props {
    vouchers: Voucher[];
}

export default function Vouchers({ vouchers }: Props) {
    const [isOpen, setIsOpen] = useState(false);
    const [editVoucher, setEditVoucher] = useState<Voucher | null>(null);

    const handleOpenCreate = () => {
        setEditVoucher(null);
        setIsOpen(true);
    };

    const handleOpenEdit = (voucher: Voucher) => {
        setEditVoucher(voucher);
        setIsOpen(true);
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
            <Head title="Vouchers Management" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header Section */}
                <div className="flex flex-col justify-between gap-4 border-b border-border pb-5 sm:flex-row sm:items-center">
                    <Heading 
                        title="Vouchers Management" 
                        description="Create discount codes for your buyers to use on checkout."
                    />
                    <Button 
                        onClick={handleOpenCreate} 
                        className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground gap-2 flex items-center justify-center"
                    >
                        <Plus className="size-4" /> Create Voucher
                    </Button>
                </div>

                {/* Vouchers List */}
                {vouchers.length > 0 ? (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {vouchers.map((voucher) => (
                            <div 
                                key={voucher.id} 
                                className="relative overflow-hidden rounded-xl border border-border bg-card p-5 shadow-xs transition-all hover:shadow-md hover:border-primary/45 group"
                            >
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="inline-flex items-center gap-1.5 rounded-lg bg-primary/10 border border-primary/20 px-3 py-1 text-sm font-bold text-primary tracking-wider font-mono">
                                            <Tag className="size-3.5" /> {voucher.code}
                                        </span>
                                        <div className="flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="size-8"
                                                onClick={() => handleOpenEdit(voucher)}
                                            >
                                                <Edit2 className="size-3.5" />
                                            </Button>
                                            <Form
                                                {...VoucherController.destroy.form({ voucher: voucher.id })}
                                                options={{ preserveScroll: true }}
                                            >
                                                {({ processing }) => (
                                                    <Button
                                                        type="submit"
                                                        variant="ghost"
                                                        size="icon"
                                                        className="size-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                                        disabled={processing}
                                                    >
                                                        <Trash2 className="size-3.5" />
                                                    </Button>
                                                )}
                                            </Form>
                                        </div>
                                    </div>

                                    <div className="space-y-1.5 border-t border-border/60 pt-3">
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="text-muted-foreground flex items-center gap-1"><Percent className="size-3" /> Discount:</span>
                                            <span className="font-bold text-sm text-foreground">{formatPrice(voucher.discount_amount)}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="text-muted-foreground flex items-center gap-1"><Receipt className="size-3" /> Min. Spend:</span>
                                            <span className="font-semibold text-muted-foreground">{formatPrice(voucher.min_spend)}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="absolute right-0 bottom-0 -mb-6 -mr-6 size-24 rounded-full bg-primary/5 group-hover:bg-primary/10 transition-colors blur-xl" />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 border border-dashed border-border rounded-xl bg-muted/10">
                        <Tag className="size-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm font-medium text-muted-foreground">No vouchers created yet.</p>
                        <p className="text-xs text-muted-foreground mt-1">Create your first discount code by clicking the button above.</p>
                    </div>
                )}
            </div>

            {/* Create & Edit Modal Dialog */}
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="sm:max-w-[420px]">
                    <DialogHeader>
                        <DialogTitle>{editVoucher ? 'Edit Voucher' : 'Create Voucher'}</DialogTitle>
                        <DialogDescription>
                            Configure your discount code details below.
                        </DialogDescription>
                    </DialogHeader>

                    <Form
                        {...(editVoucher
                            ? VoucherController.update.form({ voucher: editVoucher.id })
                            : VoucherController.store.form()
                        )}
                        onSuccess={() => setIsOpen(false)}
                        options={{
                            preserveScroll: true,
                        }}
                        resetOnSuccess
                    >
                        {({ processing, errors }) => (
                            <div className="space-y-4 py-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="code">Voucher Code (Capitalized)</Label>
                                    <Input
                                        id="code"
                                        name="code"
                                        defaultValue={editVoucher?.code ?? ''}
                                        placeholder="e.g. HANYZAFREE"
                                        required
                                        maxLength={50}
                                        className="uppercase font-mono font-semibold"
                                    />
                                    <InputError message={errors.code} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="discount_amount">Discount Amount / Potongan Harga (IDR)</Label>
                                    <Input
                                        id="discount_amount"
                                        name="discount_amount"
                                        type="number"
                                        defaultValue={editVoucher?.discount_amount ?? ''}
                                        placeholder="e.g. 15000"
                                        required
                                        min="0"
                                    />
                                    <InputError message={errors.discount_amount} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="min_spend">Minimum Spend / Belanja Minimal (IDR)</Label>
                                    <Input
                                        id="min_spend"
                                        name="min_spend"
                                        type="number"
                                        defaultValue={editVoucher?.min_spend ?? '0'}
                                        placeholder="e.g. 50000"
                                        required
                                        min="0"
                                    />
                                    <InputError message={errors.min_spend} />
                                </div>

                                <DialogFooter className="pt-4 border-t border-border mt-6">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={processing}>
                                        {editVoucher ? 'Save Changes' : 'Create Voucher'}
                                    </Button>
                                </DialogFooter>
                            </div>
                        )}
                    </Form>
                </DialogContent>
            </Dialog>
        </>
    );
}

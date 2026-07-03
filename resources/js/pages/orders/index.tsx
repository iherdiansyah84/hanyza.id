import { Form, Head, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { Package, User, Calendar, MapPin, CreditCard, CheckCircle, Truck, Info, Search, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import Heading from '@/components/heading';

interface OrderItem {
    id: number;
    product_name: string;
    quantity: number;
    price: number;
    color: string | null;
    size: string | null;
}

interface Buyer {
    name: string;
    email: string;
}

interface Order {
    id: number;
    user_id: number;
    recipient_name: string;
    phone_number: string;
    address_line: string;
    city: string;
    postal_code: string;
    shipping_method: string;
    protection_enabled: boolean;
    payment_method: string;
    subtotal: number;
    protection_fee: number;
    shipping_fee: number;
    discount: number;
    points_discount: number;
    total: number;
    status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    tracking_number: string | null;
    created_at: string;
    items: OrderItem[];
    user?: Buyer;
}

interface Props {
    orders: Order[];
}

export default function Orders({ orders }: Props) {
    const { auth } = usePage<any>().props;
    const isSeller = auth.user?.role === 'seller';
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

    // Format currency (IDR)
    const formatPrice = (value: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value);
    };

    // Filter orders
    const filteredOrders = orders.filter(order => {
        const query = searchTerm.toLowerCase();
        return (
            order.id.toString().includes(query) ||
            order.recipient_name.toLowerCase().includes(query) ||
            order.status.toLowerCase().includes(query) ||
            (order.user?.name && order.user.name.toLowerCase().includes(query))
        );
    });

    const getStatusBadge = (status: Order['status']) => {
        switch (status) {
            case 'pending':
                return <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/20 font-bold capitalize">Pending Payment</Badge>;
            case 'processing':
                return <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/20 font-bold capitalize">Processing</Badge>;
            case 'shipped':
                return <Badge variant="outline" className="bg-purple-500/10 text-purple-600 border-purple-500/20 font-bold capitalize">Shipped</Badge>;
            case 'delivered':
                return <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20 font-bold capitalize">Delivered</Badge>;
            case 'cancelled':
                return <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-500/20 font-bold capitalize">Cancelled</Badge>;
        }
    };

    return (
        <>
            <Head title="Orders Management" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6 max-w-6xl mx-auto">
                <Heading
                    title={isSeller ? "Seller Orders Control Panel" : "My Purchases & Tracking"}
                    description={isSeller 
                        ? "Manage orders, update shipping statuses, add tracking numbers (Resi), and view payment proofs."
                        : "Track your orders, upload payment proofs, and verify delivered packages."
                    }
                />

                {/* Filter and search */}
                <div className="relative">
                    <Search className="absolute left-3 top-3 size-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by Order ID, recipient name, status..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 h-10 bg-card border-border max-w-md rounded-xl"
                    />
                </div>

                {filteredOrders.length > 0 ? (
                    <div className="grid gap-6 md:grid-cols-3">
                        {/* List of Orders */}
                        <div className="md:col-span-2 space-y-4">
                            {filteredOrders.map((order) => (
                                <div 
                                    key={order.id} 
                                    onClick={() => setSelectedOrder(order)}
                                    className={`p-5 rounded-2xl border transition-all cursor-pointer bg-card ${
                                        selectedOrder?.id === order.id 
                                            ? 'border-primary ring-1 ring-primary shadow-xs' 
                                            : 'border-border hover:border-muted-foreground/30 shadow-xs'
                                    }`}
                                >
                                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-3 mb-3">
                                        <div className="space-y-0.5">
                                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                <Calendar className="size-3" /> {new Date(order.created_at).toLocaleDateString('id-ID', { dateStyle: 'medium' })}
                                            </span>
                                            <span className="font-bold text-sm text-foreground">Order ID: #{order.id}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {getStatusBadge(order.status)}
                                        </div>
                                    </div>

                                    {/* Order Items Summary */}
                                    <div className="space-y-2">
                                        {order.items.map((item) => (
                                            <div key={item.id} className="flex justify-between text-xs">
                                                <span className="text-muted-foreground">
                                                    {item.product_name} <span className="font-semibold text-foreground">x{item.quantity}</span>
                                                    {item.color && ` (${item.color})`}{item.size && ` [${item.size}]`}
                                                </span>
                                                <span className="font-medium text-foreground">{formatPrice(item.price * item.quantity)}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex items-center justify-between border-t border-border/60 pt-3 mt-3">
                                        <div className="text-xs">
                                            <span className="text-muted-foreground">Recipient: </span>
                                            <span className="font-semibold text-foreground">{order.recipient_name}</span>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-[10px] text-muted-foreground block">Total Paid</span>
                                            <span className="font-black text-sm text-primary">{formatPrice(order.total)}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Order Detail & Actions Side Panel */}
                        <div className="md:col-span-1">
                            {selectedOrder ? (
                                <div className="bg-card border border-border rounded-2xl p-5 space-y-6 sticky top-24 shadow-xs">
                                    <h3 className="font-bold text-base border-b border-border pb-3 flex items-center gap-2">
                                        <Package className="size-5 text-primary" /> Order Detail #{selectedOrder.id}
                                    </h3>

                                    {/* Status Section */}
                                    <div className="bg-muted/40 p-4 rounded-xl space-y-2">
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="text-muted-foreground font-semibold">Status:</span>
                                            {getStatusBadge(selectedOrder.status)}
                                        </div>
                                        {selectedOrder.tracking_number && (
                                            <div className="text-xs space-y-1">
                                                <span className="text-muted-foreground block font-semibold">Tracking Number (Resi):</span>
                                                <span className="font-mono text-primary bg-primary/5 px-2 py-0.5 rounded border border-primary/10 block w-fit font-bold">{selectedOrder.tracking_number}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Shipping Address */}
                                    <div className="text-xs space-y-1.5">
                                        <div className="font-semibold text-muted-foreground flex items-center gap-1">
                                            <MapPin className="size-3.5" /> Shipping Address
                                        </div>
                                        <div className="bg-muted/10 p-3 rounded-lg border border-border/60">
                                            <div className="font-bold text-foreground">{selectedOrder.recipient_name} ({selectedOrder.phone_number})</div>
                                            <div className="text-muted-foreground mt-0.5">{selectedOrder.address_line}, {selectedOrder.city}, {selectedOrder.postal_code}</div>
                                            <div className="text-muted-foreground mt-1 uppercase font-bold text-[10px]">Method: {selectedOrder.shipping_method}</div>
                                        </div>
                                    </div>

                                    {/* Payment Method */}
                                    <div className="text-xs space-y-1.5">
                                        <div className="font-semibold text-muted-foreground flex items-center gap-1">
                                            <CreditCard className="size-3.5" /> Payment Method
                                        </div>
                                        <div className="bg-muted/10 p-3 rounded-lg border border-border/60 flex items-center justify-between">
                                            <span className="font-bold text-foreground capitalize">{selectedOrder.payment_method}</span>
                                            {selectedOrder.status !== 'pending' && (
                                                <span className="text-green-600 font-bold flex items-center gap-0.5"><CheckCircle className="size-3" /> Paid</span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Action Forms */}
                                    {isSeller ? (
                                        // Seller Action Form
                                        <div className="space-y-4 pt-4 border-t border-border">
                                            <h4 className="font-bold text-xs uppercase tracking-wider text-muted-foreground">Seller Actions</h4>
                                            
                                            <Form
                                                action={`/orders/${selectedOrder.id}/status`}
                                                method="PATCH"
                                                onSuccess={() => {
                                                    const updated = orders.find(o => o.id === selectedOrder.id);
                                                    if (updated) setSelectedOrder(updated);
                                                }}
                                            >
                                                {({ processing }) => (
                                                    <div className="space-y-3">
                                                        <div className="space-y-1.5">
                                                            <Label htmlFor="status" className="text-xs font-semibold">Change Status</Label>
                                                            <select
                                                                id="status"
                                                                name="status"
                                                                defaultValue={selectedOrder.status}
                                                                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-xs shadow-xs focus-visible:outline-hidden"
                                                            >
                                                                <option value="pending">Pending Payment</option>
                                                                <option value="processing">Processing</option>
                                                                <option value="shipped">Shipped</option>
                                                                <option value="delivered">Delivered</option>
                                                                <option value="cancelled">Cancelled</option>
                                                            </select>
                                                        </div>

                                                        <div className="space-y-1.5">
                                                            <Label htmlFor="tracking_number" className="text-xs font-semibold">Tracking Number / Resi</Label>
                                                            <Input 
                                                                id="tracking_number" 
                                                                name="tracking_number" 
                                                                defaultValue={selectedOrder.tracking_number ?? ''} 
                                                                placeholder="e.g. JNE123456789"
                                                                className="h-9 text-xs"
                                                            />
                                                        </div>

                                                        <Button 
                                                            type="submit" 
                                                            disabled={processing} 
                                                            className="w-full h-9 bg-primary text-primary-foreground text-xs font-bold rounded-lg"
                                                        >
                                                            Update Status
                                                        </Button>
                                                    </div>
                                                )}
                                            </Form>
                                        </div>
                                    ) : (
                                        // Buyer Action Form
                                        <div className="space-y-4 pt-4 border-t border-border">
                                            {selectedOrder.status === 'pending' && (
                                                <Form
                                                    action={`/orders/${selectedOrder.id}/pay`}
                                                    method="POST"
                                                >
                                                    {({ processing }) => (
                                                        <div className="space-y-2">
                                                            <div className="p-3 bg-amber-500/5 border border-amber-500/20 rounded-lg text-[10px] text-amber-700 leading-normal flex items-start gap-1.5">
                                                                <Info className="size-4 shrink-0" />
                                                                <span>Please click below to simulate uploading your payment receipt to process this order.</span>
                                                            </div>
                                                            <Button
                                                                type="submit"
                                                                disabled={processing}
                                                                className="w-full h-10 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-lg"
                                                            >
                                                                Upload Receipt / Bayar Sekarang
                                                            </Button>
                                                        </div>
                                                    )}
                                                </Form>
                                            )}

                                            {selectedOrder.status === 'delivered' && (
                                                <div className="p-3 bg-green-500/5 border border-green-500/20 rounded-lg text-xs space-y-2">
                                                    <div className="font-bold text-green-700 flex items-center gap-1.5">
                                                        <ShieldCheck className="size-4" /> Dropship Delivery Confirmed
                                                    </div>
                                                    <p className="text-[10px] text-green-600 leading-normal">
                                                        The order has arrived! Dropshippers are notified to inform the customer and upload any delivery receipts.
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="bg-muted/10 border border-dashed border-border rounded-2xl p-8 text-center text-xs text-muted-foreground">
                                    Select an order from the list to view tracking details, address summaries, and payment options.
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-20 border border-dashed border-border rounded-2xl bg-card">
                        <Package className="size-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="font-bold text-lg text-foreground">No orders found</h3>
                        <p className="text-sm text-muted-foreground max-w-sm mx-auto mt-2">
                            {isSeller 
                                ? "No customers have purchased products from your catalog yet."
                                : "You haven't placed any orders yet. Visit the catalog to buy some items!"
                            }
                        </p>
                    </div>
                )}
            </div>
        </>
    );
}

Orders.layout = {
    breadcrumbs: [
        {
            title: 'Orders',
            href: '/orders',
        },
    ],
};

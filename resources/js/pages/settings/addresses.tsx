import { Form, Head, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { Plus, MapPin, ChevronDown, Bell, Gift, Coins, User, KeyRound, Palette, ShoppingBag, CreditCard, ShieldCheck } from 'lucide-react';
import AddressController from '@/actions/App/Http/Controllers/AddressController';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { index as addressesIndex } from '@/routes/addresses';

interface Address {
    id: number;
    recipient_name: string;
    phone_number: string;
    address_line: string;
    city: string;
    postal_code: string;
    is_default: boolean;
    latitude?: number;
    longitude?: number;
}

interface Props {
    addresses: Address[];
}

export default function Addresses({ addresses }: Props) {
    const { locale = 'id' } = usePage<any>().props;
    
    const [isOpen, setIsOpen] = useState(false);
    const [editAddress, setEditAddress] = useState<Address | null>(null);

    // Form inputs states
    const [recipientName, setRecipientName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [locationString, setLocationString] = useState('');
    const [streetAddress, setStreetAddress] = useState('');
    const [detailAddress, setDetailAddress] = useState('');
    const [latVal, setLatVal] = useState<string>('');
    const [lngVal, setLngVal] = useState<string>('');
    const [addressTag, setAddressTag] = useState<'home' | 'office' | null>(null);
    const [isDefaultCheck, setIsDefaultCheck] = useState(false);

    // Internal parsed values
    const [parsedCity, setParsedCity] = useState('');
    const [parsedPostalCode, setParsedPostalCode] = useState('');

    useEffect(() => {
        if (editAddress) {
            setRecipientName(editAddress.recipient_name);
            setPhoneNumber(editAddress.phone_number);
            setLocationString(`${editAddress.city}, ${editAddress.postal_code}`);
            
            // Parse street and detail if combined
            const parts = editAddress.address_line.split(', ');
            if (parts.length > 1) {
                setStreetAddress(parts[0]);
                // Remove optional (Rumah)/(Kantor) tag from street address if present
                setStreetAddress(parts[0].replace(/\s*\((Rumah|Kantor)\)$/i, ''));
                setDetailAddress(parts.slice(1).join(', ').replace(/\s*\((Rumah|Kantor)\)$/i, ''));
            } else {
                setStreetAddress(editAddress.address_line.replace(/\s*\((Rumah|Kantor)\)$/i, ''));
                setDetailAddress('');
            }
            
            setLatVal(editAddress.latitude ? editAddress.latitude.toString() : '');
            setLngVal(editAddress.longitude ? editAddress.longitude.toString() : '');
            setIsDefaultCheck(editAddress.is_default);
            setParsedCity(editAddress.city);
            setParsedPostalCode(editAddress.postal_code);

            // Determine tag based on saved address string
            if (editAddress.address_line.toLowerCase().includes('(rumah)')) {
                setAddressTag('home');
            } else if (editAddress.address_line.toLowerCase().includes('(kantor)')) {
                setAddressTag('office');
            } else {
                setAddressTag(null);
            }
        } else {
            setRecipientName('');
            setPhoneNumber('');
            setLocationString('');
            setStreetAddress('');
            setDetailAddress('');
            setLatVal('');
            setLngVal('');
            setAddressTag(null);
            setIsDefaultCheck(false);
            setParsedCity('');
            setParsedPostalCode('');
        }
    }, [editAddress, isOpen]);

    const handleLocationChange = (val: string) => {
        setLocationString(val);
        // Extract postal code if there is a 5-digit number at the end
        const match = val.match(/\b\d{5}\b/);
        if (match) {
            const postalCode = match[0];
            setParsedPostalCode(postalCode);
            // City is anything before the postal code
            const cityPart = val.replace(postalCode, '').replace(/,\s*$/, '').trim();
            setParsedCity(cityPart || val);
        } else {
            setParsedCity(val);
            setParsedPostalCode('');
        }
    };

    const handleGetGeolocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                setLatVal(position.coords.latitude.toFixed(6));
                setLngVal(position.coords.longitude.toFixed(6));
            }, (error) => {
                alert('Error obtaining location: ' + error.message);
            });
        } else {
            alert('Geolocation is not supported by your browser.');
        }
    };

    const handleOpenCreate = () => {
        setEditAddress(null);
        setIsOpen(true);
    };

    const handleOpenEdit = (address: Address) => {
        setEditAddress(address);
        setIsOpen(true);
    };

    return (
        <>
            <Head title="Shipping Addresses" />

            <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-stone-100 pb-4">
                    <Heading
                        variant="small"
                        title={locale === 'id' ? 'Alamat Saya' : 'My Addresses'}
                        description={locale === 'id' ? 'Kelola alamat pengiriman untuk pesanan belanja Anda.' : 'Manage your shipping delivery locations.'}
                    />
                    <Button 
                        onClick={handleOpenCreate} 
                        className="gap-1.5 flex items-center bg-[#E06D53] hover:bg-[#c85b43] text-white font-bold text-xs rounded-xl shadow-xs px-4 h-10 cursor-pointer"
                    >
                        <Plus className="size-4" /> {locale === 'id' ? 'Tambahkan Alamat' : 'Add Address'}
                    </Button>
                </div>

                {addresses.length > 0 ? (
                    <div className="divide-y divide-stone-100 bg-white rounded-2xl border border-stone-200/60 shadow-xs overflow-hidden">
                        {addresses.map((address) => (
                            <div
                                key={address.id}
                                className="p-6 transition-all hover:bg-stone-50/30 flex flex-col md:flex-row md:items-start justify-between gap-6"
                            >
                                <div className="space-y-2 flex-1 text-left">
                                    <div className="flex flex-wrap items-center gap-3">
                                        <span className="font-bold text-stone-850 text-sm">
                                            {address.recipient_name}
                                        </span>
                                        <span className="h-3 w-px bg-stone-200" />
                                        <span className="text-xs text-stone-500 font-semibold">{address.phone_number}</span>
                                        {address.is_default && (
                                            <span className="inline-flex items-center rounded-md bg-[#E06D53]/10 px-2 py-0.5 text-[10px] font-bold text-[#E06D53] border border-[#E06D53]/25 uppercase tracking-wider">
                                                {locale === 'id' ? 'Utama' : 'Default'}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-stone-600 leading-relaxed max-w-2xl font-medium">
                                        {address.address_line}
                                    </p>
                                    <p className="text-xs text-stone-500 font-bold uppercase tracking-wider">
                                        {address.city}, {address.postal_code}
                                    </p>
                                    {address.latitude && address.longitude && (
                                        <div className="flex items-center gap-1.5 text-[10px] font-black text-stone-400">
                                            <MapPin className="size-3.5 text-stone-400" />
                                            <span>GPS: {address.latitude}, {address.longitude}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex flex-col items-end gap-3 shrink-0">
                                    <div className="flex items-center gap-3 text-xs">
                                        <button
                                            onClick={() => handleOpenEdit(address)}
                                            className="text-sky-650 hover:text-sky-750 font-bold hover:underline cursor-pointer"
                                        >
                                            {locale === 'id' ? 'Ubah' : 'Edit'}
                                        </button>
                                        {!address.is_default && (
                                            <>
                                                <span className="text-stone-300">|</span>
                                                <Form
                                                    {...AddressController.destroy.form({ address: address.id })}
                                                    options={{ preserveScroll: true }}
                                                >
                                                    {({ processing }) => (
                                                        <button
                                                            type="submit"
                                                            className="text-red-650 hover:text-red-750 font-bold hover:underline disabled:opacity-50 cursor-pointer"
                                                            disabled={processing}
                                                        >
                                                            {locale === 'id' ? 'Hapus' : 'Delete'}
                                                        </button>
                                                    )}
                                                </Form>
                                            </>
                                        )}
                                    </div>
                                    {!address.is_default && (
                                        <Form
                                            {...AddressController.update.form({ address: address.id })}
                                            options={{ preserveScroll: true }}
                                        >
                                            {({ processing }) => (
                                                <>
                                                    {/* Pass hidden values to trigger updates to default */}
                                                    <input type="hidden" name="recipient_name" value={address.recipient_name} />
                                                    <input type="hidden" name="phone_number" value={address.phone_number} />
                                                    <input type="hidden" name="address_line" value={address.address_line} />
                                                    <input type="hidden" name="city" value={address.city} />
                                                    <input type="hidden" name="postal_code" value={address.postal_code} />
                                                    <input type="hidden" name="is_default" value="1" />
                                                    {address.latitude && <input type="hidden" name="latitude" value={address.latitude} />}
                                                    {address.longitude && <input type="hidden" name="longitude" value={address.longitude} />}
                                                    
                                                    <Button
                                                        type="submit"
                                                        variant="outline"
                                                        size="sm"
                                                        className="text-xs text-stone-600 font-bold rounded-lg border-stone-250 hover:bg-stone-50 h-9 cursor-pointer"
                                                        disabled={processing}
                                                    >
                                                        {locale === 'id' ? 'Atur sebagai utama' : 'Set as default'}
                                                    </Button>
                                                </>
                                            )}
                                        </Form>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 border border-dashed border-stone-200 bg-white rounded-2xl">
                        <MapPin className="size-10 text-stone-400 mx-auto mb-3" />
                        <p className="text-sm font-bold text-stone-750">{locale === 'id' ? 'Belum ada alamat pengiriman.' : 'No shipping addresses configured yet.'}</p>
                        <p className="text-xs text-stone-400 mt-1">{locale === 'id' ? 'Harap tambahkan alamat untuk melakukan pesanan.' : 'Please add a shipping address to be able to place orders.'}</p>
                    </div>
                )}
            </div>

            {/* Create & Edit Modal Dialog */}
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="sm:max-w-[480px] rounded-2xl bg-white p-6 shadow-xl">
                    <DialogHeader>
                        <DialogTitle className="text-base font-bold text-stone-850">
                            {editAddress ? (locale === 'id' ? 'Ubah Alamat' : 'Edit Address') : (locale === 'id' ? 'Alamat Baru' : 'New Address')}
                        </DialogTitle>
                    </DialogHeader>

                    <Form
                        {...(editAddress
                            ? AddressController.update.form({ address: editAddress.id })
                            : AddressController.store.form()
                        )}
                        onSuccess={() => setIsOpen(false)}
                        options={{
                            preserveScroll: true,
                        }}
                        resetOnSuccess
                    >
                        {({ processing, errors }) => (
                            <div className="space-y-4 pt-2">
                                {/* Row 1: recipient name | phone number */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-1">
                                        <Input
                                            id="recipient_name"
                                            name="recipient_name"
                                            value={recipientName}
                                            onChange={(e) => setRecipientName(e.target.value)}
                                            placeholder={locale === 'id' ? 'Nama Lengkap' : 'Full Name'}
                                            required
                                            className="rounded-lg border-stone-200 placeholder:text-stone-300 text-sm h-11"
                                        />
                                        <InputError message={errors.recipient_name} />
                                    </div>
                                    <div className="grid gap-1">
                                        <Input
                                            id="phone_number"
                                            name="phone_number"
                                            value={phoneNumber}
                                            onChange={(e) => setPhoneNumber(e.target.value)}
                                            placeholder={locale === 'id' ? 'Nomor Telepon' : 'Phone Number'}
                                            required
                                            className="rounded-lg border-stone-200 placeholder:text-stone-300 text-sm h-11"
                                        />
                                        <InputError message={errors.phone_number} />
                                    </div>
                                </div>

                                {/* Row 2: Provinsi, Kota, Kecamatan, Kode Pos */}
                                <div className="relative">
                                    <Input
                                        placeholder={locale === 'id' ? 'Provinsi, Kota, Kecamatan, Kode Pos' : 'Province, City, District, Postal Code'}
                                        value={locationString}
                                        onChange={(e) => handleLocationChange(e.target.value)}
                                        required
                                        className="rounded-lg border-stone-200 placeholder:text-stone-300 pr-10 text-sm h-11"
                                    />
                                    <ChevronDown className="absolute right-3 top-3.5 size-4 text-stone-400 pointer-events-none" />
                                    
                                    {/* Pass internal parsed values to the backend form helper */}
                                    <input type="hidden" name="city" value={parsedCity || 'Bekasi'} />
                                    <input type="hidden" name="postal_code" value={parsedPostalCode || '17530'} />
                                    
                                    <InputError message={errors.city} />
                                    <InputError message={errors.postal_code} />
                                </div>

                                {/* Row 3: Nama Jalan, Gedung, No. Rumah */}
                                <div className="grid gap-1">
                                    <textarea
                                        placeholder={locale === 'id' ? 'Nama Jalan, Gedung, No. Rumah' : 'Street Name, Building, House Number'}
                                        value={streetAddress}
                                        onChange={(e) => setStreetAddress(e.target.value)}
                                        className="flex min-h-[70px] w-full rounded-lg border border-stone-200 bg-background px-3 py-2 text-sm placeholder:text-stone-300 focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring font-medium"
                                        required
                                    />
                                </div>

                                {/* Row 4: Detail Lainnya */}
                                <div className="grid gap-1">
                                    <Input
                                        placeholder={locale === 'id' ? 'Detail Lainnya (Cth: Blok / Unit No., Patokan)' : 'Other Details (e.g. Block / Unit No., Landmark)'}
                                        value={detailAddress}
                                        onChange={(e) => setDetailAddress(e.target.value)}
                                        className="rounded-lg border-stone-200 placeholder:text-stone-300 text-sm h-11"
                                    />
                                    
                                    {/* Combine Row 3 and Row 4 into address_line for submission */}
                                    <input 
                                        type="hidden" 
                                        name="address_line" 
                                        value={
                                            `${streetAddress}${detailAddress ? ', ' + detailAddress : ''}${addressTag ? ' (' + (addressTag === 'home' ? 'Rumah' : 'Kantor') + ')' : ''}`
                                        } 
                                    />
                                    
                                    <InputError message={errors.address_line} />
                                </div>

                                {/* Row 5: Map Location widget */}
                                <div className="relative border border-stone-200 rounded-xl overflow-hidden bg-stone-50 h-32 flex flex-col items-center justify-center p-4">
                                    {/* Map Grid Pattern background */}
                                    <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
                                    
                                    <div className="text-center z-10 space-y-2">
                                        {latVal && lngVal ? (
                                            <>
                                                <div className="text-[11px] font-bold text-stone-600 bg-white border border-stone-200 rounded-lg px-2.5 py-1 flex items-center gap-1.5 shadow-sm">
                                                    <span className="size-2 rounded-full bg-emerald-500 animate-ping" />
                                                    <span>GPS Terpasang: {latVal}, {lngVal}</span>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={handleGetGeolocation}
                                                    className="text-[10px] text-[#E06D53] hover:underline font-bold"
                                                >
                                                    {locale === 'id' ? 'Ubah Koordinat' : 'Change Coordinates'}
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={handleGetGeolocation}
                                                    className="bg-white border-stone-200 hover:bg-stone-50 font-bold text-xs rounded-xl shadow-xs h-9 px-4 flex items-center gap-1.5 text-stone-600 cursor-pointer"
                                                >
                                                    <Plus className="size-3.5 text-stone-400" /> {locale === 'id' ? 'Tambah Lokasi' : 'Add Location'}
                                                </Button>
                                                <p className="text-[10px] text-stone-400 font-semibold">
                                                    {locale === 'id' ? 'Tandai lokasi GPS agar kurir mudah menemukan alamat Anda' : 'Pin your GPS location for easier courier deliveries'}
                                                </p>
                                            </>
                                        )}
                                    </div>
                                    
                                    <input type="hidden" name="latitude" value={latVal} />
                                    <input type="hidden" name="longitude" value={lngVal} />
                                    <InputError message={errors.latitude} />
                                </div>

                                {/* Row 6: Tandai Sebagai & Default Checkbox */}
                                <div className="space-y-3 pt-2">
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs font-bold text-stone-500">Tandai Sebagai:</span>
                                        <div className="flex gap-2">
                                            <button
                                                type="button"
                                                onClick={() => setAddressTag(addressTag === 'home' ? null : 'home')}
                                                className={`px-4 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                                                    addressTag === 'home'
                                                        ? 'border-[#E06D53] text-[#E06D53] bg-[#E06D53]/5'
                                                        : 'border-stone-200 text-stone-500 hover:border-stone-400 bg-white'
                                                }`}
                                            >
                                                Rumah
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setAddressTag(addressTag === 'office' ? null : 'office')}
                                                className={`px-4 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                                                    addressTag === 'office'
                                                        ? 'border-[#E06D53] text-[#E06D53] bg-[#E06D53]/5'
                                                        : 'border-stone-200 text-stone-500 hover:border-stone-400 bg-white'
                                                }`}
                                            >
                                                Kantor
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 pt-1.5">
                                        <input
                                            type="checkbox"
                                            id="is_default"
                                            name="is_default"
                                            checked={isDefaultCheck}
                                            onChange={(e) => setIsDefaultCheck(e.target.checked)}
                                            className="rounded border-stone-200 text-[#E06D53] focus:ring-[#E06D53] h-4 w-4 cursor-pointer"
                                            disabled={editAddress?.is_default}
                                        />
                                        <Label htmlFor="is_default" className="text-xs text-stone-400 font-bold cursor-pointer select-none">
                                            {locale === 'id' ? 'Jadikan alamat utama' : 'Set as default shipping address'}
                                        </Label>
                                    </div>
                                </div>

                                {/* Dialog Footer */}
                                <DialogFooter className="pt-4 border-t border-stone-100 mt-6 gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setIsOpen(false)}
                                        className="rounded-xl font-bold text-xs border-stone-200 h-10 px-4"
                                    >
                                        {locale === 'id' ? 'Nanti Saja' : 'Cancel'}
                                    </Button>
                                    <Button 
                                        type="submit" 
                                        disabled={processing}
                                        className="rounded-xl font-bold text-xs bg-[#E06D53] hover:bg-[#c85b43] text-white h-10 px-6"
                                    >
                                        OK
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

Addresses.layout = {
    breadcrumbs: [
        {
            title: 'Shipping Addresses',
            href: addressesIndex(),
        },
    ],
};

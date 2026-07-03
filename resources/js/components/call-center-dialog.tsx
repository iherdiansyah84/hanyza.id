import React, { useState } from 'react';
import { usePage } from '@inertiajs/react';
import { 
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { 
    PhoneCall, MessageSquare, Mail, Send, CheckCircle2, Headphones 
} from 'lucide-react';

interface CallCenterDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function CallCenterDialog({ open, onOpenChange }: CallCenterDialogProps) {
    const { auth, locale = 'en' } = usePage<any>().props;
    const user = auth?.user;

    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    // Dynamic Bilingual Translations
    const translations = {
        en: {
            title: "Hanyza Call Center",
            desc: "Need help? Talk to our customer support or report a problem directly to us.",
            phoneSupport: "Phone Hotline (09:00 - 17:00)",
            waSupport: "WhatsApp Live Chat (24/7)",
            emailSupport: "Email Support",
            reportTitle: "Report a Problem",
            labelName: "Your Name",
            labelEmail: "Your Email",
            labelSubject: "Subject / Order ID",
            labelMessage: "Explain the Issue",
            placeholderSubject: "e.g., Refund status, Shipping delay...",
            placeholderMessage: "Describe what went wrong in detail...",
            btnSubmit: "Submit Report",
            successTitle: "Report Submitted Successfully!",
            successDesc: "Thank you for contacting Hanyza.id! Your ticket has been recorded. Our Customer Service team will contact you shortly via WhatsApp or Email.",
            btnClose: "Close Center"
        },
        id: {
            title: "Call Center Hanyza",
            desc: "Butuh bantuan? Hubungi customer support kami atau laporkan masalah Anda langsung di bawah.",
            phoneSupport: "Hotline Telepon (09:00 - 17:00)",
            waSupport: "WhatsApp Live Chat (24/7)",
            emailSupport: "Dukungan Email",
            reportTitle: "Laporkan Masalah / Pengaduan",
            labelName: "Nama Anda",
            labelEmail: "Email Anda",
            labelSubject: "Subjek / ID Pesanan",
            labelMessage: "Jelaskan Masalah Anda",
            placeholderSubject: "Contoh: Status refund, Keterlambatan pengiriman...",
            placeholderMessage: "Jelaskan kronologi masalah secara mendetail...",
            btnSubmit: "Kirim Laporan",
            successTitle: "Laporan Berhasil Terkirim!",
            successDesc: "Terima kasih telah menghubungi Hanyza.id! Laporan Anda telah kami catat. Tim Customer Service kami akan segera menghubungi Anda melalui WhatsApp atau Email.",
            btnClose: "Tutup Layanan"
        }
    };

    const t = translations[locale as 'en' | 'id'] || translations.en;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !email || !message) return;

        setIsSubmitting(true);
        // Simulate API call to backend service
        setTimeout(() => {
            setIsSubmitting(false);
            setIsSuccess(true);
        }, 1200);
    };

    const handleClose = () => {
        onOpenChange(false);
        // Reset form states on close (only after transition completes)
        setTimeout(() => {
            setIsSuccess(false);
            setSubject('');
            setMessage('');
        }, 300);
    };

    return (
        <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); else onOpenChange(true); }}>
            <DialogContent className="sm:max-w-[480px] rounded-2xl p-6 bg-white border border-stone-200 shadow-xl overflow-hidden font-sans">
                
                {isSuccess ? (
                    <div className="flex flex-col items-center text-center py-8 space-y-4">
                        <div className="size-16 rounded-full bg-green-50 flex items-center justify-center text-green-600 shadow-inner animate-scaleIn">
                            <CheckCircle2 className="size-10" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="font-sans font-black text-lg text-stone-850">{t.successTitle}</h3>
                            <p className="text-xs text-stone-500 max-w-sm leading-relaxed font-semibold">
                                {t.successDesc}
                            </p>
                        </div>
                        <div className="pt-4 w-full">
                            <Button 
                                onClick={handleClose}
                                className="w-full bg-[#E06D53] hover:bg-[#C85B43] text-white font-bold h-11 rounded-xl shadow-md uppercase tracking-wider text-[10px]"
                            >
                                {t.btnClose}
                            </Button>
                        </div>
                    </div>
                ) : (
                    <>
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 font-sans font-black text-stone-850 text-lg">
                                <Headphones className="size-5.5 text-[#E06D53]" />
                                {t.title}
                            </DialogTitle>
                            <DialogDescription className="text-xs text-stone-450 font-semibold leading-relaxed">
                                {t.desc}
                            </DialogDescription>
                        </DialogHeader>

                        {/* Direct Contacts Grid */}
                        <div className="grid grid-cols-1 gap-2.5 my-4">
                            <a 
                                href="https://wa.me/6281234567890" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center justify-between p-3.5 bg-green-50/50 hover:bg-green-50 border border-green-150 rounded-xl transition-all cursor-pointer group"
                            >
                                <div className="flex items-center gap-3">
                                    <MessageSquare className="size-4.5 text-green-600 fill-green-100" />
                                    <span className="text-xs font-bold text-stone-750">{t.waSupport}</span>
                                </div>
                                <span className="text-[10px] font-bold text-green-700 bg-green-100/60 px-2 py-0.5 rounded-full group-hover:bg-green-100 transition-colors">
                                    +62 812-3456-7890
                                </span>
                            </a>

                            <a 
                                href="tel:+62215551234" 
                                className="flex items-center justify-between p-3.5 bg-amber-50/40 hover:bg-amber-50 border border-amber-150 rounded-xl transition-all cursor-pointer group"
                            >
                                <div className="flex items-center gap-3">
                                    <PhoneCall className="size-4.5 text-amber-600 fill-amber-50" />
                                    <span className="text-xs font-bold text-stone-750">{t.phoneSupport}</span>
                                </div>
                                <span className="text-[10px] font-bold text-amber-700 bg-amber-100/40 px-2 py-0.5 rounded-full group-hover:bg-amber-100/60 transition-colors">
                                    (021) 555-1234
                                </span>
                            </a>

                            <a 
                                href="mailto:support@hanyza.id" 
                                className="flex items-center justify-between p-3.5 bg-blue-50/40 hover:bg-blue-50 border border-blue-150 rounded-xl transition-all cursor-pointer group"
                            >
                                <div className="flex items-center gap-3">
                                    <Mail className="size-4.5 text-blue-600 fill-blue-50" />
                                    <span className="text-xs font-bold text-stone-750">{t.emailSupport}</span>
                                </div>
                                <span className="text-[10px] font-bold text-blue-750 bg-blue-100/40 px-2 py-0.5 rounded-full group-hover:bg-blue-100/60 transition-colors">
                                    support@hanyza.id
                                </span>
                            </a>
                        </div>

                        <div className="relative flex items-center justify-center my-3">
                            <hr className="w-full border-stone-150" />
                            <span className="absolute bg-white px-3 text-[10px] font-black uppercase tracking-wider text-stone-400">
                                OR / ATAU
                            </span>
                        </div>

                        {/* Simulated Report Ticket Form */}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <h4 className="text-xs font-black text-stone-400 uppercase tracking-widest">{t.reportTitle}</h4>
                            
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <Label htmlFor="support-name" className="text-[10px] font-bold text-stone-600">{t.labelName}</Label>
                                    <Input 
                                        id="support-name" 
                                        type="text" 
                                        value={name} 
                                        onChange={(e) => setName(e.target.value)}
                                        required 
                                        className="h-9 text-xs rounded-lg border-stone-200 bg-stone-50/40 focus:ring-1 focus:ring-[#E06D53] focus:border-[#E06D53]"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="support-email" className="text-[10px] font-bold text-stone-600">{t.labelEmail}</Label>
                                    <Input 
                                        id="support-email" 
                                        type="email" 
                                        value={email} 
                                        onChange={(e) => setEmail(e.target.value)}
                                        required 
                                        className="h-9 text-xs rounded-lg border-stone-200 bg-stone-50/40 focus:ring-1 focus:ring-[#E06D53] focus:border-[#E06D53]"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <Label htmlFor="support-subject" className="text-[10px] font-bold text-stone-600">{t.labelSubject}</Label>
                                <Input 
                                    id="support-subject" 
                                    type="text" 
                                    placeholder={t.placeholderSubject}
                                    value={subject} 
                                    onChange={(e) => setSubject(e.target.value)}
                                    className="h-9 text-xs rounded-lg border-stone-200 bg-stone-50/40 focus:ring-1 focus:ring-[#E06D53] focus:border-[#E06D53]"
                                />
                            </div>

                            <div className="space-y-1">
                                <Label htmlFor="support-message" className="text-[10px] font-bold text-stone-600">{t.labelMessage}</Label>
                                <textarea 
                                    id="support-message"
                                    required
                                    rows={3}
                                    placeholder={t.placeholderMessage}
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    className="w-full text-xs p-2.5 rounded-lg border border-stone-200 bg-stone-50/40 focus:outline-hidden focus:ring-1 focus:ring-[#E06D53] focus:border-[#E06D53] transition-all resize-none"
                                />
                            </div>

                            <DialogFooter className="pt-2">
                                <Button 
                                    type="submit" 
                                    disabled={isSubmitting || !name || !email || !message}
                                    className="w-full bg-[#E06D53] hover:bg-[#C85B43] text-white font-bold h-11 rounded-xl shadow-md uppercase tracking-wider text-[10px] flex items-center justify-center gap-1.5 cursor-pointer"
                                >
                                    {isSubmitting ? (
                                        <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                                        </svg>
                                    ) : (
                                        <Send className="size-3.5" />
                                    )}
                                    {t.btnSubmit}
                                </Button>
                            </DialogFooter>
                        </form>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}

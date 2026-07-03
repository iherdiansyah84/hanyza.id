import { router } from '@inertiajs/react';
import { useEffect } from 'react';
import { toast } from 'sonner';
import type { FlashToast } from '@/types/ui';

export function useFlashToast(): void {
    useEffect(() => {
        return router.on('flash', (event) => {
            const flash = (event as CustomEvent).detail?.flash;
            const data = flash?.toast as FlashToast | undefined;
            const notification = flash?.notification_sent as any;

            if (data) {
                toast[data.type](data.message);
            }

            if (notification) {
                setTimeout(() => {
                    toast.info(`📧 Email Sent: ${notification.email_subject}`, {
                        description: 'Simulated mail sent successfully.',
                        duration: 6000,
                    });
                }, 400);

                setTimeout(() => {
                    toast.success(`💬 WhatsApp Sent:`, {
                        description: notification.wa_message,
                        duration: 8000,
                    });
                }, 800);
            }
        });
    }, []);
}

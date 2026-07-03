import { createInertiaApp, usePage } from '@inertiajs/react';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { initializeTheme } from '@/hooks/use-appearance';
import AppLayout from '@/layouts/app-layout';
import AuthLayout from '@/layouts/auth-layout';
import SettingsLayout from '@/layouts/settings/layout';
import React from 'react';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

// Wrapper to switch layouts dynamically based on user role and page name
const DynamicLayoutWrapper = ({ children }: { children: React.ReactNode }) => {
    const { component } = usePage<any>();

    if (component === 'cart') {
        return <>{children}</>;
    }

    return <SettingsLayout>{children}</SettingsLayout>;
};

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    layout: (name) => {
        switch (true) {
            case name === 'welcome' || name.startsWith('product/') || name === 'cart':
                return undefined;
            case name.startsWith('auth/'):
                return AuthLayout;
            default:
                return DynamicLayoutWrapper;
        }
    },
    strictMode: true,
    withApp(app) {
        return (
            <TooltipProvider delayDuration={0}>
                {app}
                <Toaster />
            </TooltipProvider>
        );
    },
    progress: {
        color: '#4B5563',
    },
});

// This will set light / dark mode on load...
initializeTheme();

import { useEffect } from 'react';

import { usePage } from '@inertiajs/react';
import { toast } from 'sonner';

import {AppSidebar} from "@/components/app-sidebar"
import {SiteHeader} from "@/components/site-header"
import {
    SidebarInset,
    SidebarProvider,
} from "@/components/ui/sidebar"
import type { PageProps } from '@/types/inertia';

export default function Page({children}: { children: React.ReactNode, title?: string }) {
    const { flash, auth } = usePage<PageProps>().props;




    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }
        if (flash?.error) {
            toast.error(flash.error);
        }
        if (flash?.warning) {
            toast.warning(flash.warning);
        }
        if (flash?.info) {
            toast.info(flash.info);
        }
    }, [flash]);

    return (
        <SidebarProvider>
            <AppSidebar user={auth?.user} variant="inset"/>
            <SidebarInset>
                <SiteHeader/>
                <div className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
                    {children}
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}

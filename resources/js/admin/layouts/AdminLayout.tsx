import {useEffect} from 'react';

import {Head, usePage} from '@inertiajs/react';
import {toast} from 'sonner';

import {AppSidebar} from "@/components/app-sidebar"
import {ImpersonationBanner} from "@/components/impersonation-banner"
import {SaveBar} from "@/components/save-bar"
import {SiteHeader} from "@/components/site-header"
import {
    SidebarInset,
    SidebarProvider,
} from "@/components/ui/sidebar"
import type {PageProps} from '@/types/inertia';

export default function Page({children, title}: { children: React.ReactNode, title?: string }) {
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
            {!!title && <Head title={title}/>}
            <AppSidebar user={auth?.user} variant="inset"/>
            <SidebarInset>
                {auth?.impersonator && auth?.user ? (
                    <ImpersonationBanner user={auth.user}/>
                ) : null}
                <SiteHeader/>
                <SaveBar/>
                <div className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
                    {children}
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}

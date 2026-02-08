import {useEffect, useRef, useState} from 'react';

import {router} from '@inertiajs/react';
import {Loader2Icon, RotateCcwIcon, SaveIcon} from 'lucide-react';

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {Button} from '@/components/ui/button';
import {useLang} from '@/lib/lang';
import {cn} from '@/lib/utils';
import {useSaveBarStore} from '@/stores/save-bar';

export function SaveBar({className}: {className?: string}) {
    const {t} = useLang();
    const {hasChanges, isSaving, onSave, onDiscard} = useSaveBarStore();
    const [mounted, setMounted] = useState(false);
    const [show, setShow] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [navigating, setNavigating] = useState(false);
    const pendingUrl = useRef<string | null>(null);
    const hasChangesRef = useRef(hasChanges);

    hasChangesRef.current = hasChanges;

    // Slide in/out with proper unmount after animation
    useEffect(() => {
        if (hasChanges) {
            setMounted(true);
            const id = setTimeout(() => setShow(true), 10);

            return () => clearTimeout(id);
        } 
            setShow(false);
            const id = setTimeout(() => setMounted(false), 300);

            return () => clearTimeout(id);
        
    }, [hasChanges]);

    // Intercept Inertia navigation
    useEffect(() => {
        return router.on('before', ({detail: {visit}}) => {
            if (visit.method.toLowerCase() !== 'get') {return true;}
            if (!hasChangesRef.current || pendingUrl.current) {return true;}

            pendingUrl.current = visit.url.href;
            setDialogOpen(true);

            return false;
        });
    }, []);

    // Warn on browser close/refresh
    useEffect(() => {
        if (!hasChanges) {return;}
        const handler = (e: BeforeUnloadEvent) => {
            e.preventDefault();
            e.returnValue = '';
        };

        window.addEventListener('beforeunload', handler);

        return () => window.removeEventListener('beforeunload', handler);
    }, [hasChanges]);

    const closeDialog = () => {
        pendingUrl.current = null;
        setDialogOpen(false);
    };

    const navigateIfPending = () => {
        const url = pendingUrl.current;

        pendingUrl.current = null;
        setDialogOpen(false);
        if (url) {setTimeout(() => router.visit(url), 0);}
    };

    const handleDialogDiscard = () => {
        onDiscard?.();
        navigateIfPending();
    };

    const handleDialogSave = async () => {
        setNavigating(true);
        try {
            const ok = await onSave?.();

            if (ok) {navigateIfPending();}
            else {closeDialog();}
        } finally {
            setNavigating(false);
        }
    };

    const handleSave = () => {
        Promise.resolve(onSave?.()).catch(() => {});
    };

    const saving = isSaving || navigating;

    return (
        <>
            {!!mounted && (
                <div
                    className={cn(
                        'fixed top-0 left-0 right-0 z-50 pt-[env(safe-area-inset-top)]',
                        'border-b bg-background/95 backdrop-blur-sm supports-[backdrop-filter]:bg-background/80',
                        'shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1)]',
                        'transition-transform duration-300 ease-out',
                        show ? 'translate-y-0' : '-translate-y-full',
                        className,
                    )}
                >
                    <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-2 px-3 py-2 sm:gap-4 sm:px-6 sm:py-3">
                        <p className="min-w-0 truncate text-xs text-muted-foreground sm:text-sm">
                            <span className="sm:hidden">{t('admin.products_edit.unsaved.mobile_message')}</span>
                            <span className="hidden sm:inline">{t('admin.products_edit.unsaved.message')}</span>
                        </p>

                        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
                            <Button className="h-8 px-2 sm:h-9 sm:px-3" disabled={saving || !onDiscard} size="sm" variant="ghost" onClick={() => onDiscard?.()}>
                                <RotateCcwIcon className="size-4"/>
                                <span className="hidden sm:inline">{t('admin.products_edit.actions.discard')}</span>
                            </Button>

                            <Button className="h-8 px-3 sm:h-9 sm:px-4" disabled={saving || !onSave} size="sm" onClick={handleSave}>
                                {saving ? <Loader2Icon className="size-4 animate-spin"/> : <SaveIcon className="size-4"/>}
                                <span>{t('admin.products_edit.actions.save')}</span>
                            </Button>
                        </div>
                    </div>
                </div>
              )}

            <AlertDialog open={dialogOpen} onOpenChange={(open) => !open && closeDialog()}>
                <AlertDialogContent className="w-[calc(100%-2rem)] max-w-sm rounded-lg">
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t('admin.products_edit.unsaved.dialog.title')}</AlertDialogTitle>
                        <AlertDialogDescription>{t('admin.products_edit.unsaved.dialog.description')}</AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="flex flex-col gap-2 pt-2">
                        <AlertDialogAction disabled={saving} onClick={() => void handleDialogSave()}>
                            {!!saving && <Loader2Icon className="mr-2 size-4 animate-spin"/>}
                            {t('admin.products_edit.unsaved.dialog.save')}
                        </AlertDialogAction>
                        <Button disabled={saving} variant="destructive" onClick={handleDialogDiscard}>
                            {t('admin.products_edit.unsaved.dialog.discard')}
                        </Button>
                        <AlertDialogCancel className="mt-0" disabled={saving}>
                            {t('admin.products_edit.unsaved.dialog.cancel')}
                        </AlertDialogCancel>
                    </div>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
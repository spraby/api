import * as React from 'react';

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
import {cn} from '@/lib/utils';

export interface UnsavedChangesBarProps {
    /** Whether there are unsaved changes */
    hasChanges: boolean;
    /** Whether save operation is in progress */
    isSaving?: boolean;
    /** Called when save button is clicked */
    onSave: () => void | Promise<void>;
    /** Called when discard button is clicked */
    onDiscard: () => void;
    /** Save button label */
    saveLabel?: string;
    /** Discard button label */
    discardLabel?: string;
    /** Message to show */
    message?: string;
    /** Short message for mobile */
    mobileMessage?: string;
    /** Dialog title */
    dialogTitle?: string;
    /** Dialog description */
    dialogDescription?: string;
    /** Dialog save button label */
    dialogSaveLabel?: string;
    /** Dialog discard button label */
    dialogDiscardLabel?: string;
    /** Dialog cancel button label */
    dialogCancelLabel?: string;
    /** Additional CSS classes */
    className?: string;
}

export function UnsavedChangesBar({
    hasChanges,
    isSaving = false,
    onSave,
    onDiscard,
    saveLabel = 'Save',
    discardLabel = 'Discard',
    message = 'You have unsaved changes',
    mobileMessage = 'Unsaved changes',
    dialogTitle = 'Unsaved changes',
    dialogDescription = 'You have unsaved changes. What would you like to do?',
    dialogSaveLabel = 'Save and leave',
    dialogDiscardLabel = 'Discard changes',
    dialogCancelLabel = 'Stay on page',
    className,
}: UnsavedChangesBarProps) {
    const [isVisible, setIsVisible] = React.useState(false);
    const [isDialogOpen, setIsDialogOpen] = React.useState(false);
    const [isNavigating, setIsNavigating] = React.useState(false);
    const pendingVisitRef = React.useRef<string | null>(null);
    const hasChangesRef = React.useRef(hasChanges);

    // Keep ref in sync
    hasChangesRef.current = hasChanges;

    // Animate bar in/out
    React.useEffect(() => {
        if (hasChanges) {
            const timer = setTimeout(() => setIsVisible(true), 10);

            return () => clearTimeout(timer);
        }
        setIsVisible(false);
    }, [hasChanges]);

    // Intercept Inertia navigation
    React.useEffect(() => {
        const removeListener = router.on('before', (event) => {
            // Allow navigation if no unsaved changes
            if (!hasChangesRef.current) {
                return true;
            }

            // Allow if we're already processing a confirmed navigation
            if (pendingVisitRef.current) {
                return true;
            }

            // Store pending visit and show dialog
            pendingVisitRef.current = event.detail.visit.url.href;
            setIsDialogOpen(true);

            // Prevent navigation
            return false;
        });

        return () => removeListener();
    }, []);

    // Warn on browser close/refresh
    React.useEffect(() => {
        if (!hasChanges) {return;}

        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            e.preventDefault();
            e.returnValue = '';
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [hasChanges]);

    // Dialog actions
    const handleCancelNavigation = React.useCallback(() => {
        pendingVisitRef.current = null;
        setIsDialogOpen(false);
    }, []);

    const handleConfirmDiscard = React.useCallback(() => {
        const pendingUrl = pendingVisitRef.current;

        pendingVisitRef.current = null;
        setIsDialogOpen(false);
        onDiscard();

        if (pendingUrl) {
            setTimeout(() => router.visit(pendingUrl), 0);
        }
    }, [onDiscard]);

    const handleConfirmSave = React.useCallback(async () => {
        const pendingUrl = pendingVisitRef.current;

        setIsNavigating(true);

        try {
            await onSave();
            pendingVisitRef.current = null;
            setIsDialogOpen(false);

            if (pendingUrl) {
                setTimeout(() => router.visit(pendingUrl), 0);
            }
        } finally {
            setIsNavigating(false);
        }
    }, [onSave]);

    const savingState = isSaving || isNavigating;

    return (
        <>
            {/* Unsaved changes bar */}
            {!!(hasChanges || isVisible) && (
                <div
                    className={cn(
                        'fixed top-0 left-0 right-0 z-50',
                        'pt-[env(safe-area-inset-top)]',
                        'border-b bg-background/95 backdrop-blur-sm supports-[backdrop-filter]:bg-background/80',
                        'shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1)]',
                        'transition-transform duration-300 ease-out',
                        isVisible ? 'translate-y-0' : '-translate-y-full',
                        className
                    )}
                >
                    <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-2 px-3 py-2 sm:gap-4 sm:px-6 sm:py-3">
                        <p className="min-w-0 truncate text-xs text-muted-foreground sm:text-sm">
                            <span className="sm:hidden">{mobileMessage}</span>
                            <span className="hidden sm:inline">{message}</span>
                        </p>

                        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
                            <Button
                                className="h-8 px-2 sm:h-9 sm:px-3"
                                disabled={savingState}
                                size="sm"
                                variant="ghost"
                                onClick={onDiscard}
                            >
                                <RotateCcwIcon className="size-4"/>
                                <span className="hidden sm:inline">{discardLabel}</span>
                            </Button>

                            <Button
                                className="h-8 px-3 sm:h-9 sm:px-4"
                                disabled={savingState}
                                size="sm"
                                onClick={() => void onSave()}
                            >
                                {savingState ? (
                                    <Loader2Icon className="size-4 animate-spin"/>
                                ) : (
                                    <SaveIcon className="size-4"/>
                                )}
                                <span>{saveLabel}</span>
                            </Button>
                        </div>
                    </div>
                </div>
              )}

            {/* Navigation confirmation dialog */}
            <AlertDialog open={isDialogOpen} onOpenChange={(open) => {
                if (!open) {
                    handleCancelNavigation();
                }
            }}>
                <AlertDialogContent className="w-[calc(100%-2rem)] max-w-sm rounded-lg">
                    <AlertDialogHeader>
                        <AlertDialogTitle>{dialogTitle}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {dialogDescription}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="flex flex-col gap-2 pt-2">
                        <AlertDialogAction
                            disabled={savingState}
                            onClick={() => void handleConfirmSave()}
                        >
                            {savingState ? (
                                <Loader2Icon className="mr-2 size-4 animate-spin"/>
                            ) : null}
                            {dialogSaveLabel}
                        </AlertDialogAction>
                        <Button
                            disabled={savingState}
                            variant="destructive"
                            onClick={handleConfirmDiscard}
                        >
                            {dialogDiscardLabel}
                        </Button>
                        <AlertDialogCancel
                            className="mt-0"
                            disabled={savingState}
                        >
                            {dialogCancelLabel}
                        </AlertDialogCancel>
                    </div>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
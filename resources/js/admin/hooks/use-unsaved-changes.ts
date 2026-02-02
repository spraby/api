import * as React from 'react';

import isEqual from 'lodash-es/isEqual';

export interface UseUnsavedChangesOptions<T> {
    /** Initial/saved state to compare against */
    initialData: T;
    /** Current form data */
    currentData: T;
    /** Called when user confirms save */
    onSave: () => void | Promise<void>;
    /** Called when user discards changes */
    onDiscard: () => void;
    /** Enable keyboard shortcuts (Ctrl+S to save, Escape to discard) */
    enableKeyboardShortcuts?: boolean;
}

export interface UseUnsavedChangesResult {
    /** Whether there are unsaved changes */
    hasChanges: boolean;
    /** Whether save operation is in progress */
    isSaving: boolean;
    /** Trigger save action */
    save: () => Promise<void>;
    /** Trigger discard action */
    discard: () => void;
}

export function useUnsavedChanges<T>({
    initialData,
    currentData,
    onSave,
    onDiscard,
    enableKeyboardShortcuts = true,
}: UseUnsavedChangesOptions<T>): UseUnsavedChangesResult {
    const [isSaving, setIsSaving] = React.useState(false);

    const hasChanges = React.useMemo(
        () => !isEqual(initialData, currentData),
        [initialData, currentData]
    );

    const save = React.useCallback(async () => {
        if (!hasChanges || isSaving) {return;}

        setIsSaving(true);
        try {
            await onSave();
        } finally {
            setIsSaving(false);
        }
    }, [hasChanges, isSaving, onSave]);

    const discard = React.useCallback(() => {
        if (isSaving) {return;}
        onDiscard();
    }, [isSaving, onDiscard]);

    // Keyboard shortcuts
    React.useEffect(() => {
        if (!enableKeyboardShortcuts) {return;}

        const handleKeyDown = (e: KeyboardEvent) => {
            // Ctrl+S or Cmd+S to save
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                if (hasChanges && !isSaving) {
                    void save();
                }
            }

            // Escape to discard (only if there are changes)
            if (e.key === 'Escape' && hasChanges && !isSaving) {
                e.preventDefault();
                discard();
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [enableKeyboardShortcuts, hasChanges, isSaving, save, discard]);

    return {
        hasChanges,
        isSaving,
        save,
        discard,
    };
}
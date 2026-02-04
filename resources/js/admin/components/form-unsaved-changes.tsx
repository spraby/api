import * as React from 'react';

import {UnsavedChangesBar} from '@/components/unsaved-changes-bar';
import {useUnsavedChanges} from '@/hooks/use-unsaved-changes';

export interface FormUnsavedChangesProps<T> {
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
    /** Save button label */
    saveLabel?: string;
    /** Discard button label */
    discardLabel?: string;
    /** Additional CSS classes for the bar */
    className?: string;
}

/**
 * Combined component that tracks form changes and shows save/discard bar.
 *
 * @example
 * ```tsx
 * const [initialData] = useState(product);
 * const [formData, setFormData] = useState(product);
 *
 * <FormUnsavedChanges
 *   initialData={initialData}
 *   currentData={formData}
 *   onSave={() => router.post('/save', formData)}
 *   onDiscard={() => setFormData(initialData)}
 * />
 * ```
 */
export function FormUnsavedChanges<T>({
    initialData,
    currentData,
    onSave,
    onDiscard,
    enableKeyboardShortcuts = true,
    saveLabel,
    discardLabel,
    className,
}: FormUnsavedChangesProps<T>) {
    const {hasChanges, isSaving, save, discard} = useUnsavedChanges({
        initialData,
        currentData,
        onSave,
        onDiscard,
        enableKeyboardShortcuts,
    });

    return (
        <UnsavedChangesBar
            className={className}
            discardLabel={discardLabel}
            hasChanges={hasChanges}
            isSaving={isSaving}
            saveLabel={saveLabel}
            onDiscard={discard}
            onSave={save}
        />
    );
}
import {useEffect} from 'react';

import {create} from 'zustand';

interface SaveBarState {
    hasChanges: boolean;
    isSaving: boolean;
    onSave: (() => boolean | Promise<boolean>) | null;
    onDiscard: (() => void) | null;

    set: (state: Partial<Pick<SaveBarState, 'hasChanges' | 'isSaving'>>) => void;
    register: (callbacks: {onSave: () => boolean | Promise<boolean>; onDiscard: () => void}) => void;
    reset: () => void;
}

export const useSaveBarStore = create<SaveBarState>((set) => ({
    hasChanges: false,
    isSaving: false,
    onSave: null,
    onDiscard: null,

    set: (partial) => set(partial),

    register: ({onSave, onDiscard}) => set({onSave, onDiscard}),

    reset: () => set({hasChanges: false, isSaving: false, onSave: null, onDiscard: null}),
}));

interface UseSaveBarOptions {
    hasChanges: boolean;
    isSaving: boolean;
    onSave: () => boolean | Promise<boolean>;
    onDiscard: () => void;
}

export function useSaveBar({hasChanges, isSaving, onSave, onDiscard}: UseSaveBarOptions) {
    useEffect(() => {
        useSaveBarStore.getState().register({onSave, onDiscard});
    }, [onSave, onDiscard]);

    useEffect(() => {
        useSaveBarStore.getState().set({hasChanges, isSaving});
    }, [hasChanges, isSaving]);

    useEffect(() => {
        return () => useSaveBarStore.getState().reset();
    }, []);
}
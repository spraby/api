import type { ReactNode } from 'react';

import { create } from 'zustand';

interface DialogOptions {
  title?: string;
  description?: string;
  content: ReactNode;
  className?: string;
}

interface DialogState {
  open: boolean;
  title?: string;
  description?: string;
  content: ReactNode | null;
  className?: string;

  openDialog: (options: DialogOptions) => void;
  closeDialog: () => void;
}

export const useDialogStore = create<DialogState>((set) => ({
  open: false,
  title: undefined,
  description: undefined,
  content: null,
  className: undefined,

  openDialog: ({ title, description, content, className }) =>
    set({ open: true, title, description, content, className }),

  closeDialog: () =>
    set({
      open: false,
      title: undefined,
      description: undefined,
      content: null,
      className: undefined,
    }),
}));

export function useDialog() {
  const openDialog = useDialogStore((s) => s.openDialog);
  const closeDialog = useDialogStore((s) => s.closeDialog);

  return { openDialog, closeDialog };
}

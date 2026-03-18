import type { ReactNode } from 'react';

import { create } from 'zustand';

interface DialogOptions {
  title?: string;
  description?: string;
  content: ReactNode;
  footer?: ReactNode;
  className?: string;
}

interface DialogState {
  open: boolean;
  title?: string;
  description?: string;
  content: ReactNode | null;
  footer?: ReactNode;
  className?: string;

  openDialog: (options: DialogOptions) => void;
  closeDialog: () => void;
}

export const useDialogStore = create<DialogState>((set) => ({
  open: false,
  title: undefined,
  description: undefined,
  content: null,
  footer: undefined,
  className: undefined,

  openDialog: ({ title, description, content, footer, className }) =>
    set({ open: true, title, description, content, footer, className }),

  closeDialog: () =>
    set({
      open: false,
      title: undefined,
      description: undefined,
      content: null,
      footer: undefined,
      className: undefined,
    }),
}));

export function useDialog() {
  const openDialog = useDialogStore((s) => s.openDialog);
  const closeDialog = useDialogStore((s) => s.closeDialog);

  return { openDialog, closeDialog };
}

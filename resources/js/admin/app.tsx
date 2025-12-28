import { createInertiaApp } from '@inertiajs/react';
import { ComponentType } from 'react';
import { createRoot } from 'react-dom/client';

import { Toaster } from '@/components/ui/sonner';

interface PageModule {
  default: ComponentType;
}

createInertiaApp({
  resolve: (name) => {
    const pages = import.meta.glob<PageModule>('./Pages/**/*.tsx', { eager: true });
    return pages[`./Pages/${name}.tsx`].default;
  },
  setup({ el, App, props }) {
    createRoot(el).render(
      <>
        <App {...props} />
        <Toaster />
      </>
    );
  },
  progress: {
    color: '#4B5563',
  },
});
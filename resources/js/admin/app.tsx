import { createInertiaApp } from '@inertiajs/react';
import { ThemeProvider } from 'next-themes';
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
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <App {...props} />
        <Toaster />
      </ThemeProvider>
    );
  },
  progress: {
    color: '#4B5563',
  },
});
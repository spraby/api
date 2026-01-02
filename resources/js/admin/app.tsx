import type { ComponentType } from 'react';

import { createInertiaApp } from '@inertiajs/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ThemeProvider } from 'next-themes';
import { createRoot } from 'react-dom/client';

import { Toaster } from '@/components/ui/sonner';
import { queryClient } from '@/lib/api/query-client';

interface PageModule {
  default: ComponentType;
}

void createInertiaApp({
  resolve: (name) => {
    const pages = import.meta.glob<PageModule>('./Pages/**/*.tsx', { eager: true });

    return pages[`./Pages/${name}.tsx`].default;
  },
  // eslint-disable-next-line @typescript-eslint/naming-convention
  setup({ el, App, props }) {
    createRoot(el).render(
      <QueryClientProvider client={queryClient}>
        <ThemeProvider enableSystem attribute="class" defaultTheme="system">
          <App {...props} />
          <Toaster />
        </ThemeProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    );
  },
  progress: {
    color: '#4B5563',
  },
});
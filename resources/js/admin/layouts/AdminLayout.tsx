import { Head } from '@inertiajs/react';
import { ReactNode } from 'react';

import Sidebar from '../components/Sidebar.tsx';

interface AdminLayoutProps {
  children: ReactNode;
  title?: string;
}

export default function AdminLayout({ children, title }: AdminLayoutProps) {
  return (
    <>
      {title && <Head title={title} />}

      <div className="flex h-screen overflow-hidden bg-(--background)">
        <Sidebar />

        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto p-6">
            {children}
          </div>
        </main>
      </div>
    </>
  );
}

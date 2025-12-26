import { Link, usePage, useForm } from '@inertiajs/react';

import { cn } from '../lib/utils.ts';

import { PageProps } from '@/types/inertia';

interface MenuItem {
  name: string;
  href: string;
  icon: string;
}

const Sidebar = () => {
  const { url } = usePage();

  const menuItems: MenuItem[] = [
    { name: 'Dashboard', href: '/sb/admin', icon: '📊' },
    { name: 'Users', href: '/sb/admin/users', icon: '👥' },
  ];

  const isActive = (href: string): boolean => {
    if (href === '/sb/admin') {
      return url === '/sb/admin' || url === '/sb/admin/dashboard';
    }
    return url.startsWith(href);
  };

  return (
    <div className="flex h-screen w-64 flex-col border-r border-(--border) bg-(--sidebar-background)">
      {/* Logo/Header */}
      <div className="flex h-16 items-center border-b border-(--border) px-6">
        <h2 className="text-lg font-semibold text-(--sidebar-foreground)">
          React Admin
        </h2>
      </div>

      {/* Navigation */}
      <nav className="flex-1 gap-y-1 p-4">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-x-3 rounded-lg px-3 py-2 text-sm transition-colors',
              isActive(item.href)
                ? 'bg-(--sidebar-accent) text-(--sidebar-accent-foreground) font-medium'
                : 'text-(--sidebar-foreground) hover:bg-(--sidebar-accent) hover:text-(--sidebar-accent-foreground)'
            )}
          >
            <span className="text-lg">{item.icon}</span>
            <span>{item.name}</span>
          </Link>
        ))}
      </nav>

      {/* User Section */}
      <div className="border-t border-(--border) p-4">
        <UserSection />
      </div>
    </div>
  );
};

const UserSection = () => {
  const { auth } = usePage<PageProps>().props;
  const { post } = useForm({});

  const handleLogout = () => {
    post('/sb/admin/logout');
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-x-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-(--sidebar-accent) text-sm font-medium">
          {auth.user?.name?.charAt(0).toUpperCase() || 'U'}
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-medium text-(--sidebar-foreground)">
            {auth.user?.name || 'User'}
          </span>
          <span className="text-xs text-(--muted-foreground)">
            {auth.user?.email || 'user@example.com'}
          </span>
        </div>
      </div>
      <button
        onClick={handleLogout}
        className="rounded p-1.5 text-(--muted-foreground) hover:bg-(--sidebar-accent) hover:text-(--sidebar-accent-foreground)"
        title="Logout"
      >
        🚪
      </button>
    </div>
  );
};

export default Sidebar;

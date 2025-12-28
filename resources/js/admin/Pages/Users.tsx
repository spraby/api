import { usePage } from '@inertiajs/react';

import { UsersTable, type User } from "@/components/users-table"
import { useLang } from '@/lib/lang';
import { PageProps } from '@/types/inertia';

import AdminLayout from '../layouts/AdminLayout.tsx';

interface UsersPageProps extends PageProps {
  users: User[];
}

export default function Users() {
  const { users } = usePage<UsersPageProps>().props;
  const { __ } = useLang();

  return (
    <AdminLayout title={__('admin.users.title')}>
        <div className="@container/main flex flex-1 flex-col gap-4 p-3 sm:p-4 lg:p-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                    <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">{__('admin.users.title')}</h1>
                    <p className="text-sm text-muted-foreground">
                        {__('admin.users.description')}
                    </p>
                </div>
            </div>
            <UsersTable data={users} />
        </div>
    </AdminLayout>
  );
}
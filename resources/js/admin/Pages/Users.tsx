import { usePage } from '@inertiajs/react';

import { UsersTable, type User } from "@/components/users-table"
import { PageProps } from '@/types/inertia';

import AdminLayout from '../layouts/AdminLayout.tsx';

interface UsersPageProps extends PageProps {
  users: User[];
}

export default function Users() {
  const { users } = usePage<UsersPageProps>().props;

  return (
    <AdminLayout title="Users">
        <div className="@container/main flex flex-1 flex-col gap-4 p-4 lg:p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">Users</h1>
                    <p className="text-sm text-muted-foreground">
                        Manage users and their permissions
                    </p>
                </div>
            </div>
            <UsersTable data={users} />
        </div>
    </AdminLayout>
  );
}
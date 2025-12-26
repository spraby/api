import { Link } from '@inertiajs/react';

import { PageProps } from '@/types/inertia';
import { User } from '@/types/models.ts';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card.tsx';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table.tsx';
import AdminLayout from '../layouts/AdminLayout.tsx';


interface PaginationLink {
  url: string | null;
  label: string;
  active: boolean;
}

interface PaginatedUsers {
  data: User[];
  links?: PaginationLink[];
}

interface UsersPageProps extends PageProps {
  users: PaginatedUsers;
}

export default function Users({ users }: UsersPageProps) {
  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <AdminLayout title="Users">
      <div className="flex flex-col gap-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-(--foreground)">Users</h1>
          <p className="text-(--muted-foreground)">
            Manage all users in the system
          </p>
        </div>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Users</CardTitle>
            <CardDescription>
              Total users: {users?.data?.length || 0}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {users?.data?.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Created At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.data.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.id}</TableCell>
                      <TableCell>{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{formatDate(user.created_at)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="flex h-32 items-center justify-center text-(--muted-foreground)">
                No users found.
              </div>
            )}

            {/* Pagination */}
            {users?.links && users.links.length > 3 && (
              <div className="mt-4 flex items-center justify-center gap-x-1">
                {users.links.map((link, index) => (
                  <PaginationLinkComponent
                    key={index}
                    link={link}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}

interface PaginationLinkProps {
  link: PaginationLink;
}

function PaginationLinkComponent({ link }: PaginationLinkProps) {
  if (!link.url) {
    return (
      <span
        className="rounded border border-(--border) px-3 py-1 text-sm text-(--muted-foreground)"
        dangerouslySetInnerHTML={{ __html: link.label }}
      />
    );
  }

  return (
    <Link
      href={link.url}
      className={`rounded border px-3 py-1 text-sm transition-colors ${
        link.active
          ? 'border-(--primary) bg-(--primary) text-(--primary-foreground)'
          : 'border-(--border) text-(--foreground) hover:bg-(--muted)'
      }`}
      dangerouslySetInnerHTML={{ __html: link.label }}
    />
  );
}

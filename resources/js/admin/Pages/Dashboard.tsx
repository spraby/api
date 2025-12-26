import { usePage } from '@inertiajs/react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card.tsx';
import AdminLayout from '../layouts/AdminLayout.tsx';

import { PageProps } from '@/types/inertia';

export default function Dashboard() {
  const { auth } = usePage<PageProps>().props;

  return (
    <AdminLayout title="Dashboard">
      <div className="flex flex-col gap-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-(--foreground)">Dashboard</h1>
          <p className="text-(--muted-foreground)">
            Welcome back, {auth.user?.name || 'User'}!
          </p>
        </div>

        {/* User Info Card */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>User Information</CardTitle>
              <CardDescription>Your account details</CardDescription>
            </CardHeader>
            <CardContent>
              <dl className="flex flex-col gap-y-2">
                <div>
                  <dt className="text-sm font-medium text-(--muted-foreground)">Name</dt>
                  <dd className="text-base text-(--foreground)">{auth.user?.name || 'N/A'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-(--muted-foreground)">Email</dt>
                  <dd className="text-base text-(--foreground)">{auth.user?.email || 'N/A'}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
              <CardDescription>System overview</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-(--muted-foreground)">Status</span>
                  <span className="text-sm font-medium text-green-600">Active</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-(--muted-foreground)">Environment</span>
                  <span className="text-sm font-medium text-(--foreground)">Development</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Welcome</CardTitle>
              <CardDescription>Getting started</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-(--muted-foreground)">
                This is your React admin panel. Navigate using the sidebar to explore different sections.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}

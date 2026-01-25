import type { FormEventHandler} from 'react';
import { useEffect, useState } from 'react';

import { Link, router } from '@inertiajs/react';
import { ArrowLeftIcon, BuildingIcon, ExternalLinkIcon } from 'lucide-react';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { useUser } from '@/lib/hooks/api/useUsers';
import { useUpdateUser } from '@/lib/hooks/mutations/useUserMutations';
import { useLang } from '@/lib/lang';

import AdminLayout from '../layouts/AdminLayout';

interface UserEditProps {
  userId: number;
}

export default function UserEdit({ userId }: UserEditProps) {
  const { t } = useLang();

  // API Hooks
  const { data: user, isLoading, error } = useUser(userId);
  const updateUser = useUpdateUser();

  // Form state
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
  });

  // Update form when user data loads
  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name ?? '',
        last_name: user.last_name ?? '',
        email: user.email,
      });
    }
  }, [user]);

  const handleSubmit: FormEventHandler = (e) => {
    e.preventDefault();

    updateUser.mutate(
      {
        id: userId,
        data: formData,
      },
      {
        onSuccess: () => {
          // Redirect to users list on success
          router.visit('/sb/admin/users');
        },
      }
    );
  };

  // Loading state
  if (isLoading) {
    return (
      <AdminLayout title={t('admin.users_edit.title')}>
        <div className="@container/main flex flex-1 flex-col gap-4 p-3 sm:p-4 lg:p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-64" />
            </div>
          </div>
          <Skeleton className="h-96 w-full" />
        </div>
      </AdminLayout>
    );
  }

  // Error state
  if (error) {
    return (
      <AdminLayout title={t('admin.users_edit.title')}>
        <div className="@container/main flex flex-1 flex-col gap-4 p-3 sm:p-4 lg:p-6">
          <Alert variant="destructive">
            <AlertDescription>{error.message}</AlertDescription>
          </Alert>
          <Button variant="outline" onClick={() => { router.visit('/sb/admin/users'); }}>
            <ArrowLeftIcon className="mr-2 size-4" />
            {t('admin.users_edit.actions.back')}
          </Button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title={t('admin.users_edit.title')}>
      <div className="@container/main flex flex-1 flex-col gap-4 p-3 sm:p-4 lg:p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Button
                className="size-8"
                size="icon"
                variant="ghost"
                onClick={() => { router.visit('/sb/admin/users'); }}
              >
                <ArrowLeftIcon className="size-4" />
              </Button>
              <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
                {t('admin.users_edit.title')}
              </h1>
            </div>
            <p className="pl-10 text-sm text-muted-foreground">
              {t('admin.users_edit.description')}
            </p>
          </div>
        </div>

        <div className="rounded-lg border bg-card">
          <form className="space-y-6 p-4 sm:p-6" onSubmit={handleSubmit}>
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="flex items-center gap-1" htmlFor="first_name">
                  {t('admin.users_edit.fields.first_name')}
                  <span className="text-destructive">*</span>
                </Label>
                <Input
                  required
                  disabled={updateUser.isPending}
                  id="first_name"
                  placeholder={t('admin.users_edit.placeholders.first_name')}
                  type="text"
                  value={formData.first_name}
                  onChange={(e) => { setFormData({ ...formData, first_name: e.target.value }); }}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="last_name">{t('admin.users_edit.fields.last_name')}</Label>
                <Input
                  disabled={updateUser.isPending}
                  id="last_name"
                  placeholder={t('admin.users_edit.placeholders.last_name')}
                  type="text"
                  value={formData.last_name}
                  onChange={(e) => { setFormData({ ...formData, last_name: e.target.value }); }}
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-1" htmlFor="email">
                  {t('admin.users_edit.fields.email')}
                  <span className="text-destructive">*</span>
                </Label>
                <Input
                  required
                  disabled={updateUser.isPending}
                  id="email"
                  placeholder={t('admin.users_edit.placeholders.email')}
                  type="email"
                  value={formData.email}
                  onChange={(e) => { setFormData({ ...formData, email: e.target.value }); }}
                />
              </div>

              <div className="space-y-2">
                <Label>{t('admin.users_edit.fields.role')}</Label>
                <div className="flex h-9 items-center">
                  <Badge variant={user?.role ? 'default' : 'secondary'}>
                    {user?.role
                      ? t(`admin.users_edit.roles.${user.role}`)
                      : t('admin.users_edit.roles.none')}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">
                <span className="text-destructive">*</span> {t('admin.users_edit.required_fields')}
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                  disabled={updateUser.isPending}
                  type="button"
                  variant="outline"
                  onClick={() => { router.visit('/sb/admin/users'); }}
                >
                  {t('admin.users_edit.actions.cancel')}
                </Button>
                <Button disabled={updateUser.isPending} type="submit">
                  {updateUser.isPending
                    ? t('admin.users_edit.actions.saving')
                    : t('admin.users_edit.actions.save')}
                </Button>
              </div>
            </div>
          </form>
        </div>

        {/* Brands Section */}
        {user?.brands && user.brands.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BuildingIcon className="size-5" />
                {t('admin.users_edit.brands.title')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-2">
                {user.brands.map((brand) => (
                  <Link
                    key={brand.id}
                    href={`/sb/admin/brands/${brand.id}/edit`}
                    className="flex items-center justify-between gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <BuildingIcon className="size-4 text-muted-foreground" />
                      <span className="font-medium">{brand.name}</span>
                    </div>
                    <ExternalLinkIcon className="size-4 text-muted-foreground" />
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </AdminLayout>
  );
}

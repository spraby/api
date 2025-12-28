import { router, useForm, usePage } from '@inertiajs/react';
import { ArrowLeftIcon } from 'lucide-react';
import { FormEventHandler } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useLang } from '@/lib/lang';
import { PageProps } from '@/types/inertia';

import AdminLayout from '../layouts/AdminLayout';

interface User {
  id: number;
  first_name: string | null;
  last_name: string | null;
  email: string;
  role: string | null;
}

interface UserEditPageProps extends PageProps {
  user: User;
}

export default function UserEdit() {
  const { user } = usePage<UserEditPageProps>().props;
  const { __ } = useLang();

  const { data, setData, errors, processing } = useForm({
    first_name: user.first_name || '',
    last_name: user.last_name || '',
    email: user.email,
    role: user.role || '',
  });

  const handleSubmit: FormEventHandler = (e) => {
    e.preventDefault();

    router.put(`/sb/admin/users/${user.id}`, data, {
      onError: (errors) => {
        // Show validation errors in toast
        if (errors && typeof errors === 'object') {
          Object.entries(errors).forEach(([_field, messages]) => {
            const errorMessages = Array.isArray(messages) ? messages : [messages];
            errorMessages.forEach((message) => {
              toast.error(String(message));
            });
          });
        } else {
          toast.error(__('admin.users_edit.messages.update_failed'));
        }
      },
    });
  };

  return (
    <AdminLayout title={__('admin.users_edit.title')}>
      <div className="@container/main flex flex-1 flex-col gap-4 p-3 sm:p-4 lg:p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="size-8"
                onClick={() => router.visit('/sb/admin/users')}
              >
                <ArrowLeftIcon className="size-4" />
              </Button>
              <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
                {__('admin.users_edit.title')}
              </h1>
            </div>
            <p className="pl-10 text-sm text-muted-foreground">
              {__('admin.users_edit.description')}
            </p>
          </div>
        </div>

        <div className="rounded-lg border bg-card">
          <form onSubmit={handleSubmit} className="space-y-6 p-4 sm:p-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="first_name" className="flex items-center gap-1">
                  {__('admin.users_edit.fields.first_name')}
                  <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="first_name"
                  type="text"
                  value={data.first_name}
                  onChange={(e) => setData('first_name', e.target.value)}
                  placeholder={__('admin.users_edit.placeholders.first_name')}
                  required
                  className={errors.first_name ? 'border-destructive' : ''}
                />
                {errors.first_name && (
                  <p className="text-sm text-destructive">{errors.first_name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="last_name">{__('admin.users_edit.fields.last_name')}</Label>
                <Input
                  id="last_name"
                  type="text"
                  value={data.last_name}
                  onChange={(e) => setData('last_name', e.target.value)}
                  placeholder={__('admin.users_edit.placeholders.last_name')}
                  className={errors.last_name ? 'border-destructive' : ''}
                />
                {errors.last_name && (
                  <p className="text-sm text-destructive">{errors.last_name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-1">
                  {__('admin.users_edit.fields.email')}
                  <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={data.email}
                  onChange={(e) => setData('email', e.target.value)}
                  placeholder={__('admin.users_edit.placeholders.email')}
                  required
                  className={errors.email ? 'border-destructive' : ''}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">{__('admin.users_edit.fields.role')}</Label>
                <Select
                  value={data.role || 'none'}
                  onValueChange={(value) => setData('role', value === 'none' ? '' : value)}
                >
                  <SelectTrigger id="role" className={errors.role ? 'border-destructive' : ''}>
                    <SelectValue placeholder={__('admin.users_edit.placeholders.role')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">{__('admin.users_edit.roles.none')}</SelectItem>
                    <SelectItem value="admin">{__('admin.users_edit.roles.admin')}</SelectItem>
                    <SelectItem value="manager">{__('admin.users_edit.roles.manager')}</SelectItem>
                  </SelectContent>
                </Select>
                {errors.role && (
                  <p className="text-sm text-destructive">{errors.role}</p>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">
                <span className="text-destructive">*</span> {__('admin.users_edit.required_fields')}
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.visit('/sb/admin/users')}
                  disabled={processing}
                >
                  {__('admin.users_edit.actions.cancel')}
                </Button>
                <Button type="submit" disabled={processing}>
                  {processing ? __('admin.users_edit.actions.saving') : __('admin.users_edit.actions.save')}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}
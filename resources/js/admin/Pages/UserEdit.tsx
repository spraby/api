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
          toast.error('Failed to update user. Please check the form for errors.');
        }
      },
    });
  };

  return (
    <AdminLayout title={`Edit User #${user.id}`}>
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
                Edit User
              </h1>
            </div>
            <p className="pl-10 text-sm text-muted-foreground">
              Update user information and permissions
            </p>
          </div>
        </div>

        <div className="rounded-lg border bg-card">
          <form onSubmit={handleSubmit} className="space-y-6 p-4 sm:p-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="first_name" className="flex items-center gap-1">
                  First Name
                  <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="first_name"
                  type="text"
                  value={data.first_name}
                  onChange={(e) => setData('first_name', e.target.value)}
                  placeholder="Enter first name"
                  required
                  className={errors.first_name ? 'border-destructive' : ''}
                />
                {errors.first_name && (
                  <p className="text-sm text-destructive">{errors.first_name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="last_name">Last Name</Label>
                <Input
                  id="last_name"
                  type="text"
                  value={data.last_name}
                  onChange={(e) => setData('last_name', e.target.value)}
                  placeholder="Enter last name"
                  className={errors.last_name ? 'border-destructive' : ''}
                />
                {errors.last_name && (
                  <p className="text-sm text-destructive">{errors.last_name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-1">
                  Email
                  <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={data.email}
                  onChange={(e) => setData('email', e.target.value)}
                  placeholder="user@example.com"
                  required
                  className={errors.email ? 'border-destructive' : ''}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select
                  value={data.role || 'none'}
                  onValueChange={(value) => setData('role', value === 'none' ? '' : value)}
                >
                  <SelectTrigger id="role" className={errors.role ? 'border-destructive' : ''}>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">User (No role)</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                  </SelectContent>
                </Select>
                {errors.role && (
                  <p className="text-sm text-destructive">{errors.role}</p>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">
                <span className="text-destructive">*</span> Required fields
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.visit('/sb/admin/users')}
                  disabled={processing}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={processing}>
                  {processing ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}
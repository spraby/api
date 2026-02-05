import type { FormEventHandler } from 'react';
import { useState } from 'react';

import { useForm, router } from '@inertiajs/react';
import { MapPinIcon, PencilIcon, PlusIcon, Trash2Icon } from 'lucide-react';
import { toast } from 'sonner';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useLang } from '@/lib/lang';
import type { Address } from '@/types/api';

interface AddressFormData {
  name: string;
  country: string;
  province: string;
  city: string;
  zip_code: string;
  address1: string;
  address2: string;
}

const emptyAddress: AddressFormData = {
  name: '',
  country: '',
  province: '',
  city: '',
  zip_code: '',
  address1: '',
  address2: '',
};

function AddressFormFields({
  data,
  setData,
  errors,
  t,
}: {
  data: AddressFormData;
  setData: (key: keyof AddressFormData, value: string) => void;
  errors: Partial<Record<keyof AddressFormData, string>>;
  t: (key: string) => string;
}) {
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="name">{t('admin.settings_addresses.fields.name')}</Label>
          <Input
            id="name"
            value={data.name}
            onChange={(e) => setData('name', e.target.value)}
            className={errors.name ? 'border-destructive' : ''}
          />
          {errors.name ? <p className="text-xs text-destructive">{errors.name}</p> : null}
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="country">
            {t('admin.settings_addresses.fields.country')} <span className="text-destructive">*</span>
          </Label>
          <Input
            id="country"
            value={data.country}
            onChange={(e) => setData('country', e.target.value)}
            required
            className={errors.country ? 'border-destructive' : ''}
          />
          {errors.country ? <p className="text-xs text-destructive">{errors.country}</p> : null}
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="province">{t('admin.settings_addresses.fields.province')}</Label>
          <Input
            id="province"
            value={data.province}
            onChange={(e) => setData('province', e.target.value)}
            className={errors.province ? 'border-destructive' : ''}
          />
          {errors.province ? <p className="text-xs text-destructive">{errors.province}</p> : null}
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="city">
            {t('admin.settings_addresses.fields.city')} <span className="text-destructive">*</span>
          </Label>
          <Input
            id="city"
            value={data.city}
            onChange={(e) => setData('city', e.target.value)}
            required
            className={errors.city ? 'border-destructive' : ''}
          />
          {errors.city ? <p className="text-xs text-destructive">{errors.city}</p> : null}
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="zip_code">{t('admin.settings_addresses.fields.zip_code')}</Label>
          <Input
            id="zip_code"
            value={data.zip_code}
            onChange={(e) => setData('zip_code', e.target.value)}
            className={errors.zip_code ? 'border-destructive' : ''}
          />
          {errors.zip_code ? <p className="text-xs text-destructive">{errors.zip_code}</p> : null}
        </div>
      </div>

      <Separator />

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="address1">{t('admin.settings_addresses.fields.address1')}</Label>
          <Input
            id="address1"
            value={data.address1}
            onChange={(e) => setData('address1', e.target.value)}
            className={errors.address1 ? 'border-destructive' : ''}
          />
          {errors.address1 ? <p className="text-xs text-destructive">{errors.address1}</p> : null}
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="address2">{t('admin.settings_addresses.fields.address2')}</Label>
          <Input
            id="address2"
            value={data.address2}
            onChange={(e) => setData('address2', e.target.value)}
            className={errors.address2 ? 'border-destructive' : ''}
          />
          {errors.address2 ? <p className="text-xs text-destructive">{errors.address2}</p> : null}
        </div>
      </div>
    </>
  );
}

function AddressCreateForm({
  onCancel,
  t,
}: {
  onCancel: () => void;
  t: (key: string) => string;
}) {
  const { data, setData, post, processing, errors, reset } = useForm<AddressFormData>(emptyAddress);

  const onSubmit: FormEventHandler = (e) => {
    e.preventDefault();
    post(route('admin.settings.addresses.store'), {
      preserveState: true,
      preserveScroll: true,
      onSuccess: () => {
        reset();
        onCancel();
        toast.success(t('admin.settings_addresses.messages.added'));
      },
    });
  };

  return (
    <div className="rounded-lg border p-4">
      <p className="mb-3 text-sm font-medium">{t('admin.settings_addresses.new_address')}</p>
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <AddressFormFields data={data} setData={setData} errors={errors} t={t} />
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            {t('admin.settings_addresses.actions.cancel')}
          </Button>
          <Button type="submit" disabled={processing}>
            {processing
              ? t('admin.settings_addresses.actions.adding')
              : t('admin.settings_addresses.actions.add')}
          </Button>
        </div>
      </form>
    </div>
  );
}

function AddressEditForm({
  address,
  onCancel,
  t,
}: {
  address: Address;
  onCancel: () => void;
  t: (key: string) => string;
}) {
  const { data, setData, put, processing, errors } = useForm<AddressFormData>({
    name: address.name ?? '',
    country: address.country,
    province: address.province ?? '',
    city: address.city,
    zip_code: address.zip_code ?? '',
    address1: address.address1 ?? '',
    address2: address.address2 ?? '',
  });

  const onSubmit: FormEventHandler = (e) => {
    e.preventDefault();
    put(route('admin.settings.addresses.update', { id: address.id }), {
      preserveState: true,
      preserveScroll: true,
      onSuccess: () => {
        onCancel();
        toast.success(t('admin.settings_addresses.messages.updated'));
      },
    });
  };

  return (
    <div className="rounded-lg border p-4">
      <p className="mb-3 text-sm font-medium">{t('admin.settings_addresses.edit_address')}</p>
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <AddressFormFields data={data} setData={setData} errors={errors} t={t} />
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            {t('admin.settings_addresses.actions.cancel')}
          </Button>
          <Button type="submit" disabled={processing}>
            {processing
              ? t('admin.settings_addresses.actions.saving')
              : t('admin.settings_addresses.actions.save')}
          </Button>
        </div>
      </form>
    </div>
  );
}

function AddressCard({
  address,
  onEdit,
  t,
}: {
  address: Address;
  onEdit: () => void;
  t: (key: string) => string;
}) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = () => {
    setIsDeleting(true);
    router.delete(route('admin.settings.addresses.destroy', { id: address.id }), {
      preserveState: true,
      preserveScroll: true,
      onSuccess: () => {
        toast.success(t('admin.settings_addresses.messages.deleted'));
      },
      onError: () => {
        toast.error(t('admin.settings_addresses.messages.delete_error'));
      },
      onFinish: () => {
        setIsDeleting(false);
      },
    });
  };

  const formattedAddress = [
    address.address1,
    address.address2,
    address.city,
    address.province,
    address.zip_code,
    address.country,
  ]
    .filter(Boolean)
    .join(', ');

  return (
    <div className="flex items-start gap-3 rounded-lg border p-4">
      <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md bg-muted">
        <MapPinIcon className="size-4 text-muted-foreground" />
      </div>
      <div className="min-w-0 flex-1">
        {address.name ? (
          <p className="text-sm font-medium">{address.name}</p>
        ) : null}
        <p className="text-sm text-muted-foreground">{formattedAddress}</p>
      </div>
      <div className="flex shrink-0 gap-1">
        <Button variant="ghost" size="icon" className="size-8" onClick={onEdit}>
          <PencilIcon className="size-3.5" />
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="icon" className="size-8" disabled={isDeleting}>
              <Trash2Icon className="size-3.5" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('admin.settings_addresses.actions.delete')}</AlertDialogTitle>
              <AlertDialogDescription>
                {t('admin.settings_addresses.confirm_delete')}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t('admin.settings_addresses.actions.cancel')}</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete}>
                {t('admin.settings_addresses.actions.delete')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}

export default function AddressesSection({ addresses }: { addresses: Address[] }) {
  const { t } = useLang();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div className="flex flex-col gap-1.5">
          <CardTitle>{t('admin.settings_addresses.title')}</CardTitle>
          <CardDescription>{t('admin.settings_addresses.description')}</CardDescription>
        </div>
        {!showCreateForm ? (
          <Button size="sm" onClick={() => setShowCreateForm(true)}>
            <PlusIcon className="mr-1.5 size-4" />
            {t('admin.settings_addresses.actions.add')}
          </Button>
        ) : null}
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {showCreateForm ? (
          <AddressCreateForm
            onCancel={() => setShowCreateForm(false)}
            t={t}
          />
        ) : null}

        {!addresses.length && !showCreateForm ? (
          <p className="text-sm text-muted-foreground">
            {t('admin.settings_addresses.no_addresses')}
          </p>
        ) : null}

        {addresses.map((address) =>
          editingId === address.id ? (
            <AddressEditForm
              key={address.id}
              address={address}
              onCancel={() => setEditingId(null)}
              t={t}
            />
          ) : (
            <AddressCard
              key={address.id}
              address={address}
              onEdit={() => setEditingId(address.id)}
              t={t}
            />
          ),
        )}
      </CardContent>
    </Card>
  );
}

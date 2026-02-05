import type { FormEventHandler } from 'react';
import { useState } from 'react';

import { useForm, router } from '@inertiajs/react';
import { PencilIcon, Trash2Icon } from 'lucide-react';
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

  return (
    <div className="flex items-start justify-between gap-4 rounded-lg border p-4">
      <div className="min-w-0 flex-1">
        {address.name ? (
          <p className="font-medium">{address.name}</p>
        ) : null}
        <p className="text-sm text-muted-foreground">
          {[
            address.address1,
            address.address2,
            address.city,
            address.province,
            address.zip_code,
            address.country,
          ]
            .filter(Boolean)
            .join(', ')}
        </p>
      </div>
      <div className="flex shrink-0 gap-1">
        <Button variant="ghost" size="icon" onClick={onEdit}>
          <PencilIcon className="size-4" />
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="icon" disabled={isDeleting}>
              <Trash2Icon className="size-4" />
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
  const { data, setData, post, processing, errors, reset } = useForm<AddressFormData>(emptyAddress);
  const [editingId, setEditingId] = useState<number | null>(null);

  const onSubmitCreate: FormEventHandler = (e) => {
    e.preventDefault();
    post(route('admin.settings.addresses.store'), {
      preserveState: true,
      preserveScroll: true,
      onSuccess: () => {
        reset();
        toast.success(t('admin.settings_addresses.messages.added'));
      },
    });
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Existing addresses */}
      <Card>
        <CardHeader>
          <CardTitle>{t('admin.settings_addresses.title')}</CardTitle>
          <CardDescription>{t('admin.settings_addresses.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          {!addresses.length ? (
            <p className="text-sm text-muted-foreground">
              {t('admin.settings_addresses.no_addresses')}
            </p>
          ) : (
            <div className="grid gap-3">
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
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add new address form */}
      <Card>
        <CardHeader>
          <CardTitle>{t('admin.settings_addresses.new_address')}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmitCreate} className="flex flex-col gap-4">
            <AddressFormFields data={data} setData={setData} errors={errors} t={t} />
            <div className="flex justify-end">
              <Button type="submit" disabled={processing}>
                {processing
                  ? t('admin.settings_addresses.actions.adding')
                  : t('admin.settings_addresses.actions.add')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

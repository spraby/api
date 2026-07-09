import {useState} from 'react';

import {router} from '@inertiajs/react';
import {PlusIcon, Trash2Icon} from 'lucide-react';
import {toast} from 'sonner';

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
import {Button} from '@/components/ui/button';
import {Card, CardContent} from '@/components/ui/card';
import {Checkbox} from '@/components/ui/checkbox';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Switch} from '@/components/ui/switch';
import {Textarea} from '@/components/ui/textarea';
import {useLang} from '@/lib/lang';
import type {ShippingFieldDef, ShippingMethodConstructor} from '@/types/api';

interface ConstructorFormState {
  name: string;
  description: string;
  active: boolean;
  position: number;
  merchant_fields: string[];
  customer_fields: string[];
}

function FieldsPanel({
  idPrefix,
  title,
  description,
  catalog,
  selected,
  disabled,
  onToggle,
}: {
  idPrefix: string;
  title: string;
  description: string;
  catalog: ShippingFieldDef[];
  selected: string[];
  disabled: boolean;
  onToggle: (key: string, checked: boolean) => void;
}) {
  return (
    <div className="flex-1 rounded-lg border p-4">
      <p className="text-sm font-semibold">{title}</p>
      <p className="mb-3 text-xs text-muted-foreground">{description}</p>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {catalog.map((field) => (
          <div key={field.key} className="flex items-center space-x-2">
            <Checkbox
              id={`${idPrefix}-${field.key}`}
              checked={selected.includes(field.key)}
              disabled={disabled}
              onCheckedChange={(checked) => onToggle(field.key, checked === true)}
            />
            <Label
              htmlFor={`${idPrefix}-${field.key}`}
              className="cursor-pointer text-sm font-normal leading-tight"
            >
              {field.name}
            </Label>
          </div>
        ))}
      </div>
    </div>
  );
}

function ConstructorCard({
  constructor: initial,
  cardId,
  merchantCatalog,
  customerCatalog,
  onDiscardDraft,
}: {
  constructor: ShippingMethodConstructor | null;
  // Уникален в пределах страницы (id конструктора или ключ черновика) — от него
  // строятся DOM id инпутов, иначе label из одной карточки цеплял бы чужой инпут
  cardId: string;
  merchantCatalog: ShippingFieldDef[];
  customerCatalog: ShippingFieldDef[];
  onDiscardDraft?: () => void;
}) {
  const {t} = useLang();
  const [form, setForm] = useState<ConstructorFormState>({
    name: initial?.name ?? '',
    description: initial?.description ?? '',
    active: initial?.active ?? false,
    position: initial?.position ?? 0,
    merchant_fields: initial?.merchant_fields ?? [],
    customer_fields: initial?.customer_fields ?? [],
  });
  const [isSaving, setIsSaving] = useState(false);

  const isNew = initial === null;

  const set = <K extends keyof ConstructorFormState>(key: K, value: ConstructorFormState[K]) => {
    setForm((prev) => ({...prev, [key]: value}));
  };

  const toggleField = (panel: 'merchant_fields' | 'customer_fields') => (key: string, checked: boolean) => {
    setForm((prev) => ({
      ...prev,
      [panel]: checked ? [...prev[panel], key] : prev[panel].filter((k) => k !== key),
    }));
  };

  const handleSave = () => {
    setIsSaving(true);

    const payload = {
      ...form,
      description: form.description.trim() === '' ? null : form.description,
    };

    const options = {
      preserveScroll: true,
      onSuccess: () => {
        toast.success(t(isNew
          ? 'admin.shipping_constructors.messages.created'
          : 'admin.shipping_constructors.messages.updated'));
        onDiscardDraft?.();
      },
      onError: (errors: Record<string, string>) => {
        const message = Object.values(errors)[0];

        if (message) {
          toast.error(message);
        }
      },
      onFinish: () => setIsSaving(false),
    };

    if (isNew) {
      router.post(route('admin.settings.shipping-constructors.store'), payload, options);
    } else {
      router.put(route('admin.settings.shipping-constructors.update', initial.id), payload, options);
    }
  };

  const handleDelete = () => {
    if (isNew) {
      onDiscardDraft?.();

      return;
    }

    setIsSaving(true);
    router.delete(route('admin.settings.shipping-constructors.destroy', initial.id), {
      preserveScroll: true,
      onSuccess: () => {
        toast.success(t('admin.shipping_constructors.messages.deleted'));
      },
      onFinish: () => setIsSaving(false),
    });
  };

  return (
    <Card>
      <CardContent className="flex flex-col gap-4 pt-6">
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="flex-1 space-y-2">
            <Label htmlFor={`ctor-name-${cardId}`}>
              {t('admin.shipping_constructors.fields.name')}
            </Label>
            <Input
              id={`ctor-name-${cardId}`}
              value={form.name}
              disabled={isSaving}
              onChange={(e) => set('name', e.target.value)}
            />
          </div>
          <div className="w-full space-y-2 sm:w-32">
            <Label htmlFor={`ctor-position-${cardId}`}>
              {t('admin.shipping_constructors.fields.position')}
            </Label>
            <Input
              id={`ctor-position-${cardId}`}
              type="number"
              min={0}
              value={form.position}
              disabled={isSaving}
              onChange={(e) => set('position', Math.max(0, parseInt(e.target.value, 10) || 0))}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor={`ctor-description-${cardId}`}>
            {t('admin.shipping_constructors.fields.description')}
          </Label>
          <Textarea
            id={`ctor-description-${cardId}`}
            value={form.description}
            disabled={isSaving}
            onChange={(e) => set('description', e.target.value)}
          />
        </div>

        <div className="flex items-center justify-between rounded-lg border px-4 py-3">
          <Label htmlFor={`ctor-active-${cardId}`} className="cursor-pointer">
            {t('admin.shipping_constructors.fields.active')}
          </Label>
          <Switch
            id={`ctor-active-${cardId}`}
            checked={form.active}
            disabled={isSaving}
            onCheckedChange={(checked) => set('active', checked)}
          />
        </div>

        <div className="flex flex-col gap-4 lg:flex-row">
          <FieldsPanel
            idPrefix={`merchant-${cardId}`}
            title={t('admin.shipping_constructors.merchant_fields.title')}
            description={t('admin.shipping_constructors.merchant_fields.description')}
            catalog={merchantCatalog}
            selected={form.merchant_fields}
            disabled={isSaving}
            onToggle={toggleField('merchant_fields')}
          />
          <FieldsPanel
            idPrefix={`customer-${cardId}`}
            title={t('admin.shipping_constructors.customer_fields.title')}
            description={t('admin.shipping_constructors.customer_fields.description')}
            catalog={customerCatalog}
            selected={form.customer_fields}
            disabled={isSaving}
            onToggle={toggleField('customer_fields')}
          />
        </div>

        <div className="flex items-center justify-between">
          {isNew ? (
            <Button variant="ghost" disabled={isSaving} onClick={handleDelete}>
              {t('admin.shipping_constructors.actions.cancel')}
            </Button>
          ) : (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" className="text-destructive hover:text-destructive" disabled={isSaving}>
                  <Trash2Icon className="mr-2 size-4"/>
                  {t('admin.shipping_constructors.actions.delete')}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    {t('admin.shipping_constructors.delete_confirm.title')}
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    {t('admin.shipping_constructors.delete_confirm.description')}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>
                    {t('admin.shipping_constructors.actions.cancel')}
                  </AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    onClick={handleDelete}
                  >
                    {t('admin.shipping_constructors.actions.delete')}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}

          <Button disabled={isSaving || form.name.trim() === ''} onClick={handleSave}>
            {isSaving
              ? t('admin.shipping_constructors.actions.saving')
              : t('admin.shipping_constructors.actions.save')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ShippingConstructorsSection({
  constructors,
  merchantCatalog,
  customerCatalog,
}: {
  constructors: ShippingMethodConstructor[];
  merchantCatalog: ShippingFieldDef[];
  customerCatalog: ShippingFieldDef[];
}) {
  const {t} = useLang();
  const [draftIds, setDraftIds] = useState<number[]>([]);

  const addDraft = () => {
    setDraftIds((prev) => [...prev, prev.length === 0 ? 1 : Math.max(...prev) + 1]);
  };

  const removeDraft = (draftId: number) => {
    setDraftIds((prev) => prev.filter((id) => id !== draftId));
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold">{t('admin.shipping_constructors.title')}</h2>
          <p className="text-sm text-muted-foreground">
            {t('admin.shipping_constructors.description')}
          </p>
        </div>
        <Button onClick={addDraft}>
          <PlusIcon className="mr-2 size-4"/>
          {t('admin.shipping_constructors.add')}
        </Button>
      </div>

      {constructors.length === 0 && draftIds.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {t('admin.shipping_constructors.no_constructors')}
        </p>
      ) : null}

      {constructors.map((constructor) => (
        <ConstructorCard
          key={constructor.id}
          constructor={constructor}
          cardId={`ctor-${constructor.id}`}
          merchantCatalog={merchantCatalog}
          customerCatalog={customerCatalog}
        />
      ))}

      {draftIds.map((draftId) => (
        <ConstructorCard
          key={`draft-${draftId}`}
          constructor={null}
          cardId={`draft-${draftId}`}
          merchantCatalog={merchantCatalog}
          customerCatalog={customerCatalog}
          onDiscardDraft={() => removeDraft(draftId)}
        />
      ))}
    </div>
  );
}

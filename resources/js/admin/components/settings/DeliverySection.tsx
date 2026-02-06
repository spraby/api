import {useState} from 'react';

import {router} from '@inertiajs/react';
import {toast} from 'sonner';

import {Button} from '@/components/ui/button';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Checkbox} from '@/components/ui/checkbox';
import {Label} from '@/components/ui/label';
import {useLang} from '@/lib/lang';
import type {ShippingMethod} from '@/types/api';

export default function DeliverySection({
  shippingMethods,
  allShippingMethods,
}: {
  shippingMethods: ShippingMethod[];
  allShippingMethods: ShippingMethod[];
}) {
  const {t} = useLang();
  const initialIds = shippingMethods.map((m) => m.id);
  const [selectedIds, setSelectedIds] = useState<number[]>(initialIds);
  const [isSaving, setIsSaving] = useState(false);

  const hasChanges =
    selectedIds.length !== initialIds.length ||
    selectedIds.some((id) => !initialIds.includes(id));

  const handleToggle = (methodId: number, checked: boolean) => {
    setSelectedIds((prev) =>
      checked ? [...prev, methodId] : prev.filter((id) => id !== methodId),
    );
  };

  const handleSave = () => {
    setIsSaving(true);

    router.put(
      route('admin.settings.shipping-methods.sync'),
      {shipping_method_ids: selectedIds},
      {
        preserveScroll: true,
        preserveState: true,
        onSuccess: () => {
          toast.success(t('admin.settings_delivery.messages.updated'));
        },
        onFinish: () => setIsSaving(false),
      },
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('admin.settings_delivery.title')}</CardTitle>
        <CardDescription>{t('admin.settings_delivery.description')}</CardDescription>
      </CardHeader>
      <CardContent>
        {allShippingMethods.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {t('admin.settings_delivery.no_methods')}
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="space-y-3">
              {allShippingMethods.map((method) => (
                <div key={method.id} className="flex items-center space-x-3">
                  <Checkbox
                    id={`shipping-${method.id}`}
                    checked={selectedIds.includes(method.id)}
                    disabled={isSaving}
                    onCheckedChange={(checked) => handleToggle(method.id, checked === true)}
                  />
                  <Label
                    htmlFor={`shipping-${method.id}`}
                    className="cursor-pointer text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {method.name}
                  </Label>
                </div>
              ))}
            </div>

            <div className="flex justify-end">
              <Button onClick={handleSave} disabled={isSaving || !hasChanges}>
                {isSaving
                  ? t('admin.settings_delivery.actions.saving')
                  : t('admin.settings_delivery.actions.save')}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

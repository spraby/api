import { useEffect, useState } from 'react';

import { router } from '@inertiajs/react';
import {
  CheckIcon,
  CircleDollarSignIcon,
  PencilIcon,
  PhoneIcon,
  TruckIcon,
  UserIcon,
  XIcon,
} from 'lucide-react';
import { toast } from 'sonner';

import { formatMoney } from '@/components/money';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

import { DetailRow, EditableDetailRow } from './detail-rows';

import type { AvailableShippingMethod, OrderShipping, OrderShowData, TFunction } from './types';

type ShippingDraft = Pick<OrderShipping, 'name' | 'phone' | 'note' | 'shipping_method_id' | 'customer_settings'>;

type ShippingPayload = ShippingDraft;

export function OrderShippingCard({
  order,
  shippingMethods,
  t,
}: {
  order: OrderShowData;
  shippingMethods: AvailableShippingMethod[];
  t: TFunction;
}) {
  const [shippingPriceInput, setShippingPriceInput] = useState(order.shipping_price ?? '');
  const [savingShippingPrice, setSavingShippingPrice] = useState(false);
  const [editingShippingPrice, setEditingShippingPrice] = useState(false);
  const [editingShippingBlock, setEditingShippingBlock] = useState(false);
  const [shippingDrafts, setShippingDrafts] = useState<Record<number, ShippingDraft>>({});
  const [savingShippingBlock, setSavingShippingBlock] = useState(false);

  useEffect(() => {
    setShippingPriceInput(order.shipping_price ?? '');
  }, [order.shipping_price]);

  const shippingValueToText = (value: string | string[] | null | undefined) => {
    return Array.isArray(value) ? value.join(', ') : (value ?? '');
  };

  const normalizedCustomerSettings = (shipping: OrderShipping) => {
    return shipping.customer_settings.map((field) => ({
      key: field.key,
      name: field.name,
      type: field.type ?? 'string',
      value: field.value,
    }));
  };

  const draftFromShipping = (shipping: OrderShipping): ShippingDraft => ({
    name: shipping.name,
    phone: shipping.phone,
    note: shipping.note ?? '',
    shipping_method_id: shipping.shipping_method_id,
    customer_settings: normalizedCustomerSettings(shipping),
  });

  const availableShippingMethodId = (methodId: number | null) => {
    return methodId && shippingMethods.some((method) => method.id === methodId)
      ? methodId
      : null;
  };

  const payloadFromDraft = (draft: ShippingDraft): ShippingPayload => ({
    name: draft.name.trim(),
    phone: draft.phone.trim(),
    note: draft.note.trim(),
    shipping_method_id: availableShippingMethodId(draft.shipping_method_id),
    customer_settings: draft.customer_settings.map((field) => ({
      key: field.key,
      name: field.name,
      type: field.type ?? 'string',
      value: Array.isArray(field.value)
        ? field.value.map((item) => item.trim()).filter(Boolean)
        : field.value.trim(),
    })),
  });

  const startShippingBlockEdit = () => {
    setEditingShippingPrice(false);
    setShippingPriceInput(order.shipping_price ?? '');
    setShippingDrafts(Object.fromEntries(
      order.order_shippings.map((shipping) => [shipping.id, draftFromShipping(shipping)])
    ));
    setEditingShippingBlock(true);
  };

  const cancelShippingBlockEdit = () => {
    setEditingShippingBlock(false);
    setShippingDrafts({});
  };

  const updateShippingDraft = (shippingId: number, patch: Partial<ShippingDraft>) => {
    setShippingDrafts((drafts) => {
      const draft = drafts[shippingId];

      if (!draft) {
        return drafts;
      }

      return {
        ...drafts,
        [shippingId]: {
          ...draft,
          ...patch,
        },
      };
    });
  };

  const updateShippingSetting = (
    shippingId: number,
    fieldKey: string,
    value: string | string[]
  ) => {
    setShippingDrafts((drafts) => {
      const draft = drafts[shippingId];

      if (!draft) {
        return drafts;
      }

      return {
        ...drafts,
        [shippingId]: {
          ...draft,
          customer_settings: draft.customer_settings.map((field) => (
            field.key === fieldKey ? { ...field, value } : field
          )),
        },
      };
    });
  };

  const shippingMethodSelectValue = (shipping: OrderShipping, draft?: ShippingDraft) => {
    const methodId = draft?.shipping_method_id ?? shipping.shipping_method_id;

    if (methodId && shippingMethods.some((method) => method.id === methodId)) {
      return String(methodId);
    }

    return shipping.shipping_method_name ? `current:${shipping.id}` : '';
  };

  const hasShippingChanges = (shipping: OrderShipping, payload: ShippingPayload) => {
    return JSON.stringify(payloadFromDraft(draftFromShipping(shipping))) !== JSON.stringify(payload);
  };

  const saveShippingBlock = () => {
    if (savingShippingBlock) {
      return;
    }

    const changedShippings = order.order_shippings
      .map((shipping) => {
        const draft = shippingDrafts[shipping.id];

        if (!draft) {
          return null;
        }

        const payload = payloadFromDraft(draft);

        return hasShippingChanges(shipping, payload) ? { shipping, payload } : null;
      })
      .filter((change): change is { shipping: OrderShipping; payload: ShippingPayload } => change !== null);

    if (changedShippings.length === 0) {
      cancelShippingBlockEdit();

      return;
    }

    setSavingShippingBlock(true);

    const saveNext = (index: number) => {
      const change = changedShippings[index];

      router.put(
        `/admin/orders/${order.id}/shippings/${change.shipping.id}`,
        change.payload,
        {
          preserveScroll: true,
          onSuccess: () => {
            if (index + 1 < changedShippings.length) {
              saveNext(index + 1);

              return;
            }

            toast.success(t('admin.order_show.shipping.updated'));
            cancelShippingBlockEdit();
          },
          onError: () => {
            toast.error(t('admin.order_show.shipping.update_failed'));
            setSavingShippingBlock(false);
          },
          onFinish: () => {
            if (index + 1 >= changedShippings.length) {
              setSavingShippingBlock(false);
            }
          },
        }
      );
    };

    saveNext(0);
  };

  const cancelShippingPriceEdit = () => {
    setEditingShippingPrice(false);
    setShippingPriceInput(order.shipping_price ?? '');
  };

  const saveShippingPrice = () => {
    if (shippingPriceInput === (order.shipping_price ?? '')) {
      cancelShippingPriceEdit();

      return;
    }

    setSavingShippingPrice(true);
    router.put(
      `/admin/orders/${order.id}/shipping-price`,
      { shipping_price: shippingPriceInput === '' ? null : shippingPriceInput },
      {
        preserveScroll: true,
        onSuccess: () => {
          toast.success(t('admin.order_show.shipping.price_updated'));
          cancelShippingPriceEdit();
        },
        onError: () => {
          toast.error(t('admin.order_show.status_update_failed'));
        },
        onFinish: () => setSavingShippingPrice(false),
      }
    );
  };

  const renderTextValue = (value: string | string[] | null | undefined, className?: string) => {
    const text = shippingValueToText(value).trim();

    return (
      <span className={cn("min-w-0", text ? className : "text-muted-foreground")}>
        {text || t('admin.order_show.shipping.empty')}
      </span>
    );
  };

  return (
    <Card className="rounded-lg shadow-sm">
      <CardHeader className="flex-row items-center justify-between gap-2 space-y-0 p-4 pb-2">
        <CardTitle className="text-base leading-6">{t('admin.order_show.sections.shipping')}</CardTitle>
        {order.order_shippings.length > 0 ? (
          <div className="flex items-center gap-1">
            {editingShippingBlock ? (
              <>
                <Button
                  aria-label={t('admin.order_show.shipping.save')}
                  className="size-8"
                  disabled={savingShippingBlock}
                  size="icon"
                  title={t('admin.order_show.shipping.save')}
                  type="button"
                  variant="ghost"
                  onClick={saveShippingBlock}
                >
                  <CheckIcon className="size-4 text-primary" />
                </Button>
                <Button
                  aria-label={t('admin.order_show.shipping.cancel')}
                  className="size-8"
                  disabled={savingShippingBlock}
                  size="icon"
                  title={t('admin.order_show.shipping.cancel')}
                  type="button"
                  variant="ghost"
                  onClick={cancelShippingBlockEdit}
                >
                  <XIcon className="size-4 text-muted-foreground" />
                </Button>
              </>
            ) : (
              <Button
                aria-label={t('admin.order_show.shipping.edit')}
                className="size-8 text-muted-foreground hover:text-foreground"
                size="icon"
                title={t('admin.order_show.shipping.edit')}
                type="button"
                variant="ghost"
                onClick={startShippingBlockEdit}
              >
                <PencilIcon className="size-4" />
              </Button>
            )}
          </div>
        ) : null}
      </CardHeader>
      <CardContent className="p-4 pt-0">
        {order.order_shippings.length > 0 ? (
          <div className="space-y-4">
            {order.order_shippings.map((shipping, index) => {
              const draft = shippingDrafts[shipping.id] ?? draftFromShipping(shipping);

              return (
                <div
                  key={shipping.id}
                  className={cn("space-y-3", index > 0 && "border-t pt-3")}
                >
                  <DetailRow icon={TruckIcon} label={t('admin.order_show.shipping.method')}>
                    {editingShippingBlock ? (
                      <Select
                        value={shippingMethodSelectValue(shipping, draft)}
                        onValueChange={(value) => {
                          const methodId = Number(value);

                          if (Number.isInteger(methodId)) {
                            updateShippingDraft(shipping.id, { shipping_method_id: methodId });
                          }
                        }}
                      >
                        <SelectTrigger
                          className="h-8 min-w-0 px-2 text-sm shadow-none"
                          disabled={savingShippingBlock}
                        >
                          <SelectValue placeholder={shipping.shipping_method_name || t('admin.order_show.shipping.empty')} />
                        </SelectTrigger>
                        <SelectContent>
                          {shipping.shipping_method_name
                            && !shippingMethods.some((method) => method.id === shipping.shipping_method_id) ? (
                              <SelectItem disabled value={`current:${shipping.id}`}>
                                {shipping.shipping_method_name}
                              </SelectItem>
                            ) : null}
                          {shippingMethods.map((method) => (
                            <SelectItem key={method.id} value={String(method.id)}>
                              {method.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : renderTextValue(shipping.shipping_method_name, "break-words")}
                  </DetailRow>
                  <DetailRow icon={UserIcon} label={t('admin.order_show.shipping.name')}>
                    {editingShippingBlock ? (
                      <Input
                        className="h-8 min-w-0 px-2 text-sm"
                        disabled={savingShippingBlock}
                        value={draft.name}
                        onChange={(event) => updateShippingDraft(shipping.id, { name: event.target.value })}
                      />
                    ) : renderTextValue(shipping.name, "break-words")}
                  </DetailRow>
                  <DetailRow icon={PhoneIcon} label={t('admin.order_show.shipping.phone')}>
                    {editingShippingBlock ? (
                      <Input
                        className="h-8 min-w-0 px-2 text-sm"
                        disabled={savingShippingBlock}
                        type="tel"
                        value={draft.phone}
                        onChange={(event) => updateShippingDraft(shipping.id, { phone: event.target.value })}
                      />
                    ) : renderTextValue(shipping.phone, "break-all")}
                  </DetailRow>
                  {draft.customer_settings.map((field) => (
                    <DetailRow key={field.key} label={field.name}>
                      {editingShippingBlock ? (
                        <Input
                          className="h-8 min-w-0 px-2 text-sm"
                          disabled={savingShippingBlock}
                          value={shippingValueToText(field.value)}
                          onChange={(event) => updateShippingSetting(
                            shipping.id,
                            field.key,
                            Array.isArray(field.value)
                              ? event.target.value.split(',').map((item) => item.trim()).filter(Boolean)
                              : event.target.value
                          )}
                        />
                      ) : renderTextValue(field.value, "break-words")}
                    </DetailRow>
                  ))}
                  <DetailRow label={t('admin.order_show.shipping.note')}>
                    {editingShippingBlock ? (
                      <Input
                        className="h-8 min-w-0 px-2 text-sm"
                        disabled={savingShippingBlock}
                        value={draft.note ?? ''}
                        onChange={(event) => updateShippingDraft(shipping.id, { note: event.target.value })}
                      />
                    ) : renderTextValue(shipping.note, "break-words font-normal")}
                  </DetailRow>
                </div>
              );
            })}

            <Separator className="my-3" />
            <EditableDetailRow
              editLabel={t('admin.order_show.shipping.edit')}
              editValue={shippingPriceInput}
              displayValue={`${formatMoney(order.shipping_price)} BYN`}
              emptyLabel={t('admin.order_show.totals.shipping_negotiable')}
              icon={CircleDollarSignIcon}
              inputType="number"
              isEditing={editingShippingPrice}
              isSaving={savingShippingPrice}
              label={t('admin.order_show.shipping.price')}
              min={0}
              saveLabel={t('admin.order_show.shipping.save')}
              cancelLabel={t('admin.order_show.shipping.cancel')}
              step="0.01"
              value={order.shipping_price ?? ''}
              valueClassName="break-words"
              onCancel={cancelShippingPriceEdit}
              onChange={setShippingPriceInput}
              onEdit={() => {
                setEditingShippingPrice(true);
                setShippingPriceInput(order.shipping_price ?? '');
              }}
              onSave={saveShippingPrice}
            />
          </div>
        ) : (
          <p className="py-3 text-center text-sm text-muted-foreground">
            {t('admin.order_show.shipping.no_shipping')}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

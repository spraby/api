import type { ReactNode } from 'react';

import { router } from '@inertiajs/react';
import {
  CheckCircle2Icon,
  CircleDollarSignIcon,
  ClockIcon,
  PackageIcon,
  TruckIcon,
  XCircleIcon,
} from 'lucide-react';
import { toast } from 'sonner';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { DeliveryStatus, FinancialStatus, OrderStatus } from '@/types/models';

import type { OrderShowData, TFunction } from './types';

const ORDER_STATUSES: OrderStatus[] = ['pending', 'confirmed', 'processing', 'completed', 'cancelled', 'archived'];
const DELIVERY_STATUSES: DeliveryStatus[] = ['pending', 'packing', 'shipped', 'transit', 'delivered'];
const FINANCIAL_STATUSES: FinancialStatus[] = ['unpaid', 'paid', 'partial_paid', 'refunded'];

function StatusField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid min-w-0 grid-cols-[5rem_minmax(0,1fr)] items-center gap-2 sm:block sm:space-y-1.5">
      <div className="text-[11px] font-medium leading-4 text-muted-foreground">
        {label}
      </div>
      <div className="min-w-0">
        {children}
      </div>
    </div>
  );
}

function OrderStatusSelect({
  value,
  orderId,
  t,
}: {
  value: OrderStatus;
  orderId: number;
  t: TFunction;
}) {
  const statusIcons = {
    pending: ClockIcon,
    confirmed: CheckCircle2Icon,
    processing: PackageIcon,
    completed: CheckCircle2Icon,
    cancelled: XCircleIcon,
    archived: PackageIcon,
  };

  const handleChange = (newStatus: OrderStatus) => {
    router.put(
      `/admin/orders/${orderId}/status`,
      { status: newStatus },
      {
        preserveScroll: true,
        onSuccess: () => {
          toast.success(t('admin.order_show.status_updated'));
        },
        onError: () => {
          toast.error(t('admin.order_show.status_update_failed'));
        },
      }
    );
  };

  return (
    <Select value={value} onValueChange={handleChange}>
      <SelectTrigger className="h-9 w-full">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {ORDER_STATUSES.map((status) => {
          const StatusIcon = statusIcons[status];

          return (
            <SelectItem key={status} value={status}>
              <div className="flex items-center gap-2">
                <StatusIcon className="size-4" />
                {t(`admin.orders_table.status.${status}`)}
              </div>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}

function DeliveryStatusSelect({
  value,
  orderId,
  t,
}: {
  value: DeliveryStatus;
  orderId: number;
  t: TFunction;
}) {
  const statusIcons = {
    pending: ClockIcon,
    packing: PackageIcon,
    shipped: TruckIcon,
    transit: TruckIcon,
    delivered: CheckCircle2Icon,
  };

  const handleChange = (newStatus: DeliveryStatus) => {
    router.put(
      `/admin/orders/${orderId}/status`,
      { delivery_status: newStatus },
      {
        preserveScroll: true,
        onSuccess: () => {
          toast.success(t('admin.order_show.status_updated'));
        },
        onError: () => {
          toast.error(t('admin.order_show.status_update_failed'));
        },
      }
    );
  };

  return (
    <Select value={value} onValueChange={handleChange}>
      <SelectTrigger className="h-9 w-full">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {DELIVERY_STATUSES.map((status) => {
          const StatusIcon = statusIcons[status];

          return (
            <SelectItem key={status} value={status}>
              <div className="flex items-center gap-2">
                <StatusIcon className="size-4" />
                {t(`admin.orders_table.delivery_status.${status}`)}
              </div>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}

function FinancialStatusSelect({
  value,
  orderId,
  t,
}: {
  value: FinancialStatus;
  orderId: number;
  t: TFunction;
}) {
  const handleChange = (newStatus: FinancialStatus) => {
    router.put(
      `/admin/orders/${orderId}/status`,
      { financial_status: newStatus },
      {
        preserveScroll: true,
        onSuccess: () => {
          toast.success(t('admin.order_show.status_updated'));
        },
        onError: () => {
          toast.error(t('admin.order_show.status_update_failed'));
        },
      }
    );
  };

  return (
    <Select value={value} onValueChange={handleChange}>
      <SelectTrigger className="h-9 w-full">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {FINANCIAL_STATUSES.map((status) => (
          <SelectItem key={status} value={status}>
            <div className="flex items-center gap-2">
              <CircleDollarSignIcon className="size-4" />
              {t(`admin.orders_table.financial_status.${status}`)}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function OrderStatusControls({
  order,
  t,
}: {
  order: OrderShowData;
  t: TFunction;
}) {
  return (
    <div className="grid gap-2 rounded-lg border bg-muted/20 p-2 sm:grid-cols-3 sm:p-3">
      <StatusField label={t('admin.orders_table.columns.status')}>
        <OrderStatusSelect
          value={order.status}
          orderId={order.id}
          t={t}
        />
      </StatusField>
      <StatusField label={t('admin.orders_table.columns.delivery')}>
        <DeliveryStatusSelect
          value={order.delivery_status}
          orderId={order.id}
          t={t}
        />
      </StatusField>
      <StatusField label={t('admin.orders_table.columns.payment')}>
        <FinancialStatusSelect
          value={order.financial_status}
          orderId={order.id}
          t={t}
        />
      </StatusField>
    </div>
  );
}

import { router } from '@inertiajs/react';
import { ArrowLeftIcon } from 'lucide-react';

import { OrderCustomerCard } from '@/components/orders/order-customer-card';
import { OrderItemsCard } from '@/components/orders/order-items-card';
import { OrderShippingCard } from '@/components/orders/order-shipping-card';
import { OrderStatusControls } from '@/components/orders/order-status-controls';
import { OrderTimelineCard } from '@/components/orders/order-timeline';
import type { AuditData, AvailableShippingMethod, OrderShowData } from '@/components/orders/types';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useLang } from '@/lib/lang';

import AdminLayout from '../layouts/AdminLayout';

interface OrderShowProps {
  order: OrderShowData;
  audits: AuditData[];
  auditsTotal: number;
  auditsLimit: number;
  historyStep: number;
  shippingMethods: AvailableShippingMethod[];
}

export default function OrderShow({
  order,
  audits,
  auditsTotal,
  auditsLimit,
  historyStep,
  shippingMethods,
}: OrderShowProps) {
  const { t, trans } = useLang();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);

    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // history_limit живёт в URL: так развёрнутая история переживает
  // redirect()->back() после мутаций, обновление страницы и деплинки.
  const visitWithHistoryLimit = (limit: number | null) => {
    router.get(
      `/admin/orders/${order.id}`,
      limit === null ? {} : { history_limit: limit },
      {
        preserveScroll: true,
        preserveState: true,
      }
    );
  };

  const loadMoreHistory = () => {
    visitWithHistoryLimit(Math.min(auditsLimit + historyStep, auditsTotal));
  };

  const collapseHistory = () => {
    visitWithHistoryLimit(null);
  };

  return (
    <AdminLayout title={`${t('admin.order_show.title')} - ${order.name}`}>
      <div className="flex items-center flex-col gap-5">
        <div className="max-w-[1200px] w-full @container/main flex flex-1 flex-col gap-4 p-3 sm:p-4 lg:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Button
                  className="size-8"
                  size="icon"
                  variant="ghost"
                  onClick={() => {
                    router.visit('/admin/orders');
                  }}
                >
                  <ArrowLeftIcon className="size-4" />
                </Button>
                <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
                  {order.name}
                </h1>
              </div>
              <p className="pl-10 text-sm text-muted-foreground">
                {t('admin.order_show.created_at')}: {formatDate(order.created_at)}
              </p>
            </div>
          </div>

          <OrderStatusControls order={order} t={t} />

          <div className="grid gap-4 lg:grid-cols-3 lg:items-start">
            <div className="contents lg:order-1 lg:col-span-2 lg:flex lg:min-w-0 lg:flex-col lg:gap-4">
              <OrderItemsCard order={order} t={t} />

              <OrderTimelineCard
                audits={audits}
                auditsTotal={auditsTotal}
                historyStep={historyStep}
                updatedAt={order.updated_at}
                className="order-4 lg:order-3 lg:col-span-2"
                t={t}
                trans={trans}
                formatDate={formatDate}
                onLoadMore={loadMoreHistory}
                onCollapse={collapseHistory}
              />

              {order.note ? (
                <Card className="order-3 lg:order-4 lg:col-span-2">
                  <CardHeader className="p-4 pb-2 sm:p-5 sm:pb-3">
                    <CardTitle className="text-base leading-6">{t('admin.order_show.note')}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0 sm:p-5 sm:pt-0">
                    <p className="text-sm">{order.note}</p>
                  </CardContent>
                </Card>
              ) : null}
            </div>

            <div className="order-2 flex flex-col gap-4">
              <OrderCustomerCard customer={order.customer} t={t} />
              <OrderShippingCard
                order={order}
                shippingMethods={shippingMethods}
                t={t}
              />
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

import { router } from '@inertiajs/react';
import {
  ArrowLeftIcon,
  CheckCircle2Icon,
  CircleDollarSignIcon,
  ClockIcon,
  MailIcon,
  PackageIcon,
  PhoneIcon,
  PlusCircleIcon,
  RefreshCwIcon,
  Trash2Icon,
  TruckIcon,
  UserIcon,
  XCircleIcon,
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useLang } from '@/lib/lang';
import { cn } from '@/lib/utils';
import type { Audit, OrderStatus, DeliveryStatus, FinancialStatus } from '@/types/models';

import AdminLayout from '../layouts/AdminLayout';

// ============================================
// TYPES
// ============================================

interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
}

interface OrderItem {
  id: number;
  title: string;
  variant_title: string;
  description: string | null;
  quantity: number;
  price: string;
  final_price: string;
  image_url: string | null;
}

interface OrderShipping {
  id: number;
  name: string;
  phone: string;
  note: string;
}

interface AuditUser {
  id: number;
  name: string;
  email: string;
}

interface AuditData extends Omit<Audit, 'user'> {
  user: AuditUser | null;
}

interface Order {
  id: number;
  name: string;
  status: OrderStatus;
  delivery_status: DeliveryStatus;
  financial_status: FinancialStatus;
  note: string | null;
  status_url: string;
  created_at: string;
  updated_at: string;
  customer: Customer | null;
  order_items: OrderItem[];
  order_shippings: OrderShipping[];
}

interface OrderShowProps {
  order: Order;
  audits: AuditData[];
}

// ============================================
// STATUS SELECT COMPONENTS
// ============================================

const ORDER_STATUSES: OrderStatus[] = ['pending', 'confirmed', 'processing', 'completed', 'cancelled', 'archived'];
const DELIVERY_STATUSES: DeliveryStatus[] = ['pending', 'packing', 'shipped', 'transit', 'delivered'];
const FINANCIAL_STATUSES: FinancialStatus[] = ['unpaid', 'paid', 'partial_paid', 'refunded'];

function OrderStatusSelect({
  value,
  orderId,
  t,
}: {
  value: OrderStatus;
  orderId: number;
  t: (key: string) => string;
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
      <SelectTrigger className="w-[160px]">
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
  t: (key: string) => string;
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
      <SelectTrigger className="w-[160px]">
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
  t: (key: string) => string;
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
      <SelectTrigger className="w-[160px]">
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

// ============================================
// TIMELINE COMPONENT
// ============================================

function TimelineItem({ audit, t, isLast }: { audit: AuditData; t: (key: string) => string; isLast: boolean }) {
  const eventConfig = {
    created: { icon: PlusCircleIcon, className: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400" },
    updated: { icon: RefreshCwIcon, className: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" },
    deleted: { icon: Trash2Icon, className: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400" },
  };

  const { icon: Icon, className } = eventConfig[audit.event] || eventConfig.updated;

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

  return (
    <div className="flex gap-4">
      {/* Timeline line and dot */}
      <div className="flex flex-col items-center">
        <div className={cn("flex size-8 items-center justify-center rounded-full", className)}>
          <Icon className="size-4" />
        </div>
        {!isLast && <div className="w-px flex-1 bg-border" />}
      </div>

      {/* Content */}
      <div className={cn("flex-1 pb-6", isLast && "pb-0")}>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="font-medium">
              {t(`admin.order_show.timeline.event.${audit.event}`)}
            </span>
            <span className="text-sm text-muted-foreground">
              {t('admin.order_show.timeline.by')} {audit.user?.name || t('admin.order_show.timeline.system')}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">{audit.message}</p>
          <span className="text-xs text-muted-foreground">{formatDate(audit.created_at || '')}</span>
        </div>
      </div>
    </div>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function OrderShow({ order, audits }: OrderShowProps) {
  const { t } = useLang();

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

  const calculateTotal = () => {
    return order.order_items.reduce((sum, item) => {
      return sum + parseFloat(item.final_price) * item.quantity;
    }, 0);
  };

  return (
    <AdminLayout title={`${t('admin.order_show.title')} - ${order.name}`}>
      <div className="flex items-center flex-col gap-5">
        <div className="max-w-[1200px] w-full @container/main flex flex-1 flex-col gap-4 p-3 sm:p-4 lg:p-6">
          {/* Header */}
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

          {/* Status Selects */}
          <div className="flex flex-wrap gap-3 pl-10 sm:pl-0">
            <OrderStatusSelect
              value={order.status}
              orderId={order.id}
              t={t}
            />
            <DeliveryStatusSelect
              value={order.delivery_status}
              orderId={order.id}
              t={t}
            />
            <FinancialStatusSelect
              value={order.financial_status}
              orderId={order.id}
              t={t}
            />
          </div>

          {/* Main Content Grid */}
          <div className="grid gap-4 lg:grid-cols-3">
            {/* Left Column - Order Items & Shipping */}
            <div className="flex flex-col gap-4 lg:col-span-2">
              {/* Order Items */}
              <Card>
                <CardHeader>
                  <CardTitle>{t('admin.order_show.sections.items')}</CardTitle>
                </CardHeader>
                <CardContent>
                  {order.order_items.length > 0 ? (
                    <>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[300px]">{t('admin.order_show.items.product')}</TableHead>
                            <TableHead>{t('admin.order_show.items.quantity')}</TableHead>
                            <TableHead>{t('admin.order_show.items.price')}</TableHead>
                            <TableHead className="text-right">{t('admin.order_show.items.total')}</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {order.order_items.map((item) => (
                            <TableRow key={item.id}>
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  {item.image_url ? (
                                    <img
                                      src={item.image_url}
                                      alt={item.title}
                                      className="size-12 rounded-md object-cover"
                                    />
                                  ) : (
                                    <div className="flex size-12 items-center justify-center rounded-md bg-muted">
                                      <PackageIcon className="size-6 text-muted-foreground" />
                                    </div>
                                  )}
                                  <div className="flex flex-col">
                                    <span className="font-medium">{item.title}</span>
                                    {item.variant_title ? (
                                      <span className="text-sm text-muted-foreground">
                                        {item.variant_title}
                                      </span>
                                    ) : null}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>{item.quantity}</TableCell>
                              <TableCell>${parseFloat(item.final_price).toFixed(2)}</TableCell>
                              <TableCell className="text-right font-medium">
                                ${(parseFloat(item.final_price) * item.quantity).toFixed(2)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>

                      <Separator className="my-4" />

                      {/* Totals */}
                      <div className="flex justify-end">
                        <div className="w-full max-w-xs space-y-2">
                          <div className="flex justify-between text-lg font-semibold">
                            <span>{t('admin.order_show.totals.total')}</span>
                            <span>${calculateTotal().toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <p className="text-center text-muted-foreground py-8">
                      {t('admin.order_show.items.no_items')}
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Timeline */}
              <Card>
                <CardHeader>
                  <CardTitle>{t('admin.order_show.sections.timeline')}</CardTitle>
                  <CardDescription>
                    {t('admin.order_show.updated_at')}: {formatDate(order.updated_at)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {audits.length > 0 ? (
                    <div className="space-y-0">
                      {audits.map((audit, index) => (
                        <TimelineItem
                          key={audit.id}
                          audit={audit}
                          t={t}
                          isLast={index === audits.length - 1}
                        />
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-4">
                      {t('admin.order_show.timeline.no_history')}
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Order Note */}
              {order.note ? (
                <Card>
                  <CardHeader>
                    <CardTitle>{t('admin.order_show.note')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{order.note}</p>
                  </CardContent>
                </Card>
              ) : null}
            </div>

            {/* Right Column - Customer & Shipping */}
            <div className="flex flex-col gap-4">
              {/* Customer Info */}
              <Card>
                <CardHeader>
                  <CardTitle>{t('admin.order_show.sections.customer')}</CardTitle>
                </CardHeader>
                <CardContent>
                  {order.customer ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <UserIcon className="size-4 text-muted-foreground" />
                        <span className="font-medium">{order.customer.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MailIcon className="size-4 text-muted-foreground" />
                        <a
                          href={`mailto:${order.customer.email}`}
                          className="text-sm text-primary hover:underline"
                        >
                          {order.customer.email}
                        </a>
                      </div>
                      {order.customer.phone ? (
                        <div className="flex items-center gap-2">
                          <PhoneIcon className="size-4 text-muted-foreground" />
                          <a
                            href={`tel:${order.customer.phone}`}
                            className="text-sm text-primary hover:underline"
                          >
                            {order.customer.phone}
                          </a>
                        </div>
                      ) : null}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-4">
                      {t('admin.order_show.customer.no_customer')}
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Shipping Info */}
              <Card>
                <CardHeader>
                  <CardTitle>{t('admin.order_show.sections.shipping')}</CardTitle>
                </CardHeader>
                <CardContent>
                  {order.order_shippings.length > 0 ? (
                    <div className="space-y-4">
                      {order.order_shippings.map((shipping) => (
                        <div key={shipping.id} className="space-y-2">
                          <div className="flex items-center gap-2">
                            <UserIcon className="size-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                              {t('admin.order_show.shipping.name')}:
                            </span>
                            <span className="font-medium">{shipping.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <PhoneIcon className="size-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                              {t('admin.order_show.shipping.phone')}:
                            </span>
                            <span className="font-medium">{shipping.phone}</span>
                          </div>
                          {shipping.note ? (
                            <div className="flex items-start gap-2">
                              <span className="text-sm text-muted-foreground">
                                {t('admin.order_show.shipping.note')}:
                              </span>
                              <span>{shipping.note}</span>
                            </div>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-4">
                      {t('admin.order_show.shipping.no_shipping')}
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

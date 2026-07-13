import { PackageIcon } from 'lucide-react';

import { Money } from '@/components/money';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import type { OrderShowData, TFunction } from './types';

function calculateItemsTotal(orderItems: OrderShowData['order_items']) {
  return orderItems.reduce((sum, item) => {
    return sum + parseFloat(item.final_price) * item.quantity;
  }, 0);
}

export function OrderItemsCard({
  order,
  t,
}: {
  order: OrderShowData;
  t: TFunction;
}) {
  const hasTotalsSnapshot = order.total !== null;
  const itemsSubtotal = order.subtotal !== null ? parseFloat(order.subtotal) : calculateItemsTotal(order.order_items);
  const discountTotal = order.discount_total !== null ? parseFloat(order.discount_total) : 0;
  const orderTotal = order.total !== null ? parseFloat(order.total) : calculateItemsTotal(order.order_items);

  return (
    <Card className="order-1 lg:col-span-2">
      <CardHeader className="p-4 pb-2 sm:p-5 sm:pb-3">
        <CardTitle className="text-base leading-6">{t('admin.order_show.sections.items')}</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0 sm:p-5 sm:pt-0">
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
                    <TableCell>
                      <Money value={item.final_price}/>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      <Money value={parseFloat(item.final_price) * item.quantity}/>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <Separator className="my-4" />

            <div className="flex justify-end">
              <div className="w-full max-w-xs space-y-2">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>{t('admin.order_show.totals.items')}</span>
                  <Money value={itemsSubtotal}/>
                </div>
                {discountTotal > 0 && (
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{t('admin.order_show.totals.discount')}</span>
                    <Money value={-discountTotal}/>
                  </div>
                )}
                {hasTotalsSnapshot ? (
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{t('admin.order_show.totals.shipping')}</span>
                    {order.shipping_price !== null ? (
                      <Money value={parseFloat(order.shipping_price)}/>
                    ) : (
                      <span>{t('admin.order_show.totals.shipping_negotiable')}</span>
                    )}
                  </div>
                ) : null}
                <Separator />
                <div className="flex justify-between text-lg font-semibold">
                  <span>{t('admin.order_show.totals.total')}</span>
                  <Money value={orderTotal}/>
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
  );
}

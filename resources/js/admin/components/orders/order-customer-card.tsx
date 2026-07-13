import { MailIcon, PhoneIcon, UserIcon } from 'lucide-react';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import { DetailRow } from './detail-rows';

import type { OrderShowData, TFunction } from './types';

export function OrderCustomerCard({
  customer,
  t,
}: {
  customer: OrderShowData['customer'];
  t: TFunction;
}) {
  return (
    <Card className="rounded-lg shadow-sm">
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-base leading-6">{t('admin.order_show.sections.customer')}</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        {customer ? (
          <div className="space-y-3">
            <DetailRow icon={UserIcon} label={t('admin.order_show.customer.name')}>
              <span className="break-words">{customer.name}</span>
            </DetailRow>
            <DetailRow icon={MailIcon} label={t('admin.order_show.customer.email')}>
              <a
                href={`mailto:${customer.email}`}
                className="break-all text-primary hover:underline"
              >
                {customer.email}
              </a>
            </DetailRow>
            {customer.phone ? (
              <DetailRow icon={PhoneIcon} label={t('admin.order_show.customer.phone')}>
                <a
                  href={`tel:${customer.phone}`}
                  className="break-all text-primary hover:underline"
                >
                  {customer.phone}
                </a>
              </DetailRow>
            ) : null}
          </div>
        ) : (
          <p className="py-3 text-center text-sm text-muted-foreground">
            {t('admin.order_show.customer.no_customer')}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

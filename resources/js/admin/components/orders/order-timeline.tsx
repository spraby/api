import type { ReactNode } from 'react';

import {
  PlusCircleIcon,
  RefreshCwIcon,
  Trash2Icon,
} from 'lucide-react';

import { Money } from '@/components/money';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';

import type { AuditData, TFunction } from './types';

const AUDIT_FIELDS = [
  'status',
  'delivery_status',
  'financial_status',
  'shipping_price',
  'total',
  'note',
  'shipping_method_name',
  'shipping_name',
  'shipping_phone',
  'shipping_note',
] as const;
const SHIPPING_AUDIT_FIELD_PREFIX = 'shipping_field:';

type AuditTone = 'default' | 'muted' | 'yellow' | 'blue' | 'purple' | 'green' | 'red' | 'gray' | 'money';

const AUDIT_MONEY_FIELDS = new Set<string>(['shipping_price', 'total']);
const AUDIT_STATUS_PREFIXES: Record<string, string> = {
  status: 'admin.orders_table.status',
  delivery_status: 'admin.orders_table.delivery_status',
  financial_status: 'admin.orders_table.financial_status',
};
const AUDIT_TONE_CLASS_NAMES: Record<AuditTone, string> = {
  default: "border-border bg-background text-foreground",
  muted: "border-muted bg-muted/60 text-muted-foreground",
  yellow: "border-yellow-200 bg-yellow-50 text-yellow-800 dark:border-yellow-900/40 dark:bg-yellow-900/20 dark:text-yellow-300",
  blue: "border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-900/40 dark:bg-blue-900/20 dark:text-blue-300",
  purple: "border-purple-200 bg-purple-50 text-purple-800 dark:border-purple-900/40 dark:bg-purple-900/20 dark:text-purple-300",
  green: "border-green-200 bg-green-50 text-green-800 dark:border-green-900/40 dark:bg-green-900/20 dark:text-green-300",
  red: "border-red-200 bg-red-50 text-red-800 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-300",
  gray: "border-gray-200 bg-gray-50 text-gray-800 dark:border-gray-800 dark:bg-gray-900/40 dark:text-gray-300",
  money: "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-900/20 dark:text-emerald-300",
};
const AUDIT_VALUE_TONES: Record<string, AuditTone> = {
  'status:pending': 'yellow',
  'status:confirmed': 'blue',
  'status:processing': 'purple',
  'status:completed': 'green',
  'status:cancelled': 'red',
  'status:archived': 'gray',
  'delivery_status:pending': 'gray',
  'delivery_status:packing': 'yellow',
  'delivery_status:shipped': 'blue',
  'delivery_status:transit': 'purple',
  'delivery_status:delivered': 'green',
  'financial_status:unpaid': 'red',
  'financial_status:paid': 'green',
  'financial_status:partial_paid': 'yellow',
  'financial_status:refunded': 'gray',
};

interface AuditChange {
  key: string;
  label: string;
  oldValue: ReactNode;
  newValue: ReactNode;
  oldTone: AuditTone;
  newTone: AuditTone;
  emphasize: boolean;
}

function compactAuditText(value: unknown): string {
  if (value === null || value === undefined || value === '') {
    return '—';
  }

  let text: string;

  if (Array.isArray(value)) {
    text = value.map((item) => compactAuditText(item)).join(', ');
  } else if (typeof value === 'object') {
    text = JSON.stringify(value);
  } else {
    text = String(value);
  }

  return text.length > 56 ? `${text.slice(0, 56).trim()}...` : text;
}

function getAuditFieldLabel(field: string, t: TFunction): string {
  if (field.startsWith(SHIPPING_AUDIT_FIELD_PREFIX)) {
    const [, key, ...labelParts] = field.split(':');

    return labelParts.join(':') || key || field;
  }

  const labels: Record<string, string> = {
    status: t('admin.orders_table.columns.status'),
    delivery_status: t('admin.orders_table.columns.delivery'),
    financial_status: t('admin.orders_table.columns.payment'),
    shipping_price: t('admin.order_show.shipping.price'),
    total: t('admin.order_show.totals.total'),
    note: t('admin.order_show.note'),
    shipping_method_name: t('admin.order_show.shipping.method'),
    shipping_name: t('admin.order_show.shipping.name'),
    shipping_phone: t('admin.order_show.shipping.phone'),
    shipping_note: t('admin.order_show.shipping.note'),
  };

  return labels[field] ?? field;
}

function formatAuditValue(
  field: string,
  value: unknown,
  t: TFunction,
): ReactNode {
  const statusPrefix = AUDIT_STATUS_PREFIXES[field];

  if (statusPrefix && typeof value === 'string') {
    return t(`${statusPrefix}.${value}`);
  }

  if (AUDIT_MONEY_FIELDS.has(field)) {
    return <Money value={typeof value === 'number' || typeof value === 'string' ? value : null} />;
  }

  return compactAuditText(value);
}

function getAuditTone(field: string, value: unknown, side: 'old' | 'new'): AuditTone {
  if (AUDIT_MONEY_FIELDS.has(field)) {
    return side === 'new' ? 'money' : 'muted';
  }

  return AUDIT_VALUE_TONES[`${field}:${String(value)}`] ?? (side === 'new' ? 'default' : 'muted');
}

function buildAuditChanges(audit: AuditData, t: TFunction): AuditChange[] {
  const newValues = audit.new_values;

  if (audit.event !== 'updated' || !newValues) {
    return [];
  }

  const fields = [
    ...AUDIT_FIELDS.filter((field) => Object.prototype.hasOwnProperty.call(newValues, field)),
    ...Object.keys(newValues)
      .filter((field) => field.startsWith(SHIPPING_AUDIT_FIELD_PREFIX))
      .sort(),
  ];

  return fields
    .map((field) => {
      const oldValue = audit.old_values?.[field] ?? null;
      const newValue = newValues[field];

      return {
        key: field,
        label: getAuditFieldLabel(field, t),
        oldValue: formatAuditValue(field, oldValue, t),
        newValue: formatAuditValue(field, newValue, t),
        oldTone: getAuditTone(field, oldValue, 'old'),
        newTone: getAuditTone(field, newValue, 'new'),
        emphasize: !['note', 'shipping_note'].includes(field),
      };
    });
}

function AuditChangeRow({ change }: { change: AuditChange }) {
  return (
    <div className={cn(
      "flex min-w-0 flex-wrap items-center gap-1.5 rounded-md border bg-muted/20 px-2 py-1 text-xs",
      change.emphasize ? "border-primary/15" : "border-border"
    )}>
      <span className={cn(
        "min-w-[5.5rem] shrink-0 text-muted-foreground",
        change.emphasize && "font-semibold text-foreground"
      )}>
        {change.label}
      </span>
      <Badge
        className={cn(
          "min-w-0 max-w-[9rem] justify-center truncate border px-1.5 py-0.5 text-xs",
          AUDIT_TONE_CLASS_NAMES[change.oldTone]
        )}
        variant="outline"
      >
        <span className="truncate">{change.oldValue}</span>
      </Badge>
      <span className="shrink-0 text-xs text-muted-foreground">→</span>
      <Badge
        className={cn(
          "min-w-0 max-w-[9rem] justify-center truncate border px-1.5 py-0.5 text-xs",
          change.emphasize && "font-semibold",
          AUDIT_TONE_CLASS_NAMES[change.newTone]
        )}
        variant="outline"
      >
        <span className="truncate">{change.newValue}</span>
      </Badge>
    </div>
  );
}

function TimelineItem({
  audit,
  t,
  isLast,
  formatDate,
}: {
  audit: AuditData;
  t: TFunction;
  isLast: boolean;
  formatDate: (dateString: string) => string;
}) {
  const eventConfig = {
    created: { icon: PlusCircleIcon, className: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400" },
    updated: { icon: RefreshCwIcon, className: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" },
    deleted: { icon: Trash2Icon, className: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400" },
  };

  const { icon: Icon, className } = eventConfig[audit.event as keyof typeof eventConfig] || eventConfig.updated;
  const changes = buildAuditChanges(audit, t);

  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <div className={cn("flex size-6 items-center justify-center rounded-full", className)}>
          <Icon className="size-3.5" />
        </div>
        {!isLast && <div className="w-px flex-1 bg-border" />}
      </div>

      <div className={cn("flex-1 pb-4", isLast && "pb-0")}>
        <div className="flex flex-col gap-1.5">
          <div className="flex flex-col gap-0.5 sm:flex-row sm:items-center sm:justify-between sm:gap-2">
            <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-0.5">
              <span className="text-sm font-medium">
                {t(`admin.order_show.timeline.event.${audit.event}`)}
              </span>
              <span className="text-xs text-muted-foreground">
                {t('admin.order_show.timeline.by')} {audit.user?.name || t('admin.order_show.timeline.system')}
              </span>
            </div>
            <span className="shrink-0 text-xs text-muted-foreground">{formatDate(audit.created_at || '')}</span>
          </div>
          {changes.length > 0 && (
            <div className="space-y-1">
              {changes.map((change) => (
                <AuditChangeRow key={change.key} change={change} />
              ))}
            </div>
          )}
          {changes.length === 0 && audit.message ? (
            <p className="text-xs text-muted-foreground">{audit.message}</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function OrderTimelineCard({
  audits,
  auditsTotal,
  historyStep,
  updatedAt,
  className,
  t,
  trans,
  formatDate,
  onLoadMore,
}: {
  audits: AuditData[];
  auditsTotal: number;
  historyStep: number;
  updatedAt: string;
  className?: string;
  t: TFunction;
  trans: (key: string, replacements?: Record<string, string | number>) => string;
  formatDate: (dateString: string) => string;
  onLoadMore: () => void;
}) {
  const hiddenAuditsCount = Math.max(auditsTotal - audits.length, 0);
  const nextAuditsCount = Math.min(historyStep, hiddenAuditsCount);

  return (
    <Card className={className}>
      <CardHeader className="p-4 pb-1.5 sm:p-5 sm:pb-2">
        <CardTitle className="text-base leading-6">{t('admin.order_show.sections.timeline')}</CardTitle>
        <CardDescription className="text-xs">
          {t('admin.order_show.updated_at')}: {formatDate(updatedAt)}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-0 sm:p-5 sm:pt-0">
        {audits.length > 0 ? (
          <div className="space-y-2.5">
            <div className="space-y-0">
              {audits.map((audit, index) => (
                <TimelineItem
                  key={audit.id}
                  audit={audit}
                  t={t}
                  isLast={index === audits.length - 1}
                  formatDate={formatDate}
                />
              ))}
            </div>
            {hiddenAuditsCount > 0 ? (
              <Button
                className="w-full"
                size="sm"
                type="button"
                variant="outline"
                onClick={onLoadMore}
              >
                {trans('admin.order_show.timeline.show_all', { count: nextAuditsCount })}
              </Button>
            ) : null}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-4">
            {t('admin.order_show.timeline.no_history')}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

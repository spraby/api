import { router, usePage } from '@inertiajs/react';
import { CheckCircle2Icon, ClockIcon, ExternalLinkIcon, XCircleIcon } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useLang } from '@/lib/lang';

import AdminLayout from '../layouts/AdminLayout';

type RequestStatus = 'pending' | 'approved' | 'partial' | 'rejected';

interface RequestItem {
  id: number;
  category_id: number;
  status: 'pending' | 'approved' | 'rejected';
  rejection_reason: string | null;
  category: { id: number; name: string; handle: string } | null;
}

interface CategoryRequestRow {
  id: number;
  brand_id: number;
  user_id: number | null;
  status: RequestStatus;
  comment: string;
  reviewed_at: string | null;
  created_at: string;
  brand: { id: number; name: string } | null;
  user: { id: number; email: string; first_name: string | null; last_name: string | null } | null;
  items: RequestItem[];
}

function StatusBadge({ status, t }: { status: RequestStatus; t: (k: string) => string }) {
  const map: Record<RequestStatus, { cls: string; Icon: typeof ClockIcon }> = {
    pending: {
      cls: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      Icon: ClockIcon,
    },
    approved: {
      cls: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      Icon: CheckCircle2Icon,
    },
    partial: {
      cls: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      Icon: CheckCircle2Icon,
    },
    rejected: {
      cls: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
      Icon: XCircleIcon,
    },
  };

  const { cls, Icon } = map[status];

  return (
    <Badge className={cls} variant="outline">
      <Icon className="mr-1 size-3" />
      {t(`admin.category_requests.statuses.${status}`)}
    </Badge>
  );
}

export default function CategoryRequests() {
  const { t } = useLang();
  const { categoryRequests } = usePage<{ categoryRequests: CategoryRequestRow[] }>().props;

  return (
    <AdminLayout title={t('admin.category_requests.title')}>
      <div className="@container/main flex flex-1 flex-col gap-4 p-3 sm:p-4 lg:p-6">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
            {t('admin.category_requests.title')}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t('admin.category_requests.description')}
          </p>
        </div>

        {categoryRequests.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">{t('admin.category_requests.empty')}</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3">
            {categoryRequests.map((r) => {
              const managerName =
                r.user
                  ? `${r.user.first_name ?? ''} ${r.user.last_name ?? ''}`.trim() || r.user.email
                  : '—';

              return (
                <Card key={r.id}>
                  <CardHeader>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-base">#{r.id}</CardTitle>
                        <StatusBadge status={r.status} t={t} />
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => { router.visit(`/admin/category-requests/${r.id}`); }}
                      >
                        {t('admin.category_requests.actions.view')}
                        <ExternalLinkIcon className="ml-2 size-3" />
                      </Button>
                    </div>
                    <CardDescription>
                      {t('admin.category_requests.columns.brand')}: {r.brand?.name ?? '—'} ·{' '}
                      {t('admin.category_requests.columns.manager')}: {managerName} ·{' '}
                      {new Date(r.created_at).toLocaleString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-2 flex flex-wrap gap-2">
                      {r.items.map((i) => (
                        <Badge key={i.id} variant="secondary">
                          {i.category?.name ?? '—'}
                        </Badge>
                      ))}
                    </div>
                    {r.comment ? (
                      <p className="text-sm text-muted-foreground">{r.comment}</p>
                    ) : null}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

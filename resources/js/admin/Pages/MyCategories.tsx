import { usePage } from '@inertiajs/react';
import { CheckCircle2Icon, ClockIcon, XCircleIcon } from 'lucide-react';

import { CategoryRequestForm } from '@/components/category-request-form';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLang } from '@/lib/lang';

import AdminLayout from '../layouts/AdminLayout.tsx';

interface Category {
  id: number;
  name: string;
  handle: string;
}

interface RequestItem {
  id: number;
  status: 'pending' | 'approved' | 'rejected';
  rejection_reason: string | null;
  category: { id: number; name: string } | null;
}

interface CategoryRequestRow {
  id: number;
  status: 'pending' | 'approved' | 'partial' | 'rejected';
  comment: string;
  created_at: string;
  reviewed_at: string | null;
  items: RequestItem[];
}

interface PageData {
  categories: Category[];
  attachedIds: number[];
  pendingIds: number[];
  requests: CategoryRequestRow[];
  error?: string;
}

function statusBadge(status: CategoryRequestRow['status'], label: string) {
  const map: Record<CategoryRequestRow['status'], string> = {
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    approved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    partial: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  };

  const Icon = status === 'pending' ? ClockIcon : status === 'rejected' ? XCircleIcon : CheckCircle2Icon;

  return (
    <Badge className={map[status]} variant="outline">
      <Icon className="mr-1 size-3" />
      {label}
    </Badge>
  );
}

export default function MyCategories() {
  const { t } = useLang();
  const { categories, attachedIds, pendingIds, requests, error } = usePage<PageData>().props;

  const attachedSet = new Set(attachedIds);
  const pendingSet = new Set(pendingIds);

  const attached = categories.filter((c) => attachedSet.has(c.id));
  const available = categories.filter((c) => !attachedSet.has(c.id) && !pendingSet.has(c.id));

  return (
    <AdminLayout title={t('admin.my_categories.title')}>
      <div className="@container/main flex flex-1 flex-col gap-4 p-3 sm:p-4 lg:p-6">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
            {t('admin.my_categories.title')}
          </h1>
          <p className="text-sm text-muted-foreground">{t('admin.my_categories.description')}</p>
        </div>

        {error ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-destructive">{error}</p>
            </CardContent>
          </Card>
        ) : null}

        {!error ? (
          <>
            <Card>
              <CardHeader>
                <CardTitle>{t('admin.my_categories.sections.attached')}</CardTitle>
              </CardHeader>
              <CardContent>
                {attached.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    {t('admin.my_categories.empty_attached')}
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {attached.map((c) => (
                      <Badge key={c.id} variant="secondary">
                        {c.name}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t('admin.my_categories.sections.add')}</CardTitle>
                <CardDescription>{t('admin.my_categories.description')}</CardDescription>
              </CardHeader>
              <CardContent>
                <CategoryRequestForm categories={available} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t('admin.my_categories.sections.history')}</CardTitle>
              </CardHeader>
              <CardContent>
                {requests.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    {t('admin.my_categories.empty_history')}
                  </p>
                ) : (
                  <div className="flex flex-col gap-3">
                    {requests.map((r) => (
                      <div key={r.id} className="rounded-md border p-3">
                        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">#{r.id}</span>
                            {statusBadge(r.status, t(`admin.category_requests.statuses.${r.status}`))}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {new Date(r.created_at).toLocaleString()}
                          </span>
                        </div>
                        <div className="mb-2 flex flex-wrap gap-2">
                          {r.items.map((i) => (
                            <Badge
                              key={i.id}
                              className={
                                i.status === 'approved'
                                  ? 'bg-green-100 text-green-800'
                                  : i.status === 'rejected'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-yellow-100 text-yellow-800'
                              }
                              variant="outline"
                            >
                              {i.category?.name ?? '—'}
                            </Badge>
                          ))}
                        </div>
                        {r.comment ? (
                          <p className="text-sm text-muted-foreground">{r.comment}</p>
                        ) : null}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        ) : null}
      </div>
    </AdminLayout>
  );
}

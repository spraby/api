import { useState } from 'react';

import { Link, router, usePage } from '@inertiajs/react';
import {
  ArrowLeftIcon,
  BuildingIcon,
  CalendarIcon,
  CheckCircle2Icon,
  ClockIcon,
  Loader2Icon,
  UserIcon,
  XCircleIcon,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useLang } from '@/lib/lang';

import AdminLayout from '../layouts/AdminLayout';

type RequestStatus = 'pending' | 'approved' | 'partial' | 'rejected';
type ItemStatus = 'pending' | 'approved' | 'rejected';

interface RequestItem {
  id: number;
  category_id: number;
  status: ItemStatus;
  rejection_reason: string | null;
  category: { id: number; name: string; handle: string } | null;
}

interface CategoryRequest {
  id: number;
  brand_id: number;
  user_id: number | null;
  status: RequestStatus;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
  brand: { id: number; name: string } | null;
  user: { id: number; email: string; first_name: string | null; last_name: string | null } | null;
  reviewer: { id: number; email: string; first_name: string | null; last_name: string | null } | null;
  items: RequestItem[];
}

function StatusBadge({ status, t }: { status: RequestStatus | ItemStatus; t: (k: string) => string }) {
  const classMap: Record<RequestStatus | ItemStatus, string> = {
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    approved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    partial: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  };
  const iconMap = {
    pending: ClockIcon,
    approved: CheckCircle2Icon,
    partial: CheckCircle2Icon,
    rejected: XCircleIcon,
  };
  const Icon = iconMap[status];

  return (
    <Badge className={classMap[status]} variant="outline">
      <Icon className="mr-1 size-3" />
      {t(`admin.category_requests.statuses.${status}`)}
    </Badge>
  );
}

export default function CategoryRequestShow() {
  const { t } = useLang();
  const { categoryRequest } = usePage<{ categoryRequest: CategoryRequest }>().props;

  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [isRejectOpen, setRejectOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [submitting, setSubmitting] = useState<'approve' | 'reject' | null>(null);

  const pendingItems = categoryRequest.items.filter((i) => i.status === 'pending');
  let pendingSelectionState: boolean | 'indeterminate' = false;

  if (selected.size > 0) {
    pendingSelectionState = selected.size === pendingItems.length ? true : 'indeterminate';
  }

  const toggle = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);

      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }

      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === pendingItems.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(pendingItems.map((i) => i.id)));
    }
  };

  const submit = (action: 'approve' | 'reject', extra: Record<string, unknown> = {}) => {
    setSubmitting(action);
    router.post(
      `/admin/category-requests/${categoryRequest.id}/${action}`,
      { ...extra, item_ids: Array.from(selected) },
      {
        preserveScroll: true,
        onSuccess: () => {
          setSelected(new Set());
          setRejectOpen(false);
          setRejectionReason('');
        },
        onFinish: () => { setSubmitting(null); },
      },
    );
  };

  const managerName = categoryRequest.user
    ? `${categoryRequest.user.first_name ?? ''} ${categoryRequest.user.last_name ?? ''}`.trim()
      || categoryRequest.user.email
    : '—';

  const reviewerName = categoryRequest.reviewer
    ? `${categoryRequest.reviewer.first_name ?? ''} ${categoryRequest.reviewer.last_name ?? ''}`.trim()
      || categoryRequest.reviewer.email
    : null;

  return (
    <AdminLayout title={`${t('admin.category_requests.show.title')} #${categoryRequest.id}`}>
      <div className="flex flex-col items-center gap-5">
        <div className="@container/main flex w-full max-w-[900px] flex-1 flex-col gap-4 p-3 sm:p-4 lg:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Button
                  className="size-8"
                  size="icon"
                  variant="ghost"
                  onClick={() => { router.visit('/admin/category-requests'); }}
                >
                  <ArrowLeftIcon className="size-4" />
                </Button>
                <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
                  {t('admin.category_requests.show.title')} #{categoryRequest.id}
                </h1>
              </div>
              <div className="flex items-center gap-3 pl-10">
                <StatusBadge status={categoryRequest.status} t={t} />
                <span className="text-sm text-muted-foreground">
                  {new Date(categoryRequest.created_at).toLocaleString()}
                </span>
              </div>
            </div>

            {pendingItems.length > 0 ? (
              <div className="flex items-center gap-2">
                <Button
                  disabled={selected.size === 0 || submitting !== null}
                  variant="outline"
                  onClick={() => { setRejectOpen(true); }}
                >
                  <XCircleIcon className="mr-2 size-4" />
                  {t('admin.category_requests.actions.reject')}
                </Button>
                <Button
                  disabled={selected.size === 0 || submitting !== null}
                  onClick={() => { submit('approve'); }}
                >
                  {submitting === 'approve' ? (
                    <Loader2Icon className="mr-2 size-4 animate-spin" />
                  ) : (
                    <CheckCircle2Icon className="mr-2 size-4" />
                  )}
                  {t('admin.category_requests.actions.approve')}
                </Button>
              </div>
            ) : null}
          </div>

          <div className="grid gap-4">
            <Card>
              <CardHeader>
                <CardTitle>{t('admin.category_requests.columns.brand')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {categoryRequest.brand ? (
                  <Link
                    className="flex items-center gap-3 rounded-md border p-3 hover:bg-muted/50"
                    href={`/admin/brands/${categoryRequest.brand.id}/edit`}
                  >
                    <BuildingIcon className="size-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{categoryRequest.brand.name}</p>
                      <p className="text-sm text-muted-foreground">ID: {categoryRequest.brand.id}</p>
                    </div>
                  </Link>
                ) : null}
                <div className="flex items-center gap-3">
                  <UserIcon className="size-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {t('admin.category_requests.columns.manager')}
                    </p>
                    <p className="font-medium">{managerName}</p>
                  </div>
                </div>
                {reviewerName && categoryRequest.reviewed_at ? (
                  <div className="flex items-center gap-3">
                    <CalendarIcon className="size-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {t('admin.category_requests.show.reviewed_at')}
                      </p>
                      <p className="font-medium">
                        {new Date(categoryRequest.reviewed_at).toLocaleString()} — {reviewerName}
                      </p>
                    </div>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{t('admin.category_requests.columns.categories')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-hidden rounded-md border">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="w-12 p-3">
                        {pendingItems.length > 0 ? (
                          <Checkbox
                            checked={pendingSelectionState}
                            onCheckedChange={toggleAll}
                          />
                        ) : null}
                      </th>
                      <th className="p-3 text-left font-medium">
                        {t('admin.category_requests.columns.categories')}
                      </th>
                      <th className="p-3 text-left font-medium">
                        {t('admin.category_requests.show.item_status')}
                      </th>
                      <th className="p-3 text-left font-medium">
                        {t('admin.category_requests.show.rejection_reason')}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {categoryRequest.items.map((item) => (
                      <tr key={item.id} className="border-t">
                        <td className="p-3">
                          {item.status === 'pending' ? (
                            <Checkbox
                              checked={selected.has(item.id)}
                              onCheckedChange={() => { toggle(item.id); }}
                            />
                          ) : null}
                        </td>
                        <td className="p-3">{item.category?.name ?? '—'}</td>
                        <td className="p-3">
                          <StatusBadge status={item.status} t={t} />
                        </td>
                        <td className="p-3 text-muted-foreground">
                          {item.rejection_reason ?? '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={isRejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('admin.category_requests.reject_modal.title')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 py-4">
            <Label htmlFor="rejection_reason">
              {t('admin.category_requests.reject_modal.reason_label')}
            </Label>
            <Textarea
              id="rejection_reason"
              placeholder={t('admin.category_requests.reject_modal.reason_placeholder')}
              rows={4}
              value={rejectionReason}
              onChange={(e) => { setRejectionReason(e.target.value); }}
            />
          </div>
          <DialogFooter>
            <Button
              disabled={submitting !== null}
              variant="outline"
              onClick={() => { setRejectOpen(false); }}
            >
              {t('admin.category_requests.reject_modal.cancel')}
            </Button>
            <Button
              disabled={submitting !== null}
              variant="destructive"
              onClick={() => { submit('reject', { rejection_reason: rejectionReason }); }}
            >
              {submitting === 'reject' ? (
                <Loader2Icon className="mr-2 size-4 animate-spin" />
              ) : (
                <XCircleIcon className="mr-2 size-4" />
              )}
              {t('admin.category_requests.reject_modal.submit')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}

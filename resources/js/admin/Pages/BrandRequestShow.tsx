import { useState } from 'react';

import { Link, router } from '@inertiajs/react';
import {
  ArrowLeftIcon,
  BuildingIcon,
  CalendarIcon,
  CheckCircle2Icon,
  ClockIcon,
  ExternalLinkIcon,
  Loader2Icon,
  MailIcon,
  PhoneIcon,
  UserIcon,
  XCircleIcon,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { useLang } from '@/lib/lang';

import AdminLayout from '../layouts/AdminLayout';

// ============================================
// TYPES
// ============================================

interface BrandRequest {
  id: number;
  email: string;
  phone: string | null;
  name: string | null;
  brand_name: string | null;
  status: 'pending' | 'approved' | 'rejected';
  brand_id: number | null;
  user_id: number | null;
  rejection_reason: string | null;
  reviewed_by: number | null;
  approved_at: string | null;
  rejected_at: string | null;
  created_at: string;
  updated_at: string;
  brand: {
    id: number;
    name: string;
  } | null;
  user: {
    id: number;
    email: string;
    first_name: string | null;
    last_name: string | null;
  } | null;
  reviewer: {
    id: number;
    email: string;
    first_name: string | null;
    last_name: string | null;
  } | null;
}

interface BrandRequestShowProps {
  brandRequest: BrandRequest;
}

// ============================================
// STATUS BADGE COMPONENT
// ============================================

function StatusBadge({ status, t }: { status: string; t: (key: string) => string }) {
  if (status === 'pending') {
    return (
      <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400" variant="outline">
        <ClockIcon className="mr-1 size-3" />
        {t('admin.brand_requests_table.status.pending')}
      </Badge>
    )
  }

  if (status === 'approved') {
    return (
      <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" variant="outline">
        <CheckCircle2Icon className="mr-1 size-3" />
        {t('admin.brand_requests_table.status.approved')}
      </Badge>
    )
  }

  return (
    <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" variant="outline">
      <XCircleIcon className="mr-1 size-3" />
      {t('admin.brand_requests_table.status.rejected')}
    </Badge>
  )
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function BrandRequestShow({ brandRequest }: BrandRequestShowProps) {
  const { t } = useLang();
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);

  const handleApprove = () => {
    setIsApproving(true);
    router.post(`/admin/brand-requests/${brandRequest.id}/approve`, {}, {
      onFinish: () => setIsApproving(false),
    });
  };

  const handleReject = () => {
    setIsRejecting(true);
    router.post(`/admin/brand-requests/${brandRequest.id}/reject`, {
      rejection_reason: rejectionReason,
    }, {
      onSuccess: () => {
        setIsRejectModalOpen(false);
        setRejectionReason('');
      },
      onFinish: () => setIsRejecting(false),
    });
  };

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

  const getReviewerName = () => {
    if (!brandRequest.reviewer) { return null; }

    const firstName = brandRequest.reviewer.first_name || '';
    const lastName = brandRequest.reviewer.last_name || '';

    return `${firstName} ${lastName}`.trim() || brandRequest.reviewer.email;
  };

  const getUserName = () => {
    if (!brandRequest.user) { return null; }

    const firstName = brandRequest.user.first_name || '';
    const lastName = brandRequest.user.last_name || '';

    return `${firstName} ${lastName}`.trim() || brandRequest.user.email;
  };

  return (
    <AdminLayout title={`${t('admin.brand_request_show.title')} #${brandRequest.id}`}>
      <div className="flex items-center flex-col gap-5">
        <div className="max-w-[900px] w-full @container/main flex flex-1 flex-col gap-4 p-3 sm:p-4 lg:p-6">
          {/* Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Button
                  className="size-8"
                  size="icon"
                  variant="ghost"
                  onClick={() => {
                    router.visit('/admin/brand-requests');
                  }}
                >
                  <ArrowLeftIcon className="size-4" />
                </Button>
                <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
                  {t('admin.brand_request_show.title')} #{brandRequest.id}
                </h1>
              </div>
              <div className="flex items-center gap-3 pl-10">
                <StatusBadge status={brandRequest.status} t={t} />
                <span className="text-sm text-muted-foreground">
                  {formatDate(brandRequest.created_at)}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            {brandRequest.status === 'pending' ? (
              <div className="flex items-center gap-2">
                <Button
                  disabled={isApproving || isRejecting}
                  variant="outline"
                  onClick={() => setIsRejectModalOpen(true)}
                >
                  <XCircleIcon className="mr-2 size-4" />
                  {t('admin.brand_request_show.actions.reject')}
                </Button>
                <Button
                  disabled={isApproving || isRejecting}
                  onClick={handleApprove}
                >
                  {isApproving ? (
                    <Loader2Icon className="mr-2 size-4 animate-spin" />
                  ) : (
                    <CheckCircle2Icon className="mr-2 size-4" />
                  )}
                  {t('admin.brand_request_show.actions.approve')}
                </Button>
              </div>
            ) : null}
          </div>

          {/* Main Content Grid */}
          <div className="grid gap-4 lg:grid-cols-2">
            {/* Request Information */}
            <Card>
              <CardHeader>
                <CardTitle>{t('admin.brand_request_show.sections.request_info')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <MailIcon className="size-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">{t('admin.brand_request_show.fields.email')}</p>
                    <a href={`mailto:${brandRequest.email}`} className="font-medium text-primary hover:underline">
                      {brandRequest.email}
                    </a>
                  </div>
                </div>

                {brandRequest.phone ? (
                  <div className="flex items-center gap-3">
                    <PhoneIcon className="size-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">{t('admin.brand_request_show.fields.phone')}</p>
                      <a href={`tel:${brandRequest.phone}`} className="font-medium text-primary hover:underline">
                        {brandRequest.phone}
                      </a>
                    </div>
                  </div>
                ) : null}

                {brandRequest.name ? (
                  <div className="flex items-center gap-3">
                    <UserIcon className="size-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">{t('admin.brand_request_show.fields.name')}</p>
                      <p className="font-medium">{brandRequest.name}</p>
                    </div>
                  </div>
                ) : null}

                {brandRequest.brand_name ? (
                  <div className="flex items-center gap-3">
                    <BuildingIcon className="size-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">{t('admin.brand_request_show.fields.brand_name')}</p>
                      <p className="font-medium">{brandRequest.brand_name}</p>
                    </div>
                  </div>
                ) : null}
              </CardContent>
            </Card>

            {/* Status & Review Information */}
            <Card>
              <CardHeader>
                <CardTitle>{t('admin.brand_request_show.sections.status_info')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div>
                    <p className="text-sm text-muted-foreground">{t('admin.brand_request_show.fields.status')}</p>
                    <StatusBadge status={brandRequest.status} t={t} />
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <CalendarIcon className="size-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">{t('admin.brand_request_show.fields.created_at')}</p>
                    <p className="font-medium">{formatDate(brandRequest.created_at)}</p>
                  </div>
                </div>

                {brandRequest.approved_at ? (
                  <div className="flex items-center gap-3">
                    <CheckCircle2Icon className="size-5 text-green-600" />
                    <div>
                      <p className="text-sm text-muted-foreground">{t('admin.brand_request_show.fields.approved_at')}</p>
                      <p className="font-medium">{formatDate(brandRequest.approved_at)}</p>
                    </div>
                  </div>
                ) : null}

                {brandRequest.rejected_at ? (
                  <div className="flex items-center gap-3">
                    <XCircleIcon className="size-5 text-red-600" />
                    <div>
                      <p className="text-sm text-muted-foreground">{t('admin.brand_request_show.fields.rejected_at')}</p>
                      <p className="font-medium">{formatDate(brandRequest.rejected_at)}</p>
                    </div>
                  </div>
                ) : null}

                {getReviewerName() ? (
                  <div className="flex items-center gap-3">
                    <UserIcon className="size-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">{t('admin.brand_request_show.fields.reviewed_by')}</p>
                      <p className="font-medium">{getReviewerName()}</p>
                    </div>
                  </div>
                ) : null}
              </CardContent>
            </Card>

            {/* Linked Entities */}
            {(brandRequest.brand || brandRequest.user) ? (
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>{t('admin.brand_request_show.sections.linked_entities')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {brandRequest.user ? (
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">{t('admin.brand_request_show.fields.created_user')}</p>
                      <Link
                        href={`/admin/users/${brandRequest.user.id}/edit`}
                        className="flex items-center justify-between gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50"
                      >
                        <div className="flex items-center gap-3">
                          <UserIcon className="size-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{getUserName()}</p>
                            <p className="text-sm text-muted-foreground">{brandRequest.user.email}</p>
                          </div>
                        </div>
                        <ExternalLinkIcon className="size-4 text-muted-foreground" />
                      </Link>
                    </div>
                  ) : null}

                  {brandRequest.brand ? (
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">{t('admin.brand_request_show.fields.created_brand')}</p>
                      <Link
                        href={`/admin/brands/${brandRequest.brand.id}/edit`}
                        className="flex items-center justify-between gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50"
                      >
                        <div className="flex items-center gap-3">
                          <BuildingIcon className="size-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{brandRequest.brand.name}</p>
                            <p className="text-sm text-muted-foreground">ID: {brandRequest.brand.id}</p>
                          </div>
                        </div>
                        <ExternalLinkIcon className="size-4 text-muted-foreground" />
                      </Link>
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            ) : null}

            {/* Rejection Reason */}
            {brandRequest.rejection_reason ? (
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>{t('admin.brand_request_show.fields.rejection_reason')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-900/20">
                    <p className="text-sm text-red-800 dark:text-red-200">{brandRequest.rejection_reason}</p>
                  </div>
                </CardContent>
              </Card>
            ) : null}
          </div>

          <Separator />

          {/* Timestamps */}
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <span>
              {t('admin.brand_request_show.fields.updated_at')}: {formatDate(brandRequest.updated_at)}
            </span>
          </div>
        </div>
      </div>

      {/* Reject Modal */}
      <Dialog open={isRejectModalOpen} onOpenChange={setIsRejectModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('admin.brand_request_show.reject_modal.title')}</DialogTitle>
            <DialogDescription>
              {t('admin.brand_request_show.reject_modal.description')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="rejection_reason">
                {t('admin.brand_request_show.reject_modal.reason_label')}
              </Label>
              <Textarea
                id="rejection_reason"
                placeholder={t('admin.brand_request_show.reject_modal.reason_placeholder')}
                rows={4}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              disabled={isRejecting}
              variant="outline"
              onClick={() => setIsRejectModalOpen(false)}
            >
              {t('admin.brand_request_show.reject_modal.cancel')}
            </Button>
            <Button
              disabled={isRejecting}
              variant="destructive"
              onClick={handleReject}
            >
              {isRejecting ? (
                <Loader2Icon className="mr-2 size-4 animate-spin" />
              ) : (
                <XCircleIcon className="mr-2 size-4" />
              )}
              {t('admin.brand_request_show.reject_modal.confirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
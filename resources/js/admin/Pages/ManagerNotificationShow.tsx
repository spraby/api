import * as React from 'react';

import {Link, useForm, usePage} from '@inertiajs/react';
import {ArrowLeftIcon, CheckIcon, SendIcon} from 'lucide-react';
import {toast} from 'sonner';

import {ManualSendDialog} from '@/components/manager-notifications/manual-send-dialog';
import {
    type DeliveriesPage,
    type DeliveryData,
    type EmailStatus,
    formatHour,
    type ManagerNotificationDetails,
} from '@/components/manager-notifications/types';
import {Badge} from '@/components/ui/badge';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Label} from '@/components/ui/label';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {Switch} from '@/components/ui/switch';
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from '@/components/ui/table';
import AdminLayout from '@/layouts/AdminLayout';
import fetchClient from '@/lib/api/fetch-client';
import {useLang} from '@/lib/lang';

const HOURS = Array.from({length: 24}, (_, hour) => hour);

const EMAIL_STATUS_CLASS: Record<EmailStatus, string> = {
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    processing: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    sent: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    failed: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

function formatDate(value: string | null, locale: string): string {
    if (!value) {
        return '—';
    }

    return new Date(value).toLocaleString(locale === 'en' ? 'en-US' : 'ru-RU', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    });
}

function SettingsCard({notification, canEdit}: {notification: ManagerNotificationDetails; canEdit: boolean}) {
    const {t} = useLang();
    const {data, setData, setDefaults, put, processing, isDirty} = useForm({
        send_hour: notification.send_hour,
        enabled: notification.enabled,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/admin/manager-notifications/${notification.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                // Сохранённые значения становятся новой точкой отсчёта для isDirty.
                setDefaults();
            },
        });
    };

    return (
        <Card>
            <CardHeader className="p-4 sm:p-6">
                <CardTitle>{t('admin.manager_notifications.settings')}</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
                <form className="flex flex-col gap-5" onSubmit={submit}>
                    <div className="flex items-center justify-between gap-3">
                        <Label htmlFor="notification-enabled">{t('admin.manager_notifications.enabled')}</Label>
                        <Switch
                            checked={data.enabled}
                            disabled={!canEdit}
                            id="notification-enabled"
                            onCheckedChange={(value) => {
                                setData('enabled', value);
                            }}
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <Label htmlFor="notification-hour">{t('admin.manager_notifications.send_hour')}</Label>
                        <Select
                            disabled={!canEdit}
                            value={String(data.send_hour)}
                            onValueChange={(value) => {
                                setData('send_hour', Number(value));
                            }}
                        >
                            <SelectTrigger className="w-32" id="notification-hour">
                                <SelectValue/>
                            </SelectTrigger>
                            <SelectContent>
                                {HOURS.map((hour) => (
                                    <SelectItem key={hour} value={String(hour)}>{formatHour(hour)}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">{t('admin.manager_notifications.send_hour_hint')}</p>
                    </div>

                    {canEdit ? (
                        <div>
                            <Button disabled={processing || !isDirty} type="submit">
                                <CheckIcon className="size-4"/>
                                {processing ? t('admin.manager_notifications.saving') : t('admin.manager_notifications.save')}
                            </Button>
                        </div>
                    ) : null}
                </form>
            </CardContent>
        </Card>
    );
}

function TriggerLabel({delivery}: {delivery: DeliveryData}) {
    const {t, trans} = useLang();

    if (delivery.trigger === 'manual') {
        return delivery.sent_by
            ? trans('admin.manager_notifications.triggers.manual_by', {name: delivery.sent_by})
            : t('admin.manager_notifications.triggers.manual');
    }

    return delivery.sequence && delivery.sequence > 1
        ? trans('admin.manager_notifications.triggers.auto_sequence', {n: delivery.sequence})
        : t('admin.manager_notifications.triggers.auto');
}

function DeliveriesCard({notificationId, initial}: {notificationId: number; initial: DeliveriesPage}) {
    const {t, locale} = useLang();
    // Начальное состояние берётся один раз: после «Сохранить» догруженное
    // не сбрасывается. Свежую первую порцию (после ручной отправки) родитель
    // передаёт сменой key.
    const [items, setItems] = React.useState(initial.items);
    const [hasMore, setHasMore] = React.useState(initial.has_more);
    const [loading, setLoading] = React.useState(false);

    const loadMore = () => {
        const last = items.at(-1);

        if (!last) {
            return;
        }

        setLoading(true);
        fetchClient
            .get<DeliveriesPage>(`/admin/manager-notifications/${notificationId}/deliveries`, {params: {before_id: last.id}})
            .then((response) => {
                setItems((previous) => [...previous, ...response.data.items]);
                setHasMore(response.data.has_more);
            })
            .catch(() => {
                toast.error(t('admin.manager_notifications.errors.load_failed'));
            })
            .finally(() => {
                setLoading(false);
            });
    };

    return (
        <Card>
            <CardHeader className="p-4 sm:p-6">
                <CardTitle>{t('admin.manager_notifications.deliveries')}</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
                {items.length === 0 ? (
                    <p className="text-sm text-muted-foreground">{t('admin.manager_notifications.deliveries_empty')}</p>
                ) : (
                    <div className="flex flex-col gap-3">
                        <div className="overflow-x-auto rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>{t('admin.manager_notifications.columns.date')}</TableHead>
                                        <TableHead>{t('admin.manager_notifications.columns.brand')}</TableHead>
                                        <TableHead>{t('admin.manager_notifications.columns.manager')}</TableHead>
                                        <TableHead>{t('admin.manager_notifications.columns.trigger')}</TableHead>
                                        <TableHead>{t('admin.manager_notifications.columns.status')}</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {items.map((delivery) => (
                                        <TableRow key={delivery.id}>
                                            <TableCell className="whitespace-nowrap">{formatDate(delivery.created_at, locale)}</TableCell>
                                            <TableCell>{delivery.brand?.name ?? '—'}</TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span>{delivery.user?.name ?? '—'}</span>
                                                    {delivery.user ? (
                                                        <span className="text-xs text-muted-foreground">{delivery.user.email}</span>
                                                    ) : null}
                                                </div>
                                            </TableCell>
                                            <TableCell className="whitespace-nowrap"><TriggerLabel delivery={delivery}/></TableCell>
                                            <TableCell>
                                                {delivery.email ? (
                                                    <Link href={`/admin/emails/${delivery.email.id}`}>
                                                        <Badge className={EMAIL_STATUS_CLASS[delivery.email.status]} variant="outline">
                                                            {t(`admin.manager_notifications.email_statuses.${delivery.email.status}`)}
                                                        </Badge>
                                                    </Link>
                                                ) : (
                                                    <span className="text-sm text-muted-foreground">
                                                        {t('admin.manager_notifications.email_statuses.deleted')}
                                                    </span>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                        {hasMore ? (
                            <div>
                                <Button disabled={loading} type="button" variant="outline" onClick={loadMore}>
                                    {loading ? t('admin.manager_notifications.loading') : t('admin.manager_notifications.load_more')}
                                </Button>
                            </div>
                        ) : null}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

export default function ManagerNotificationShow() {
    const {t} = useLang();
    const {notification, previewHtml, deliveries, canEdit} = usePage<{
        notification: ManagerNotificationDetails;
        previewHtml: string | null;
        deliveries: DeliveriesPage;
        canEdit: boolean;
    }>().props;
    const [manualOpen, setManualOpen] = React.useState(false);

    return (
        <AdminLayout title={notification.name}>
            <div className="@container/main flex flex-1 flex-col gap-4 p-3 sm:p-4 lg:p-6">
                <div className="flex flex-col gap-3">
                    <Link
                        className="flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                        href="/admin/manager-notifications"
                    >
                        <ArrowLeftIcon className="size-4"/>
                        {t('admin.manager_notifications.back')}
                    </Link>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="flex flex-col gap-1">
                            <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">{notification.name}</h1>
                            {notification.description ? (
                                <p className="text-sm text-muted-foreground">{notification.description}</p>
                            ) : null}
                        </div>
                        {canEdit ? (
                            <Button
                                type="button"
                                onClick={() => {
                                    setManualOpen(true);
                                }}
                            >
                                <SendIcon className="size-4"/>
                                {t('admin.manager_notifications.manual.button')}
                            </Button>
                        ) : null}
                    </div>
                </div>

                <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
                    <Card>
                        <CardHeader className="p-4 sm:p-6">
                            <CardTitle>{t('admin.manager_notifications.conditions_title')}</CardTitle>
                            <CardDescription>{t('admin.manager_notifications.conditions_readonly')}</CardDescription>
                        </CardHeader>
                        <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
                            <ul className="list-disc space-y-1.5 pl-5 text-sm">
                                {notification.conditions_text.map((line) => (
                                    <li key={line}>{line}</li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>

                    <SettingsCard canEdit={canEdit} notification={notification}/>
                </div>

                <Card>
                    <CardHeader className="p-4 sm:p-6">
                        <CardTitle>{t('admin.manager_notifications.preview')}</CardTitle>
                        <CardDescription>{t('admin.manager_notifications.preview_hint')}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-3 p-4 pt-0 sm:p-6 sm:pt-0">
                        <dl className="grid gap-2 text-sm sm:grid-cols-[auto_1fr] sm:gap-x-4">
                            <dt className="text-muted-foreground">{t('admin.manager_notifications.subject')}</dt>
                            <dd className="font-medium">{notification.subject ?? '—'}</dd>
                            <dt className="text-muted-foreground">{t('admin.manager_notifications.preheader')}</dt>
                            <dd>{notification.preheader ?? '—'}</dd>
                        </dl>
                        {previewHtml ? (
                            <iframe
                                className="h-[640px] w-full rounded-md border bg-white"
                                sandbox=""
                                srcDoc={previewHtml}
                                title={`notification-preview-${notification.id}`}
                            />
                        ) : (
                            <p className="text-sm text-muted-foreground">{t('admin.manager_notifications.preview_unavailable')}</p>
                        )}
                    </CardContent>
                </Card>

                <DeliveriesCard
                    key={deliveries.items[0]?.id ?? 'empty'}
                    initial={deliveries}
                    notificationId={notification.id}
                />
            </div>

            {canEdit ? (
                <ManualSendDialog notificationId={notification.id} open={manualOpen} onOpenChange={setManualOpen}/>
            ) : null}
        </AdminLayout>
    );
}

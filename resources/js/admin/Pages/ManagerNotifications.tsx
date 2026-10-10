import {Link, usePage} from '@inertiajs/react';
import {BellIcon, ChevronRightIcon, ClockIcon} from 'lucide-react';

import {
    formatHour,
    type ManagerNotificationListItem,
} from '@/components/manager-notifications/types';
import {Badge} from '@/components/ui/badge';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import AdminLayout from '@/layouts/AdminLayout';
import {useLang} from '@/lib/lang';

function StatusBadge({enabled}: {enabled: boolean}) {
    const {t} = useLang();

    return enabled ? (
        <Badge
            className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
            variant="outline"
        >
            {t('admin.manager_notifications.enabled')}
        </Badge>
    ) : (
        <Badge className="text-muted-foreground" variant="outline">
            {t('admin.manager_notifications.disabled')}
        </Badge>
    );
}

export default function ManagerNotifications() {
    const {t} = useLang();
    const {notifications} = usePage<{notifications: ManagerNotificationListItem[]}>().props;

    return (
        <AdminLayout title={t('admin.manager_notifications.title')}>
            <div className="@container/main flex flex-1 flex-col gap-4 p-3 sm:p-4 lg:p-6">
                <div className="flex flex-col gap-1">
                    <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
                        {t('admin.manager_notifications.title')}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        {t('admin.manager_notifications.subtitle')}
                    </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {notifications.map((notification) => (
                        <Link
                            key={notification.id}
                            className="group rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            href={`/admin/manager-notifications/${notification.id}`}
                        >
                            <Card className="h-full transition-colors group-hover:border-primary/40">
                                <CardHeader className="gap-2 p-4 sm:p-6">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex items-center gap-2">
                                            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                                                <BellIcon className="size-4"/>
                                            </span>
                                            <CardTitle className="text-base">{notification.name}</CardTitle>
                                        </div>
                                        <StatusBadge enabled={notification.enabled}/>
                                    </div>
                                    {notification.description ? (
                                        <CardDescription>{notification.description}</CardDescription>
                                    ) : null}
                                </CardHeader>
                                <CardContent className="flex flex-wrap items-end justify-between gap-3 p-4 pt-0 sm:p-6 sm:pt-0">
                                    <dl className="grid grid-cols-3 gap-4 text-sm">
                                        <div>
                                            <dt className="text-muted-foreground">{t('admin.manager_notifications.send_hour')}</dt>
                                            <dd className="mt-1 flex items-center gap-1 font-medium">
                                                <ClockIcon className="size-3.5"/>
                                                {formatHour(notification.send_hour)}
                                            </dd>
                                        </div>
                                        <div>
                                            <dt className="text-muted-foreground">{t('admin.manager_notifications.sent_total')}</dt>
                                            <dd className="mt-1 font-medium">{notification.deliveries_count}</dd>
                                        </div>
                                        <div>
                                            <dt className="text-muted-foreground">{t('admin.manager_notifications.sent_30_days')}</dt>
                                            <dd className="mt-1 font-medium">{notification.deliveries_last_30_days_count}</dd>
                                        </div>
                                    </dl>
                                    <span className="flex items-center gap-1 text-sm text-muted-foreground group-hover:text-foreground">
                                        {t('admin.manager_notifications.open')}
                                        <ChevronRightIcon className="size-4"/>
                                    </span>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            </div>
        </AdminLayout>
    );
}

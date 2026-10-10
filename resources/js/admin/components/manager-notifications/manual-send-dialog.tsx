import * as React from 'react';

import {router} from '@inertiajs/react';
import {AlertTriangleIcon, SearchIcon, SendIcon} from 'lucide-react';
import {toast} from 'sonner';

import {Button} from '@/components/ui/button';
import {Checkbox} from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {Input} from '@/components/ui/input';
import fetchClient from '@/lib/api/fetch-client';
import {useLang} from '@/lib/lang';

import {MANUAL_SEND_LIMIT, type RecipientData} from './types';

interface ManualSendDialogProps {
    notificationId: number;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

/**
 * Ручная отправка оповещения выбранным брендам. Условия не проверяются; если
 * бренду это письмо уже уходило сегодня — предупреждаем, но не запрещаем.
 */
export function ManualSendDialog({notificationId, open, onOpenChange}: ManualSendDialogProps) {
    const {t, trans} = useLang();
    const [search, setSearch] = React.useState('');
    const [recipients, setRecipients] = React.useState<RecipientData[]>([]);
    const [loading, setLoading] = React.useState(false);
    // Выбранные храним целиком: при смене поиска строки пропадают из списка,
    // а предупреждение и счётчик должны их помнить.
    const [selected, setSelected] = React.useState<Map<number, RecipientData>>(new Map());
    const [processing, setProcessing] = React.useState(false);

    React.useEffect(() => {
        if (!open) {
            return;
        }

        let cancelled = false;
        const timer = window.setTimeout(() => {
            setLoading(true);
            fetchClient
                .get<{recipients: RecipientData[]}>(`/admin/manager-notifications/${notificationId}/recipients`, {
                    params: {search},
                })
                .then((response) => {
                    if (!cancelled) {
                        setRecipients(response.data.recipients);
                    }
                })
                .catch(() => {
                    if (!cancelled) {
                        setRecipients([]);
                        toast.error(t('admin.manager_notifications.errors.load_failed'));
                    }
                })
                .finally(() => {
                    if (!cancelled) {
                        setLoading(false);
                    }
                });
        }, 250);

        return () => {
            cancelled = true;
            window.clearTimeout(timer);
        };
    }, [open, search, notificationId, t]);

    const reset = () => {
        setSearch('');
        setSelected(new Map());
    };

    const atLimit = selected.size >= MANUAL_SEND_LIMIT;

    const toggle = (recipient: RecipientData) => {
        setSelected((previous) => {
            const next = new Map(previous);

            if (next.has(recipient.brand_id)) {
                next.delete(recipient.brand_id);
            } else if (next.size < MANUAL_SEND_LIMIT) {
                next.set(recipient.brand_id, recipient);
            }

            return next;
        });
    };

    const sentToday = [...selected.values()].filter((recipient) => recipient.sent_today);

    const submit = () => {
        router.post(
            `/admin/manager-notifications/${notificationId}/send`,
            {brand_ids: [...selected.keys()]},
            {
                preserveScroll: true,
                onStart: () => {
                    setProcessing(true);
                },
                onFinish: () => {
                    setProcessing(false);
                },
                onSuccess: () => {
                    reset();
                    onOpenChange(false);
                },
                // Сервер отклоняет список целиком (бренд удалён, владелец больше
                // не менеджер…) — ошибку показываем, иначе окно молчит.
                onError: (errors) => {
                    toast.error(errors['brand_ids'] ?? t('admin.manager_notifications.errors.load_failed'));
                },
            },
        );
    };

    return (
        <Dialog
            open={open}
            onOpenChange={(value) => {
                if (!value) {
                    reset();
                }
                onOpenChange(value);
            }}
        >
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>{t('admin.manager_notifications.manual.title')}</DialogTitle>
                    <DialogDescription>{t('admin.manager_notifications.manual.description')}</DialogDescription>
                </DialogHeader>

                <div className="relative">
                    <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"/>
                    <Input
                        className="pl-9"
                        placeholder={t('admin.manager_notifications.manual.search')}
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                        }}
                    />
                </div>

                <div className="max-h-72 overflow-y-auto rounded-md border">
                    {recipients.length === 0 ? (
                        <p className="p-4 text-sm text-muted-foreground">
                            {loading ? t('admin.manager_notifications.loading') : t('admin.manager_notifications.manual.nothing_found')}
                        </p>
                    ) : (
                        <ul className="divide-y">
                            {recipients.map((recipient) => {
                                const id = `recipient-${recipient.brand_id}`;

                                return (
                                    <li key={recipient.brand_id}>
                                        <label
                                            className="flex cursor-pointer items-start gap-3 px-3 py-2.5 hover:bg-muted/50"
                                            htmlFor={id}
                                        >
                                            <Checkbox
                                                checked={selected.has(recipient.brand_id)}
                                                className="mt-0.5"
                                                disabled={!!atLimit && !selected.has(recipient.brand_id)}
                                                id={id}
                                                onCheckedChange={() => {
                                                    toggle(recipient);
                                                }}
                                            />
                                            <span className="flex min-w-0 flex-1 flex-col">
                                                <span className="truncate text-sm font-medium">{recipient.brand_name}</span>
                                                <span className="truncate text-xs text-muted-foreground">
                                                    {[recipient.user_name, recipient.user_email].filter(Boolean).join(' · ')}
                                                </span>
                                            </span>
                                            {recipient.sent_today ? (
                                                <span className="flex shrink-0 items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
                                                    <AlertTriangleIcon className="size-3.5"/>
                                                    {t('admin.manager_notifications.manual.sent_today')}
                                                </span>
                                            ) : null}
                                        </label>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>

                {selected.size > 0 ? (
                    <div className="space-y-2 text-sm">
                        <p>{trans('admin.manager_notifications.manual.will_queue', {count: selected.size})}</p>
                        {atLimit ? (
                            <p className="text-muted-foreground">
                                {trans('admin.manager_notifications.manual.limit_reached', {count: MANUAL_SEND_LIMIT})}
                            </p>
                        ) : null}
                        {sentToday.length > 0 ? (
                            <p className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 p-3 text-amber-800 dark:border-amber-900/50 dark:bg-amber-900/20 dark:text-amber-300">
                                <AlertTriangleIcon className="mt-0.5 size-4 shrink-0"/>
                                {trans('admin.manager_notifications.manual.warning_today', {
                                    brands: sentToday.map((recipient) => recipient.brand_name).join(', '),
                                })}
                            </p>
                        ) : null}
                    </div>
                ) : null}

                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                            onOpenChange(false);
                            reset();
                        }}
                    >
                        {t('admin.manager_notifications.manual.cancel')}
                    </Button>
                    <Button disabled={selected.size === 0 || processing} type="button" onClick={submit}>
                        <SendIcon className="size-4"/>
                        {t('admin.manager_notifications.manual.confirm')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

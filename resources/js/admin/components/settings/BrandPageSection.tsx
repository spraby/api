import {CheckCircle2Icon, ClockIcon, ExternalLinkIcon, SendIcon, XCircleIcon} from 'lucide-react';

import {Badge} from '@/components/ui/badge';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {useLang} from '@/lib/lang';

export type BrandPageStatus = 'none' | 'draft' | 'pending' | 'published';

export type BrandPageRequestStatus = 'pending' | 'approved' | 'rejected';

export interface BrandPageRequest {
    status: BrandPageRequestStatus;
    /** ISO-строки, как их отдаёт сервер. */
    created_at: string | null;
    reviewed_at: string | null;
    /** Причина отказа — заполнена только у отклонённых заявок. */
    reason: string | null;
}

export interface BrandPageSectionProps {
    /** brands.page_status */
    pageStatus: BrandPageStatus;
    /** brands.page_published_at */
    pagePublishedAt: string | null;
    /** Внешний адрес страницы бренда; null, пока страница не опубликована. */
    pageUrl: string | null;
    /** Последняя заявка на публикацию, если она вообще была. */
    request?: BrandPageRequest | null;
    /** Отправку наружу делает родитель — компонент только сообщает о клике. */
    onSubmit?: () => void;
    /** Запрос уже летит: блокируем кнопку. */
    isSubmitting?: boolean;
    /** Жёсткий запрет на отправку (нет прав, не заполнен профиль и т.п.). */
    disabled?: boolean;
}

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

/**
 * Блок публикации персональной страницы бренда в настройках.
 *
 * Компонент презентационный: ничего не грузит и никуда не отправляет —
 * всё состояние приходит пропсами, клик уходит в onSubmit.
 */
export default function BrandPageSection({
    pageStatus,
    pagePublishedAt,
    pageUrl,
    request = null,
    onSubmit,
    isSubmitting = false,
    disabled = false,
}: BrandPageSectionProps) {
    const {t, locale} = useLang();

    // Страница опубликована — ведущий признак, дальше состояние заявки уже не важно.
    const isPublished = pageStatus === 'published' && !!pagePublishedAt;
    const isPending = !isPublished && (pageStatus === 'pending' || request?.status === 'pending');
    const isRejected = !isPublished && !isPending && request?.status === 'rejected';

    const canSubmit = !disabled && !isSubmitting && !isPublished && !isPending;

    return (
        <Card>
            <CardHeader className="p-4 sm:p-6">
                <CardTitle>{t('admin.settings_brand_page.title')}</CardTitle>
                <CardDescription>{t('admin.settings_brand_page.description')}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 p-4 pt-0 sm:p-6 sm:pt-0">
                {isPublished ? (
                    <div className="flex flex-col gap-3">
                        <div className="flex flex-wrap items-center gap-2">
                            <Badge
                                className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                variant="outline"
                            >
                                <CheckCircle2Icon className="mr-1 size-3"/>
                                {t('admin.settings_brand_page.statuses.published')}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                                {t('admin.settings_brand_page.published_at')}: {formatDate(pagePublishedAt, locale)}
                            </span>
                        </div>

                        {pageUrl ? (
                            <Button asChild className="self-start" variant="outline">
                                <a href={pageUrl} rel="noopener noreferrer" target="_blank">
                                    <ExternalLinkIcon className="size-4"/>
                                    {t('admin.settings_brand_page.actions.open_page')}
                                </a>
                            </Button>
                        ) : (
                            <p className="text-sm text-muted-foreground">
                                {t('admin.settings_brand_page.hints.no_url')}
                            </p>
                        )}
                    </div>
                ) : null}

                {isPending ? (
                    <div className="flex flex-col gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                            <Badge
                                className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                                variant="outline"
                            >
                                <ClockIcon className="mr-1 size-3"/>
                                {t('admin.settings_brand_page.statuses.pending')}
                            </Badge>
                            {request?.created_at ? (
                                <span className="text-sm text-muted-foreground">
                                    {t('admin.settings_brand_page.sent_at')}: {formatDate(request.created_at, locale)}
                                </span>
                            ) : null}
                        </div>
                        <p className="text-sm text-muted-foreground">
                            {t('admin.settings_brand_page.hints.pending')}
                        </p>
                    </div>
                ) : null}

                {isRejected ? (
                    <div className="flex flex-col gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                            <Badge
                                className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                                variant="outline"
                            >
                                <XCircleIcon className="mr-1 size-3"/>
                                {t('admin.settings_brand_page.statuses.rejected')}
                            </Badge>
                            {request?.reviewed_at ? (
                                <span className="text-sm text-muted-foreground">
                                    {t('admin.settings_brand_page.reviewed_at')}: {formatDate(request.reviewed_at, locale)}
                                </span>
                            ) : null}
                        </div>
                        {request?.reason ? (
                            <p className="text-sm text-muted-foreground">
                                {t('admin.settings_brand_page.reason')}: {request.reason}
                            </p>
                        ) : null}
                    </div>
                ) : null}

                {!isPublished && !isPending ? (
                    <div className="flex flex-col items-start gap-2">
                        <Button
                            disabled={!canSubmit}
                            type="button"
                            onClick={onSubmit}
                        >
                            <SendIcon className="size-4"/>
                            {isRejected
                                ? t('admin.settings_brand_page.actions.resubmit')
                                : t('admin.settings_brand_page.actions.submit')}
                        </Button>
                        <p className="text-sm text-muted-foreground">
                            {t('admin.settings_brand_page.hints.submit')}
                        </p>
                    </div>
                ) : null}
            </CardContent>
        </Card>
    );
}

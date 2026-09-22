import {Link} from '@inertiajs/react';
import {
    CheckCircle2Icon,
    ClockIcon,
    CopyIcon,
    ExternalLinkIcon,
    GlobeIcon,
    LinkIcon,
    SendIcon,
    StoreIcon,
    XCircleIcon,
} from 'lucide-react';
import {toast} from 'sonner';

import {Button} from '@/components/ui/button';
import {Card, CardContent} from '@/components/ui/card';
import {Separator} from '@/components/ui/separator';
import {useLang} from '@/lib/lang';
import {cn} from '@/lib/utils';

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

export interface BrandPageData {
    /** brands.page_status */
    page_status: BrandPageStatus;
    /** brands.page_published_at */
    page_published_at: string | null;
    /** Адрес страницы на витрине; до публикации это лишь пример будущей ссылки. */
    page_url: string | null;
    request: BrandPageRequest | null;
}

export interface BrandPageCardProps {
    brandName: string;
    brandPage: BrandPageData;
    /** Открыть окно подтверждения; родитель решает, что делать дальше. */
    onRequestPublication: () => void;
    isSubmitting?: boolean;
}

/** Отображаемое состояние страницы: публикация важнее статуса заявки. */
type ViewState = 'draft' | 'pending' | 'published' | 'rejected';

const STATE_STYLES: Record<ViewState, string> = {
    draft: 'bg-muted/60 text-foreground',
    pending: 'bg-yellow-50 text-yellow-900 dark:bg-yellow-900/20 dark:text-yellow-100',
    published: 'bg-green-50 text-green-900 dark:bg-green-900/20 dark:text-green-100',
    rejected: 'bg-red-50 text-red-900 dark:bg-red-900/20 dark:text-red-100',
};

const STATE_ICONS: Record<ViewState, typeof GlobeIcon> = {
    draft: GlobeIcon,
    pending: ClockIcon,
    published: CheckCircle2Icon,
    rejected: XCircleIcon,
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

function resolveState(brandPage: BrandPageData): ViewState {
    if (brandPage.page_status === 'published' && brandPage.page_published_at) {
        return 'published';
    }

    if (brandPage.page_status === 'pending' || brandPage.request?.status === 'pending') {
        return 'pending';
    }

    return brandPage.request?.status === 'rejected' ? 'rejected' : 'draft';
}

/**
 * Карточка персональной страницы бренда: статус, адрес и заявка на публикацию.
 *
 * Компонент презентационный: ничего не грузит и никуда не отправляет —
 * состояние приходит пропсами, клик уходит в onRequestPublication.
 */
export default function BrandPageCard({
    brandName,
    brandPage,
    onRequestPublication,
    isSubmitting = false,
}: BrandPageCardProps) {
    const {t, locale} = useLang();

    const state = resolveState(brandPage);
    const StateIcon = STATE_ICONS[state];
    const isPublished = state === 'published';
    const pageUrl = brandPage.page_url;

    // Пока страница не опубликована, ссылка никуда не ведёт: показываем
    // её как пример будущего адреса и держим кнопки заблокированными.
    const canOpen = isPublished && !!pageUrl;
    const canSubmit = state === 'draft' || state === 'rejected';

    const handleCopy = async () => {
        if (!pageUrl) {
            return;
        }

        try {
            await navigator.clipboard.writeText(pageUrl);
            toast.success(t('admin.my_page.copied'));
        } catch {
            // Clipboard API недоступен (нет https или отказ в правах) —
            // ссылка всё равно видна рядом, её можно выделить руками.
        }
    };

    return (
        <Card className="max-w-2xl">
            <CardContent className="flex flex-col gap-5 p-4 sm:p-6">
                <div className="flex items-center gap-3">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                        <StoreIcon className="size-5 text-muted-foreground"/>
                    </span>
                    <h2 className="min-w-0 truncate text-lg font-semibold">{brandName}</h2>
                </div>

                <div className={cn('flex gap-3 rounded-lg p-4', STATE_STYLES[state])}>
                    <StateIcon className="mt-0.5 size-5 shrink-0"/>
                    <div className="flex min-w-0 flex-col gap-1">
                        <p className="font-medium">{t(`admin.my_page.statuses.${state}.title`)}</p>
                        <p className="text-sm opacity-80">
                            {t(`admin.my_page.statuses.${state}.description`)}
                        </p>

                        {isPublished ? (
                            <p className="text-xs opacity-70">
                                {t('admin.my_page.published_at')}: {formatDate(brandPage.page_published_at, locale)}
                            </p>
                        ) : null}

                        {state === 'pending' && brandPage.request?.created_at ? (
                            <p className="text-xs opacity-70">
                                {t('admin.my_page.sent_at')}: {formatDate(brandPage.request.created_at, locale)}
                            </p>
                        ) : null}

                        {state === 'rejected' ? (
                            <>
                                {brandPage.request?.reviewed_at ? (
                                    <p className="text-xs opacity-70">
                                        {t('admin.my_page.reviewed_at')}: {formatDate(brandPage.request.reviewed_at, locale)}
                                    </p>
                                ) : null}
                                {brandPage.request?.reason ? (
                                    <p className="text-sm">
                                        {t('admin.my_page.reason')}: {brandPage.request.reason}
                                    </p>
                                ) : null}
                            </>
                        ) : null}
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    <p className="text-sm font-medium">
                        {isPublished ? t('admin.my_page.url.published') : t('admin.my_page.url.preview')}
                    </p>

                    {pageUrl ? (
                        <div className="flex items-center gap-2 rounded-lg bg-muted/60 px-3 py-2.5">
                            <LinkIcon className="size-4 shrink-0 text-muted-foreground"/>
                            <span className="min-w-0 truncate text-sm text-muted-foreground">{pageUrl}</span>
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground">{t('admin.my_page.url.empty')}</p>
                    )}

                    <div className="grid gap-2 sm:grid-cols-2">
                        {canOpen ? (
                            <Button asChild variant="outline">
                                <a href={pageUrl} rel="noopener noreferrer" target="_blank">
                                    <ExternalLinkIcon className="size-4"/>
                                    {t('admin.my_page.actions.open_page')}
                                </a>
                            </Button>
                        ) : (
                            <Button disabled type="button" variant="outline">
                                <ExternalLinkIcon className="size-4"/>
                                {t('admin.my_page.actions.open_page')}
                            </Button>
                        )}

                        <Button
                            disabled={!canOpen}
                            type="button"
                            variant="outline"
                            onClick={handleCopy}
                        >
                            <CopyIcon className="size-4"/>
                            {t('admin.my_page.actions.copy_link')}
                        </Button>
                    </div>
                </div>

                {canSubmit ? (
                    <>
                        <Separator/>
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <Link
                                className="text-sm font-medium underline underline-offset-4 hover:text-primary"
                                href={route('admin.settings')}
                            >
                                {t('admin.my_page.actions.brand_settings')}
                            </Link>
                            <Button
                                disabled={isSubmitting}
                                type="button"
                                onClick={onRequestPublication}
                            >
                                <SendIcon className="size-4"/>
                                {state === 'rejected'
                                    ? t('admin.my_page.actions.resubmit')
                                    : t('admin.my_page.actions.submit')}
                            </Button>
                        </div>
                    </>
                ) : null}
            </CardContent>
        </Card>
    );
}

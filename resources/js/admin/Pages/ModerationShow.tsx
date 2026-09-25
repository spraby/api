import {useForm, usePage} from '@inertiajs/react';
import {CheckCircle2Icon, ClockIcon, XCircleIcon} from 'lucide-react';

import BrandPageDetails, {type BrandPageDetailsData} from '@/components/moderation/BrandPageDetails';
import BrandTypeDetails, {type BrandTypeDetailsData} from '@/components/moderation/BrandTypeDetails';
import {Badge} from '@/components/ui/badge';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Label} from '@/components/ui/label';
import {Textarea} from '@/components/ui/textarea';
import AdminLayout from '@/layouts/AdminLayout';
import {useLang} from '@/lib/lang';

type ModerationStatus = 'pending' | 'approved' | 'rejected';

interface ModerationRequestData {
    id: number;
    type: string;
    status: ModerationStatus;
    reason: string | null;
    reviewed_at: string | null;
    created_at: string | null;
    source: {type: string; id: number; label: string; admin_url: string | null; exists: boolean} | null;
    reviewer: {id: number; email: string; first_name: string | null; last_name: string | null} | null;
}

/** Детали разных типов заявок различает поле kind. */
type ModerationDetails = BrandPageDetailsData | BrandTypeDetailsData;

const STATUS_CONFIG: Record<ModerationStatus, {cls: string; Icon: typeof ClockIcon}> = {
    pending: {
        cls: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
        Icon: ClockIcon,
    },
    approved: {
        cls: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
        Icon: CheckCircle2Icon,
    },
    rejected: {
        cls: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
        Icon: XCircleIcon,
    },
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

function reviewerLabel(reviewer: ModerationRequestData['reviewer']): string {
    if (!reviewer) {
        return '—';
    }

    return `${reviewer.first_name ?? ''} ${reviewer.last_name ?? ''}`.trim() || reviewer.email;
}

function Field({label, value}: {label: string; value: string}) {
    return (
        <div className="flex min-w-0 flex-col gap-1">
            <span className="text-xs text-muted-foreground">{label}</span>
            <div className="text-sm break-words">{value}</div>
        </div>
    );
}

/** Столько символов влезает в moderation_requests.reason. */
const REASON_MAX_LENGTH = 255;

/** Решение по заявке: пояснение обязательно только при отказе. */
function DecisionCard({requestId}: {requestId: number}) {
    const {t} = useLang();
    const {data, setData, post, processing, errors} = useForm({reason: ''});

    const submit = (action: 'approve' | 'reject') => {
        post(route(`admin.moderation.${action}`, requestId), {preserveScroll: true});
    };

    return (
        <Card>
            <CardHeader className="p-4 sm:p-6">
                <CardTitle>{t('admin.moderation.show.actions.title')}</CardTitle>
                <CardDescription>{t('admin.moderation.show.actions.description')}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 p-4 pt-0 sm:p-6 sm:pt-0">
                <div className="flex min-w-0 flex-col gap-2">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <Label htmlFor="moderation-reason">
                            {t('admin.moderation.show.actions.reason')}
                        </Label>
                        <span className="text-xs text-muted-foreground">
                            {data.reason.length} / {REASON_MAX_LENGTH}
                        </span>
                    </div>
                    <Textarea
                        id="moderation-reason"
                        maxLength={REASON_MAX_LENGTH}
                        placeholder={t('admin.moderation.show.actions.reason_placeholder')}
                        rows={3}
                        value={data.reason}
                        onChange={(event) => {
                            setData('reason', event.target.value);
                        }}
                    />
                    {errors.reason ? (
                        <p className="text-sm text-destructive">{errors.reason}</p>
                    ) : (
                        <p className="text-sm text-muted-foreground">
                            {t('admin.moderation.show.actions.reason_hint')}
                        </p>
                    )}
                </div>
                <div className="flex flex-wrap gap-2">
                    <Button
                        disabled={processing}
                        type="button"
                        onClick={() => {
                            submit('approve');
                        }}
                    >
                        <CheckCircle2Icon className="size-4"/>
                        {t('admin.moderation.show.actions.approve')}
                    </Button>
                    <Button
                        disabled={processing}
                        type="button"
                        variant="destructive"
                        onClick={() => {
                            submit('reject');
                        }}
                    >
                        <XCircleIcon className="size-4"/>
                        {t('admin.moderation.show.actions.reject')}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

/** Блок деталей выбирается по типу заявки: новый тип — новый case. */
function DetailsBlock({details}: {details: ModerationDetails | null}) {
    const {t} = useLang();

    if (details?.kind === 'brand_page') {
        return <BrandPageDetails data={details}/>;
    }

    if (details?.kind === 'brand_type') {
        return <BrandTypeDetails data={details}/>;
    }

    return (
        <Card>
            <CardContent className="p-4 text-sm text-muted-foreground sm:p-6">
                {t('admin.moderation.show.no_details')}
            </CardContent>
        </Card>
    );
}

export default function ModerationShow() {
    const {t, locale} = useLang();
    const {request, details, canReview} = usePage<{
        request: ModerationRequestData;
        details: ModerationDetails | null;
        canReview: boolean;
    }>().props;

    const status = STATUS_CONFIG[request.status];
    const typeLabel = t(`admin.moderation.types.${request.type}`);

    return (
        <AdminLayout title={t('admin.moderation.show.title')}>
            <div className="@container/main flex flex-1 flex-col gap-4 p-3 sm:p-4 lg:p-6">
                <div className="flex flex-col gap-2">
                    <div className="flex flex-wrap items-center gap-3">
                        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
                            {t('admin.moderation.show.title')} #{request.id}
                        </h1>
                        {status ? (
                            <Badge className={status.cls} variant="outline">
                                <status.Icon className="mr-1 size-3"/>
                                {t(`admin.moderation.statuses.${request.status}`)}
                            </Badge>
                        ) : null}
                    </div>
                </div>

                <Card>
                    <CardHeader className="p-4 sm:p-6">
                        <CardTitle>{t('admin.moderation.show.request')}</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-4 p-4 pt-0 sm:grid-cols-2 sm:p-6 sm:pt-0 lg:grid-cols-4">
                        <Field
                            label={t('admin.moderation.columns.type')}
                            value={typeLabel.startsWith('admin.') ? request.type : typeLabel}
                        />
                        <Field
                            label={t('admin.moderation.columns.source')}
                            value={request.source?.label ?? '—'}
                        />
                        <Field
                            label={t('admin.moderation.columns.created')}
                            value={formatDate(request.created_at, locale)}
                        />
                        <Field
                            label={t('admin.moderation.columns.reviewer')}
                            value={reviewerLabel(request.reviewer)}
                        />
                        <Field
                            label={t('admin.moderation.show.reviewed_at')}
                            value={formatDate(request.reviewed_at, locale)}
                        />
                        {request.reason ? (
                            <Field label={t('admin.moderation.show.reason')} value={request.reason}/>
                        ) : null}
                    </CardContent>
                </Card>

                {canReview ? <DecisionCard requestId={request.id}/> : null}

                <DetailsBlock details={details}/>
            </div>
        </AdminLayout>
    );
}

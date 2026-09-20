import type {ReactNode} from 'react';

import {Link} from '@inertiajs/react';
import {ExternalLinkIcon, EyeIcon, PencilIcon} from 'lucide-react';

import BrandDomainField from '@/components/brand/BrandDomainField';
import {MediaThumbnail} from '@/components/media-thumbnail';
import {Badge} from '@/components/ui/badge';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {useLang} from '@/lib/lang';

export interface BrandPageDetailsData {
    kind: 'brand_page';
    can_edit_domain: boolean;
    brand: {
        id: number;
        name: string;
        employment_type_label: string | null;
        domain: string | null;
        /** Домен бренда, а если его нет — транскрипция названия. */
        suggested_domain: string;
        page_status: string;
        page_published_at: string | null;
        page_url: string | null;
        /** Подписанная ссылка на предпросмотр неопубликованной страницы. */
        preview_url: string | null;
        admin_url: string;
        created_at: string | null;
        logo_url: string | null;
        /** Описания приходят с сервера уже текстом, без HTML. */
        about: string | null;
        refund_policy: string | null;
    };
    owner: {
        id: number;
        name: string | null;
        email: string;
        phone: string | null;
        admin_url: string;
    } | null;
    contacts: {type: string; value: string}[];
    stats: {products: number; categories: number};
}

/** Типы контактов подписаны в настройках — переиспользуем те же ключи. */
function contactLabel(t: (key: string) => string, type: string): string {
    const label = t(`admin.settings_contacts.fields.${type}`);

    return label.startsWith('admin.') ? type : label;
}

function Field({label, children}: {label: string; children: ReactNode}) {
    return (
        <div className="flex min-w-0 flex-col gap-1">
            <span className="text-xs text-muted-foreground">{label}</span>
            <div className="text-sm break-words">{children}</div>
        </div>
    );
}

export default function BrandPageDetails({data}: {data: BrandPageDetailsData}) {
    const {t} = useLang();
    const {brand, owner, contacts, stats} = data;

    const statusKey = `admin.settings_brand_page.statuses.${brand.page_status}`;
    const statusLabel = t(statusKey);

    return (
        <div className="flex min-w-0 flex-col gap-4">
            <Card>
                <CardHeader className="p-4 sm:p-6">
                    <CardTitle>{t('admin.moderation.show.brand.title')}</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-6 p-4 pt-0 sm:p-6 sm:pt-0">
                    <div className="flex items-start gap-4">
                        <MediaThumbnail
                            className="size-20 shrink-0"
                            name={brand.name}
                            url={brand.logo_url}
                        />
                        <div className="flex min-w-0 flex-col items-start gap-2">
                            <div className="text-base font-medium">{brand.name}</div>
                            {brand.employment_type_label ? (
                                <Badge variant="secondary">{brand.employment_type_label}</Badge>
                            ) : null}
                            <div className="flex flex-wrap gap-2">
                                <Button asChild size="sm" variant="outline">
                                    <Link href={brand.admin_url}>
                                        <PencilIcon className="size-4"/>
                                        {t('admin.moderation.show.brand.open_admin')}
                                    </Link>
                                </Button>
                                {brand.page_url ? (
                                    <Button asChild size="sm" variant="outline">
                                        <a href={brand.page_url} rel="noopener noreferrer" target="_blank">
                                            <ExternalLinkIcon className="size-4"/>
                                            {t('admin.moderation.show.brand.open_page')}
                                        </a>
                                    </Button>
                                ) : null}
                                {brand.preview_url ? (
                                    <Button asChild size="sm" variant="outline">
                                        <a href={brand.preview_url} rel="noopener noreferrer" target="_blank">
                                            <EyeIcon className="size-4"/>
                                            {t('admin.moderation.show.brand.preview_page')}
                                        </a>
                                    </Button>
                                ) : null}
                            </div>
                        </div>
                    </div>

                    {brand.domain ? (
                        <Field label={t('admin.brands_edit.domain.label')}>
                            <div className="flex flex-col gap-1">
                                <span>{brand.domain}</span>
                                <span className="text-xs text-muted-foreground">
                                    {t('admin.moderation.show.brand.domain_locked')}
                                </span>
                            </div>
                        </Field>
                    ) : (
                        <BrandDomainField
                            brandId={brand.id}
                            canEdit={data.can_edit_domain}
                            domain={brand.domain}
                            suggestedDomain={brand.suggested_domain}
                        />
                    )}

                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <Field label={t('admin.moderation.show.brand.page_status')}>
                            {statusLabel.startsWith('admin.') ? brand.page_status : statusLabel}
                        </Field>
                        <Field label={t('admin.moderation.show.brand.products')}>{stats.products}</Field>
                        <Field label={t('admin.moderation.show.brand.categories')}>{stats.categories}</Field>
                    </div>

                    <div className="flex flex-col gap-4">
                        <Field label={t('admin.moderation.show.brand.about')}>
                            {brand.about ? (
                                <p className="whitespace-pre-line">{brand.about}</p>
                            ) : (
                                <span className="text-muted-foreground">
                                    {t('admin.moderation.show.empty_value')}
                                </span>
                            )}
                        </Field>
                        <Field label={t('admin.moderation.show.brand.refund_policy')}>
                            {brand.refund_policy ? (
                                <p className="whitespace-pre-line">{brand.refund_policy}</p>
                            ) : (
                                <span className="text-muted-foreground">
                                    {t('admin.moderation.show.empty_value')}
                                </span>
                            )}
                        </Field>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="p-4 sm:p-6">
                    <CardTitle>{t('admin.moderation.show.brand.owner')}</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 p-4 pt-0 sm:grid-cols-2 sm:p-6 sm:pt-0 lg:grid-cols-4">
                    {owner ? (
                        <>
                            <Field label={t('admin.moderation.show.brand.owner_name')}>
                                {owner.name ? (
                                    <Link className="text-primary hover:underline" href={owner.admin_url}>
                                        {owner.name}
                                    </Link>
                                ) : (
                                    <span className="text-muted-foreground">—</span>
                                )}
                            </Field>
                            <Field label={t('admin.moderation.show.brand.owner_email')}>
                                <Link className="text-primary hover:underline" href={owner.admin_url}>
                                    {owner.email}
                                </Link>
                            </Field>
                            <Field label={t('admin.moderation.show.brand.owner_phone')}>
                                {owner.phone ? (
                                    <Link className="text-primary hover:underline" href={owner.admin_url}>
                                        {owner.phone}
                                    </Link>
                                ) : (
                                    <span className="text-muted-foreground">—</span>
                                )}
                            </Field>
                        </>
                    ) : (
                        <span className="text-sm text-muted-foreground">
                            {t('admin.moderation.show.brand.no_owner')}
                        </span>
                    )}

                    {contacts.map((contact) => (
                        <Field
                            key={`${contact.type}-${contact.value}`}
                            label={contactLabel(t, contact.type)}
                        >
                            {contact.value}
                        </Field>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
}

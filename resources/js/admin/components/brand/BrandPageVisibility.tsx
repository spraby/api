import {router} from '@inertiajs/react';
import {ExternalLinkIcon} from 'lucide-react';

import {Button} from '@/components/ui/button';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Label} from '@/components/ui/label';
import {Switch} from '@/components/ui/switch';
import {useLang} from '@/lib/lang';

export interface BrandPageVisibilityProps {
    brandId: number;
    pageStatus: string;
    pagePublishedAt: string | null;
    /** Адрес страницы; приходит только у опубликованной. */
    pageUrl: string | null;
    /** Переключать показ может только админ — остальным блок не рендерится. */
    canPublish: boolean;
}

export default function BrandPageVisibility({
    brandId,
    pageStatus,
    pagePublishedAt,
    pageUrl,
    canPublish,
}: BrandPageVisibilityProps) {
    const {t, locale} = useLang();

    if (!canPublish) {
        return null;
    }

    const isPublished = pageStatus === 'published';

    // Переключатель — действие, а не поле формы: отправляем сразу.
    const handleChange = (published: boolean) => {
        router.put(
            route('admin.brands.page-visibility.update', brandId),
            {published},
            {preserveScroll: true},
        );
    };

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="text-base">{t('admin.brands_edit.page.title')}</CardTitle>
                <CardDescription>{t('admin.brands_edit.page.description')}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex min-w-0 flex-col gap-1">
                        <Label htmlFor={`brand-page-${brandId}`}>
                            {t('admin.brands_edit.page.switch')}
                        </Label>
                        <p className="text-sm text-muted-foreground">
                            {isPublished
                                ? t('admin.brands_edit.page.hint_published')
                                : t('admin.brands_edit.page.hint_blocked')}
                        </p>
                    </div>
                    <Switch
                        checked={isPublished}
                        id={`brand-page-${brandId}`}
                        onCheckedChange={handleChange}
                    />
                </div>

                {isPublished && pagePublishedAt ? (
                    <div className="flex flex-wrap items-center gap-3">
                        <span className="text-sm text-muted-foreground">
                            {t('admin.brands_edit.page.published_at')}:{' '}
                            {new Date(pagePublishedAt).toLocaleString(locale === 'en' ? 'en-US' : 'ru-RU', {
                                year: 'numeric',
                                month: '2-digit',
                                day: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit',
                            })}
                        </span>
                        {pageUrl ? (
                            <Button asChild size="sm" variant="outline">
                                <a href={pageUrl} rel="noopener noreferrer" target="_blank">
                                    <ExternalLinkIcon className="size-4"/>
                                    {t('admin.brands_edit.page.open')}
                                </a>
                            </Button>
                        ) : null}
                    </div>
                ) : null}
            </CardContent>
        </Card>
    );
}

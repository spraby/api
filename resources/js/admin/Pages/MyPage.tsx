import {useCallback, useState} from 'react';

import {useForm, usePage} from '@inertiajs/react';

import BrandPageCard, {type BrandPageData} from '@/components/brand/BrandPageCard';
import BrandPagePublishDialog from '@/components/brand/BrandPagePublishDialog';
import {Card, CardContent} from '@/components/ui/card';
import {useLang} from '@/lib/lang';
import type {PageProps} from '@/types/inertia';

import AdminLayout from '../layouts/AdminLayout.tsx';

interface MyPageProps extends Record<string, unknown> {
    brand: {id: number, name: string} | null;
    brandPage: BrandPageData | null;
    /** Адрес условий публикации на витрине. */
    termsUrl: string;
    /** Редакция условий: уходит вместе с подтверждением. */
    termsVersion: string;
}

export default function MyPage() {
    const {t} = useLang();
    const {brand, brandPage, termsUrl, termsVersion} = usePage<PageProps<MyPageProps>>().props;
    const [dialogOpen, setDialogOpen] = useState(false);

    // Текст подтверждения уходит на сервер вместе с галочкой: в заявке
    // сохраняется ровно то, что видел менеджер.
    const {post, processing} = useForm({
        accepted: true,
        terms_version: termsVersion,
        terms_text: t('admin.my_page.dialog.consent'),
    });

    // Тост показывает AdminLayout по flash-сообщению от сервера.
    const handleConfirm = useCallback(() => {
        post(route('admin.my-page.request'), {
            preserveScroll: true,
            onFinish: () => setDialogOpen(false),
        });
    }, [post]);

    return (
        <AdminLayout title={t('admin.my_page.title')}>
            <div className="@container/main flex flex-1 flex-col gap-4 p-3 sm:p-4 lg:p-6">
                <div className="space-y-1">
                    <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
                        {t('admin.my_page.title')}
                    </h1>
                    <p className="text-sm text-muted-foreground">{t('admin.my_page.description')}</p>
                </div>

                {brand && brandPage ? (
                    <>
                        <BrandPageCard
                            brandName={brand.name}
                            brandPage={brandPage}
                            isSubmitting={processing}
                            onRequestPublication={() => setDialogOpen(true)}
                        />
                        <BrandPagePublishDialog
                            isSubmitting={processing}
                            open={dialogOpen}
                            termsUrl={termsUrl}
                            onConfirm={handleConfirm}
                            onOpenChange={setDialogOpen}
                        />
                    </>
                ) : (
                    <Card className="max-w-2xl">
                        <CardContent className="pt-6">
                            <p className="text-sm text-muted-foreground">{t('admin.my_page.empty')}</p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AdminLayout>
    );
}

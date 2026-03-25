import type {FormEventHandler} from 'react';

import {useForm} from '@inertiajs/react';
import {toast} from 'sonner';

import {Button} from '@/components/ui/button';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Label} from '@/components/ui/label';
import {RichTextEditor} from '@/components/ui/rich-text-editor';
import {useLang} from '@/lib/lang';

interface GeneralSectionProps {
    about: string;
    refundPolicy: string;
}

export default function GeneralSection({about, refundPolicy}: GeneralSectionProps) {
    const {t} = useLang();

    const {data, setData, put, processing} = useForm({
        about: about ?? '',
        refund_policy: refundPolicy ?? '',
    });

    const onSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        put(route('admin.settings.general.update'), {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                toast.success(t('admin.settings_general.messages.updated'));
            },
        });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>{t('admin.settings_general.title')}</CardTitle>
                <CardDescription>{t('admin.settings_general.description')}</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={onSubmit} className="flex flex-col gap-6">
                    <div className="flex flex-col gap-2">
                        <Label>{t('admin.settings_general.fields.about')}</Label>
                        <RichTextEditor
                            value={data.about}
                            onChange={(v) => setData('about', v)}
                            placeholder={t('admin.settings_general.placeholders.about')}
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <Label>{t('admin.settings_general.fields.refund_policy')}</Label>
                        <RichTextEditor
                            value={data.refund_policy}
                            onChange={(v) => setData('refund_policy', v)}
                            placeholder={t('admin.settings_general.placeholders.refund_policy')}
                        />
                    </div>

                    <div className="flex justify-end">
                        <Button type="submit" disabled={processing}>
                            {processing
                                ? t('admin.settings_general.actions.saving')
                                : t('admin.settings_general.actions.save')}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
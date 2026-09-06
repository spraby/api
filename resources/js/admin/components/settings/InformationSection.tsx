import {useMemo, type FormEventHandler} from 'react';

import {useForm} from '@inertiajs/react';
import {toast} from 'sonner';

import {Button} from '@/components/ui/button';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Label} from '@/components/ui/label';
import {RichTextEditor} from '@/components/ui/rich-text-editor';
import {useLang} from '@/lib/lang';

interface InformationSectionProps {
    information: string;
    maxLength: number;
}

export default function InformationSection({information, maxLength}: InformationSectionProps) {
    const {t, trans} = useLang();

    const {data, setData, put, processing, errors} = useForm({
        description: information ?? '',
    });

    // Считаем видимый текст, а не разметку: на один введённый символ редактор
    // отдаёт `<p>a</p>`, и счётчик по длине HTML вводил бы в заблуждение.
    // Правило совпадает с серверным (UpdateInformationRequest::plainText).
    const visibleLength = useMemo(() => data.description
        .replace(/<[^>]*>/g, '')
        .replace(/&nbsp;/gi, ' ')
        .replace(/\u00a0/g, ' ')
        .trim()
        .length, [data.description]);

    const onSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        put(route('admin.settings.information.update'), {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                toast.success(t('admin.settings_information.messages.updated'));
            },
        });
    };

    return (
        <Card>
            <CardHeader className="p-4 sm:p-6">
                <CardTitle>{t('admin.settings_information.title')}</CardTitle>
                <CardDescription>{t('admin.settings_information.description')}</CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
                <form onSubmit={onSubmit} className="flex flex-col gap-6">
                    <div className="flex min-w-0 flex-col gap-2">
                        <Label>{t('admin.settings_information.fields.description')}</Label>
                        <RichTextEditor
                            value={data.description}
                            onChange={(v) => setData('description', v)}
                            placeholder={t('admin.settings_information.placeholders.description')}
                        />
                        {errors.description ? (
                            <p className="text-xs text-destructive">{errors.description}</p>
                        ) : null}
                        <p className="text-sm text-muted-foreground">
                            {t('admin.settings_information.hints.description')}
                        </p>
                        <p className="text-xs text-muted-foreground">
                            {trans('admin.settings_information.hints.limit', {
                                current: visibleLength,
                                max: maxLength,
                            })}
                        </p>
                    </div>

                    <div className="flex justify-end">
                        <Button type="submit" className="w-full sm:w-auto" disabled={processing}>
                            {processing
                                ? t('admin.settings_information.actions.saving')
                                : t('admin.settings_information.actions.save')}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}

import {useCallback, useState, type FormEventHandler} from 'react';

import {useForm} from '@inertiajs/react';
import {TrashIcon} from 'lucide-react';
import {toast} from 'sonner';

import {ImagePickerDialog} from '@/components/image-picker-dialog';
import type {ImageSelectorItem} from '@/components/image-selector';
import {MediaThumbnail} from '@/components/media-thumbnail';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Label} from '@/components/ui/label';
import {RichTextEditor} from '@/components/ui/rich-text-editor';
import {useLang} from '@/lib/lang';
import type {BrandImage} from '@/types/api';

interface GeneralSectionProps {
    about: string;
    refundPolicy: string;
    image: BrandImage | null;
}

export default function GeneralSection({about, refundPolicy, image}: GeneralSectionProps) {
    const {t} = useLang();

    const [logo, setLogo] = useState<BrandImage | null>(image ?? null);

    const {data, setData, put, processing} = useForm({
        about: about ?? '',
        refund_policy: refundPolicy ?? '',
        image_id: (image?.id ?? null) as number | null,
    });

    // Ключ серверного значения: id меняется при смене логотипа, url — если файл перезалили.
    const serverLogoKey = image ? `${image.id}:${image.url}` : '';
    const [syncedLogoKey, setSyncedLogoKey] = useState(serverLogoKey);

    // Пропы приезжают с сервера после сохранения, перезагрузки или partial reload.
    // Пока серверное значение не изменилось, ещё не сохранённый выбор пользователя не трогаем.
    if (syncedLogoKey !== serverLogoKey) {
        setSyncedLogoKey(serverLogoKey);
        setLogo(image ?? null);
        setData('image_id', image?.id ?? null);
    }

    const handleLogoRemoved = useCallback(() => {
        setLogo(null);
        setData('image_id', null);
    }, [setData]);

    const handleLogoChosen = useCallback((selected: ImageSelectorItem[]) => {
        const picked = selected[0];

        // Снятие выбора в диалоге — такой же осознанный жест, как крестик на превью.
        if (!picked?.id) {
            handleLogoRemoved();

            return;
        }

        setLogo({id: picked.id, name: picked.name, alt: picked.alt ?? null, url: picked.url});
        setData('image_id', picked.id);
    }, [setData, handleLogoRemoved]);

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

    const selectedPickerImages: ImageSelectorItem[] = logo
        ? [{uid: `brand-logo-${logo.id}`, id: logo.id, url: logo.url, name: logo.name, alt: logo.alt}]
        : [];

    return (
        <Card>
            <CardHeader className="p-4 sm:p-6">
                <CardTitle>{t('admin.settings_general.title')}</CardTitle>
                <CardDescription>{t('admin.settings_general.description')}</CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
                <form onSubmit={onSubmit} className="flex flex-col gap-6">
                    <div className="flex min-w-0 flex-col gap-2">
                        <Label>{t('admin.settings_general.fields.image')}</Label>
                        <div className="flex items-start gap-4">
                            <MediaThumbnail
                                url={logo?.url}
                                alt={logo?.alt}
                                name={logo?.name}
                                className="size-24 shrink-0"
                                onDelete={logo ? handleLogoRemoved : undefined}
                            />
                            <div className="flex min-w-0 flex-col items-start gap-2">
                                <div className="flex flex-wrap items-center gap-2">
                                    <ImagePickerDialog
                                        multiple={false}
                                        label={logo
                                            ? t('admin.settings_general.actions.change_image')
                                            : t('admin.settings_general.actions.select_image')}
                                        selectedImages={selectedPickerImages}
                                        onChoose={handleLogoChosen}
                                    />
                                    {logo ? (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            onClick={handleLogoRemoved}
                                        >
                                            <TrashIcon className="size-4"/>
                                            {t('admin.settings_general.actions.remove_image')}
                                        </Button>
                                    ) : null}
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    {t('admin.settings_general.hints.image')}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex min-w-0 flex-col gap-2">
                        <Label>{t('admin.settings_general.fields.about')}</Label>
                        <RichTextEditor
                            value={data.about}
                            onChange={(v) => setData('about', v)}
                            placeholder={t('admin.settings_general.placeholders.about')}
                        />
                    </div>

                    <div className="flex min-w-0 flex-col gap-2">
                        <Label>{t('admin.settings_general.fields.refund_policy')}</Label>
                        <RichTextEditor
                            value={data.refund_policy}
                            onChange={(v) => setData('refund_policy', v)}
                            placeholder={t('admin.settings_general.placeholders.refund_policy')}
                        />
                    </div>

                    <div className="flex justify-end">
                        <Button type="submit" className="w-full sm:w-auto" disabled={processing}>
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

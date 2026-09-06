import {useCallback, useRef} from "react";

import {AlertTriangleIcon, ImageOffIcon} from "lucide-react";

import {ImagePicker} from "@/components/image-picker.tsx";
import type {ImageSelectorItem} from "@/components/image-selector.tsx";
import {MediaThumbnail} from "@/components/media-thumbnail.tsx";
import {PricingSection} from "@/components/pricing-section.tsx";
import {TrashButton} from "@/components/trash-button.tsx";
import {Button} from "@/components/ui/button.tsx";
import {Input} from "@/components/ui/input.tsx";
import {Label} from "@/components/ui/label.tsx";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select.tsx";
import {Switch} from "@/components/ui/switch.tsx";
import {useLang} from "@/lib/lang";
import {useDialog} from "@/stores/dialog.ts";
import {type Option, type ProductImage, type Variant, type VariantValue} from "@/types/data";

// Должны совпадать с Variant::PRODUCTION_TIME_MIN_DAYS / PRODUCTION_TIME_MAX_DAYS —
// иначе форма пропустит значение, которое сервер отвергнет.
const PRODUCTION_TIME_MIN_DAYS = 1;
const PRODUCTION_TIME_MAX_DAYS = 365;

/**
 *
 * @param defaultVariant
 * @param images
 * @param options
 * @param onChange
 * @param onDelete
 * @constructor
 */
export const VariantLine = ({variant, images = [], options = [], onChange, onDelete, isDuplicate = false}: {
    variant: Variant,
    images: ProductImage[]
    options: Option[]
    onChange: (variant: Variant) => void
    onDelete: () => void
    isDuplicate?: boolean
}) => {

    const {t} = useLang();

    const update = useCallback((patch: Partial<Variant>) => {
        onChange({...variant, ...patch});
    }, [variant, onChange]);

    return <div
        className={`md:col-span-5 flex flex-col gap-3 md:grid md:grid-cols-subgrid md:items-end p-5 rounded-lg border transition-colors ${isDuplicate ? 'border-destructive bg-destructive/5 hover:bg-destructive/10' : 'hover:bg-muted/30 hover:border-primary/30'}`}>
        {/* Первый ряд: миниатюра, «под заказ», срок, цены и удаление.
            На мобильном цены переносятся ниже, остальное остаётся в ряду. */}
        <div className="flex items-end gap-3 md:contents">
            <VariantImagePicker
                image={variant?.image?.image?.url ?? undefined}
                images={images}
                onSelect={(image?: ImageSelectorItem) => {
                    const productImage = image ? {
                        uid: image.uid,
                        image_id: image.id,
                        image: {
                            uid: image.uid,
                            id: image.id,
                            name: image.name,
                            url: image.url,
                            alt: image.alt
                        }
                    } as ProductImage : null;

                    update({
                        ...(productImage ? {image: productImage} : {}),
                    } as Partial<Variant>);
                }}/>
            <MadeToOrderControl
                isMadeToOrder={variant.is_made_to_order ?? false}
                productionTimeDays={variant.production_time_days ?? null}
                onChange={update}
            />
            {/* Распорка: держит цены и корзину на месте, когда появляется поле срока */}
            <div className="hidden md:block"/>
            <div className="ms-auto md:hidden">
                <TrashButtonCell onDelete={onDelete}/>
            </div>
        </div>
        <PricingSection
            price={(variant.price ?? 0).toString()}
            finalPrice={(variant.final_price ?? 0).toString()}
            onChange={update}
        />
        <div className="hidden md:block">
            <TrashButtonCell onDelete={onDelete}/>
        </div>
        {/* Поля опций: на десктопе — второй ряд, на мобильном — по два в ряд под ценами */}
        {!!variant.values?.length && (
            <div className="md:col-span-5 grid grid-cols-2 gap-x-4 gap-y-3 md:flex md:flex-wrap md:gap-4">
                {variant.values.map(v => (
                    <VariantValueSelect
                        key={v.uid}
                        variantValue={v}
                        option={options.find(o => o.id === v.option_id)}
                        onChange={(updated) => {
                            update({
                                values: variant.values?.map(val => val.uid === v.uid ? updated : val),
                            });
                        }}
                    />
                ))}
            </div>
        )}
        {!!isDuplicate && (
            <div className="md:col-span-5 flex items-center gap-2 text-destructive text-sm">
                <AlertTriangleIcon className="h-4 w-4 shrink-0" />
                <span>{t('admin.products_edit.duplicate_variants.line_message')}</span>
            </div>
          )}
    </div>
}

/**
 * Кнопка удаления, выровненная по центральной оси полей первого ряда:
 * высота обёртки совпадает с высотой инпутов, поэтому иконка встаёт по их центру.
 */
const TrashButtonCell = ({onDelete}: { onDelete: () => void }) => (
    <div className="flex h-9 items-center">
        <TrashButton onClick={onDelete}/>
    </div>
)

/**
 * Переключатель «Под заказ» и необязательный срок изготовления.
 *
 * Подпись стоит над переключателем, поле срока появляется справа только
 * во включённом состоянии; при выключении срок очищается, чтобы на сервер
 * не уезжало значение от прошлой настройки варианта.
 */
const MadeToOrderControl = ({isMadeToOrder, productionTimeDays, onChange}: {
    isMadeToOrder: boolean,
    productionTimeDays: number | null,
    onChange: (patch: Partial<Variant>) => void
}) => {
    const {t} = useLang();

    const onDaysChange = (raw: string) => {
        if (raw === '') {
            onChange({production_time_days: null});

            return;
        }

        const parsed = Number.parseInt(raw, 10);

        if (Number.isNaN(parsed)) {
            onChange({production_time_days: null});

            return;
        }

        // Значение вне диапазона сервер отвергнет, а ошибки уровня варианта
        // форма нигде не показывает — сохранение просто молча не пройдёт.
        // Поэтому не даём выйти за границы прямо при вводе.
        const clamped = Math.min(PRODUCTION_TIME_MAX_DAYS, Math.max(PRODUCTION_TIME_MIN_DAYS, parsed));

        onChange({production_time_days: clamped});
    };

    return <div className="flex items-end gap-3">
        <div className="space-y-0">
            <Label className="flex items-center gap-1 text-muted-foreground text-xs text-nowrap">
                {t('admin.products_edit.fields.made_to_order')}
            </Label>
            <div className="flex h-9 items-center">
                <Switch
                    checked={isMadeToOrder}
                    aria-label={t('admin.products_edit.fields.made_to_order')}
                    onCheckedChange={(checked) => {
                        onChange({
                            is_made_to_order: checked,
                            // Выключение гасит срок, чтобы он не всплыл при повторном включении
                            ...(checked ? {} : {production_time_days: null}),
                        });
                    }}
                />
            </div>
        </div>
        {!!isMadeToOrder && (
            <div className="relative">
                <Input
                    className="h-9 w-24 pe-9"
                    min={PRODUCTION_TIME_MIN_DAYS}
                    max={PRODUCTION_TIME_MAX_DAYS}
                    step={1}
                    type="number"
                    inputMode="numeric"
                    aria-label={t('admin.products_edit.fields.production_time')}
                    value={productionTimeDays ?? ''}
                    onChange={(e) => onDaysChange(e.target.value)}
                />
                <span className="pointer-events-none absolute inset-y-0 end-3 flex items-center text-xs text-muted-foreground">
                    {t('admin.products_edit.units.days_short')}
                </span>
            </div>
        )}
    </div>
}

/**
 *
 * @param image
 * @param images
 * @param onSelect
 * @constructor
 */
const VariantImagePicker = ({image, images, onSelect}: {
    image?: string,
    images: ProductImage[],
    onSelect: (image?: ImageSelectorItem) => void
}) => {
    const {t} = useLang();
    const {openDialog, closeDialog} = useDialog();

    const selectedImagesRef = useRef<ImageSelectorItem[]>([])

    const onChoose = () => {
        const items = selectedImagesRef.current;

        onSelect(items?.length ? items[0] : undefined);
        closeDialog();
    };

    const onClick = () => {
        openDialog({
            title: t('admin.products_edit.actions.select_image'),
            className: 'w-full md:max-w-[70%]',
            content: (
                <ImagePicker
                    resource={route('admin.media.api.index')}
                    images={images.map(i => ({
                        id: i.image_id ?? null,
                        uid: i.uid,
                        url: i.image?.url ?? '',
                        name: i.image?.name ?? '',
                        alt: i.image?.alt ?? null,
                    }))}
                    multiple={false}
                    onChange={(items) => {
                        selectedImagesRef.current = items
                    }}
                />
            ),
            footer: (
                <div className="pt-5">
                    <Button onClick={onChoose}>{t('admin.products_edit.images.choose')}</Button>
                </div>
            )
        });
    }

    return <button
        type="button"
        onClick={onClick}
        className="shrink-0 transition-colors hover:bg-muted/60 ">
        {
            image ?
                <MediaThumbnail url={image} className="w-16 h-16"/> :
                <div
                    className="w-16 h-16 flex justify-center items-center rounded-lg border-2 border-dashed border-border hover:border-primary/40">
                    <ImageOffIcon className="w-4 h-4 text-muted-foreground"/>
                </div>
        }
    </button>
}

/**
 *
 * @param variantValue
 * @param option
 * @param onChange
 * @constructor
 */
const VariantValueSelect = ({variantValue, option, onChange}: {
    variantValue: VariantValue,
    option?: Option,
    onChange: (updated: VariantValue) => void
}) => {
    const label = option?.title || option?.name;

    if (!option?.values?.length) {
        return <div className="min-w-0 space-y-0 md:w-56">
            {!!label && <Label className="text-muted-foreground text-xs">{label}</Label>}
            <span className="flex h-9 items-center truncate rounded-md border border-input bg-muted px-3 text-sm">
                {variantValue.value?.value}
            </span>
        </div>
    }

    return <div className="min-w-0 space-y-0 md:w-56">
        {!!label && <Label className="text-muted-foreground text-xs">{label}</Label>}
        <Select
            value={variantValue.option_value_id?.toString() ?? ''}
            onValueChange={(newValueId) => {
                const newOptionValue = option.values?.find(ov => ov.id?.toString() === newValueId);

                if (!newOptionValue) {return;}
                onChange({...variantValue, option_value_id: newOptionValue.id ?? undefined, value: newOptionValue});
            }}
        >
            <SelectTrigger className="h-9 w-full">
                <SelectValue/>
            </SelectTrigger>
            <SelectContent>
                {option.values.map(ov => (
                    <SelectItem key={ov.id} value={ov.id?.toString() ?? ''}>
                        {ov.value}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    </div>
}

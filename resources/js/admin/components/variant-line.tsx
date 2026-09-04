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
import {cn} from "@/lib/utils.ts";
import {useDialog} from "@/stores/dialog.ts";
import {type Option, type ProductImage, type Variant, type VariantValue} from "@/types/data";

/**
 *
 * @param defaultVariant
 * @param images
 * @param options
 * @param onChange
 * @param onDelete
 * @constructor
 */
export const VariantLine = ({variant, images = [], options = [], productionTimeError, onChange, onDelete, isDuplicate = false}: {
    variant: Variant,
    images: ProductImage[]
    options: Option[]
    productionTimeError?: string
    onChange: (variant: Variant) => void
    onDelete: () => void
    isDuplicate?: boolean
}) => {

    const {t} = useLang();

    const update = useCallback((patch: Partial<Variant>) => {
        onChange({...variant, ...patch});
    }, [variant, onChange]);

    const isMadeToOrder = variant.is_made_to_order;
    const hasOptions = Boolean(variant.values?.length);

    return <div
        className={`grid grid-cols-[minmax(0,1fr)_28px] items-start gap-x-2 gap-y-3 rounded-lg border p-4 transition-colors sm:p-5 xl:grid-cols-[minmax(236px,480px)_292px_minmax(0,1fr)_28px] ${isDuplicate ? 'border-destructive bg-destructive/5 hover:bg-destructive/10' : 'hover:bg-muted/30 hover:border-primary/30'}`}>
        <div className="col-start-1 row-start-1 flex min-w-0 items-start gap-2">
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
            <div className="flex min-w-0 flex-1 items-end gap-2">
                <div className="flex shrink-0 flex-col gap-1">
                    <Label
                        htmlFor={`made-to-order-${variant.uid}`}
                        className="cursor-pointer whitespace-nowrap text-xs font-normal text-muted-foreground"
                    >
                        {t('admin.products_edit.availability.made_to_order')}
                    </Label>
                    <div className="flex h-9 items-center justify-center">
                        <Switch
                            id={`made-to-order-${variant.uid}`}
                            checked={isMadeToOrder}
                            aria-label={t('admin.products_edit.availability.made_to_order')}
                            onCheckedChange={(checked) => update({
                                is_made_to_order: checked,
                                production_time_days: checked ? variant.production_time_days : null,
                            })}
                        />
                    </div>
                </div>
                <div
                    aria-hidden={!isMadeToOrder}
                    className={cn(
                        "grid w-14 shrink-0 grid-rows-[1rem_2.25rem] gap-1 transition-opacity duration-150",
                        isMadeToOrder ? "opacity-100" : "pointer-events-none invisible opacity-0",
                    )}
                >
                    <div className="relative row-start-2">
                        <Input
                            id={`production-time-${variant.uid}`}
                            type="number"
                            inputMode="numeric"
                            min={1}
                            max={365}
                            step={1}
                            disabled={!isMadeToOrder}
                            value={variant.production_time_days ?? ''}
                            title={productionTimeError}
                            aria-label={t('admin.products_edit.availability.production_time')}
                            aria-invalid={Boolean(productionTimeError)}
                            aria-describedby={productionTimeError ? `production-time-error-${variant.uid}` : undefined}
                            className={cn(
                                "h-9 appearance-none px-1 pr-6 text-center text-xs tabular-nums [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
                                productionTimeError && "border-destructive focus-visible:ring-destructive",
                            )}
                            onChange={(event) => {
                                const {value} = event.target;

                                update({production_time_days: value === '' ? null : Number(value)});
                            }}
                        />
                        <span className="pointer-events-none absolute inset-y-0 right-1.5 flex items-center text-[10px] text-muted-foreground">
                            {t('admin.products_edit.availability.days_short')}
                        </span>
                    </div>
                    {productionTimeError ? (
                        <span id={`production-time-error-${variant.uid}`} className="sr-only">
                            {productionTimeError}
                        </span>
                    ) : null}
                </div>
            </div>
        </div>
        <div className="col-span-2 row-start-2 min-w-0 xl:col-span-1 xl:col-start-2 xl:row-start-1">
            <PricingSection
                price={(variant.price ?? 0).toString()}
                finalPrice={(variant.final_price ?? 0).toString()}
                onChange={update}
            />
        </div>
        {hasOptions ? (
            <div className="col-span-2 row-start-3 grid w-full min-w-0 grid-cols-2 gap-2 xl:col-span-1 xl:col-start-1 xl:row-start-2">
                {variant.values?.map(v => (
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
        ) : null}
        <div className="col-start-2 row-start-1 grid grid-rows-[1rem_2.25rem] gap-1 justify-self-end xl:col-start-4">
            <div className="row-start-2 flex h-9 items-center">
                <TrashButton
                    ariaLabel={t('admin.products_edit.actions.delete_variant')}
                    onClick={onDelete}
                />
            </div>
        </div>
        {!!isDuplicate && (
            <div className="col-span-2 flex items-center gap-2 text-sm text-destructive xl:col-span-4">
                <AlertTriangleIcon className="h-4 w-4 shrink-0" />
                <span>{t('admin.products_edit.duplicate_variants.line_message')}</span>
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
        className="mt-1.5 shrink-0 transition-colors hover:bg-muted/60">
        {
            image ?
                <MediaThumbnail url={image} className="size-16"/> :
                <div
                    className="flex size-16 items-center justify-center rounded-lg border-2 border-dashed border-border hover:border-primary/40">
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
        return <div className="min-w-0 space-y-1">
            {label ? <Label className="block truncate text-[11px] text-muted-foreground">{label}</Label> : null}
            <span className="flex h-9 min-w-0 items-center truncate rounded border border-border bg-muted px-2 text-[13px]">
                {variantValue.value?.value}
            </span>
        </div>
    }

    return <div className="min-w-0 space-y-1">
        {label ? <Label className="block truncate text-[11px] text-muted-foreground">{label}</Label> : null}
        <Select
            value={variantValue.option_value_id?.toString() ?? ''}
            onValueChange={(newValueId) => {
                const newOptionValue = option.values?.find(ov => ov.id?.toString() === newValueId);

                if (!newOptionValue) {return;}
                onChange({...variantValue, option_value_id: newOptionValue.id ?? undefined, value: newOptionValue});
            }}
        >
            <SelectTrigger aria-label={label} className="h-9 w-full min-w-0 gap-1 rounded border-border bg-muted px-2 text-[13px]">
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

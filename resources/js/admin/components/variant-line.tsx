import {Option, ProductImage, Variant, VariantValue} from "@/types/data";
import {ImageOffIcon} from "lucide-react";
import {TrashButton} from "@/components/trash-button.tsx";
import {PricingSection} from "@/components/pricing-section.tsx";
import {useEffect, useRef, useState} from "react";
import {useDialog} from "@/stores/dialog.ts";
import {ImagePicker} from "@/components/image-picker.tsx";
import type {ImageSelectorItem} from "@/components/image-selector.tsx";
import {Button} from "@/components/ui/button.tsx";
import {MediaThumbnail} from "@/components/media-thumbnail.tsx";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select.tsx";

/**
 *
 * @param defaultVariant
 * @param images
 * @param options
 * @param onChange
 * @param onDelete
 * @constructor
 */
export const VariantLine = ({variant: defaultVariant, images = [], options = [], onChange, onDelete}: {
    variant: Variant,
    images: ProductImage[]
    options: Option[]
    onChange: (variant: Variant) => void
    onDelete: () => void
}) => {

    const [variant, setVariant] = useState<Variant>(defaultVariant)

    useEffect(() => {
        if (onChange) {
            onChange(variant);
        }
    }, [variant]);

    /**
     *
     * @param values
     */
    const onSelect = (values: any) => {
        setVariant(v => ({...v, ...values}))
    }

    return <div
        className={'col-span-4 grid grid-cols-subgrid items-center p-5 rounded-lg border transition-colors hover:bg-muted/30 hover:border-primary/30'}>
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

                onSelect({
                    ...(productImage ? {image: productImage} : {}),
                } as Variant);
            }}/>
        <div className={'flex gap-1 justify-start items-center'}>
            {variant.values?.map(v => (
                <VariantValueSelect
                    key={v.uid}
                    variantValue={v}
                    option={options.find(o => o.id === v.option_id)}
                    onChange={(updated) => {
                        setVariant(prev => ({
                            ...prev,
                            values: prev.values?.map(val => val.uid === v.uid ? updated : val),
                        }));
                    }}
                />
            ))}
        </div>
        <PricingSection
            price={(variant.price ?? 0).toString()}
            finalPrice={(variant.final_price ?? 0).toString()}
            onChange={onSelect}
        />
        <div>
            <TrashButton onClick={onDelete}/>
        </div>
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
    const {openDialog, closeDialog} = useDialog();

    const selectedImagesRef = useRef<ImageSelectorItem[]>([])

    const onChoose = () => {
        const items = selectedImagesRef.current;
        onSelect(items?.length ? items[0] : undefined);
        closeDialog();
    };

    const onClick = () => {
        openDialog({
            title: 'Select image',
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
                <div className={'pt-5'}>
                    <Button onClick={onChoose}>Choose</Button>
                </div>
            )
        });
    }

    return <button
        type="button"
        onClick={onClick}
        className={'shrink-0 transition-colors hover:bg-muted/60 '}>
        {
            image ?
                <MediaThumbnail url={image} className={'w-16 h-16'}/> :
                <div
                    className={'w-16 h-16 flex justify-center items-center rounded-lg border-2 border-dashed border-border hover:border-primary/40'}>
                    <ImageOffIcon className={'w-4 h-4 text-muted-foreground'}/>
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
    if (!option?.values?.length) {
        return <span className={'flex rounded border border-border bg-muted px-2 py-1 text-[13px]'}>
            {variantValue.value?.value}
        </span>
    }

    return <Select
        value={variantValue.option_value_id?.toString() ?? ''}
        onValueChange={(newValueId) => {
            const newOptionValue = option.values?.find(ov => ov.id?.toString() === newValueId);
            if (!newOptionValue) return;
            onChange({...variantValue, option_value_id: newOptionValue.id ?? undefined, value: newOptionValue});
        }}
    >
        <SelectTrigger className={'h-auto w-auto gap-1 rounded border-border bg-muted px-2 py-1 text-[13px]'}>
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
}

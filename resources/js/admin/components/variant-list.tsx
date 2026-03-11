import {Option, ProductImage, Variant} from "@/types/data";
import {VariantLine} from "@/components/variant-line.tsx";

export const VariantList = ({variants, images = [], options = [], onChange}: {
    variants: Variant[],
    images: ProductImage[],
    options: Option[],
    onChange: (variants: Variant[]) => void
}) => {

    const onChangeHandle = (variant: Variant) => {
        onChange(variants.map(v => {
            return variant.uid === v.uid ? {...variant} : {...v}
        }))
    }

    const onDeleteHandle = (uid: string) => {
        onChange(variants.filter(v => v.uid !== uid))
    }

    return <>
        {
            variants.map(variant => <div
                key={variant.uid}
                className={'p-5 rounded-lg border transition-colors hover:bg-muted/30 hover:border-primary/30'}>
                <VariantLine variant={variant} images={images} options={options} onChange={onChangeHandle} onDelete={() => onDeleteHandle(variant.uid)}/>
            </div>)
        }
    </>
}

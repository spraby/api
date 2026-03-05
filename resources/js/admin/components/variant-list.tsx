import {ProductImage, Variant} from "@/types/data";
import {VariantLine} from "@/components/variant-line.tsx";

export const VariantList = ({variants, images = [], onChange}: {
    variants: Variant[],
    images: ProductImage[],
    onChange: (variants: Variant[]) => void
}) => {

    const onChangeHandle = (variant: Variant) => {
        onChange(variants.map(v => {
            return variant.uid === v.uid ? {...variant} : {...v}
        }))
    }

    return <>
        {
            variants.map(variant => <div
                className={'p-5 rounded-lg border transition-colors hover:bg-muted/30 hover:border-primary/30'}>
                <VariantLine variant={variant} images={images} onChange={onChangeHandle}/>
            </div>)
        }
    </>
}

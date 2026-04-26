import {useState} from "react";

import {v4 as uuidv4} from 'uuid';

import {ToggleButton} from "@/components/toggle-button.tsx";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog.tsx";
import {useLang} from "@/lib/lang";
import {type Category, type Option, type OptionValue, type Variant} from "@/types/data";

interface PickedValue {
    option: Option;
    value: OptionValue;
}

const buildDefaultVariant = (category: Category): Variant => {
    const pickedValues: PickedValue[] = [];

    for (const option of category.options ?? []) {
        if (option.id == null) {continue;}
        const [first] = (option.values ?? []).slice().sort((a, b) => a.position - b.position);

        if (first) {pickedValues.push({option, value: first});}
    }

    return {
        uid: uuidv4(),
        title: pickedValues.map(({value}) => value.value).join(' / '),
        price: 0,
        final_price: 0,
        enabled: true,
        values: pickedValues.map(({option, value}) => ({
            uid: uuidv4(),
            option_id: option.id ?? undefined,
            option_value_id: value.id ?? undefined,
            value: {
                uid: uuidv4(),
                id: value.id ?? undefined,
                value: value.value,
                position: value.position,
            },
        })),
    };
};

export function CategoryVariantsGenerator({categories = [], selectedCategoryId, hasVariants, onSelect}: {
    categories: Category[],
    selectedCategoryId: number | null,
    hasVariants: boolean,
    onSelect: (category: Category, variant: Variant) => void
}) {
    const {t} = useLang();
    const [pendingCategory, setPendingCategory] = useState<Category | null>(null);

    const apply = (category: Category) => {
        onSelect(category, buildDefaultVariant(category));
    };

    const handleClick = (category: Category) => {
        if (!category.id || selectedCategoryId === category.id) {return;}

        if (hasVariants) {
            setPendingCategory(category);

            return;
        }

        apply(category);
    };

    return (
        <>
            <div className="flex gap-5 flex-wrap">
                {categories.map(category => (
                    <ToggleButton
                        key={category.id}
                        active={selectedCategoryId === category.id}
                        title={category.name}
                        onClick={() => handleClick(category)}
                    />
                ))}
            </div>

            <AlertDialog open={!!pendingCategory} onOpenChange={open => !open && setPendingCategory(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {t('admin.products_create.change_category_confirm.title')}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {t('admin.products_create.change_category_confirm.description')}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{t('admin.common.cancel')}</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => {
                                if (pendingCategory) {apply(pendingCategory);}
                                setPendingCategory(null);
                            }}
                        >
                            {t('admin.products_create.change_category_confirm.confirm')}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
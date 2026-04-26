import {useMemo, useState} from "react";

import {v4 as uuidv4} from 'uuid';

import {CategoryPicker} from "@/components/category-picker.tsx";
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

    const categoryOptions = useMemo(
        () => categories
            .filter((c): c is Category & {id: number} => c.id != null)
            .map(c => ({id: c.id, name: c.name})),
        [categories]
    );

    const apply = (category: Category) => {
        onSelect(category, buildDefaultVariant(category));
    };

    const handleChange = (ids: number[]) => {
        const newId = ids[0];

        if (newId == null || newId === selectedCategoryId) {return;}
        const cat = categories.find(c => c.id === newId);

        if (!cat) {return;}

        if (hasVariants) {
            setPendingCategory(cat);

            return;
        }

        apply(cat);
    };

    return (
        <>
            <CategoryPicker
                multiple={false}
                categories={categoryOptions}
                selectedIds={selectedCategoryId != null ? [selectedCategoryId] : []}
                onChange={handleChange}
                label={t('admin.products_create.category_picker.label')}
                hint={t('admin.products_create.category_picker.hint')}
                searchPlaceholder={t('admin.products_create.category_picker.search_placeholder')}
            />

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

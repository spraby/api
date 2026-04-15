import {useEffect, useRef, useState} from "react";

import {OptionsValueGenerator} from "@/components/options-value-generator.tsx";
import {ToggleButton} from "@/components/toggle-button.tsx";
import {type Category, type OptionValue} from "@/types/data";

/**
 *
 * @param categories
 * @param onGenerate
 * @param onSetCategory
 * @constructor
 */
export function CategoryVariantsGenerator({categories = [], onGenerate, onSetCategory}: {
    categories: Category[],
    onGenerate: (combinations: OptionValue[][]) => void,
    onSetCategory: (category: Category | null) => void
}) {
    const [category, setCategory] = useState<Category>();
    const isFirstRender = useRef(true);
    const onSetCategoryRef = useRef(onSetCategory);
    onSetCategoryRef.current = onSetCategory;

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;

            return;
        }
        onSetCategoryRef.current(category ?? null)
    }, [category]);

    return <div className="flex flex-col gap-5">
        <CategoriesLine categories={categories} onSelect={setCategory}/>
        <OptionsValueGenerator key={category?.id ?? 'none'} options={category?.options ?? []} onGenerate={onGenerate}/>
    </div>
}

/**
 *
 * @param categories
 * @param onSelect
 * @constructor
 */
const CategoriesLine = ({categories, onSelect}: {
    categories: Category[],
    onSelect: (category: Category) => void
}) => {
    const [activeId, setActiveId] = useState<number>()

    const onClick = (category: Category) => {
        if (category?.id) {
            onSelect(category);
            setActiveId(category.id);
        }
    }

    return <div className="flex gap-5">
        {
            categories.map(category => {
                const active = activeId === category.id;

                return <ToggleButton
                    key={category.id}
                    active={active}
                    title={category.name}
                    onClick={() => onClick(category)}
                />
            })
        }
    </div>
}

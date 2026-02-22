import {StepHeader} from '@/components/step-header';
import {Button} from '@/components/ui/button';
import {Card} from '@/components/ui/card';
import {cn} from '@/lib/utils';
import type {Category, Option, OptionValue} from '@/types/models';

export type CategoryWithOptions = Category & {
    options: (Option & {values: OptionValue[]})[];
};

interface ProductCategoryCardProps {
    categories: CategoryWithOptions[];
    categoryId: number | null;
    selectedValues: Record<number, number[]>;
    error?: string;
    onSelectCategory: (id: number) => void;
    onToggleOptionValue: (optionId: number, valueId: number) => void;
    onSelectAllValues: (optionId: number, values: OptionValue[]) => void;
    onDeselectAllValues: (optionId: number) => void;
    onGenerateVariants: () => void;
    combinationCount: number;
}

/** Detects if a value string is a CSS hex color */
function isHexColor(value: string): boolean {
    return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(value);
}

/** Returns true if an option is a color-type option */
function isColorOption(option: Option): boolean {
    const name = option.name.toLowerCase();

    return name === 'color' || name === 'colour' || name === 'цвет';
}

export function ProductCategoryCard({
    categories,
    categoryId,
    selectedValues,
    error,
    onSelectCategory,
    onToggleOptionValue,
    onSelectAllValues,
    onDeselectAllValues,
    onGenerateVariants,
    combinationCount,
}: ProductCategoryCardProps) {
    const selectedCategory = categories.find(c => c.id === categoryId) ?? null;
    const totalSelected = Object.values(selectedValues).reduce(
        (acc, ids) => acc + ids.length,
        0,
    );

    return (
        <Card className="flex flex-col gap-5 p-4 sm:p-6">
            <StepHeader step={2} label="Категория и опции" />

            {/* Category chips */}
            <div className="flex flex-col gap-2">
                <div className="flex flex-wrap gap-2">
                    {categories.map(cat => {
                        const active = cat.id === categoryId;

                        return (
                            <button
                                key={cat.id}
                                type="button"
                                onClick={() => cat.id != null && onSelectCategory(cat.id)}
                                className={cn(
                                    'rounded-lg border px-3 py-1.5 text-sm transition-colors',
                                    active
                                        ? 'border-primary bg-primary/5 text-primary'
                                        : 'border-border bg-transparent text-muted-foreground hover:border-primary/40 hover:text-foreground',
                                )}
                            >
                                {cat.name}
                            </button>
                        );
                    })}
                </div>
                {!!error && <p className="text-[11px] text-destructive">{error}</p>}
            </div>

            {/* Option blocks — appear after category selection */}
            {!!selectedCategory && selectedCategory.options.length > 0 && (
                <div className="flex flex-col gap-3">
                    {selectedCategory.options.map(option => {
                        if (!option.id) {return null;}

                        const optionId = option.id;
                        const selected = selectedValues[optionId] ?? [];
                        const allSelected = option.values.length > 0
                            && selected.length === option.values.length;
                        const isColor = isColorOption(option);

                        return (
                            <div key={optionId} className="flex flex-col gap-2 rounded-xl bg-muted/40 px-4 py-3.5">
                                {/* Option header */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="text-[13px] font-bold">{option.title}</span>
                                        {selected.length > 0 && (
                                            <span className="rounded bg-primary/10 px-1.5 py-0.5 font-mono text-xs text-primary">
                                                {selected.length}
                                            </span>
                                        )}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => allSelected
                                            ? onDeselectAllValues(optionId)
                                            : onSelectAllValues(optionId, option.values)}
                                        className="text-[11px] text-primary hover:underline"
                                    >
                                        {allSelected ? 'Снять все' : 'Выбрать все'}
                                    </button>
                                </div>

                                {/* Value chips */}
                                <div className="flex flex-wrap gap-1.5">
                                    {option.values.map(val => {
                                        if (!val.id) {return null;}

                                        const valueId = val.id;
                                        const isSelected = selected.includes(valueId);
                                        const hexColor = isColor && isHexColor(val.value)
                                            ? val.value
                                            : null;

                                        return (
                                            <button
                                                key={valueId}
                                                type="button"
                                                onClick={() => onToggleOptionValue(optionId, valueId)}
                                                className={cn(
                                                    'flex items-center gap-1.5 rounded-lg border px-3.5 py-1.5 text-[13px] transition-colors',
                                                    isSelected
                                                        ? 'border-primary bg-primary/5 text-primary'
                                                        : 'border-border bg-transparent text-muted-foreground hover:border-primary/40',
                                                )}
                                            >
                                                {!!hexColor && (
                                                    <span
                                                        className="size-3 shrink-0 rounded-full border-2"
                                                        style={{
                                                            backgroundColor: hexColor,
                                                            borderColor: isSelected ? 'currentColor' : '#94a3b8',
                                                        }}
                                                    />
                                                  )}
                                                {val.value}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
              )}

            {/* Generate variants button */}
            {!!selectedCategory && (
                <div className="flex items-center justify-between">
                    <Button
                        type="button"
                        disabled={totalSelected === 0}
                        onClick={onGenerateVariants}
                    >
                        Сгенерировать варианты
                    </Button>
                    {combinationCount > 0 && (
                        <span className="font-mono text-xs text-muted-foreground">
                            {combinationCount} комб.
                        </span>
                    )}
                </div>
              )}
        </Card>
    );
}

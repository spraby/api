import {Alert, AlertDescription} from "@/components/ui/alert.tsx";
import {Card} from "@/components/ui/card.tsx";
import {Checkbox} from '@/components/ui/checkbox';
import {Label} from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {useLang} from '@/lib/lang';
import type {Category} from "@/types/models.ts";

interface ProductCategorySelectProps {
    enabled: boolean;
    category: Category | null | undefined;
    brandCategories: Category[];
    isEditMode: boolean;
    errors: { enabled?: string; category_id?: string };
    onEnabledChange: (enabled: boolean) => void;
    onCategoryChange: (categoryId: number) => void;
}

export function ProductCategorySelect({
    enabled,
    category,
    brandCategories,
    isEditMode,
    errors,
    onEnabledChange,
    onCategoryChange,
}: ProductCategorySelectProps) {
    const {t} = useLang();

    return (
        <Card className="flex flex-col gap-4 md:gap-5 rounded-lg border bg-card p-4 sm:p-6">
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                    <Checkbox
                        checked={enabled}
                        id="enabled"
                        onCheckedChange={v => onEnabledChange(v as boolean)}
                    />
                    <Label className="cursor-pointer" htmlFor="enabled">
                        {t('admin.products_edit.fields.enabled')}
                    </Label>
                </div>
                {!!errors.enabled && <p className="text-xs text-destructive">{errors.enabled}</p>}
            </div>
            {
                category?.id ?
                    <div className="gap-2 flex flex-col">
                        <Label htmlFor="category">{t('admin.products_edit.fields.category')}</Label>
                        <Select
                            disabled={isEditMode}
                            value={category.id.toString()}
                            onValueChange={(value) => {
                                if (!value?.length) {
                                    return;
                                }
                                onCategoryChange(Number(value));
                            }}
                        >
                            <SelectTrigger
                                id="category"
                                className={errors.category_id ? 'border-destructive' : ''}
                            >
                                <SelectValue placeholder={t('admin.products_edit.placeholders.category')}/>
                            </SelectTrigger>
                            <SelectContent>
                                {brandCategories.map((cat) => (
                                    cat?.id ?
                                        <SelectItem key={cat.id} value={cat?.id.toString()}>
                                            {cat.name}
                                        </SelectItem> : null
                                ))}
                            </SelectContent>
                        </Select>

                        {!!errors.category_id &&
                            <p className="text-xs text-destructive">{errors.category_id}</p>}
                        {!isEditMode && (
                            <p className="text-xs text-muted-foreground">
                                {t('admin.products_edit.category.locked')}
                            </p>
                        )}

                    </div> :
                    <Alert variant="destructive">
                        <AlertDescription>
                            {t('admin.products_edit.category.not_in_list')}
                        </AlertDescription>
                    </Alert>
            }
        </Card>
    );
}

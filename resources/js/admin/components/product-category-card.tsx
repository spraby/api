import {Card} from '@/components/ui/card';
import {Label} from '@/components/ui/label';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {useLang} from '@/lib/lang';

interface Category {
    id: number;
    name: string;
}

interface ProductCategoryCardProps {
    categoryId: number | undefined;
    categories: Category[];
    error?: string;
    onChange: (categoryId: number) => void;
}

export function ProductCategoryCard({categoryId, categories, error, onChange}: ProductCategoryCardProps) {
    const {t} = useLang();

    return (
        <Card className="flex flex-col gap-2 p-4 sm:p-6">
            <Label>{t('admin.products_edit.fields.category')}</Label>
            <Select
                value={categoryId?.toString() ?? ''}
                onValueChange={val => onChange(Number(val))}
            >
                <SelectTrigger>
                    <SelectValue placeholder={t('admin.products_edit.placeholders.category')}/>
                </SelectTrigger>
                <SelectContent>
                    {categories
                        .filter(cat => cat.id != null)
                        .map(cat => (
                            <SelectItem key={cat.id} value={String(cat.id)}>
                                {cat.name}
                            </SelectItem>
                        ))}
                </SelectContent>
            </Select>
            {!!error && <p className="text-xs text-destructive">{error}</p>}
        </Card>
    );
}

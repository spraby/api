import {StepHeader} from '@/components/step-header';
import {Card} from '@/components/ui/card';
import {Input} from '@/components/ui/input';
import {cn} from '@/lib/utils';

interface ProductBasicFieldsCardProps {
    title: string;
    description: string;
    errors: {title?: string; description?: string};
    onChange: (field: 'title' | 'description', value: string) => void;
}

export function ProductBasicFieldsCard({title, description, errors, onChange}: ProductBasicFieldsCardProps) {
    return (
        <Card className="flex flex-col gap-5 p-4 sm:p-6">
            <StepHeader step={1} label="Основная информация" />

            <div className="flex flex-col gap-1.5">
                <label className="flex items-center gap-1 text-xs font-semibold text-muted-foreground" htmlFor="product-title">
                    Название продукта
                    <span className="text-destructive">*</span>
                </label>
                <Input
                    required
                    id="product-title"
                    placeholder="Например: Футболка Premium"
                    type="text"
                    value={title}
                    onChange={e => onChange('title', e.target.value)}
                    className={cn(
                        'rounded-[10px] border-[1.5px] px-3.5 py-2.5 focus-visible:border-primary focus-visible:ring-0',
                        errors.title ? 'border-destructive' : 'border-input',
                    )}
                />
                {!!errors.title && (
                    <p className="text-[11px] text-destructive">{errors.title}</p>
                )}
            </div>

            <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-muted-foreground" htmlFor="product-description">
                    Описание
                </label>
                <textarea
                    id="product-description"
                    rows={3}
                    placeholder="Опишите продукт..."
                    value={description}
                    onChange={e => onChange('description', e.target.value)}
                    className="w-full resize-y rounded-[10px] border-[1.5px] border-input bg-background px-3.5 py-2.5 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                />
            </div>
        </Card>
    );
}

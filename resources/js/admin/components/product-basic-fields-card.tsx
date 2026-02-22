import {StepHeader} from '@/components/step-header';
import {Card} from '@/components/ui/card';
import {Input} from '@/components/ui/input';
import {RichTextEditor} from '@/components/ui/rich-text-editor';
import {useLang} from '@/lib/lang';
import {cn} from '@/lib/utils';

interface ProductBasicFieldsCardProps {
    title: string;
    description: string;
    errors: {title?: string; description?: string};
    onChange: (field: 'title' | 'description', value: string) => void;
}

export function ProductBasicFieldsCard({title, description, errors, onChange}: ProductBasicFieldsCardProps) {
    const {t} = useLang();

    return (
        <Card className="flex flex-col gap-5 p-4 sm:p-6">
            <StepHeader step={1} label={t('admin.products_edit.basic_info')} />

            <div className="flex flex-col gap-1.5">
                <label className="flex items-center gap-1 text-xs font-semibold text-muted-foreground" htmlFor="product-title">
                    {t('admin.products_edit.product_title_label')}
                    <span className="text-destructive">*</span>
                </label>
                <Input
                    required
                    id="product-title"
                    placeholder={t('admin.products_edit.placeholders.title')}
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
                <p className="text-xs font-semibold text-muted-foreground">
                    {t('admin.products_edit.fields.description')}
                </p>
                <RichTextEditor
                    value={description}
                    onChange={v => onChange('description', v)}
                    placeholder={t('admin.products_edit.placeholders.description')}
                />
            </div>
        </Card>
    );
}

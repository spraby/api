import {Card} from '@/components/ui/card';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {RichTextEditor} from '@/components/ui/rich-text-editor';
import {useLang} from '@/lib/lang';

interface ProductBasicFieldsCardProps {
    title: string;
    description: string;
    errors: {title?: string; description?: string};
    onChange: (field: 'title' | 'description', value: string) => void;
}

export function ProductBasicFieldsCard({title, description, errors, onChange}: ProductBasicFieldsCardProps) {
    const {t} = useLang();

    return (
        <Card className="flex flex-col gap-4 md:gap-5 p-4 sm:p-6">
            <div className="gap-2 flex flex-col">
                <Label className="flex items-center gap-1" htmlFor="title">
                    {t('admin.products_edit.fields.title')}
                    <span className="text-destructive">*</span>
                </Label>
                <Input
                    required
                    id="title"
                    placeholder={t('admin.products_edit.placeholders.title')}
                    type="text"
                    value={title}
                    onChange={e => onChange('title', e.target.value)}
                    className={errors.title ? 'border-destructive' : ''}
                />
                {!!errors.title && <p className="text-xs text-destructive">{errors.title}</p>}
            </div>
            <div className="gap-2 flex flex-col">
                <Label htmlFor="description">{t('admin.products_edit.fields.description')}</Label>
                <RichTextEditor
                    placeholder={t('admin.products_edit.placeholders.description')}
                    value={description}
                    onChange={val => onChange('description', val)}
                />
                {!!errors.description && <p className="text-xs text-destructive">{errors.description}</p>}
            </div>
        </Card>
    );
}

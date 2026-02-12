import {Card} from "@/components/ui/card.tsx";
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {RichTextEditor} from '@/components/ui/rich-text-editor';
import {useLang} from '@/lib/lang';

interface ProductBasicFieldsProps {
    title: string;
    description: string | null;
    errors: { title?: string; description?: string };
    onTitleChange: (title: string) => void;
    onDescriptionChange: (description: string) => void;
}

export function ProductBasicFields({
    title,
    description,
    errors,
    onTitleChange,
    onDescriptionChange,
}: ProductBasicFieldsProps) {
    const {t} = useLang();

    return (
        <Card className="flex flex-col gap-4 md:gap-5 p-4 sm:p-6">
            <div className="col-span-12 gap-2 flex flex-col">
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
                    onChange={e => onTitleChange(e.target.value)}
                    className={errors.title ? 'border-destructive' : ''}
                />
                {!!errors.title && <p className="text-xs text-destructive">{errors.title}</p>}
            </div>
            <div className="col-span-12 gap-2 flex flex-col">
                <Label htmlFor="description">{t('admin.products_edit.fields.description')}</Label>
                <RichTextEditor
                    placeholder={t('admin.products_edit.placeholders.description')}
                    value={description ?? ''}
                    onChange={onDescriptionChange}
                />
                {!!errors.description && <p className="text-xs text-destructive">{errors.description}</p>}
            </div>
        </Card>
    );
}

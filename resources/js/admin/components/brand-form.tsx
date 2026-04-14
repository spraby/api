import {Card} from "@/components/ui/card.tsx";
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Textarea} from '@/components/ui/textarea';
import {useLang} from '@/lib/lang';

interface BrandFormFieldsProps {
    name: string;
    description: string | null;
    errors: Partial<Record<'name' | 'description', string>>;
    onChange: (field: 'name' | 'description', value: string) => void;
}

export function BrandFormFields({name, description, errors, onChange}: BrandFormFieldsProps) {
    const {t} = useLang();

    return (
        <Card className="flex flex-col gap-4 md:gap-5 p-4 sm:p-6">
            <div className="gap-2 flex flex-col">
                <Label className="flex items-center gap-1" htmlFor="name">
                    {t('admin.brands_edit.fields.name')}
                    <span className="text-destructive">*</span>
                </Label>
                <Input
                    required
                    id="name"
                    placeholder={t('admin.brands_edit.placeholders.name')}
                    type="text"
                    value={name}
                    onChange={e => onChange('name', e.target.value)}
                    className={errors.name ? 'border-destructive' : ''}
                />
                {!!errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
            </div>

            <div className="gap-2 flex flex-col">
                <Label htmlFor="description">
                    {t('admin.brands_edit.fields.description')}
                </Label>
                <Textarea
                    id="description"
                    placeholder={t('admin.brands_edit.placeholders.description')}
                    value={description ?? ''}
                    onChange={e => onChange('description', e.target.value)}
                    className={errors.description ? 'border-destructive' : ''}
                    rows={4}
                />
                {!!errors.description && <p className="text-xs text-destructive">{errors.description}</p>}
            </div>
        </Card>
    );
}
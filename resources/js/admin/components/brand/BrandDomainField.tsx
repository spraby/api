import {useState} from 'react';

import {useForm} from '@inertiajs/react';
import {SaveIcon} from 'lucide-react';

import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {useLang} from '@/lib/lang';

export interface BrandDomainFieldProps {
    brandId: number;
    /** Домен, уже закреплённый за брендом. */
    domain: string | null;
    /** Чем заполнить поле, когда своего домена нет: транскрипция названия. */
    suggestedDomain: string;
    /** Домен правит только админ — остальным поле не рендерится вовсе. */
    canEdit: boolean;
}

export default function BrandDomainField({brandId, domain, suggestedDomain, canEdit}: BrandDomainFieldProps) {
    const {t} = useLang();
    const {data, setData, put, processing, errors} = useForm({
        domain: domain ?? suggestedDomain,
    });

    // Сервер нормализует хэндл (нижний регистр, обрезка адреса), поэтому после
    // сохранения в поле должно оказаться то, что реально записано в бренд.
    const [syncedDomain, setSyncedDomain] = useState(domain);

    if (syncedDomain !== domain) {
        setSyncedDomain(domain);
        setData('domain', domain ?? suggestedDomain);
    }

    if (!canEdit) {
        return null;
    }

    const handleSave = () => {
        put(route('admin.brands.domain.update', brandId), {preserveScroll: true});
    };

    const isUnchanged = (data.domain || null) === domain;

    return (
        <div className="flex min-w-0 flex-col gap-2">
            <Label htmlFor={`brand-domain-${brandId}`}>{t('admin.brands_edit.domain.label')}</Label>
            <div className="flex flex-wrap items-start gap-2">
                <Input
                    className="sm:max-w-sm"
                    id={`brand-domain-${brandId}`}
                    value={data.domain}
                    onChange={(event) => {
                        setData('domain', event.target.value);
                    }}
                />
                <Button disabled={processing || isUnchanged} type="button" onClick={handleSave}>
                    <SaveIcon className="size-4"/>
                    {t('admin.brands_edit.domain.save')}
                </Button>
            </div>
            {errors.domain ? (
                <p className="text-sm text-destructive">{errors.domain}</p>
            ) : (
                <p className="text-sm text-muted-foreground">
                    {domain
                        ? t('admin.brands_edit.domain.hint_current')
                        : t('admin.brands_edit.domain.hint_suggested')}
                </p>
            )}
        </div>
    );
}

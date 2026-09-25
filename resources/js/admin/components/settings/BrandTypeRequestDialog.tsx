import type {FormEventHandler} from 'react';

import {useForm} from '@inertiajs/react';

import {Button} from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {useLang} from '@/lib/lang';
import {cn} from '@/lib/utils';
import type {BrandAccountType, BrandTypeState} from '@/types/api';

const ACCOUNT_TYPES: BrandAccountType[] = ['master', 'business'];

interface BrandTypeRequestDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    brandType: BrandTypeState;
    /** Текущие реквизиты — подставляем, если бизнес меняет только форму занятости. */
    employmentName: string;
    employmentNumber: string;
}

/**
 * Попап заявки на смену типа аккаунта: мастер (ремесленник/самозанятый)
 * или бизнес (ИП/ЧУП/ООО + наименование и УНП). Бренд меняет модератор.
 */
export default function BrandTypeRequestDialog({
    open,
    onOpenChange,
    brandType,
    employmentName,
    employmentNumber,
}: BrandTypeRequestDialogProps) {
    const {t} = useLang();

    // Форма стартует с текущих значений: продавец меняет только нужное.
    const {data, setData, post, processing, errors, clearErrors} = useForm({
        type: brandType.type,
        employment_type: brandType.employment_type ?? '',
        employment_name: employmentName,
        employment_number: employmentNumber,
    });

    const employmentOptions = brandType.employment_types_by_type[data.type] ?? [];
    const isBusiness = data.type === 'business';

    const changeAccountType = (type: BrandAccountType) => {
        if (type === data.type) {
            return;
        }

        // Формы занятости у типов не пересекаются: при возврате к текущему
        // типу подставляем текущую форму, иначе выбор сбрасываем.
        const employmentType = type === brandType.type ? brandType.employment_type ?? '' : '';

        setData((prev) => ({...prev, type, employment_type: employmentType}));
        clearErrors();
    };

    const onSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('admin.settings.brand-type-request.store'), {
            preserveScroll: true,
            onSuccess: () => {
                onOpenChange(false);
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <form className="flex flex-col gap-5" onSubmit={onSubmit}>
                    <DialogHeader>
                        <DialogTitle>{t('admin.brand_type_request.dialog.title')}</DialogTitle>
                        <DialogDescription>{t('admin.brand_type_request.dialog.description')}</DialogDescription>
                    </DialogHeader>

                    <div className="flex flex-col gap-2">
                        <Label>{t('admin.brand_type_request.dialog.account_type')}</Label>
                        <div className="grid gap-2 sm:grid-cols-2" role="radiogroup">
                            {ACCOUNT_TYPES.map((type) => (
                                <button
                                    key={type}
                                    type="button"
                                    role="radio"
                                    aria-checked={data.type === type}
                                    className={cn(
                                        'flex flex-col items-start gap-1 rounded-lg border p-3 text-left transition-colors',
                                        'hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                                        data.type === type && 'border-primary bg-muted/50 ring-1 ring-primary',
                                    )}
                                    onClick={() => changeAccountType(type)}
                                >
                                    <span className="text-sm font-medium">
                                        {t(`admin.brand_type_request.types.${type}`)}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                        {t(`admin.brand_type_request.type_hints.${type}`)}
                                    </span>
                                </button>
                            ))}
                        </div>
                        {errors.type ? <p className="text-sm text-destructive">{errors.type}</p> : null}
                    </div>

                    <div className="flex flex-col gap-2">
                        <Label htmlFor="brand-type-employment">
                            {t('admin.brand_type_request.dialog.employment_type')}
                        </Label>
                        <Select
                            value={data.employment_type || undefined}
                            onValueChange={(value) => setData('employment_type', value)}
                        >
                            <SelectTrigger id="brand-type-employment" aria-invalid={!!errors.employment_type}>
                                <SelectValue placeholder={t('admin.brand_type_request.dialog.employment_type_placeholder')}/>
                            </SelectTrigger>
                            <SelectContent>
                                {employmentOptions.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.employment_type ? (
                            <p className="text-sm text-destructive">{errors.employment_type}</p>
                        ) : null}
                    </div>

                    {isBusiness ? (
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="flex min-w-0 flex-col gap-2">
                                <Label htmlFor="brand-type-name">
                                    {t('admin.settings_general.fields.employment_name')}
                                </Label>
                                <Input
                                    id="brand-type-name"
                                    value={data.employment_name}
                                    maxLength={255}
                                    placeholder={t('admin.settings_general.placeholders.employment_name')}
                                    aria-invalid={!!errors.employment_name}
                                    onChange={(e) => setData('employment_name', e.target.value)}
                                />
                                {errors.employment_name ? (
                                    <p className="text-sm text-destructive">{errors.employment_name}</p>
                                ) : null}
                            </div>
                            <div className="flex min-w-0 flex-col gap-2">
                                <Label htmlFor="brand-type-number">
                                    {t('admin.settings_general.fields.employment_number')}
                                </Label>
                                <Input
                                    id="brand-type-number"
                                    value={data.employment_number}
                                    inputMode="numeric"
                                    maxLength={9}
                                    placeholder={t('admin.settings_general.placeholders.employment_number')}
                                    aria-invalid={!!errors.employment_number}
                                    onChange={(e) => setData('employment_number', e.target.value.replace(/\D/g, ''))}
                                />
                                {errors.employment_number ? (
                                    <p className="text-sm text-destructive">{errors.employment_number}</p>
                                ) : (
                                    <p className="text-sm text-muted-foreground">
                                        {t('admin.settings_general.hints.employment_number')}
                                    </p>
                                )}
                            </div>
                        </div>
                    ) : null}

                    <DialogFooter>
                        <Button type="button" variant="outline" disabled={processing} onClick={() => onOpenChange(false)}>
                            {t('admin.brand_type_request.dialog.cancel')}
                        </Button>
                        <Button type="submit" disabled={processing || !data.employment_type}>
                            {processing
                                ? t('admin.brand_type_request.dialog.submitting')
                                : t('admin.brand_type_request.dialog.submit')}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

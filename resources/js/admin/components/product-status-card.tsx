import {Card} from '@/components/ui/card';
import {Switch} from '@/components/ui/switch';
import {useLang} from '@/lib/lang';

interface ProductStatusCardProps {
    enabled: boolean;
    onChange: (enabled: boolean) => void;
}

export function ProductStatusCard({enabled, onChange}: ProductStatusCardProps) {
    const {t} = useLang();

    return (
        <Card className="flex flex-row items-center justify-between gap-4 p-4">
            <div className="flex flex-col gap-0.5">
                <label className="text-sm font-semibold" htmlFor="product-enabled">
                    {t('admin.products_edit.status_label')}
                </label>
                <p className="text-xs text-muted-foreground">
                    {enabled ? t('admin.products_edit.status_published') : t('admin.products_edit.status_hidden')}
                </p>
            </div>
            <Switch
                checked={enabled}
                id="product-enabled"
                onCheckedChange={onChange}
            />
        </Card>
    );
}

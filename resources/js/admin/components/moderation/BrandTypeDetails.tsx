import {Link} from '@inertiajs/react';
import {PencilIcon} from 'lucide-react';

import {Button} from '@/components/ui/button';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from '@/components/ui/table';
import {useLang} from '@/lib/lang';

interface BrandTypeValues {
    type: string | null;
    employment_type: string | null;
    employment_type_label: string | null;
    employment_name: string | null;
    employment_number: string | null;
}

export interface BrandTypeDetailsData {
    kind: 'brand_type';
    brand: {id: number; name: string; admin_url: string};
    owner: {id: number; name: string | null; email: string; admin_url: string} | null;
    /** Снимок бренда на момент подачи заявки. */
    previous: BrandTypeValues | null;
    requested: BrandTypeValues | null;
    /** Бренд сейчас — мог измениться, пока заявка ждала решения. */
    current: BrandTypeValues | null;
}

const FIELDS = ['type', 'employment_type', 'employment_name', 'employment_number'] as const;

type Field = typeof FIELDS[number];

function sameValues(a: BrandTypeValues | null, b: BrandTypeValues | null): boolean {
    return FIELDS.every((field) => (a?.[field] ?? null) === (b?.[field] ?? null));
}

export default function BrandTypeDetails({data}: {data: BrandTypeDetailsData}) {
    const {t} = useLang();
    const {brand, owner, previous, requested, current} = data;
    const changedSinceRequest = !sameValues(previous, current);

    const display = (values: BrandTypeValues | null, field: Field): string => {
        if (!values) {
            return '—';
        }

        if (field === 'type') {
            return values.type ? t(`admin.brand_type_request.types.${values.type}`) : '—';
        }

        if (field === 'employment_type') {
            return values.employment_type_label ?? '—';
        }

        return values[field] ?? '—';
    };

    return (
        <Card>
            <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2 p-4 sm:p-6">
                <CardTitle>{t('admin.moderation.show.brand_type.title')}</CardTitle>
                <Button asChild size="sm" variant="outline">
                    <Link href={brand.admin_url}>
                        <PencilIcon className="size-4"/>
                        {t('admin.moderation.show.brand_type.open_brand')}
                    </Link>
                </Button>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 p-4 pt-0 sm:p-6 sm:pt-0">
                <div className="grid gap-4 text-sm sm:grid-cols-2">
                    <div className="flex min-w-0 flex-col gap-1">
                        <span className="text-xs text-muted-foreground">{t('admin.moderation.columns.source')}</span>
                        <span className="break-words font-medium">{brand.name}</span>
                    </div>
                    {owner ? (
                        <div className="flex min-w-0 flex-col gap-1">
                            <span className="text-xs text-muted-foreground">
                                {t('admin.moderation.show.brand_type.owner')}
                            </span>
                            <Link className="break-words hover:underline" href={owner.admin_url}>
                                {owner.name ? `${owner.name} · ${owner.email}` : owner.email}
                            </Link>
                        </div>
                    ) : null}
                </div>

                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead/>
                            <TableHead>{t('admin.moderation.show.brand_type.previous')}</TableHead>
                            <TableHead>{t('admin.moderation.show.brand_type.requested')}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {FIELDS.map((field) => {
                            const before = display(previous, field);
                            const after = display(requested, field);

                            return (
                                <TableRow key={field}>
                                    <TableCell className="text-muted-foreground">
                                        {t(`admin.moderation.show.brand_type.fields.${field}`)}
                                    </TableCell>
                                    <TableCell>{before}</TableCell>
                                    <TableCell className={before !== after ? 'font-semibold' : undefined}>
                                        {after}
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>

                {changedSinceRequest ? (
                    <p className="text-sm text-amber-700 dark:text-amber-400">
                        {t('admin.moderation.show.brand_type.changed_since')}:{' '}
                        {FIELDS.map((field) => display(current, field)).filter((v) => v !== '—').join(' · ')}
                    </p>
                ) : null}
            </CardContent>
        </Card>
    );
}

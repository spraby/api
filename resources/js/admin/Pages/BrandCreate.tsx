import {type FormEventHandler} from 'react';

import {router, useForm} from '@inertiajs/react';
import {ArrowLeftIcon} from 'lucide-react';

import {BrandFormFields} from "@/components/brand-form.tsx";
import {Button} from '@/components/ui/button';
import {useLang} from '@/lib/lang';

import AdminLayout from '../layouts/AdminLayout';

interface BrandData {
    name: string;
    description: string | null;
}

interface BrandCreateProps {
    brand: BrandData;
}

export default function BrandCreate({brand}: BrandCreateProps) {
    const {t} = useLang();
    const {data, setData, errors, post, processing} = useForm<BrandData>(brand);

    const onSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('admin.brands.store'));
    };

    return (
        <AdminLayout title={t('admin.brands_create.title')}>
            <div className="flex items-center flex-col gap-5">
                <div
                    className="max-w-[800px] w-full @container/main flex flex-1 flex-col gap-4 p-3 sm:p-4 lg:p-6">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <Button
                                    className="size-8"
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => {
                                        router.visit('/admin/brands');
                                    }}
                                >
                                    <ArrowLeftIcon className="size-4"/>
                                </Button>
                                <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
                                    {t('admin.brands_create.title')}
                                </h1>
                            </div>
                            <p className="pl-10 text-sm text-muted-foreground">
                                {t('admin.brands_create.description')}
                            </p>
                        </div>
                    </div>

                    <form className="space-y-4 md:space-y-6" onSubmit={onSubmit}>
                        <BrandFormFields
                            name={data.name}
                            description={data.description}
                            errors={errors}
                            onChange={(field, value) => setData(field, value)}
                        />

                        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                            <p className="text-sm text-muted-foreground">
                                <span className="text-destructive">*</span> {t('admin.brands_edit.required_fields')}
                            </p>
                            <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    disabled={processing}
                                    className="w-full sm:w-auto"
                                    onClick={() => {
                                        router.visit(route('admin.brands'));
                                    }}
                                >
                                    {t('admin.brands_edit.actions.cancel')}
                                </Button>
                                <Button type="submit" disabled={processing} className="w-full sm:w-auto">
                                    {processing
                                        ? t('admin.brands_edit.actions.saving')
                                        : t('admin.brands_create.actions.create')}
                                </Button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </AdminLayout>
    );
}
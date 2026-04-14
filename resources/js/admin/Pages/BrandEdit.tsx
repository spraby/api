import {type FormEventHandler} from 'react';

import {router, useForm, usePage} from '@inertiajs/react';
import {ArrowLeftIcon, TruckIcon, UserCheckIcon, UserIcon} from 'lucide-react';

import {BrandFormFields} from "@/components/brand-form.tsx";
import {CategoryPicker} from "@/components/category-picker.tsx";
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Checkbox} from '@/components/ui/checkbox';
import {Label} from '@/components/ui/label';
import {useLang} from '@/lib/lang';
import type {ShippingMethod} from '@/types/api';
import type {PageProps} from '@/types/inertia';

import AdminLayout from '../layouts/AdminLayout';

interface BrandData {
    id: number;
    name: string;
    description: string | null;
    user_id: number | null;
    user: {
        id: number;
        name: string;
        email: string;
    } | null;
    category_ids: number[];
    shipping_methods: ShippingMethod[];
    created_at: string;
    updated_at: string;
}

interface BrandEditProps {
    brand: BrandData;
    allShippingMethods: ShippingMethod[];
}

interface BrandEditFormData {
    name: string;
    description: string | null;
    category_ids: number[];
    shipping_method_ids: number[];
}

export default function BrandEdit({brand, allShippingMethods}: BrandEditProps) {
    const {t} = useLang();
    const {auth} = usePage<PageProps>().props;

    const {data, setData, errors, put, processing} = useForm<BrandEditFormData>({
        name: brand.name,
        description: brand.description,
        category_ids: brand.category_ids,
        shipping_method_ids: brand.shipping_methods.map(m => m.id),
    });

    const canImpersonate = auth?.user?.is_admin && brand.user;

    const handleImpersonate = () => {
        if (brand.user) {
            router.post(route('admin.impersonate', {user: brand.user.id}));
        }
    };

    const handleShippingMethodToggle = (methodId: number, checked: boolean) => {
        setData('shipping_method_ids',
            checked
                ? [...data.shipping_method_ids, methodId]
                : data.shipping_method_ids.filter(id => id !== methodId)
        );
    };

    const onSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        put(route('admin.brands.update', brand.id), {
            preserveScroll: true,
        });
    };

    return (
        <AdminLayout title={t('admin.brands_edit.title')}>
            <div className="flex items-center flex-col gap-5">
                <div className="max-w-[800px] w-full @container/main flex flex-1 flex-col gap-4 p-3 sm:p-4 lg:p-6">
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
                                    {t('admin.brands_edit.title')}
                                </h1>
                            </div>
                            <p className="pl-10 text-sm text-muted-foreground">
                                {t('admin.brands_edit.description')}
                            </p>
                        </div>

                        {canImpersonate ? (
                            <Button variant="outline" onClick={handleImpersonate}>
                                <UserCheckIcon className="mr-2 size-4"/>
                                {t('admin.impersonation.impersonate')} {brand.user?.name}
                            </Button>
                        ) : null}
                    </div>

                    {brand.user ? (
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base flex items-center gap-2">
                                    <UserIcon className="size-4"/>
                                    {t('admin.brands_table.columns.owner')}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <a
                                    className="flex flex-col hover:underline cursor-pointer"
                                    href={`/admin/users/${brand.user.id}/edit`}
                                    onClick={(e) => {
                                        e.preventDefault()
                                        router.visit(e.currentTarget.href)
                                    }}
                                >
                                    <span className="font-medium text-primary">{brand.user.name}</span>
                                    <span className="text-sm text-muted-foreground">{brand.user.email}</span>
                                </a>
                            </CardContent>
                        </Card>
                    ) : null}

                    <form className="space-y-4 md:space-y-6" onSubmit={onSubmit}>
                        <BrandFormFields
                            name={data.name}
                            description={data.description}
                            errors={errors}
                            onChange={(field, value) => setData(field, value)}
                        />

                        <CategoryPicker
                            selectedIds={data.category_ids}
                            onChange={(ids) => setData('category_ids', ids)}
                        />

                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base flex items-center gap-2">
                                    <TruckIcon className="size-4"/>
                                    {t('admin.brands_edit.shipping_methods')}
                                </CardTitle>
                                <CardDescription>
                                    {t('admin.brands_edit.shipping_methods_description')}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {allShippingMethods.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">
                                        {t('admin.brands_edit.no_shipping_methods')}
                                    </p>
                                ) : (
                                    <div className="space-y-3">
                                        {allShippingMethods.map((method) => (
                                            <div key={method.id} className="flex items-center space-x-3">
                                                <Checkbox
                                                    id={`shipping-${method.id}`}
                                                    checked={data.shipping_method_ids.includes(method.id)}
                                                    disabled={processing}
                                                    onCheckedChange={(checked) =>
                                                        handleShippingMethodToggle(method.id, checked === true)
                                                    }
                                                />
                                                <Label
                                                    htmlFor={`shipping-${method.id}`}
                                                    className="cursor-pointer text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                >
                                                    {method.name}
                                                </Label>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

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
                                        : t('admin.brands_edit.actions.save')}
                                </Button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </AdminLayout>
    );
}
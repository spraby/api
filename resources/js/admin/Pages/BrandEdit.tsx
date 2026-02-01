import {router, usePage} from '@inertiajs/react';
import {ArrowLeftIcon, UserCheckIcon, UserIcon} from 'lucide-react';

import {BrandForm} from "@/components/brand-form.tsx";
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {useLang} from '@/lib/lang';
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
  created_at: string;
  updated_at: string;
}

interface BrandEditProps {
  brand: BrandData;
}

export default function BrandEdit({brand}: BrandEditProps) {
    const {t} = useLang();
    const {auth} = usePage<PageProps>().props;

    // Check if current user can impersonate (admins only)
    const canImpersonate = auth?.user?.is_admin && brand.user;

    const handleImpersonate = () => {
        if (brand.user) {
            router.post(route('admin.impersonate', {user: brand.user.id}));
        }
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
                                {t('admin.impersonation.impersonate') || 'Impersonate'} {brand.user?.name}
                            </Button>
                        ) : null}
                    </div>

                    {brand.user ? (
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base flex items-center gap-2">
                                    <UserIcon className="size-4"/>
                                    {t('admin.brands_table.columns.owner') || 'Owner'}
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

                    <BrandForm brand={brand}/>
                </div>
            </div>
        </AdminLayout>
    );
}
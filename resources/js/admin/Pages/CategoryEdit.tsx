import { router } from '@inertiajs/react';
import { ArrowLeftIcon } from 'lucide-react';

import { CategoryForm } from "@/components/category-form.tsx";
import { Button } from '@/components/ui/button';
import { useLang } from '@/lib/lang';

import AdminLayout from '../layouts/AdminLayout';

interface CategoryData {
  id: number;
  handle: string;
  name: string;
  title: string | null;
  header: string | null;
  description: string | null;
  created_at: string;
  updated_at: string;
}

interface CategoryEditProps {
  category: CategoryData;
}

export default function CategoryEdit({ category }: CategoryEditProps) {
  const { t } = useLang();

  return (
    <AdminLayout title={t('admin.categories_edit.title')}>
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
                    router.visit('/admin/categories');
                  }}
                >
                  <ArrowLeftIcon className="size-4" />
                </Button>
                <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
                  {t('admin.categories_edit.title')}
                </h1>
              </div>
              <p className="pl-10 text-sm text-muted-foreground">
                {t('admin.categories_edit.description')}
              </p>
            </div>
          </div>

          <CategoryForm category={category} />
        </div>
      </div>
    </AdminLayout>
  );
}

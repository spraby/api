import { router } from '@inertiajs/react';
import { ArrowLeftIcon } from 'lucide-react';

import { CollectionForm } from "@/components/collection-form.tsx";
import { Button } from '@/components/ui/button';
import { useLang } from '@/lib/lang';

import AdminLayout from '../layouts/AdminLayout';

interface CollectionData {
  handle: string;
  name: string;
  title: string | null;
  header: string | null;
  description: string | null;
}

interface CollectionCreateProps {
  collection: CollectionData;
}

export default function CollectionCreate({ collection }: CollectionCreateProps) {
  const { t } = useLang();

  return (
    <AdminLayout title={t('admin.collections_create.title')}>
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
                    router.visit('/sb/admin/collections');
                  }}
                >
                  <ArrowLeftIcon className="size-4" />
                </Button>
                <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
                  {t('admin.collections_create.title')}
                </h1>
              </div>
              <p className="pl-10 text-sm text-muted-foreground">
                {t('admin.collections_create.description')}
              </p>
            </div>
          </div>

          <CollectionForm collection={collection} />
        </div>
      </div>
    </AdminLayout>
  );
}

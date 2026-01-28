import { router } from '@inertiajs/react';
import { ArrowLeftIcon } from 'lucide-react';

import { OptionForm } from "@/components/option-form.tsx";
import { Button } from '@/components/ui/button';
import { useLang } from '@/lib/lang';

import AdminLayout from '../layouts/AdminLayout';

interface OptionValue {
  id: number;
  value: string;
}

interface OptionData {
  id: number;
  name: string;
  title: string | null;
  description: string | null;
  values: OptionValue[];
  created_at: string;
  updated_at: string;
}

interface OptionEditProps {
  option: OptionData;
}

export default function OptionEdit({ option }: OptionEditProps) {
  const { t } = useLang();

  return (
    <AdminLayout title={t('admin.options_edit.title')}>
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
                    router.visit('/admin/options');
                  }}
                >
                  <ArrowLeftIcon className="size-4" />
                </Button>
                <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
                  {t('admin.options_edit.title')}
                </h1>
              </div>
              <p className="pl-10 text-sm text-muted-foreground">
                {t('admin.options_edit.description')}
              </p>
            </div>
          </div>

          <OptionForm option={option} />
        </div>
      </div>
    </AdminLayout>
  );
}

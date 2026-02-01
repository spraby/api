import type { FormEventHandler } from "react";
import { useMemo } from "react";

import { useForm, router } from '@inertiajs/react';

import { Button } from "@/components/ui/button.tsx";
import { Card } from "@/components/ui/card.tsx";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useLang } from '@/lib/lang';

interface BrandFormData {
  id?: number;
  name: string;
  description: string | null;
}

interface BrandFormProps {
  brand: BrandFormData;
}

export function BrandForm({ brand: defaultBrand }: BrandFormProps) {
  const { t } = useLang();

  const { data: brand, setData, errors, put, post, processing } = useForm<BrandFormData>(defaultBrand);
  const isEditMode = useMemo(() => !!brand?.id, [brand?.id]);

  const submitButtonText = useMemo(() => {
    if (processing) {
      return t('admin.brands_edit.actions.saving');
    }

    return isEditMode
      ? t('admin.brands_edit.actions.save')
      : t('admin.brands_create.actions.create');
  }, [processing, isEditMode, t]);

  /**
   * Handle form submission
   */
  const onSubmit: FormEventHandler = (e) => {
    e.preventDefault();

    if (brand?.id) {
      put(route('admin.brands.update', brand.id), {
        preserveScroll: true,
      });
    } else {
      post(route('admin.brands.store'));
    }
  }

  return (
    <form className="space-y-4 md:space-y-6" onSubmit={onSubmit}>
      <div className="grid grid-cols-1 gap-4 md:gap-5">
        <Card className="flex flex-col gap-4 md:gap-5 p-4 sm:p-6">
          <div className="gap-2 flex flex-col">
            <Label className="flex items-center gap-1" htmlFor="name">
              {t('admin.brands_edit.fields.name')}
              <span className="text-destructive">*</span>
            </Label>
            <Input
              required
              id="name"
              placeholder={t('admin.brands_edit.placeholders.name')}
              type="text"
              value={brand.name}
              onChange={e => setData('name', e.target.value)}
              className={errors.name ? 'border-destructive' : ''}
            />
            {!!errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
          </div>

          <div className="gap-2 flex flex-col">
            <Label htmlFor="description">
              {t('admin.brands_edit.fields.description')}
            </Label>
            <Textarea
              id="description"
              placeholder={t('admin.brands_edit.placeholders.description')}
              value={brand.description ?? ''}
              onChange={e => setData('description', e.target.value)}
              className={errors.description ? 'border-destructive' : ''}
              rows={4}
            />
            {!!errors.description && <p className="text-xs text-destructive">{errors.description}</p>}
          </div>
        </Card>
      </div>

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
            {submitButtonText}
          </Button>
        </div>
      </div>
    </form>
  );
}
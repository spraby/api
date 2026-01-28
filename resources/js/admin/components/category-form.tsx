import type { FormEventHandler } from "react";
import { useMemo } from "react";

import { useForm, router } from '@inertiajs/react';

import { Button } from "@/components/ui/button.tsx";
import { Card } from "@/components/ui/card.tsx";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useLang } from '@/lib/lang';

interface CategoryFormData {
  id?: number;
  handle: string;
  name: string;
  title: string | null;
  header: string | null;
  description: string | null;
}

interface CategoryFormProps {
  category: CategoryFormData;
}

export function CategoryForm({ category: defaultCategory }: CategoryFormProps) {
  const { t } = useLang();

  const { data: category, setData, errors, put, post, processing } = useForm<CategoryFormData>(defaultCategory);
  const isEditMode = useMemo(() => !!category?.id, [category?.id]);

  const submitButtonText = useMemo(() => {
    if (processing) {
      return t('admin.categories_edit.actions.saving');
    }

    return isEditMode
      ? t('admin.categories_edit.actions.save')
      : t('admin.categories_create.actions.create');
  }, [processing, isEditMode, t]);

  /**
   * Handle form submission
   */
  const onSubmit: FormEventHandler = (e) => {
    e.preventDefault();

    if (category?.id) {
      put(route('admin.categories.update', category.id), {
        preserveScroll: true,
      });
    } else {
      post(route('admin.categories.store'));
    }
  }

  return (
    <form className="space-y-4 md:space-y-6" onSubmit={onSubmit}>
      <div className="grid grid-cols-1 gap-4 md:gap-5">
        <Card className="flex flex-col gap-4 md:gap-5 p-4 sm:p-6">
          <div className="gap-2 flex flex-col">
            <Label className="flex items-center gap-1" htmlFor="name">
              {t('admin.categories_edit.fields.name')}
              <span className="text-destructive">*</span>
            </Label>
            <Input
              required
              id="name"
              placeholder={t('admin.categories_edit.placeholders.name')}
              type="text"
              value={category.name}
              onChange={e => setData('name', e.target.value)}
              className={errors.name ? 'border-destructive' : ''}
            />
            {!!errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
          </div>

          <div className="gap-2 flex flex-col">
            <Label htmlFor="handle">
              {t('admin.categories_edit.fields.handle')}
            </Label>
            <Input
              id="handle"
              placeholder={t('admin.categories_edit.placeholders.handle')}
              type="text"
              value={category.handle}
              onChange={e => setData('handle', e.target.value)}
              className={errors.handle ? 'border-destructive' : ''}
            />
            <p className="text-xs text-muted-foreground">
              {t('admin.categories_edit.hints.handle')}
            </p>
            {!!errors.handle && <p className="text-xs text-destructive">{errors.handle}</p>}
          </div>

          <div className="gap-2 flex flex-col">
            <Label htmlFor="title">
              {t('admin.categories_edit.fields.title')}
            </Label>
            <Input
              id="title"
              placeholder={t('admin.categories_edit.placeholders.title')}
              type="text"
              value={category.title ?? ''}
              onChange={e => setData('title', e.target.value)}
              className={errors.title ? 'border-destructive' : ''}
            />
            {!!errors.title && <p className="text-xs text-destructive">{errors.title}</p>}
          </div>

          <div className="gap-2 flex flex-col">
            <Label htmlFor="header">
              {t('admin.categories_edit.fields.header')}
            </Label>
            <Input
              id="header"
              placeholder={t('admin.categories_edit.placeholders.header')}
              type="text"
              value={category.header ?? ''}
              onChange={e => setData('header', e.target.value)}
              className={errors.header ? 'border-destructive' : ''}
            />
            {!!errors.header && <p className="text-xs text-destructive">{errors.header}</p>}
          </div>

          <div className="gap-2 flex flex-col">
            <Label htmlFor="description">
              {t('admin.categories_edit.fields.description')}
            </Label>
            <Textarea
              id="description"
              placeholder={t('admin.categories_edit.placeholders.description')}
              value={category.description ?? ''}
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
          <span className="text-destructive">*</span> {t('admin.categories_edit.required_fields')}
        </p>
        <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
          <Button
            type="button"
            variant="outline"
            disabled={processing}
            className="w-full sm:w-auto"
            onClick={() => {
              router.visit(route('admin.categories'));
            }}
          >
            {t('admin.categories_edit.actions.cancel')}
          </Button>
          <Button type="submit" disabled={processing} className="w-full sm:w-auto">
            {submitButtonText}
          </Button>
        </div>
      </div>
    </form>
  );
}

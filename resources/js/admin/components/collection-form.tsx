import { type FormEventHandler , useMemo, useState } from "react";

import { useForm, router } from '@inertiajs/react';

import { Badge } from "@/components/ui/badge.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Card } from "@/components/ui/card.tsx";
import { Checkbox } from "@/components/ui/checkbox.tsx";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useLang } from '@/lib/lang';

interface CategoryOption {
  id: number;
  name: string;
}

interface CollectionFormData {
  id?: number;
  handle: string;
  name: string;
  title: string | null;
  header: string | null;
  description: string | null;
  category_ids?: number[];
}

interface CollectionFormProps {
  collection: CollectionFormData;
  categories?: CategoryOption[];
}

export function CollectionForm({ collection: defaultCollection, categories = [] }: CollectionFormProps) {
  const { t } = useLang();
  const [categorySearch, setCategorySearch] = useState('');

  const { data: collection, setData, errors, put, post, processing } = useForm<CollectionFormData>(defaultCollection);
  const isEditMode = useMemo(() => !!collection?.id, [collection?.id]);

  const submitButtonText = useMemo(() => {
    if (processing) {
      return t('admin.collections_edit.actions.saving');
    }

    return isEditMode
      ? t('admin.collections_edit.actions.save')
      : t('admin.collections_create.actions.create');
  }, [processing, isEditMode, t]);

  /**
   * Handle form submission
   */
  const onSubmit: FormEventHandler = (e) => {
    e.preventDefault();

    if (collection?.id) {
      put(route('admin.collections.update', collection.id), {
        preserveScroll: true,
      });
    } else {
      post(route('admin.collections.store'));
    }
  }

  return (
    <form className="space-y-4 md:space-y-6" onSubmit={onSubmit}>
      <div className="grid grid-cols-1 gap-4 md:gap-5">
        <Card className="flex flex-col gap-4 md:gap-5 p-4 sm:p-6">
          <div className="gap-2 flex flex-col">
            <Label className="flex items-center gap-1" htmlFor="name">
              {t('admin.collections_edit.fields.name')}
              <span className="text-destructive">*</span>
            </Label>
            <Input
              required
              id="name"
              placeholder={t('admin.collections_edit.placeholders.name')}
              type="text"
              value={collection.name}
              onChange={e => setData('name', e.target.value)}
              className={errors.name ? 'border-destructive' : ''}
            />
            {!!errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
          </div>

          <div className="gap-2 flex flex-col">
            <Label htmlFor="handle">
              {t('admin.collections_edit.fields.handle')}
            </Label>
            <Input
              id="handle"
              placeholder={t('admin.collections_edit.placeholders.handle')}
              type="text"
              value={collection.handle}
              onChange={e => setData('handle', e.target.value)}
              className={errors.handle ? 'border-destructive' : ''}
            />
            <p className="text-xs text-muted-foreground">
              {t('admin.collections_edit.hints.handle')}
            </p>
            {!!errors.handle && <p className="text-xs text-destructive">{errors.handle}</p>}
          </div>

          <div className="gap-2 flex flex-col">
            <Label htmlFor="title">
              {t('admin.collections_edit.fields.title')}
            </Label>
            <Input
              id="title"
              placeholder={t('admin.collections_edit.placeholders.title')}
              type="text"
              value={collection.title ?? ''}
              onChange={e => setData('title', e.target.value)}
              className={errors.title ? 'border-destructive' : ''}
            />
            {!!errors.title && <p className="text-xs text-destructive">{errors.title}</p>}
          </div>

          <div className="gap-2 flex flex-col">
            <Label htmlFor="header">
              {t('admin.collections_edit.fields.header')}
            </Label>
            <Input
              id="header"
              placeholder={t('admin.collections_edit.placeholders.header')}
              type="text"
              value={collection.header ?? ''}
              onChange={e => setData('header', e.target.value)}
              className={errors.header ? 'border-destructive' : ''}
            />
            {!!errors.header && <p className="text-xs text-destructive">{errors.header}</p>}
          </div>

          <div className="gap-2 flex flex-col">
            <Label htmlFor="description">
              {t('admin.collections_edit.fields.description')}
            </Label>
            <Textarea
              id="description"
              placeholder={t('admin.collections_edit.placeholders.description')}
              value={collection.description ?? ''}
              onChange={e => setData('description', e.target.value)}
              className={errors.description ? 'border-destructive' : ''}
              rows={4}
            />
            {!!errors.description && <p className="text-xs text-destructive">{errors.description}</p>}
          </div>
        </Card>

        {categories.length > 0 && (
          <Card className="flex flex-col gap-4 md:gap-5 p-4 sm:p-6">
            <div className="gap-2 flex flex-col">
              <Label>{t('admin.collections_edit.fields.categories')}</Label>
              <p className="text-xs text-muted-foreground">
                {t('admin.collections_edit.hints.categories')}
              </p>
            </div>

            {(collection.category_ids?.length ?? 0) > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {categories
                  .filter(c => collection.category_ids?.includes(c.id))
                  .map(c => (
                    <Badge
                      key={c.id}
                      variant="secondary"
                      className="cursor-pointer"
                      onClick={() => {
                        setData('category_ids', (collection.category_ids ?? []).filter(id => id !== c.id));
                      }}
                    >
                      {c.name} &times;
                    </Badge>
                  ))}
              </div>
            )}

            {categories.length > 5 && (
              <Input
                placeholder={t('admin.collections_edit.placeholders.category_search')}
                value={categorySearch}
                onChange={e => setCategorySearch(e.target.value)}
              />
            )}

            <div className="max-h-[240px] overflow-y-auto flex flex-col gap-1">
              {categories
                .filter(c => !categorySearch || c.name.toLowerCase().includes(categorySearch.toLowerCase()))
                .map(c => {
                  const checked = collection.category_ids?.includes(c.id) ?? false;

                  return (
                    <label
                      key={c.id}
                      className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted cursor-pointer"
                    >
                      <Checkbox
                        checked={checked}
                        onCheckedChange={(val) => {
                          const current = collection.category_ids ?? [];

                          setData('category_ids', val
                            ? [...current, c.id]
                            : current.filter(id => id !== c.id)
                          );
                        }}
                      />
                      {c.name}
                    </label>
                  );
                })}
            </div>
          </Card>
        )}
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <p className="text-sm text-muted-foreground">
          <span className="text-destructive">*</span> {t('admin.collections_edit.required_fields')}
        </p>
        <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
          <Button
            type="button"
            variant="outline"
            disabled={processing}
            className="w-full sm:w-auto"
            onClick={() => {
              router.visit(route('admin.collections'));
            }}
          >
            {t('admin.collections_edit.actions.cancel')}
          </Button>
          <Button type="submit" disabled={processing} className="w-full sm:w-auto">
            {submitButtonText}
          </Button>
        </div>
      </div>
    </form>
  );
}

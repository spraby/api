import type { FormEventHandler } from "react";
import { useMemo } from "react";

import { useForm, router } from '@inertiajs/react';
import { PlusIcon, Trash2Icon } from 'lucide-react';

import { Button } from "@/components/ui/button.tsx";
import { Card } from "@/components/ui/card.tsx";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useLang } from '@/lib/lang';

interface OptionValue {
  id?: number;
  value: string;
}

interface OptionFormData {
  id?: number;
  name: string;
  title: string | null;
  description: string | null;
  values: OptionValue[];
}

interface OptionFormProps {
  option: OptionFormData;
}

export function OptionForm({ option: defaultOption }: OptionFormProps) {
  const { t } = useLang();

  const { data: option, setData, errors, put, post, processing } = useForm<OptionFormData>({
    ...defaultOption,
    values: defaultOption.values || [],
  });
  const isEditMode = useMemo(() => !!option?.id, [option?.id]);

  const submitButtonText = useMemo(() => {
    if (processing) {
      return t('admin.options_edit.actions.saving');
    }

    return isEditMode
      ? t('admin.options_edit.actions.save')
      : t('admin.options_create.actions.create');
  }, [processing, isEditMode, t]);

  /**
   * Add a new value
   */
  const handleAddValue = () => {
    setData('values', [...option.values, { value: '' }]);
  };

  /**
   * Update a value
   */
  const handleUpdateValue = (index: number, value: string) => {
    const newValues = [...option.values];

    newValues[index] = { ...newValues[index], value };
    setData('values', newValues);
  };

  /**
   * Remove a value
   */
  const handleRemoveValue = (index: number) => {
    const newValues = option.values.filter((_, i) => i !== index);

    setData('values', newValues);
  };

  /**
   * Handle form submission
   */
  const onSubmit: FormEventHandler = (e) => {
    e.preventDefault();

    if (option?.id) {
      put(route('sb.admin.options.update', option.id), {
        preserveScroll: true,
      });
    } else {
      post(route('sb.admin.options.store'));
    }
  }

  return (
    <form className="space-y-4 md:space-y-6" onSubmit={onSubmit}>
      <div className="grid grid-cols-1 gap-4 md:gap-5">
        {/* Basic Info Card */}
        <Card className="flex flex-col gap-4 md:gap-5 p-4 sm:p-6">
          <div className="gap-2 flex flex-col">
            <Label className="flex items-center gap-1" htmlFor="name">
              {t('admin.options_edit.fields.name')}
              <span className="text-destructive">*</span>
            </Label>
            <Input
              required
              id="name"
              placeholder={t('admin.options_edit.placeholders.name')}
              type="text"
              value={option.name}
              onChange={e => setData('name', e.target.value)}
              className={errors.name ? 'border-destructive' : ''}
            />
            {!!errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
          </div>

          <div className="gap-2 flex flex-col">
            <Label htmlFor="title">
              {t('admin.options_edit.fields.title')}
            </Label>
            <Input
              id="title"
              placeholder={t('admin.options_edit.placeholders.title')}
              type="text"
              value={option.title ?? ''}
              onChange={e => setData('title', e.target.value)}
              className={errors.title ? 'border-destructive' : ''}
            />
            {!!errors.title && <p className="text-xs text-destructive">{errors.title}</p>}
          </div>

          <div className="gap-2 flex flex-col">
            <Label htmlFor="description">
              {t('admin.options_edit.fields.description')}
            </Label>
            <Textarea
              id="description"
              placeholder={t('admin.options_edit.placeholders.description')}
              value={option.description ?? ''}
              onChange={e => setData('description', e.target.value)}
              className={errors.description ? 'border-destructive' : ''}
              rows={4}
            />
            {!!errors.description && <p className="text-xs text-destructive">{errors.description}</p>}
          </div>
        </Card>

        {/* Values Card */}
        <Card className="flex flex-col gap-4 md:gap-5 p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-medium">{t('admin.options_edit.values.title')}</h3>
              <p className="text-sm text-muted-foreground">{t('admin.options_edit.values.description')}</p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddValue}
            >
              <PlusIcon className="size-4" />
              {t('admin.options_edit.values.add')}
            </Button>
          </div>

          {option.values.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <p className="text-sm text-muted-foreground">{t('admin.options_edit.values.empty')}</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={handleAddValue}
              >
                <PlusIcon className="size-4" />
                {t('admin.options_edit.values.add_first')}
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {option.values.map((valueItem, index) => (
                <div key={valueItem.id ?? `new-${index}`} className="flex items-center gap-2">
                  <Input
                    placeholder={t('admin.options_edit.values.placeholder')}
                    type="text"
                    value={valueItem.value}
                    onChange={e => handleUpdateValue(index, e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="shrink-0 text-muted-foreground hover:text-destructive"
                    onClick={() => handleRemoveValue(index)}
                  >
                    <Trash2Icon className="size-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <p className="text-sm text-muted-foreground">
          <span className="text-destructive">*</span> {t('admin.options_edit.required_fields')}
        </p>
        <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
          <Button
            type="button"
            variant="outline"
            disabled={processing}
            className="w-full sm:w-auto"
            onClick={() => {
              router.visit(route('sb.admin.options'));
            }}
          >
            {t('admin.options_edit.actions.cancel')}
          </Button>
          <Button type="submit" disabled={processing} className="w-full sm:w-auto">
            {submitButtonText}
          </Button>
        </div>
      </div>
    </form>
  );
}

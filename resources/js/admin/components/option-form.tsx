import type { FormEventHandler } from "react";
import { useMemo, useCallback } from "react";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useForm, router } from '@inertiajs/react';
import { GripVerticalIcon, PlusIcon, Trash2Icon } from 'lucide-react';

import { Button } from "@/components/ui/button.tsx";
import { Card } from "@/components/ui/card.tsx";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useLang } from '@/lib/lang';

interface OptionValue {
  id?: number;
  value: string;
  position?: number;
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

interface SortableValueItemProps {
  valueItem: OptionValue;
  index: number;
  onUpdate: (index: number, value: string) => void;
  onRemove: (index: number) => void;
  placeholder: string;
}

function SortableValueItem({
  valueItem,
  index,
  onUpdate,
  onRemove,
  placeholder,
}: SortableValueItemProps) {
  const sortableId = valueItem.id ?? `new-${index}`;
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: sortableId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-2 ${isDragging ? 'opacity-50' : ''}`}
    >
      <button
        type="button"
        className="shrink-0 cursor-grab touch-none p-1 text-muted-foreground hover:text-foreground active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        <GripVerticalIcon className="size-4" />
      </button>
      <Input
        placeholder={placeholder}
        type="text"
        value={valueItem.value}
        onChange={e => onUpdate(index, e.target.value)}
        className="flex-1"
      />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="shrink-0 text-muted-foreground hover:text-destructive"
        onClick={() => onRemove(index)}
      >
        <Trash2Icon className="size-4" />
      </Button>
    </div>
  );
}

export function OptionForm({ option: defaultOption }: OptionFormProps) {
  const { t } = useLang();

  const { data: option, setData, errors, put, post, processing } = useForm<OptionFormData>({
    ...defaultOption,
    values: defaultOption.values || [],
  });
  const isEditMode = useMemo(() => !!option?.id, [option?.id]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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
    setData('values', [...option.values, { value: '', position: option.values.length }]);
  };

  /**
   * Update a value
   */
  const handleUpdateValue = useCallback((index: number, value: string) => {
    const newValues = [...option.values];

    newValues[index] = { ...newValues[index], value };
    setData('values', newValues);
  }, [option.values, setData]);

  /**
   * Remove a value
   */
  const handleRemoveValue = useCallback((index: number) => {
    const newValues = option.values.filter((_, i) => i !== index);

    setData('values', newValues);
  }, [option.values, setData]);

  /**
   * Handle drag end - reorder values
   */
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = option.values.findIndex(
        (item) => (item.id ?? `new-${option.values.indexOf(item)}`) === active.id
      );
      const newIndex = option.values.findIndex(
        (item) => (item.id ?? `new-${option.values.indexOf(item)}`) === over.id
      );

      const newValues = arrayMove(option.values, oldIndex, newIndex);

      setData('values', newValues);
    }
  };

  /**
   * Get sortable IDs for the values
   */
  const sortableIds = useMemo(() => {
    return option.values.map((item, index) => item.id ?? `new-${index}`);
  }, [option.values]);

  /**
   * Handle form submission
   */
  const onSubmit: FormEventHandler = (e) => {
    e.preventDefault();

    if (option?.id) {
      put(route('admin.options.update', option.id), {
        preserveScroll: true,
      });
    } else {
      post(route('admin.options.store'));
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
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={sortableIds}
                strategy={verticalListSortingStrategy}
              >
                <div className="flex flex-col gap-3">
                  {option.values.map((valueItem, index) => (
                    <SortableValueItem
                      key={valueItem.id ?? `new-${index}`}
                      valueItem={valueItem}
                      index={index}
                      onUpdate={handleUpdateValue}
                      onRemove={handleRemoveValue}
                      placeholder={t('admin.options_edit.values.placeholder')}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
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
              router.visit(route('admin.options'));
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
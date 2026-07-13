import type { ReactNode } from 'react';

import { CheckIcon, PencilIcon, XIcon, type LucideIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export function DetailRow({
  icon: iconComponent,
  label,
  children,
}: {
  icon?: LucideIcon;
  label: string;
  children: ReactNode;
}) {
  const RowIcon = iconComponent;

  return (
    <div className={cn(
      "grid gap-x-2 gap-y-0.5",
      RowIcon ? "grid-cols-[1rem_minmax(0,1fr)]" : "grid-cols-1"
    )}>
      {RowIcon ? <RowIcon className="mt-0.5 size-3.5 text-muted-foreground" /> : null}
      <div className="min-w-0">
        <div className="text-[11px] font-medium leading-4 text-muted-foreground">
          {label}
        </div>
        <div className="min-w-0 text-sm font-medium leading-5 text-foreground">
          {children}
        </div>
      </div>
    </div>
  );
}

export function EditableDetailRow({
  icon,
  label,
  value,
  displayValue,
  editValue,
  inputType = 'text',
  min,
  step,
  isEditing,
  isSaving,
  editLabel,
  saveLabel,
  cancelLabel,
  emptyLabel,
  valueClassName,
  onEdit,
  onChange,
  onSave,
  onCancel,
}: {
  icon?: LucideIcon;
  label: string;
  value: string;
  displayValue?: ReactNode;
  editValue: string;
  inputType?: 'text' | 'tel' | 'number';
  min?: number;
  step?: string;
  isEditing: boolean;
  isSaving: boolean;
  editLabel: string;
  saveLabel: string;
  cancelLabel: string;
  emptyLabel: string;
  valueClassName?: string;
  onEdit: () => void;
  onChange: (value: string) => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  const visibleValue = value.trim();

  return (
    <DetailRow icon={icon} label={label}>
      {isEditing ? (
        <form
          className="flex min-w-0 items-center gap-1"
          onSubmit={(event) => {
            event.preventDefault();
            onSave();
          }}
        >
          <Input
            autoFocus
            className="h-8 min-w-0 px-2 text-sm"
            disabled={isSaving}
            min={min}
            step={step}
            type={inputType}
            value={editValue}
            onChange={(event) => onChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Escape') {
                onCancel();
              }
            }}
          />
          <Button
            aria-label={saveLabel}
            className="size-8 shrink-0"
            disabled={isSaving}
            size="icon"
            title={saveLabel}
            type="submit"
            variant="ghost"
          >
            <CheckIcon className="size-4 text-primary" />
          </Button>
          <Button
            aria-label={cancelLabel}
            className="size-8 shrink-0"
            disabled={isSaving}
            size="icon"
            title={cancelLabel}
            type="button"
            variant="ghost"
            onClick={onCancel}
          >
            <XIcon className="size-4 text-muted-foreground" />
          </Button>
        </form>
      ) : (
        <div className="group flex min-w-0 items-start gap-1">
          <span className={cn(
            "min-w-0 flex-1",
            visibleValue ? valueClassName : "text-muted-foreground"
          )}>
            {visibleValue ? (displayValue ?? visibleValue) : emptyLabel}
          </span>
          <Button
            aria-label={editLabel}
            className="mt-[-3px] size-6 shrink-0 text-muted-foreground opacity-70 hover:text-foreground sm:opacity-0 sm:group-hover:opacity-100"
            size="icon"
            title={editLabel}
            type="button"
            variant="ghost"
            onClick={onEdit}
          >
            <PencilIcon className="size-3.5" />
          </Button>
        </div>
      )}
    </DetailRow>
  );
}

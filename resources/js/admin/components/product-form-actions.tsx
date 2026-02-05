import { Loader2Icon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ProductFormActionsProps {
  onSave: () => void;
  onCancel: () => void;
  saveLabel: string;
  savingLabel?: string;
  cancelLabel: string;
  isSaving?: boolean;
  className?: string;
  primaryClassName?: string;
  secondaryClassName?: string;
}

export function ProductFormActions({
  onSave,
  onCancel,
  saveLabel,
  savingLabel,
  cancelLabel,
  isSaving = false,
  className,
  primaryClassName,
  secondaryClassName,
}: ProductFormActionsProps) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Button
        className={secondaryClassName}
        disabled={isSaving}
        type="button"
        variant="outline"
        onClick={onCancel}
      >
        {cancelLabel}
      </Button>
      <Button
        className={primaryClassName}
        disabled={isSaving}
        type="button"
        onClick={onSave}
      >
        {isSaving ? <Loader2Icon className="size-4 animate-spin" /> : null}
        <span>{isSaving && savingLabel ? savingLabel : saveLabel}</span>
      </Button>
    </div>
  );
}

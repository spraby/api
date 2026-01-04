import type { ReactNode } from 'react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useLang } from '@/lib/lang';

interface ConfirmationPopoverProps {
  /** The trigger element (usually a button) */
  trigger: ReactNode;
  /** The confirmation message to display */
  message: string;
  /** Callback when user confirms */
  onConfirm: () => void;
  /** Optional callback when user cancels */
  onCancel?: () => void;
  /** Whether the action is in progress (disables buttons) */
  isLoading?: boolean;
}

/**
 * A confirmation popover component that asks the user to confirm an action
 * before executing it. Uses Popover instead of window.confirm for better UX.
 */
export function ConfirmationPopover({
  trigger,
  message,
  onConfirm,
  onCancel,
  isLoading = false,
}: ConfirmationPopoverProps) {
  const { t } = useLang();
  const [open, setOpen] = useState(false);

  const handleConfirm = () => {
    onConfirm();
    setOpen(false);
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-4">
          <p className="text-sm text-foreground">{message}</p>
          <div className="flex justify-end gap-2">
            <Button
              disabled={isLoading}
              size="sm"
              type="button"
              variant="outline"
              onClick={handleCancel}
            >
              {t('admin.common.cancel')}
            </Button>
            <Button
              disabled={isLoading}
              size="sm"
              type="button"
              variant="destructive"
              onClick={handleConfirm}
            >
              {isLoading ? t('admin.common.deleting') : t('admin.common.delete')}
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

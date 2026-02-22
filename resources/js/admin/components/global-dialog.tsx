import * as VisuallyHidden from '@radix-ui/react-visually-hidden';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { useDialogStore } from '@/stores/dialog';

export function GlobalDialog() {
  const { open, title, description, content, footer, className, closeDialog } = useDialogStore();

  const hasHeader = !!(title || description);

  return (
    <Dialog open={open} onOpenChange={(value) => !value && closeDialog()}>
      <DialogContent className={cn('flex max-h-[85vh] flex-col', className)}>
        {hasHeader ? (
          <DialogHeader className="shrink-0">
            {title ? <DialogTitle>{title}</DialogTitle> : null}
            {description ? <DialogDescription>{description}</DialogDescription> : null}
            {!title && (
              <VisuallyHidden.Root>
                <DialogTitle>Dialog</DialogTitle>
              </VisuallyHidden.Root>
            )}
          </DialogHeader>
        ) : (
          <VisuallyHidden.Root>
            <DialogTitle>Dialog</DialogTitle>
          </VisuallyHidden.Root>
        )}
        <div className="overflow-y-auto">
          {content}
        </div>
        {!!footer && (
          <DialogFooter className="shrink-0">
            {footer}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}

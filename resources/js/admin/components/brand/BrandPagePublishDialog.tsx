import {useState} from 'react';

import {SendIcon} from 'lucide-react';

import {Button} from '@/components/ui/button';
import {Checkbox} from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {useLang} from '@/lib/lang';

export interface BrandPagePublishDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    /** Адрес условий публикации на витрине. */
    termsUrl: string;
    /** Отправку делает родитель: сюда приходит только подтверждённый клик. */
    onConfirm: () => void;
    isSubmitting?: boolean;
}

/**
 * Окно подтверждения публикации.
 *
 * Галочка по умолчанию пустая и обязательна — без неё кнопка отправки
 * заблокирована (п. 12 Условий публикации).
 */
export default function BrandPagePublishDialog({
    open,
    onOpenChange,
    termsUrl,
    onConfirm,
    isSubmitting = false,
}: BrandPagePublishDialogProps) {
    const {t} = useLang();
    const [accepted, setAccepted] = useState(false);

    // Каждое открытие — новое подтверждение: прошлую галочку не наследуем.
    const handleOpenChange = (next: boolean) => {
        if (!next) {
            setAccepted(false);
        }

        onOpenChange(next);
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>{t('admin.my_page.dialog.title')}</DialogTitle>
                    <DialogDescription>{t('admin.my_page.dialog.description')}</DialogDescription>
                </DialogHeader>

                <a
                    className="text-sm font-medium underline underline-offset-4 hover:text-primary"
                    href={termsUrl}
                    rel="noopener noreferrer"
                    target="_blank"
                >
                    {t('admin.my_page.dialog.terms_link')}
                </a>

                <label className="flex cursor-pointer gap-3 rounded-lg border bg-muted/40 p-4 text-sm leading-relaxed">
                    <Checkbox
                        checked={accepted}
                        className="mt-0.5 shrink-0 bg-background"
                        disabled={isSubmitting}
                        onCheckedChange={(value) => setAccepted(value === true)}
                    />
                    <span>{t('admin.my_page.dialog.consent')}</span>
                </label>

                <DialogFooter>
                    <Button
                        disabled={isSubmitting}
                        type="button"
                        variant="outline"
                        onClick={() => handleOpenChange(false)}
                    >
                        {t('admin.my_page.actions.cancel')}
                    </Button>
                    <Button
                        disabled={!accepted || isSubmitting}
                        type="button"
                        onClick={onConfirm}
                    >
                        <SendIcon className="size-4"/>
                        {t('admin.my_page.actions.submit')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

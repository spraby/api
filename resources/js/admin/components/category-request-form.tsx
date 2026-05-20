import * as React from 'react';

import { router } from '@inertiajs/react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useLang } from '@/lib/lang';

interface AvailableCategory {
  id: number;
  name: string;
}

interface Props {
  categories: AvailableCategory[];
}

export function CategoryRequestForm({ categories }: Props) {
  const { t } = useLang();
  const [selected, setSelected] = React.useState<Set<number>>(new Set());
  const [comment, setComment] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);

  const toggle = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);

      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }

      return next;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (selected.size === 0 || comment.trim().length < 3) {
      return;
    }

    setSubmitting(true);
    router.post(
      '/admin/my-categories/requests',
      {
        category_ids: Array.from(selected),
        comment,
      },
      {
        preserveScroll: true,
        onError: (errors) => {
          const firstError = Object.values(errors)[0];

          if (typeof firstError === 'string') {
            toast.error(firstError);
          }
        },
        onSuccess: () => {
          setSelected(new Set());
          setComment('');
        },
        onFinish: () => { setSubmitting(false); },
      },
    );
  };

  if (categories.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">{t('admin.my_categories.empty_available')}</p>
    );
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      <div className="flex flex-col gap-2">
        <Label>{t('admin.my_categories.form.select_categories')}</Label>
        <div className="max-h-64 overflow-y-auto rounded-md border p-3">
          <ul className="flex flex-col gap-2">
            {categories.map((category) => (
              <li key={category.id} className="flex items-center gap-2">
                <Checkbox
                  checked={selected.has(category.id)}
                  id={`cat-${category.id}`}
                  onCheckedChange={() => { toggle(category.id); }}
                />
                <Label className="cursor-pointer font-normal" htmlFor={`cat-${category.id}`}>
                  {category.name}
                </Label>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="comment">{t('admin.my_categories.form.comment_label')}</Label>
        <Textarea
          id="comment"
          minLength={3}
          maxLength={1000}
          placeholder={t('admin.my_categories.form.comment_placeholder')}
          required
          rows={4}
          value={comment}
          onChange={(e) => { setComment(e.target.value); }}
        />
      </div>

      <div>
        <Button
          disabled={submitting || selected.size === 0 || comment.trim().length < 3}
          type="submit"
        >
          {t('admin.my_categories.form.submit')}
        </Button>
      </div>
    </form>
  );
}

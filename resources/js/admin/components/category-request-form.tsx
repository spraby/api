import * as React from 'react';

import { router } from '@inertiajs/react';
import { SearchIcon, XIcon } from 'lucide-react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  const [submitting, setSubmitting] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const filteredCategories = React.useMemo(() => {
    const query = search.trim().toLowerCase();

    return query
      ? categories.filter((category) => category.name.toLowerCase().includes(query))
      : categories;
  }, [categories, search]);
  const selectedCategories = React.useMemo(
    () => categories.filter((category) => selected.has(category.id)),
    [categories, selected],
  );

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

    if (selected.size === 0) {
      return;
    }

    setSubmitting(true);
    router.post(
      '/admin/my-categories/requests',
      {
        category_ids: Array.from(selected),
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
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            aria-label={t('admin.my_categories.form.search_placeholder')}
            className="pl-9"
            placeholder={t('admin.my_categories.form.search_placeholder')}
            value={search}
            onChange={(e) => { setSearch(e.target.value); }}
          />
        </div>
        <div className="max-h-64 overflow-y-auto rounded-md border p-3">
          {filteredCategories.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t('admin.my_categories.form.no_results')}</p>
          ) : null}
          <ul className="flex flex-col gap-2">
            {filteredCategories.map((category) => (
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

      {selectedCategories.length > 0 ? (
        <div className="flex flex-col gap-2">
          <Label>{t('admin.my_categories.form.selected_categories')}</Label>
          <div className="flex flex-wrap gap-2">
            {selectedCategories.map((category) => (
              <Badge key={category.id} className="gap-1 pr-1" variant="secondary">
                {category.name}
                <button
                  aria-label={t('admin.my_categories.form.remove_category')}
                  className="rounded-sm p-0.5 hover:bg-background/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  type="button"
                  onClick={() => { toggle(category.id); }}
                >
                  <XIcon className="size-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      ) : null}

      <div>
        <Button
          disabled={submitting || selected.size === 0}
          type="submit"
        >
          {t('admin.my_categories.form.submit')}
        </Button>
      </div>
    </form>
  );
}

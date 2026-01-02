import { router } from '@inertiajs/react';
import { Languages } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useLang } from '@/lib/lang';

export function LanguageToggle() {
  const { t, locale } = useLang();

  const switchLocale = (newLocale: string) => {
    router.get(`/set-locale/${newLocale}`, {}, {
      preserveState: true,
      preserveScroll: true,
      only: ['locale', 'lang'],
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="icon" variant="ghost">
          <Languages className="h-5 w-5" />
          <span className="sr-only">{t('admin.language.switch')}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          className={locale === 'ru' ? 'bg-accent' : ''}
          onClick={() => { switchLocale('ru'); }}
        >
          {t('admin.language.russian')}
        </DropdownMenuItem>
        <DropdownMenuItem
          className={locale === 'en' ? 'bg-accent' : ''}
          onClick={() => { switchLocale('en'); }}
        >
          {t('admin.language.english')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

import { usePage } from '@inertiajs/react';

import { PageProps } from '@/types/inertia';

/**
 * Hook для доступа к переводам из Laravel
 */
export function useLang() {
  const { lang, locale } = usePage<PageProps>().props;

  /**
   * Получить перевод по ключу
   * @example __('admin.nav.dashboard')
   */
  const __ = (key: string): string => {
    const keys = key.split('.');
    let value: unknown = lang;

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return key;
      }
    }

    return typeof value === 'string' ? value : key;
  };

  /**
   * Получить перевод с заменой плейсхолдеров
   * @example trans('admin.welcome', { name: 'John' })
   */
  const trans = (key: string, replacements?: Record<string, string | number>): string => {
    let translation = __(key);

    if (replacements) {
      Object.entries(replacements).forEach(([placeholder, value]) => {
        translation = translation.replace(`:${placeholder}`, String(value));
        translation = translation.replace(`{${placeholder}}`, String(value));
      });
    }

    return translation;
  };

  return { __, trans, locale };
}

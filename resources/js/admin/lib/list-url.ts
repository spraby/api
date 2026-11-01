import { router } from '@inertiajs/react';

import type { SortingState } from '@tanstack/react-table';

/**
 * Состояние списка (страница, фильтры, сортировка) в query-параметрах URL,
 * чтобы при возврате со страницы записи пользователь оказывался там же.
 */

const STORAGE_PREFIX = 'admin:list-url:';

const PAGE_PARAM = 'page';
const PER_PAGE_PARAM = 'per_page';
const SORT_PARAM = 'sort';

export interface ListUrlState {
  pageIndex: number;
  pageSize: number;
  sorting: SortingState;
  filters: Record<string, string>;
}

const parsePositiveInt = (value: string | null): number | null => {
  if (!value) {
    return null;
  }

  const parsed = Number.parseInt(value, 10);

  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
};

export function readListUrlState(
  filterIds: string[],
  defaultPageSize: number,
  pageSizeOptions: number[],
): ListUrlState {
  const params = new URLSearchParams(window.location.search);

  const page = parsePositiveInt(params.get(PAGE_PARAM)) ?? 1;
  const perPage = parsePositiveInt(params.get(PER_PAGE_PARAM));
  const sort = params.get(SORT_PARAM);

  const filters = filterIds.reduce<Record<string, string>>((acc, id) => {
    const value = params.get(id);

    if (value) {
      acc[id] = value;
    }

    return acc;
  }, {});

  return {
    pageIndex: page - 1,
    pageSize: perPage !== null && pageSizeOptions.includes(perPage) ? perPage : defaultPageSize,
    sorting: sort
      ? [{ id: sort.replace(/^-/, ''), desc: sort.startsWith('-') }]
      : [],
    filters,
  };
}

const normalizeUrl = (url: URL): string => {
  const query = url.searchParams.toString();

  return `${url.pathname}${query ? `?${query}` : ''}${url.hash}`;
};

/**
 * Собирает URL текущей страницы с новым состоянием списка.
 * Посторонние query-параметры сохраняются.
 */
export function buildListUrl(
  state: ListUrlState,
  filterIds: string[],
  defaultPageSize: number,
): { current: string; next: string } {
  const url = new URL(window.location.href);
  const current = normalizeUrl(url);
  const params = url.searchParams;

  const setOrDelete = (key: string, value: string | null) => {
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
  };

  filterIds.forEach((id) => { setOrDelete(id, state.filters[id] ?? null); });

  const [sort] = state.sorting;

  setOrDelete(SORT_PARAM, sort ? `${sort.desc ? '-' : ''}${sort.id}` : null);
  setOrDelete(PER_PAGE_PARAM, state.pageSize !== defaultPageSize ? String(state.pageSize) : null);
  setOrDelete(PAGE_PARAM, state.pageIndex > 0 ? String(state.pageIndex + 1) : null);

  return { current, next: normalizeUrl(url) };
}

/**
 * Запоминает последний URL списка (с query), чтобы кнопка «Назад»
 * со страницы записи вернула на ту же страницу/фильтры.
 */
export function rememberListUrl(url: string): void {
  try {
    const parsed = new URL(url, window.location.origin);

    window.sessionStorage.setItem(STORAGE_PREFIX + parsed.pathname, `${parsed.pathname}${parsed.search}`);
  } catch {
    // sessionStorage недоступен — вернёмся на список без параметров
  }
}

export function getListUrl(path: string): string {
  try {
    return window.sessionStorage.getItem(STORAGE_PREFIX + path) ?? path;
  } catch {
    return path;
  }
}

/**
 * Переход на список с восстановлением последней страницы/фильтров.
 */
export function visitList(path: string): void {
  router.visit(getListUrl(path));
}

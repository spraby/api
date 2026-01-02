import type { Config } from 'ziggy-js';

export interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  roles: string[];
  permissions: string[];
  is_admin: boolean;
  is_manager: boolean;
}

export interface LangTranslations {
  nav: {
    dashboard: string;
    users: string;
    settings: string;
    documents: string;
  };
  user: {
    account: string;
    logout: string;
  };
  theme: {
    light: string;
    dark: string;
    system: string;
    toggle: string;
  };
  language: {
    switch: string;
    russian: string;
    english: string;
  };
}

export type PageProps<T extends Record<string, unknown> = Record<string, unknown>> = T & {
  auth: {
    user: User;
  };
  ziggy?: Config;
  errors?: Record<string, string>;
  flash?: {
    success?: string;
    error?: string;
    warning?: string;
    info?: string;
  };
  locale: string;
  lang: {
    admin: LangTranslations;
  };
};
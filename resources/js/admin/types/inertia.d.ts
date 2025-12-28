import { Config } from 'ziggy-js';

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
};
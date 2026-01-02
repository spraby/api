import type { PageProps as InertiaPageProps } from '@inertiajs/core';

export {};

declare global {
  interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at?: string;
    created_at: string;
    updated_at: string;
  }

  interface PageProps extends InertiaPageProps {
    auth: {
      user: User;
    };
    errors?: Record<string, string>;
    flash?: {
      success?: string;
      error?: string;
      warning?: string;
      info?: string;
    };
  }
}
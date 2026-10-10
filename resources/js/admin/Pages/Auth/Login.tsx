import type { FormEventHandler } from 'react';

import { useForm, Link, usePage } from '@inertiajs/react';

import {
  StorefrontAuthLayout,
  StorefrontButton,
  StorefrontField,
  StorefrontNotice,
  storefrontLinkClass,
} from '../../components/storefront-auth.tsx';

import type { PageProps } from '../../types/inertia';

interface LoginProps {
  canResetPassword?: boolean;
  status?: string | null;
}

interface LoginFormData {
  email: string;
  password: string;
  remember: boolean;
}

export default function Login({ canResetPassword = false, status = null }: LoginProps) {
  const { storeUrl } = usePage<PageProps>().props;
  const { data, setData, post, processing, errors } = useForm<LoginFormData>({
    email: '',
    password: '',
    remember: false,
  });

  const submit: FormEventHandler = (e) => {
    e.preventDefault();
    post('/admin/login');
  };

  return (
    <StorefrontAuthLayout description="Войдите, чтобы управлять своим магазином." title="Вход в кабинет">
      <form className="space-y-4" onSubmit={submit}>
        {!!status && <StorefrontNotice variant="success">{status}</StorefrontNotice>}

        <StorefrontField
          required
          autoComplete="email"
          error={errors.email}
          id="email"
          label="Email"
          placeholder="hello@spra.by"
          type="email"
          value={data.email}
          onChange={(e) => { setData('email', e.target.value); }}
        />

        <StorefrontField
          required
          autoComplete="current-password"
          error={errors.password}
          id="password"
          label="Пароль"
          type="password"
          value={data.password}
          onChange={(e) => { setData('password', e.target.value); }}
        />

        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 text-sm">
          <label className="flex min-h-11 cursor-pointer items-center gap-2 text-gray-700" htmlFor="remember">
            <input
              checked={data.remember}
              className="h-4 w-4 cursor-pointer rounded border-gray-300 accent-store-600"
              id="remember"
              type="checkbox"
              onChange={(e) => { setData('remember', e.target.checked); }}
            />
            Запомнить меня
          </label>

          {!!canResetPassword && (
            <Link className={storefrontLinkClass} href="/admin/forgot-password">
              Забыли пароль?
            </Link>
          )}
        </div>

        <StorefrontButton disabled={processing}>
          {processing ? 'Вход...' : 'Войти'}
        </StorefrontButton>

        <p className="text-center text-sm text-gray-500">
          Нет аккаунта?{' '}
          <a className={storefrontLinkClass} href={`${storeUrl}/register`}>
            Стать продавцом
          </a>
        </p>
      </form>
    </StorefrontAuthLayout>
  );
}

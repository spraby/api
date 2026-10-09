import type { FormEventHandler } from 'react';

import { useForm, Link } from '@inertiajs/react';

import {
  StorefrontAuthLayout,
  StorefrontButton,
  StorefrontField,
  StorefrontNotice,
  storefrontLinkClass,
} from '../../components/storefront-auth.tsx';

interface ResetPasswordProps {
  token: string;
  email: string | null;
}

interface ResetPasswordFormData {
  token: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export default function ResetPassword({ token, email }: ResetPasswordProps) {
  const { data, setData, post, processing, errors } = useForm<ResetPasswordFormData>({
    token,
    email: email ?? '',
    password: '',
    password_confirmation: '',
  });

  const submit: FormEventHandler = (e) => {
    e.preventDefault();
    post('/admin/reset-password');
  };

  return (
    <StorefrontAuthLayout description="Придумайте новый пароль для входа в кабинет." title="Новый пароль">
      <form className="space-y-5" onSubmit={submit}>
        {/* Bad or expired token is reported on the email field. */}
        {!!errors.email && (
          <StorefrontNotice title="Не получилось сменить пароль" variant="error">
            {errors.email}{' '}
            <Link className={storefrontLinkClass} href="/admin/forgot-password">
              Запросить новую ссылку
            </Link>
          </StorefrontNotice>
        )}

        <StorefrontField
          required
          autoComplete="email"
          id="email"
          label="Email"
          readOnly={!!email}
          type="email"
          value={data.email}
          onChange={(e) => { setData('email', e.target.value); }}
        />

        <StorefrontField
          autoFocus
          required
          autoComplete="new-password"
          error={errors.password}
          id="password"
          label="Новый пароль"
          placeholder="Не короче 8 символов"
          type="password"
          value={data.password}
          onChange={(e) => { setData('password', e.target.value); }}
        />

        <StorefrontField
          required
          autoComplete="new-password"
          id="password_confirmation"
          label="Повторите пароль"
          type="password"
          value={data.password_confirmation}
          onChange={(e) => { setData('password_confirmation', e.target.value); }}
        />

        <StorefrontButton disabled={processing}>
          {processing ? 'Сохранение...' : 'Сохранить пароль'}
        </StorefrontButton>
      </form>
    </StorefrontAuthLayout>
  );
}

import type { FormEventHandler } from 'react';

import { useForm, Link } from '@inertiajs/react';

import {
  StorefrontAuthLayout,
  StorefrontButton,
  StorefrontField,
  StorefrontNotice,
  storefrontLinkClass,
} from '../../components/storefront-auth.tsx';

interface ForgotPasswordProps {
  status: string | null;
}

interface ForgotPasswordFormData {
  email: string;
}

export default function ForgotPassword({ status }: ForgotPasswordProps) {
  const { data, setData, post, processing, errors } = useForm<ForgotPasswordFormData>({
    email: '',
  });

  const submit: FormEventHandler = (e) => {
    e.preventDefault();
    post('/admin/forgot-password');
  };

  return (
    <StorefrontAuthLayout
      description="Укажите email, с которым вы входите в кабинет, и мы пришлём ссылку для смены пароля."
      title="Забыли пароль?"
    >
      <form className="space-y-5" onSubmit={submit}>
        {!!status && <StorefrontNotice title="Проверьте почту" variant="success">{status}</StorefrontNotice>}

        <StorefrontField
          autoFocus
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

        <StorefrontButton disabled={processing}>
          {processing ? 'Отправка...' : 'Отправить ссылку'}
        </StorefrontButton>

        <p className="text-center text-sm">
          <Link className={storefrontLinkClass} href="/admin/login">
            Вернуться ко входу
          </Link>
        </p>
      </form>
    </StorefrontAuthLayout>
  );
}

import type { FormEventHandler } from 'react';

import { useForm, Head, Link } from '@inertiajs/react';

import { Button } from '../../components/ui/button.tsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card.tsx';
import { Input } from '../../components/ui/input.tsx';
import { Label } from '../../components/ui/label.tsx';

interface SetPasswordProps {
  token: string;
  email: string | null;
  valid: boolean;
}

interface SetPasswordFormData {
  password: string;
  password_confirmation: string;
}

export default function SetPassword({ token, email, valid }: SetPasswordProps) {
  const { data, setData, post, processing, errors } = useForm<SetPasswordFormData>({
    password: '',
    password_confirmation: '',
  });

  const submit: FormEventHandler = (e) => {
    e.preventDefault();
    post(`/admin/set-password/${token}`);
  };

  return (
    <>
      <Head title="Установка пароля" />

      <div className="flex min-h-screen items-center justify-center bg-(--background) px-4">
        <Card className="w-full max-w-md">
          {valid ? (
            <>
              <CardHeader className="gap-y-2">
                <CardTitle className="text-2xl">Установите пароль</CardTitle>
                <CardDescription>
                  {email
                    ? `Создайте пароль для входа в аккаунт ${email}`
                    : 'Создайте пароль для входа в аккаунт'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="flex flex-col gap-y-4" onSubmit={submit}>
                  <div className="flex flex-col gap-y-2">
                    <Label htmlFor="password">Новый пароль</Label>
                    <Input
                      autoFocus
                      required
                      id="password"
                      type="password"
                      value={data.password}
                      onChange={(e) => { setData('password', e.target.value); }}
                    />
                    {!!errors.password && <span className="text-sm text-(--destructive)">{errors.password}</span>}
                  </div>

                  <div className="flex flex-col gap-y-2">
                    <Label htmlFor="password_confirmation">Повторите пароль</Label>
                    <Input
                      required
                      id="password_confirmation"
                      type="password"
                      value={data.password_confirmation}
                      onChange={(e) => { setData('password_confirmation', e.target.value); }}
                    />
                  </div>

                  <Button className="w-full" disabled={processing} type="submit">
                    {processing ? 'Сохранение...' : 'Сохранить пароль'}
                  </Button>
                </form>
              </CardContent>
            </>
          ) : (
            <>
              <CardHeader className="gap-y-2">
                <CardTitle className="text-2xl">Ссылка недействительна</CardTitle>
                <CardDescription>
                  Ссылка для установки пароля устарела или уже была использована.
                  Срок её действия — 48 часов. Обратитесь к администратору, чтобы
                  получить новую.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link
                  className="text-(--primary) underline-offset-4 hover:underline"
                  href="/admin/login"
                >
                  Перейти ко входу
                </Link>
              </CardContent>
            </>
          )}
        </Card>
      </div>
    </>
  );
}

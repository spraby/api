import type { FormEventHandler } from 'react';

import { useForm, Head, Link } from '@inertiajs/react';

import { Button } from '../../components/ui/button.tsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card.tsx';
import { Input } from '../../components/ui/input.tsx';
import { Label } from '../../components/ui/label.tsx';

interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export default function Register() {
  const { data, setData, post, processing, errors } = useForm<RegisterFormData>({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
  });

  const submit: FormEventHandler = (e) => {
    e.preventDefault();
    post('/sb/admin/register');
  };

  return (
    <>
      <Head title="Register" />

      <div className="flex min-h-screen items-center justify-center bg-(--background) px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="gap-y-2">
            <CardTitle className="text-2xl">Create Account</CardTitle>
            <CardDescription>
              Enter your information to create a new account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="flex flex-col gap-y-4" onSubmit={submit}>
              <div className="flex flex-col gap-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  autoFocus
                  required
                  id="name"
                  placeholder="John Doe"
                  type="text"
                  value={data.name}
                  onChange={(e) => { setData('name', e.target.value); }}
                />
                {!!errors.name && <span className="text-sm text-(--destructive)">{errors.name}</span>}
              </div>

              <div className="flex flex-col gap-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  required
                  id="email"
                  placeholder="user@example.com"
                  type="email"
                  value={data.email}
                  onChange={(e) => { setData('email', e.target.value); }}
                />
                {!!errors.email && <span className="text-sm text-(--destructive)">{errors.email}</span>}
              </div>

              <div className="flex flex-col gap-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  required
                  id="password"
                  type="password"
                  value={data.password}
                  onChange={(e) => { setData('password', e.target.value); }}
                />
                {!!errors.password && <span className="text-sm text-(--destructive)">{errors.password}</span>}
              </div>

              <div className="flex flex-col gap-y-2">
                <Label htmlFor="password_confirmation">Confirm Password</Label>
                <Input
                  required
                  id="password_confirmation"
                  type="password"
                  value={data.password_confirmation}
                  onChange={(e) => { setData('password_confirmation', e.target.value); }}
                />
                {!!errors.password_confirmation && (
                  <span className="text-sm text-(--destructive)">
                    {errors.password_confirmation}
                  </span>
                )}
              </div>

              <Button className="w-full" disabled={processing} type="submit">
                {processing ? 'Creating account...' : 'Create Account'}
              </Button>

              <div className="text-center text-sm text-(--muted-foreground)">
                Already have an account?{' '}
                <Link
                  className="text-(--primary) underline-offset-4 hover:underline"
                  href="/sb/admin/login"
                >
                  Login
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

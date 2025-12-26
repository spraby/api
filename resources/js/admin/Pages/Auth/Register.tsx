import { useForm, Head, Link } from '@inertiajs/react';
import { FormEventHandler } from 'react';

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
            <form onSubmit={submit} className="flex flex-col gap-y-4">
              <div className="flex flex-col gap-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  type="text"
                  value={data.name}
                  onChange={(e) => setData('name', e.target.value)}
                  placeholder="John Doe"
                  required
                  autoFocus
                />
                {errors.name && (
                  <span className="text-sm text-(--destructive)">{errors.name}</span>
                )}
              </div>

              <div className="flex flex-col gap-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={data.email}
                  onChange={(e) => setData('email', e.target.value)}
                  placeholder="user@example.com"
                  required
                />
                {errors.email && (
                  <span className="text-sm text-(--destructive)">{errors.email}</span>
                )}
              </div>

              <div className="flex flex-col gap-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={data.password}
                  onChange={(e) => setData('password', e.target.value)}
                  required
                />
                {errors.password && (
                  <span className="text-sm text-(--destructive)">{errors.password}</span>
                )}
              </div>

              <div className="flex flex-col gap-y-2">
                <Label htmlFor="password_confirmation">Confirm Password</Label>
                <Input
                  id="password_confirmation"
                  type="password"
                  value={data.password_confirmation}
                  onChange={(e) => setData('password_confirmation', e.target.value)}
                  required
                />
                {errors.password_confirmation && (
                  <span className="text-sm text-(--destructive)">
                    {errors.password_confirmation}
                  </span>
                )}
              </div>

              <Button type="submit" disabled={processing} className="w-full">
                {processing ? 'Creating account...' : 'Create Account'}
              </Button>

              <div className="text-center text-sm text-(--muted-foreground)">
                Already have an account?{' '}
                <Link
                  href="/sb/admin/login"
                  className="text-(--primary) underline-offset-4 hover:underline"
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

import { useForm, Head, Link } from '@inertiajs/react';
import { Button } from '../../components/ui/button.tsx';
import { Input } from '../../components/ui/input.tsx';
import { Label } from '../../components/ui/label.tsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card.tsx';
import { FormEventHandler } from 'react';

interface LoginFormData {
  email: string;
  password: string;
  remember: boolean;
}

export default function Login() {
  const { data, setData, post, processing, errors } = useForm<LoginFormData>({
    email: '',
    password: '',
    remember: false,
  });

  const submit: FormEventHandler = (e) => {
    e.preventDefault();
    post('/sb/admin/login');
  };

  return (
    <>
      <Head title="Login" />

      <div className="flex min-h-screen items-center justify-center bg-(--background) px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="gap-y-2">
            <CardTitle className="text-2xl">Welcome Back</CardTitle>
            <CardDescription>
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={submit} className="flex flex-col gap-y-4">
              <div className="flex flex-col gap-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={data.email}
                  onChange={(e) => setData('email', e.target.value)}
                  placeholder="user@example.com"
                  required
                  autoFocus
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

              <div className="flex items-center gap-x-2">
                <input
                  id="remember"
                  type="checkbox"
                  checked={data.remember}
                  onChange={(e) => setData('remember', e.target.checked)}
                  className="h-4 w-4 rounded border-(--input)"
                />
                <Label htmlFor="remember" className="cursor-pointer">
                  Remember me
                </Label>
              </div>

              <Button type="submit" disabled={processing} className="w-full">
                {processing ? 'Logging in...' : 'Login'}
              </Button>

              <div className="text-center text-sm text-(--muted-foreground)">
                Don't have an account?{' '}
                <Link
                  href="/sb/admin/register"
                  className="text-(--primary) underline-offset-4 hover:underline"
                >
                  Register
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

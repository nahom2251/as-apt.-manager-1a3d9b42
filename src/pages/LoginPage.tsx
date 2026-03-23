import { useState } from 'react';
import { useI18n } from '@/lib/i18n';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { LanguageToggle } from '@/components/LanguageToggle';
import { Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Footer } from '@/components/Footer';
import { toast } from 'sonner';

export default function LoginPage() {
  const { t } = useI18n();
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) {
      toast.error(error);
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="absolute top-4 right-4">
        <LanguageToggle />
      </div>
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <Card className="w-full max-w-md border-border shadow-lg">
          <CardHeader className="text-center space-y-2">
            <div className="w-14 h-14 mx-auto rounded-xl gold-gradient flex items-center justify-center mb-2">
              <span className="text-xl font-bold text-primary-foreground">AS</span>
            </div>
            <CardTitle className="text-2xl font-bold">{t('appShort')}</CardTitle>
            <CardDescription>{t('appName')}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">{t('email')}</Label>
                <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@example.com" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">{t('password')}</Label>
                <div className="relative">
                  <Input id="password" type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Checkbox id="remember" checked={rememberMe} onCheckedChange={(c) => setRememberMe(c as boolean)} />
                  <Label htmlFor="remember" className="text-sm cursor-pointer">{t('rememberMe')}</Label>
                </div>
                <button type="button" onClick={() => navigate('/forgot-password')} className="text-sm text-primary hover:underline">
                  {t('forgotPassword')}
                </button>
              </div>
              <Button type="submit" className="w-full gold-gradient text-primary-foreground hover:opacity-90" disabled={loading}>
                {loading ? '...' : t('signIn')}
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                {t('noAccount')}{' '}
                <button type="button" onClick={() => navigate('/register')} className="text-primary hover:underline font-medium">{t('signUp')}</button>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
}
import { useState } from 'react';
import { useI18n } from '@/lib/i18n';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { Footer } from '@/components/Footer';
import { toast } from 'sonner';

export default function ForgotPasswordPage() {
  const { t } = useI18n();
  const { resetPassword } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await resetPassword(email);
    setLoading(false);
    if (error) {
      toast.error(error);
    } else {
      setSent(true);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>{t('forgotPassword')}</CardTitle>
          </CardHeader>
          <CardContent>
            {sent ? (
              <div className="text-center space-y-4">
                <p className="text-muted-foreground">A password reset link has been sent to your email.</p>
                <Button variant="outline" onClick={() => navigate('/login')}>{t('signIn')}</Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">{t('email')}</Label>
                  <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
                </div>
                <Button type="submit" className="w-full gold-gradient text-primary-foreground" disabled={loading}>
                  {loading ? '...' : t('sendResetLink')}
                </Button>
                <button type="button" onClick={() => navigate('/login')} className="block w-full text-center text-sm text-primary hover:underline">
                  {t('signIn')}
                </button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
}
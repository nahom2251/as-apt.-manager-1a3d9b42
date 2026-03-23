import { useI18n } from '@/lib/i18n';
import { useAuth } from '@/lib/auth';
import { useAppUsers, useUpdateUserStatus } from '@/hooks/use-users';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, X } from 'lucide-react';
import { toast } from 'sonner';

export default function UsersPage() {
  const { t } = useI18n();
  const { profile } = useAuth();
  const { data: users = [], isLoading } = useAppUsers();
  const updateStatus = useUpdateUserStatus();

  const isSuperAdmin = profile?.role === 'super_admin';

  const handleUpdate = async (userId: string, status: 'approved' | 'rejected') => {
    try {
      await updateStatus.mutateAsync({ userId, status });
      toast.success(status === 'approved' ? 'User approved' : 'User rejected');
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center py-12"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold">{t('users')}</h1>
      <div className="space-y-3">
        {users.filter(u => u.id !== profile?.id).map(user => (
          <Card key={user.id}>
            <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="font-medium">{user.name}</p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                  user.status === 'approved' ? 'bg-success/10 text-success' :
                  user.status === 'rejected' ? 'bg-destructive/10 text-destructive' :
                  'bg-warning/10 text-warning'
                }`}>
                  {user.status === 'approved' ? t('approved') : user.status === 'rejected' ? t('rejected') : t('pending')}
                </span>
                {isSuperAdmin && user.status === 'pending' && (
                  <>
                    <Button size="sm" variant="ghost" className="text-success" onClick={() => handleUpdate(user.id, 'approved')}>
                      <Check className="h-4 w-4 mr-1" />{t('approve')}
                    </Button>
                    <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleUpdate(user.id, 'rejected')}>
                      <X className="h-4 w-4 mr-1" />{t('reject')}
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        {users.filter(u => u.id !== profile?.id).length === 0 && (
          <Card><CardContent className="p-8 text-center text-muted-foreground">No other users registered yet.</CardContent></Card>
        )}
      </div>
    </div>
  );
}

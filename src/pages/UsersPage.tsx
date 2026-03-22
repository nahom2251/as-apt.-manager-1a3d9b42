import { useState } from 'react';
import { useI18n } from '@/lib/i18n';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AppUser } from '@/lib/types';
import { Check, X } from 'lucide-react';

const demoUsers: AppUser[] = [
  { id: '2', email: 'assistant@example.com', name: 'Kebede Alemu', role: 'admin', status: 'pending' },
  { id: '3', email: 'helper@example.com', name: 'Sara Tadesse', role: 'admin', status: 'approved' },
];

export default function UsersPage() {
  const { t } = useI18n();
  const [users, setUsers] = useState<AppUser[]>(demoUsers);

  const updateStatus = (id: string, status: 'approved' | 'rejected') => {
    setUsers(us => us.map(u => u.id === id ? { ...u, status } : u));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold">{t('users')}</h1>
      <div className="space-y-3">
        {users.map(user => (
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
                {user.status === 'pending' && (
                  <>
                    <Button size="sm" variant="ghost" className="text-success" onClick={() => updateStatus(user.id, 'approved')}>
                      <Check className="h-4 w-4 mr-1" />{t('approve')}
                    </Button>
                    <Button size="sm" variant="ghost" className="text-destructive" onClick={() => updateStatus(user.id, 'rejected')}>
                      <X className="h-4 w-4 mr-1" />{t('reject')}
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

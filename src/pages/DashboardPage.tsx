import { useI18n } from '@/lib/i18n';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Users, TrendingUp, AlertTriangle } from 'lucide-react';
import { APARTMENTS_CONFIG, getUnitLabel } from '@/lib/types';
import { useMemo } from 'react';
import { useApartmentStore } from '@/lib/store';

export default function DashboardPage() {
  const { t, lang } = useI18n();
  const { apartments, bills } = useApartmentStore();

  const stats = useMemo(() => {
    const occupied = apartments.filter(a => a.tenant).length;
    const totalRev = bills.filter(b => b.status === 'paid').reduce((s, b) => s + b.amount, 0);
    const pendingBills = bills.filter(b => b.status === 'pending').length;
    return { occupied, total: 7, totalRev, pendingBills };
  }, [apartments, bills]);

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold">{t('dashboard')}</h1>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl gold-gradient-light flex items-center justify-center">
              <Building2 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t('occupancy')}</p>
              <p className="text-2xl font-bold">{stats.occupied}/{stats.total}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl gold-gradient-light flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t('totalRevenue')}</p>
              <p className="text-2xl font-bold">{stats.totalRev.toLocaleString()} Br</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t('pending')}</p>
              <p className="text-2xl font-bold">{stats.pendingBills}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl gold-gradient-light flex items-center justify-center">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t('apartments')}</p>
              <p className="text-2xl font-bold">7</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Apartment overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('overview')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {apartments.map(apt => (
              <div key={apt.id} className="border rounded-lg p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">{getUnitLabel(apt.floor, apt.position, lang)}</p>
                  <p className="text-sm text-muted-foreground">
                    {apt.tenant ? apt.tenant.name : t('noTenant')}
                  </p>
                </div>
                <div className={`w-3 h-3 rounded-full ${apt.tenant ? 'bg-success' : 'bg-muted-foreground/30'}`} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

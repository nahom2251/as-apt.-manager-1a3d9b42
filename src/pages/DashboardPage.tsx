import { useI18n } from '@/lib/i18n';
import { useApartments } from '@/hooks/use-apartments';
import { useBills } from '@/hooks/use-bills';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Users, TrendingUp, AlertTriangle } from 'lucide-react';
import { getUnitLabel, calculateRentStatus } from '@/lib/types';
import { useMemo } from 'react';

export default function DashboardPage() {
  const { t, lang } = useI18n();
  const { data: apartments = [], isLoading: aptsLoading } = useApartments();
  const { data: bills = [], isLoading: billsLoading } = useBills();

  const stats = useMemo(() => {
    const occupied = apartments.filter(a => a.tenant).length;
    const totalRev = bills.filter(b => b.status === 'paid').reduce((s, b) => s + Number(b.amount), 0);
    const pendingBills = bills.filter(b => b.status === 'pending').length;
    return { occupied, total: 7, totalRev, pendingBills };
  }, [apartments, bills]);

  const getStatusDot = (status: 'good' | 'near_due' | 'overdue') => {
    if (status === 'overdue') return 'bg-destructive';
    if (status === 'near_due') return 'bg-warning';
    return 'bg-success';
  };

  if (aptsLoading || billsLoading) {
    return <div className="flex items-center justify-center py-12"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold">{t('dashboard')}</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card><CardContent className="p-4 flex items-center gap-4"><div className="w-12 h-12 rounded-xl gold-gradient-light flex items-center justify-center"><Building2 className="h-6 w-6 text-primary" /></div><div><p className="text-sm text-muted-foreground">{t('occupancy')}</p><p className="text-2xl font-bold">{stats.occupied}/{stats.total}</p></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-4"><div className="w-12 h-12 rounded-xl gold-gradient-light flex items-center justify-center"><TrendingUp className="h-6 w-6 text-primary" /></div><div><p className="text-sm text-muted-foreground">{t('totalRevenue')}</p><p className="text-2xl font-bold">{stats.totalRev.toLocaleString()} Br</p></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-4"><div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center"><AlertTriangle className="h-6 w-6 text-destructive" /></div><div><p className="text-sm text-muted-foreground">{t('pending')}</p><p className="text-2xl font-bold">{stats.pendingBills}</p></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-4"><div className="w-12 h-12 rounded-xl gold-gradient-light flex items-center justify-center"><Users className="h-6 w-6 text-primary" /></div><div><p className="text-sm text-muted-foreground">{t('apartments')}</p><p className="text-2xl font-bold">7</p></div></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-lg">{t('overview')}</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {apartments.map(apt => {
              const occupied = !!apt.tenant;
              const rs = occupied ? calculateRentStatus(apt.tenant!.move_in_date, apt.tenant!.payment_months) : null;
              return (
                <div key={apt.id} className="border rounded-lg p-4 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-sm">{getUnitLabel(apt.floor, apt.position, lang)}</p>
                    <div className={`w-3 h-3 rounded-full ${occupied ? getStatusDot(rs!.status) : 'bg-muted-foreground/30'}`} />
                  </div>
                  <p className="text-sm text-muted-foreground">{apt.tenant ? apt.tenant.name : t('noTenant')}</p>
                  {rs && (
                    <p className={`text-xs font-medium ${rs.status === 'overdue' ? 'text-destructive' : rs.status === 'near_due' ? 'text-warning' : 'text-success'}`}>
                      {rs.daysLeft > 0
                        ? `${rs.daysLeft} ${lang === 'am' ? 'ቀናት ቀርተዋል' : 'days left'}`
                        : `${Math.abs(rs.daysLeft)} ${lang === 'am' ? 'ቀናት ያለፈ' : 'days overdue'}`}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

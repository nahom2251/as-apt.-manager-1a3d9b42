import { useMemo } from 'react';
import { useI18n } from '@/lib/i18n';
import { useBills } from '@/hooks/use-bills';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Download } from 'lucide-react';
import { generateRevenueReportPDF } from '@/lib/pdf';

export default function RevenuePage() {
  const { t } = useI18n();
  const { data: bills = [], isLoading } = useBills();

  const { rentTotal, electricityTotal, waterTotal, chartData } = useMemo(() => {
    const paidBills = bills.filter(b => b.status === 'paid');
    const rent = paidBills.filter(b => b.type === 'rent').reduce((s, b) => s + Number(b.amount), 0);
    const elec = paidBills.filter(b => b.type === 'electricity').reduce((s, b) => s + Number(b.amount), 0);
    const water = paidBills.filter(b => b.type === 'water').reduce((s, b) => s + Number(b.amount), 0);
    const chartData = [
      { name: 'Rent', amount: rent, fill: 'hsl(43, 76%, 52%)' },
      { name: 'Electricity', amount: elec, fill: 'hsl(38, 92%, 50%)' },
      { name: 'Water', amount: water, fill: 'hsl(210, 79%, 46%)' },
    ];
    return { rentTotal: rent, electricityTotal: elec, waterTotal: water, chartData };
  }, [bills]);

  const total = rentTotal + electricityTotal + waterTotal;
  const pendingTotal = bills.filter(b => b.status === 'pending').reduce((s, b) => s + Number(b.amount), 0);

  if (isLoading) {
    return <div className="flex items-center justify-center py-12"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">{t('revenue')}</h1>
        <Button size="sm" className="gold-gradient text-primary-foreground" onClick={() => generateRevenueReportPDF(rentTotal, electricityTotal, waterTotal)}>
          <Download className="h-3.5 w-3.5 mr-1" />{t('downloadReport')}
        </Button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">{t('totalRevenue')}</p><p className="text-2xl font-bold">{total.toLocaleString()} Br</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">{t('rent')}</p><p className="text-2xl font-bold text-primary">{rentTotal.toLocaleString()} Br</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">{t('electricity')}</p><p className="text-2xl font-bold text-warning">{electricityTotal.toLocaleString()} Br</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">{t('water')}</p><p className="text-2xl font-bold text-info">{waterTotal.toLocaleString()} Br</p></CardContent></Card>
      </div>
      <Card>
        <CardHeader><CardTitle className="text-lg">{t('revenue')} — {t('overview')}</CardTitle></CardHeader>
        <CardContent>
          <div className="h-64 sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(40, 20%, 90%)" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value: number) => [`${value.toLocaleString()} Birr`, 'Amount']} />
                <Legend />
                <Bar dataKey="amount" name="Collected (Birr)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4 flex items-center justify-between">
          <div><p className="text-sm text-muted-foreground">{t('pendingAmount')}</p><p className="text-xl font-bold text-destructive">{pendingTotal.toLocaleString()} Br</p></div>
        </CardContent>
      </Card>
    </div>
  );
}

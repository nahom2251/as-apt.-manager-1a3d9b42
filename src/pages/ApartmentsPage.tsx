import { useState, useMemo, useCallback } from 'react';
import { useI18n } from '@/lib/i18n';
import { useApartments, useSetTenant, useRemoveTenant } from '@/hooks/use-apartments';
import { getUnitLabel, calculateRentStatus } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { UserPlus, UserMinus, Phone, Calendar, DollarSign, Clock } from 'lucide-react';
import { toast } from 'sonner';

export default function ApartmentsPage() {
  const { t, lang } = useI18n();
  const { data: apartments = [], isLoading } = useApartments();
  const setTenantMut = useSetTenant();
  const removeTenantMut = useRemoveTenant();
  const [editingApt, setEditingApt] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', phone: '', moveInDate: '', monthlyRent: '', paymentMonths: '1' });
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleSave = useCallback(async () => {
    if (!editingApt) return;
    try {
      await setTenantMut.mutateAsync({
        apartmentId: editingApt,
        tenant: {
          name: form.name,
          phone: form.phone,
          move_in_date: form.moveInDate,
          monthly_rent: Number(form.monthlyRent),
          payment_months: Number(form.paymentMonths),
        },
      });
      setDialogOpen(false);
      setEditingApt(null);
      setForm({ name: '', phone: '', moveInDate: '', monthlyRent: '', paymentMonths: '1' });
      toast.success('Tenant added');
    } catch (err: any) {
      toast.error(err.message);
    }
  }, [editingApt, form, setTenantMut]);

  const handleRemove = useCallback(async (aptId: string) => {
    if (!confirm(t('deleteConfirm'))) return;
    try {
      await removeTenantMut.mutateAsync(aptId);
      toast.success('Tenant removed');
    } catch (err: any) {
      toast.error(err.message);
    }
  }, [removeTenantMut, t]);

  const rentStatuses = useMemo(() => {
    const map: Record<string, ReturnType<typeof calculateRentStatus>> = {};
    apartments.forEach(apt => {
      if (apt.tenant) {
        map[apt.id] = calculateRentStatus(apt.tenant.move_in_date, apt.tenant.payment_months);
      }
    });
    return map;
  }, [apartments]);

  const getStatusColor = (status: 'good' | 'near_due' | 'overdue') => {
    if (status === 'overdue') return 'bg-destructive/10 text-destructive';
    if (status === 'near_due') return 'bg-warning/10 text-warning';
    return 'bg-success/10 text-success';
  };

  const getStatusDot = (status: 'good' | 'near_due' | 'overdue') => {
    if (status === 'overdue') return 'bg-destructive';
    if (status === 'near_due') return 'bg-warning';
    return 'bg-success';
  };

  if (isLoading) {
    return <div className="flex items-center justify-center py-12"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold">{t('apartments')}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {apartments.map(apt => {
          const unit = getUnitLabel(apt.floor, apt.position, lang);
          const rentStatus = rentStatuses[apt.id];
          return (
            <Card key={apt.id} className="overflow-hidden">
              <div className={`h-1.5 ${apt.tenant ? (rentStatus?.status === 'overdue' ? 'bg-destructive' : rentStatus?.status === 'near_due' ? 'bg-warning' : 'gold-gradient') : 'bg-muted'}`} />
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center justify-between">
                  <span>{unit}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${apt.tenant ? getStatusColor(rentStatus?.status || 'good') : 'bg-muted text-muted-foreground'}`}>
                    {apt.tenant ? (
                      rentStatus?.status === 'overdue' ? (lang === 'am' ? 'ያለፈ' : 'Overdue') :
                      rentStatus?.status === 'near_due' ? (lang === 'am' ? 'ቅርብ' : 'Near Due') :
                      t('tenant')
                    ) : t('noTenant')}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {apt.tenant ? (
                  <>
                    <div className="space-y-1.5 text-sm">
                      <div className="flex items-center gap-2"><UserPlus className="h-3.5 w-3.5 text-muted-foreground" /><span>{apt.tenant.name}</span></div>
                      <div className="flex items-center gap-2"><Phone className="h-3.5 w-3.5 text-muted-foreground" /><span>{apt.tenant.phone}</span></div>
                      <div className="flex items-center gap-2"><Calendar className="h-3.5 w-3.5 text-muted-foreground" /><span>{apt.tenant.move_in_date}</span></div>
                      <div className="flex items-center gap-2"><DollarSign className="h-3.5 w-3.5 text-muted-foreground" /><span>{Number(apt.tenant.monthly_rent).toLocaleString()} Br/mo × {apt.tenant.payment_months}mo</span></div>
                      {rentStatus && (
                        <div className="flex items-center gap-2">
                          <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                          <div className="flex items-center gap-1.5">
                            <span className={`w-2 h-2 rounded-full ${getStatusDot(rentStatus.status)}`} />
                            <span className={rentStatus.status === 'overdue' ? 'text-destructive font-medium' : rentStatus.status === 'near_due' ? 'text-warning font-medium' : ''}>
                              {rentStatus.daysLeft > 0
                                ? `${rentStatus.daysLeft} ${lang === 'am' ? 'ቀናት ቀርተዋል' : 'days left'}`
                                : `${Math.abs(rentStatus.daysLeft)} ${lang === 'am' ? 'ቀናት ያለፈ' : 'days overdue'}`}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                    <Button variant="outline" size="sm" className="w-full text-destructive border-destructive/30 hover:bg-destructive/5" onClick={() => handleRemove(apt.id)}>
                      <UserMinus className="h-3.5 w-3.5 mr-1.5" />{t('removeTenant')}
                    </Button>
                  </>
                ) : (
                  <Dialog open={dialogOpen && editingApt === apt.id} onOpenChange={(open) => {
                    setDialogOpen(open);
                    if (open) {
                      setEditingApt(apt.id);
                      setForm({ name: '', phone: '', moveInDate: '', monthlyRent: '', paymentMonths: '1' });
                    }
                  }}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="w-full">
                        <UserPlus className="h-3.5 w-3.5 mr-1.5" />{t('addTenant')}
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader><DialogTitle>{t('addTenant')} — {unit}</DialogTitle></DialogHeader>
                      <div className="space-y-3 pt-2">
                        <div className="space-y-1"><Label>{t('name')}</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
                        <div className="space-y-1"><Label>{t('phone')}</Label><Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} /></div>
                        <div className="space-y-1"><Label>{t('moveInDate')}</Label><Input type="date" value={form.moveInDate} onChange={e => setForm(f => ({ ...f, moveInDate: e.target.value }))} /></div>
                        <div className="space-y-1"><Label>{t('monthlyRent')}</Label><Input type="number" value={form.monthlyRent} onChange={e => setForm(f => ({ ...f, monthlyRent: e.target.value }))} /></div>
                        <div className="space-y-1">
                          <Label>{lang === 'am' ? 'የክፍያ ወራት (1-12)' : 'Payment Months (1-12)'}</Label>
                          <Select value={form.paymentMonths} onValueChange={v => setForm(f => ({ ...f, paymentMonths: v }))}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {Array.from({ length: 12 }, (_, i) => (
                                <SelectItem key={i + 1} value={String(i + 1)}>{i + 1} {lang === 'am' ? 'ወር' : 'month(s)'}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <Button onClick={handleSave} className="w-full gold-gradient text-primary-foreground" disabled={setTenantMut.isPending}>
                          {setTenantMut.isPending ? '...' : t('save')}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

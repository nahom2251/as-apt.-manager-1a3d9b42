import { useState } from 'react';
import { useI18n } from '@/lib/i18n';
import { useApartmentStore } from '@/lib/store';
import { getUnitLabel } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { UserPlus, UserMinus, Phone, Calendar, DollarSign } from 'lucide-react';

export default function ApartmentsPage() {
  const { t, lang } = useI18n();
  const { apartments, setTenant, removeTenant } = useApartmentStore();
  const [editingApt, setEditingApt] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', phone: '', moveInDate: '', monthlyRent: '' });

  const handleSave = () => {
    if (!editingApt) return;
    setTenant(editingApt, {
      name: form.name,
      phone: form.phone,
      moveInDate: form.moveInDate,
      monthlyRent: Number(form.monthlyRent),
    });
    setEditingApt(null);
    setForm({ name: '', phone: '', moveInDate: '', monthlyRent: '' });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold">{t('apartments')}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {apartments.map(apt => {
          const unit = getUnitLabel(apt.floor, apt.position, lang);
          return (
            <Card key={apt.id} className="overflow-hidden">
              <div className={`h-1.5 ${apt.tenant ? 'gold-gradient' : 'bg-muted'}`} />
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center justify-between">
                  <span>{unit}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${apt.tenant ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}>
                    {apt.tenant ? t('tenant') : t('noTenant')}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {apt.tenant ? (
                  <>
                    <div className="space-y-1.5 text-sm">
                      <div className="flex items-center gap-2">
                        <UserPlus className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>{apt.tenant.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>{apt.tenant.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>{apt.tenant.moveInDate}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>{apt.tenant.monthlyRent.toLocaleString()} Br/mo</span>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-destructive border-destructive/30 hover:bg-destructive/5"
                      onClick={() => removeTenant(apt.id)}
                    >
                      <UserMinus className="h-3.5 w-3.5 mr-1.5" />
                      {t('removeTenant')}
                    </Button>
                  </>
                ) : (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => {
                          setEditingApt(apt.id);
                          setForm({ name: '', phone: '', moveInDate: '', monthlyRent: '' });
                        }}
                      >
                        <UserPlus className="h-3.5 w-3.5 mr-1.5" />
                        {t('addTenant')}
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>{t('addTenant')} — {unit}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-3 pt-2">
                        <div className="space-y-1">
                          <Label>{t('name')}</Label>
                          <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                        </div>
                        <div className="space-y-1">
                          <Label>{t('phone')}</Label>
                          <Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
                        </div>
                        <div className="space-y-1">
                          <Label>{t('moveInDate')}</Label>
                          <Input type="date" value={form.moveInDate} onChange={e => setForm(f => ({ ...f, moveInDate: e.target.value }))} />
                        </div>
                        <div className="space-y-1">
                          <Label>{t('monthlyRent')}</Label>
                          <Input type="number" value={form.monthlyRent} onChange={e => setForm(f => ({ ...f, monthlyRent: e.target.value }))} />
                        </div>
                        <Button onClick={handleSave} className="w-full gold-gradient text-primary-foreground">{t('save')}</Button>
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

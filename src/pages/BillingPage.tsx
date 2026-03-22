import { useState, useMemo } from 'react';
import { useI18n } from '@/lib/i18n';
import { useApartmentStore } from '@/lib/store';
import { getUnitLabel, calculateElectricityBill, PAYMENT_CONFIG } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Download, Plus, Trash2, Check } from 'lucide-react';
import { generateInvoicePDF, generateReceiptPDF } from '@/lib/pdf';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function BillingPage() {
  const { t, lang } = useI18n();
  const { apartments, bills, addBill, markBillPaid, deleteBills } = useApartmentStore();
  const [filterMonth, setFilterMonth] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [selected, setSelected] = useState<string[]>([]);
  const [showNewBill, setShowNewBill] = useState(false);
  const [newBill, setNewBill] = useState({
    apartmentId: '', type: 'rent' as 'rent' | 'electricity' | 'water',
    month: new Date().getMonth() + 1, year: new Date().getFullYear(),
    amount: '', kwh: '', rate: '',
  });

  const tenantApts = apartments.filter(a => a.tenant);

  const filteredBills = useMemo(() => {
    return bills.filter(b => {
      if (filterMonth !== 'all' && b.month !== Number(filterMonth)) return false;
      if (filterType !== 'all' && b.type !== filterType) return false;
      return true;
    });
  }, [bills, filterMonth, filterType]);

  const handleCreateBill = () => {
    const apt = apartments.find(a => a.id === newBill.apartmentId);
    if (!apt?.tenant) return;
    let amount = Number(newBill.amount);
    if (newBill.type === 'electricity') {
      amount = calculateElectricityBill(Number(newBill.kwh), Number(newBill.rate));
    }
    addBill({
      tenantId: apt.tenant.id,
      tenantName: apt.tenant.name,
      apartmentId: apt.id,
      unitLabel: getUnitLabel(apt.floor, apt.position, lang),
      type: newBill.type,
      month: newBill.month,
      year: newBill.year,
      amount,
      status: 'pending',
      kwh: newBill.type === 'electricity' ? Number(newBill.kwh) : undefined,
      rate: newBill.type === 'electricity' ? Number(newBill.rate) : undefined,
    });
    setShowNewBill(false);
    setNewBill({ apartmentId: '', type: 'rent', month: new Date().getMonth() + 1, year: new Date().getFullYear(), amount: '', kwh: '', rate: '' });
  };

  const toggleSelect = (id: string) => {
    setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  };

  const handleDeleteSelected = () => {
    if (confirm(t('deleteConfirm'))) {
      deleteBills(selected);
      setSelected([]);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">{t('billing')}</h1>
        <div className="flex items-center gap-2">
          {selected.length > 0 && (
            <Button variant="outline" size="sm" className="text-destructive" onClick={handleDeleteSelected}>
              <Trash2 className="h-3.5 w-3.5 mr-1" />{t('delete')} ({selected.length})
            </Button>
          )}
          <Dialog open={showNewBill} onOpenChange={setShowNewBill}>
            <DialogTrigger asChild>
              <Button size="sm" className="gold-gradient text-primary-foreground">
                <Plus className="h-3.5 w-3.5 mr-1" />{t('generateBill')}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>{t('generateBill')}</DialogTitle></DialogHeader>
              <div className="space-y-3 pt-2">
                <div className="space-y-1">
                  <Label>{t('unit')}</Label>
                  <Select value={newBill.apartmentId} onValueChange={v => setNewBill(f => ({ ...f, apartmentId: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {tenantApts.map(a => (
                        <SelectItem key={a.id} value={a.id}>
                          {getUnitLabel(a.floor, a.position, lang)} — {a.tenant!.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label>Type</Label>
                  <Select value={newBill.type} onValueChange={(v: any) => setNewBill(f => ({ ...f, type: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rent">{t('rent')}</SelectItem>
                      <SelectItem value="electricity">{t('electricity')}</SelectItem>
                      <SelectItem value="water">{t('water')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label>{t('month')}</Label>
                    <Select value={String(newBill.month)} onValueChange={v => setNewBill(f => ({ ...f, month: Number(v) }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {MONTHS.map((m, i) => <SelectItem key={i} value={String(i + 1)}>{m}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label>{t('year')}</Label>
                    <Input type="number" value={newBill.year} onChange={e => setNewBill(f => ({ ...f, year: Number(e.target.value) }))} />
                  </div>
                </div>
                {newBill.type === 'electricity' ? (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label>{t('kwh')}</Label>
                      <Input type="number" value={newBill.kwh} onChange={e => setNewBill(f => ({ ...f, kwh: e.target.value }))} />
                    </div>
                    <div className="space-y-1">
                      <Label>{t('rate')}</Label>
                      <Input type="number" step="0.01" value={newBill.rate} onChange={e => setNewBill(f => ({ ...f, rate: e.target.value }))} />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <Label>{t('amount')} (Birr)</Label>
                    <Input type="number" value={newBill.amount} onChange={e => setNewBill(f => ({ ...f, amount: e.target.value }))} />
                  </div>
                )}
                <Button onClick={handleCreateBill} className="w-full gold-gradient text-primary-foreground">{t('generateBill')}</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Select value={filterMonth} onValueChange={setFilterMonth}>
          <SelectTrigger className="w-32"><SelectValue placeholder={t('month')} /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('all')}</SelectItem>
            {MONTHS.map((m, i) => <SelectItem key={i} value={String(i + 1)}>{m}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('all')}</SelectItem>
            <SelectItem value="rent">{t('rent')}</SelectItem>
            <SelectItem value="electricity">{t('electricity')}</SelectItem>
            <SelectItem value="water">{t('water')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Bills list */}
      <div className="space-y-3">
        {filteredBills.length === 0 ? (
          <Card><CardContent className="p-8 text-center text-muted-foreground">No bills found.</CardContent></Card>
        ) : (
          filteredBills.map(bill => (
            <Card key={bill.id}>
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex items-center gap-3 flex-1">
                    <Checkbox
                      checked={selected.includes(bill.id)}
                      onCheckedChange={() => toggleSelect(bill.id)}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-sm">{bill.tenantName}</span>
                        <span className="text-xs text-muted-foreground">{bill.unitLabel}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          bill.type === 'rent' ? 'bg-primary/10 text-primary' :
                          bill.type === 'electricity' ? 'bg-warning/10 text-warning' : 'bg-info/10 text-info'
                        }`}>
                          {t(bill.type)}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {MONTHS[bill.month - 1]} {bill.year} • {bill.amount.toLocaleString()} Birr
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                      bill.status === 'paid' ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'
                    }`}>
                      {bill.status === 'paid' ? t('paid') : t('pending')}
                    </span>
                    {bill.status === 'pending' && (
                      <Button variant="ghost" size="sm" onClick={() => markBillPaid(bill.id)} className="text-success">
                        <Check className="h-3.5 w-3.5 mr-1" />{t('markAsPaid')}
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (bill.status === 'paid') {
                          generateReceiptPDF(bill);
                        } else {
                          generateInvoicePDF(bill);
                        }
                      }}
                    >
                      <Download className="h-3.5 w-3.5 mr-1" />
                      {bill.status === 'paid' ? t('downloadReceipt') : t('downloadInvoice')}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

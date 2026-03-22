import { useState, useMemo } from 'react';
import { useI18n } from '@/lib/i18n';
import { useApartmentStore } from '@/lib/store';
import { getUnitLabel, calculateElectricityBill } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
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
    apartmentId: '',
    type: 'rent' as 'rent' | 'electricity' | 'water',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    amount: '',        
    kwh: '',           
    rate: '',          
    monthsCount: 1,    
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
    let startDate: Date | undefined;
    let endDate: Date | undefined;

    if (newBill.type === 'rent') {
      const lastRentBill = bills
        .filter(b => b.apartmentId === apt.id && b.type === 'rent' && b.endDate)
        .sort((a, b) => new Date(b.endDate!).getTime() - new Date(a.endDate!).getTime())[0];

      startDate = lastRentBill ? new Date(lastRentBill.endDate!) : new Date(apt.tenant.moveInDate);
      endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + (newBill.monthsCount || 1));

      amount = apt.tenant.monthlyRent * (newBill.monthsCount || 1);
    }

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
      monthsCount: newBill.type === 'rent' ? newBill.monthsCount : undefined,
      startDate: newBill.type === 'rent' ? startDate?.toISOString() : undefined,
      endDate: newBill.type === 'rent' ? endDate?.toISOString() : undefined,
    });

    setShowNewBill(false);
    setNewBill({
      apartmentId: '',
      type: 'rent',
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
      amount: '',
      kwh: '',
      rate: '',
      monthsCount: 1,
    });
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

      {/* Header */}
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
              <DialogHeader>
                <DialogTitle>{t('generateBill')}</DialogTitle>
              </DialogHeader>

              <div className="space-y-3 pt-2">

                {/* Apartment */}
                <div className="space-y-1">
                  <Label>{t('unit')}</Label>
                  <Select value={newBill.apartmentId} onValueChange={v => setNewBill(f => ({ ...f, apartmentId: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {tenantApts.map(a => (
                        <SelectItem key={a.id} value={a.id}>
                          {getUnitLabel(a.floor, a.position, lang)} — {a.tenant!.name} (Move-in: {new Date(a.tenant!.moveInDate).toLocaleDateString()})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Type */}
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

                {/* Month & Year */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label>{t('month')}</Label>
                    <Select value={String(newBill.month)} onValueChange={v => setNewBill(f => ({ ...f, month: Number(v) }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {MONTHS.map((m, i) => (
                          <SelectItem key={i} value={String(i + 1)}>{m}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <Label>{t('year')}</Label>
                    <Input
                      type="number"
                      value={newBill.year}
                      onChange={e => setNewBill(f => ({ ...f, year: Number(e.target.value) }))}
                    />
                  </div>
                </div>

                {/* Dynamic Inputs */}
                {newBill.type === 'electricity' ? (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label>{t('kwh')}</Label>
                      <Input type="number" value={newBill.kwh} onChange={e => setNewBill(f => ({ ...f, kwh: e.target.value }))} />
                    </div>
                    <div className="space-y-1">
                      <Label>{t('rate')}</Label>
                      <Input type="number" value={newBill.rate} onChange={e => setNewBill(f => ({ ...f, rate: e.target.value }))} />
                    </div>
                  </div>
                ) : newBill.type === 'rent' ? (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label>Monthly Rent (Birr)</Label>
                      <Input type="number" value={newBill.amount} onChange={e => setNewBill(f => ({ ...f, amount: e.target.value }))} />
                    </div>
                    <div className="space-y-1">
                      <Label>Number of Months</Label>
                      <Input type="number" min={1} value={newBill.monthsCount} onChange={e => setNewBill(f => ({ ...f, monthsCount: Number(e.target.value) }))} />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <Label>Amount (Birr)</Label>
                    <Input type="number" value={newBill.amount} onChange={e => setNewBill(f => ({ ...f, amount: e.target.value }))} />
                  </div>
                )}

                <Button onClick={handleCreateBill} className="w-full gold-gradient text-primary-foreground">
                  {t('generateBill')}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <Select value={filterMonth} onValueChange={setFilterMonth}>
          <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('all')}</SelectItem>
            {MONTHS.map((m, i) => (
              <SelectItem key={i} value={String(i + 1)}>{m}</SelectItem>
            ))}
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

      {/* Bills */}
      <div className="space-y-3">
        {filteredBills.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              No bills found.
            </CardContent>
          </Card>
        ) : (
          filteredBills.map(bill => (
            <Card key={bill.id}>
              <CardContent className="p-4 flex justify-between items-center">

                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={selected.includes(bill.id)}
                    onCheckedChange={() => toggleSelect(bill.id)}
                  />

                  <div>
                    <div className="text-sm font-medium">
                      {bill.tenantName} — {bill.unitLabel}
                    </div>

                    <p className="text-xs text-muted-foreground mt-0.5">
                      {bill.type === 'rent' && bill.startDate && bill.endDate
                        ? `${new Date(bill.startDate).toLocaleDateString()} → ${new Date(bill.endDate).toLocaleDateString()}`
                        : `${MONTHS[bill.month - 1]} ${bill.year}`
                      }
                      {' • '}
                      {bill.amount.toLocaleString()} Birr
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {bill.status === 'pending' && (
                    <Button size="sm" onClick={() => markBillPaid(bill.id)}>
                      <Check className="h-3.5 w-3.5 mr-1" />
                      {t('markAsPaid')}
                    </Button>
                  )}

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      bill.status === 'paid'
                        ? generateReceiptPDF(bill)
                        : generateInvoicePDF(bill)
                    }
                  >
                    <Download className="h-3.5 w-3.5 mr-1" />
                    {bill.status === 'paid' ? t('downloadReceipt') : t('downloadInvoice')}
                  </Button>
                </div>

              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
export interface Apartment {
  id: string;
  floor: number;
  position: 'front' | 'back' | 'single';
  tenant: Tenant | null;
}

export interface Tenant {
  id: string;
  name: string;
  phone: string;
  moveInDate: string;
  monthlyRent: number;
  paymentMonths: number; // how many months paid upfront (1-12)
  apartmentId: string;
}

export interface Bill {
  id: string;
  tenantId: string;
  tenantName: string;
  apartmentId: string;
  unitLabel: string;
  type: 'rent' | 'electricity' | 'water';
  month: number;
  year: number;
  amount: number;
  status: 'pending' | 'paid';
  createdAt: string;
  paidAt?: string;
  kwh?: number;
  rate?: number;

  // ✅ NEW FIELD
  monthsCount?: number;
}

export interface AppUser {
  id: string;
  email: string;
  name: string;
  role: 'super_admin' | 'admin';
  status: 'pending' | 'approved' | 'rejected';
}

export interface Notification {
  id: string;
  type: 'overdue' | 'near_due' | 'pending_bill' | 'user_approval';
  message: string;
  read: boolean;
  createdAt: string;
  tenantId?: string;
}

export const APARTMENTS_CONFIG: { floor: number; position: 'front' | 'back' | 'single' }[] = [
  { floor: 2, position: 'front' },
  { floor: 2, position: 'back' },
  { floor: 3, position: 'front' },
  { floor: 3, position: 'back' },
  { floor: 4, position: 'front' },
  { floor: 4, position: 'back' },
  { floor: 5, position: 'single' },
];

export function getUnitLabel(floor: number, position: string, lang: 'en' | 'am' = 'en'): string {
  const posLabel = lang === 'am'
    ? (position === 'front' ? 'ፊት' : position === 'back' ? 'ኋላ' : 'ነጠላ')
    : (position === 'front' ? 'Front' : position === 'back' ? 'Back' : 'Single');
  return `${floor}${lang === 'am' ? 'ኛ ፎቅ' : 'F'} - ${posLabel}`;
}

export const PAYMENT_CONFIG = {
  rent: {
    method: 'CBE Bank Transfer',
    accountName: 'Bayush Kassa',
    accountNumber: '1000499143072',
  },
  utilities: {
    method: 'Telebirr',
    accountName: 'Alehegne',
    accountNumber: '0911238816',
  },
};

export function calculateElectricityBill(kwh: number, rate: number) {
  const base = kwh * rate;
  const serviceFee = 16;
  const tax = base * 0.15;
  const tvTax = 10;
  const controlTax = base * 0.005;
  return base + serviceFee + tax + tvTax + controlTax;
}

export function calculateRentStatus(moveInDate: string, paymentMonths: number) {
  const moveIn = new Date(moveInDate);
  const now = new Date();
  const paidUntil = new Date(moveIn);
  paidUntil.setMonth(paidUntil.getMonth() + paymentMonths);

  const diffMs = paidUntil.getTime() - now.getTime();
  const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  let status: 'good' | 'near_due' | 'overdue' = 'good';
  if (daysLeft <= 0) status = 'overdue';
  else if (daysLeft <= 5) status = 'near_due';

  return { daysLeft, status, paidUntil };
}
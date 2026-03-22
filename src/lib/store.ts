import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Apartment, Bill, Tenant, APARTMENTS_CONFIG } from './types';

interface ApartmentStore {
  apartments: Apartment[];
  bills: Bill[];
  setTenant: (apartmentId: string, tenant: Omit<Tenant, 'id' | 'apartmentId'> | null) => void;
  addBill: (bill: Omit<Bill, 'id' | 'createdAt'>) => void;
  markBillPaid: (billId: string) => void;
  deleteBills: (ids: string[]) => void;
  removeTenant: (apartmentId: string) => void;
  updateTenantPaymentMonths: (apartmentId: string, paymentMonths: number) => void;
}

const initialApartments: Apartment[] = APARTMENTS_CONFIG.map((cfg, i) => ({
  id: `apt-${i}`,
  floor: cfg.floor,
  position: cfg.position,
  tenant: null,
}));

export const useApartmentStore = create<ApartmentStore>()(
  persist(
    (set) => ({
      apartments: initialApartments,
      bills: [],
      setTenant: (apartmentId, tenantData) =>
        set(state => ({
          apartments: state.apartments.map(a =>
            a.id === apartmentId
              ? {
                  ...a,
                  tenant: tenantData
                    ? { ...tenantData, id: `tenant-${Date.now()}`, apartmentId }
                    : null,
                }
              : a
          ),
        })),
      addBill: (bill) =>
        set(state => ({
          bills: [...state.bills, { ...bill, id: `bill-${Date.now()}-${Math.random().toString(36).slice(2)}`, createdAt: new Date().toISOString() }],
        })),
      markBillPaid: (billId) =>
        set(state => ({
          bills: state.bills.map(b =>
            b.id === billId ? { ...b, status: 'paid', paidAt: new Date().toISOString() } : b
          ),
        })),
      deleteBills: (ids) =>
        set(state => ({
          bills: state.bills.filter(b => !ids.includes(b.id)),
        })),
      removeTenant: (apartmentId) =>
        set(state => ({
          apartments: state.apartments.map(a =>
            a.id === apartmentId ? { ...a, tenant: null } : a
          ),
        })),
      updateTenantPaymentMonths: (apartmentId, paymentMonths) =>
        set(state => ({
          apartments: state.apartments.map(a =>
            a.id === apartmentId && a.tenant
              ? { ...a, tenant: { ...a.tenant, paymentMonths } }
              : a
          ),
        })),
    }),
    { name: 'as-apt-store' }
  )
);

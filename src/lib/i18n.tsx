import React, { createContext, useContext, useState, useCallback } from 'react';

type Lang = 'en' | 'am';

const translations = {
  en: {
    appName: 'Alehegne Sewnet Apartment',
    appShort: 'AS Apt.',
    dashboard: 'Dashboard',
    apartments: 'Apartments',
    billing: 'Billing',
    revenue: 'Revenue',
    settings: 'Settings',
    users: 'User Management',
    login: 'Login',
    register: 'Register',
    email: 'Email',
    password: 'Password',
    rememberMe: 'Remember Me',
    forgotPassword: 'Forgot Password?',
    signIn: 'Sign In',
    signUp: 'Sign Up',
    name: 'Full Name',
    noAccount: "Don't have an account?",
    hasAccount: 'Already have an account?',
    pendingApproval: 'Your account is pending approval.',
    tenant: 'Tenant',
    phone: 'Phone',
    moveInDate: 'Move-in Date',
    monthlyRent: 'Monthly Rent (Birr)',
    floor: 'Floor',
    position: 'Position',
    front: 'Front',
    back: 'Back',
    single: 'Single',
    daysLeft: 'Days Left',
    daysOverdue: 'Days Overdue',
    overdue: 'Overdue',
    nearDue: 'Near Due',
    paid: 'PAID',
    pending: 'PENDING',
    rent: 'Rent',
    electricity: 'Electricity',
    water: 'Water',
    total: 'Total',
    month: 'Month',
    year: 'Year',
    amount: 'Amount',
    kwh: 'kWh',
    rate: 'Rate',
    status: 'Status',
    actions: 'Actions',
    downloadInvoice: 'Download Invoice',
    downloadReceipt: 'Download Receipt',
    markAsPaid: 'Mark as Paid',
    generateBill: 'Generate Bill',
    totalRevenue: 'Total Revenue',
    collected: 'Collected',
    pendingAmount: 'Pending',
    downloadReport: 'Download Revenue Report',
    approve: 'Approve',
    reject: 'Reject',
    approved: 'Approved',
    rejected: 'Rejected',
    clearData: 'Clear Data',
    delete: 'Delete',
    confirm: 'Confirm',
    cancel: 'Cancel',
    deleteConfirm: 'Are you sure you want to delete?',
    notifications: 'Notifications',
    poweredBy: 'Powered by NUN Tech',
    save: 'Save',
    edit: 'Edit',
    noTenant: 'Vacant',
    addTenant: 'Add Tenant',
    removeTenant: 'Remove Tenant',
    resetPassword: 'Reset Password',
    newPassword: 'New Password',
    sendResetLink: 'Send Reset Link',
    unit: 'Unit',
    filter: 'Filter',
    all: 'All',
    overview: 'Overview',
    occupancy: 'Occupancy',
    paymentMethod: 'Payment Method',
    accountName: 'Account Name',
    accountNumber: 'Account Number',
    paymentInstructions: 'Payment Instructions',
    cbeTransfer: 'CBE Bank Transfer',
    telebirr: 'Telebirr',
    selectMonth: 'Select Month',
  },
  am: {
    appName: 'አለኸኝ ሰውነት አፓርትመንት',
    appShort: 'AS Apt.',
    dashboard: 'ዳሽቦርድ',
    apartments: 'አፓርትመንቶች',
    billing: 'ክፍያ',
    revenue: 'ገቢ',
    settings: 'ቅንብሮች',
    users: 'ተጠቃሚ አስተዳደር',
    login: 'ግባ',
    register: 'ይመዝገቡ',
    email: 'ኢሜይል',
    password: 'የይለፍ ቃል',
    rememberMe: 'አስታውስ',
    forgotPassword: 'የይለፍ ቃል ረሳህ?',
    signIn: 'ግባ',
    signUp: 'ተመዝገብ',
    name: 'ሙሉ ስም',
    noAccount: 'መለያ የለህም?',
    hasAccount: 'መለያ አለህ?',
    pendingApproval: 'መለያህ እየተጠበቀ ነው።',
    tenant: 'ተከራይ',
    phone: 'ስልክ',
    moveInDate: 'የገባበት ቀን',
    monthlyRent: 'ወርሃዊ ኪራይ (ብር)',
    floor: 'ፎቅ',
    position: 'ቦታ',
    front: 'ፊት',
    back: 'ኋላ',
    single: 'ነጠላ',
    daysLeft: 'ቀናት ቀርተዋል',
    daysOverdue: 'ቀናት አልፈዋል',
    overdue: 'ያለፈ',
    nearDue: 'ቅርብ',
    paid: 'ተከፍሏል',
    pending: 'በመጠበቅ',
    rent: 'ኪራይ',
    electricity: 'ኤሌክትሪክ',
    water: 'ውሃ',
    total: 'ጠቅላላ',
    month: 'ወር',
    year: 'ዓመት',
    amount: 'መጠን',
    kwh: 'ኪሎዋት',
    rate: 'ተመን',
    status: 'ሁኔታ',
    actions: 'ተግባራት',
    downloadInvoice: 'ደረሰኝ አውርድ',
    downloadReceipt: 'ደረሰኝ አውርድ',
    markAsPaid: 'ተከፍሏል ምልክት',
    generateBill: 'ሂሳብ ፍጠር',
    totalRevenue: 'ጠቅላላ ገቢ',
    collected: 'የተሰበሰበ',
    pendingAmount: 'በመጠበቅ',
    downloadReport: 'የገቢ ሪፖርት አውርድ',
    approve: 'ፍቀድ',
    reject: 'ከልክል',
    approved: 'ፀድቋል',
    rejected: 'ተከልክሏል',
    clearData: 'ዳታ አጽዳ',
    delete: 'ሰርዝ',
    confirm: 'አረጋግጥ',
    cancel: 'ሰርዝ',
    deleteConfirm: 'እርግጠኛ ነህ ልትሰርዝ?',
    notifications: 'ማሳወቂያዎች',
    poweredBy: 'Powered by NUN Tech',
    save: 'አስቀምጥ',
    edit: 'አስተካክል',
    noTenant: 'ባዶ',
    addTenant: 'ተከራይ ጨምር',
    removeTenant: 'ተከራይ አስወግድ',
    resetPassword: 'የይለፍ ቃል ቀይር',
    newPassword: 'አዲስ የይለፍ ቃል',
    sendResetLink: 'ማገናኛ ላክ',
    unit: 'ክፍል',
    filter: 'አጣራ',
    all: 'ሁሉም',
    overview: 'አጠቃላይ',
    occupancy: 'ይዞታ',
    paymentMethod: 'የክፍያ ዘዴ',
    accountName: 'የመለያ ስም',
    accountNumber: 'የመለያ ቁጥር',
    paymentInstructions: 'የክፍያ መመሪያ',
    cbeTransfer: 'CBE ባንክ ማስተላለፍ',
    telebirr: 'ቴሌብር',
    selectMonth: 'ወር ምረጥ',
  },
} as const;

type TranslationKey = keyof typeof translations.en;

interface I18nContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: TranslationKey) => string;
}

const I18nContext = createContext<I18nContextType | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    return (localStorage.getItem('as-apt-lang') as Lang) || 'en';
  });

  const setLang = useCallback((newLang: Lang) => {
    setLangState(newLang);
    localStorage.setItem('as-apt-lang', newLang);
    document.body.setAttribute('data-lang', newLang);
  }, []);

  const t = useCallback((key: TranslationKey): string => {
    return translations[lang][key] || key;
  }, [lang]);

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}

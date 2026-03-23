import { useState, useEffect, useMemo } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useI18n } from '@/lib/i18n';
import { useAuth } from '@/lib/auth';
import { useApartments } from '@/hooks/use-apartments';
import { calculateRentStatus, getUnitLabel } from '@/lib/types';
import { LanguageToggle } from '@/components/LanguageToggle';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard, Building2, Receipt, TrendingUp, Users, Bell, LogOut, Menu, X,
} from 'lucide-react';

const navItems = [
  { key: 'dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { key: 'apartments', icon: Building2, path: '/dashboard/apartments' },
  { key: 'billing', icon: Receipt, path: '/dashboard/billing' },
  { key: 'revenue', icon: TrendingUp, path: '/dashboard/revenue' },
  { key: 'users', icon: Users, path: '/dashboard/users' },
] as const;

export default function DashboardLayout() {
  const { t, lang } = useI18n();
  const { profile, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const { data: apartments = [] } = useApartments();

  useEffect(() => {
    if (!loading && (!profile || profile.status !== 'approved')) {
      navigate('/login');
    }
  }, [profile, loading, navigate]);

  const notifications = useMemo(() => {
    const notifs: { id: string; message: string }[] = [];
    apartments.forEach(apt => {
      if (!apt.tenant) return;
      const rs = calculateRentStatus(apt.tenant.move_in_date, apt.tenant.payment_months);
      const unit = getUnitLabel(apt.floor, apt.position, lang);
      if (rs.status === 'overdue') {
        notifs.push({ id: `overdue-${apt.id}`, message: `🔴 ${unit} (${apt.tenant.name}): ${Math.abs(rs.daysLeft)} ${lang === 'am' ? 'ቀናት ያለፈ' : 'days overdue'}` });
      } else if (rs.status === 'near_due') {
        notifs.push({ id: `near-${apt.id}`, message: `🟡 ${unit} (${apt.tenant.name}): ${rs.daysLeft} ${lang === 'am' ? 'ቀናት ቀርተዋል' : 'days left'}` });
      }
    });
    return notifs;
  }, [apartments, lang]);

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const isActive = (path: string) =>
    path === '/dashboard' ? location.pathname === '/dashboard' : location.pathname.startsWith(path);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-40 h-14 border-b bg-background/95 backdrop-blur flex items-center px-4 gap-3">
        <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg gold-gradient flex items-center justify-center">
            <span className="text-xs font-bold text-primary-foreground">AS</span>
          </div>
          <span className="font-semibold text-sm hidden sm:inline">{t('appShort')}</span>
        </div>
        <div className="flex-1" />
        <LanguageToggle />
        <div className="relative">
          <Button variant="ghost" size="icon" onClick={() => setShowNotifications(!showNotifications)}>
            <Bell className="h-4 w-4" />
            {notifications.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-destructive text-destructive-foreground text-[10px] flex items-center justify-center">
                {notifications.length}
              </span>
            )}
          </Button>
          {showNotifications && (
            <div className="absolute right-0 top-10 w-72 bg-card border rounded-lg shadow-lg z-50 p-3 space-y-2">
              <h4 className="font-semibold text-sm">{t('notifications')}</h4>
              {notifications.length === 0 ? (
                <p className="text-sm text-muted-foreground">No notifications</p>
              ) : (
                notifications.map(n => (
                  <div key={n.id} className="text-sm p-2 rounded bg-accent/50">{n.message}</div>
                ))
              )}
            </div>
          )}
        </div>
        <Button variant="ghost" size="icon" onClick={handleLogout}><LogOut className="h-4 w-4" /></Button>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {sidebarOpen && <div className="fixed inset-0 z-30 bg-foreground/20 lg:hidden" onClick={() => setSidebarOpen(false)} />}
        <aside className={`fixed lg:static z-30 top-14 bottom-0 left-0 w-60 bg-sidebar border-r transition-transform duration-200 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
          <nav className="p-3 space-y-1">
            {navItems.map(item => (
              <button
                key={item.key}
                onClick={() => { navigate(item.path); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive(item.path) ? 'gold-gradient text-primary-foreground' : 'text-sidebar-foreground hover:bg-sidebar-accent'
                }`}
              >
                <item.icon className="h-4 w-4" />
                {t(item.key as any)}
              </button>
            ))}
          </nav>
        </aside>
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8"><Outlet /></main>
      </div>
      <Footer />
    </div>
  );
}
import { useI18n } from '@/lib/i18n';

export function Footer() {
  const { t } = useI18n();
  return (
    <footer className="w-full py-3 text-center text-sm text-muted-foreground border-t bg-background">
      {t('poweredBy')}
    </footer>
  );
}

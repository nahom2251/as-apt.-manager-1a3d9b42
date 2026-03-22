import { useState, useEffect } from 'react';

export function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onComplete, 500);
    }, 2500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center gold-gradient transition-opacity duration-500 ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div className="animate-splash text-center">
        <div className="mb-4">
          <div className="w-20 h-20 mx-auto rounded-2xl bg-primary-foreground/20 backdrop-blur flex items-center justify-center">
            <span className="text-3xl font-bold text-primary-foreground">AS</span>
          </div>
        </div>
        <h1 className="text-2xl md:text-4xl font-bold text-primary-foreground mb-2">
          Alehegne Sewnet Apartment
        </h1>
        <p className="text-lg md:text-xl text-primary-foreground/80 font-medium">
          AS Apt.
        </p>
        <div className="mt-8">
          <div className="w-8 h-8 mx-auto border-3 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
        </div>
      </div>
    </div>
  );
}

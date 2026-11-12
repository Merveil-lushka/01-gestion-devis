import { useEffect, useState } from 'react';

export default function PwaInstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const checkInstalled = () => {
      const standalone = window.matchMedia('(display-mode: standalone)').matches;
      const iosStandalone = 'standalone' in window.navigator && window.navigator.standalone;
      setIsInstalled(Boolean(standalone || iosStandalone));
    };

    checkInstalled();

    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault();
      setDeferredPrompt(event);
    };

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setIsInstalled(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  if (isInstalled || !deferredPrompt) return null;

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
  };

  return (
    <button
      type="button"
      onClick={handleInstall}
      style={{
        position: 'fixed',
        left: '50%',
        bottom: 'calc(5.5rem + env(safe-area-inset-bottom))',
        transform: 'translateX(-50%)',
        zIndex: 100000,
        border: 'none',
        borderRadius: '999px',
        background: '#111827',
        color: '#fff',
        fontWeight: 700,
        fontSize: '0.82rem',
        padding: '0.8rem 1.2rem',
        boxShadow: '0 14px 32px rgba(17, 24, 39, 0.25)',
        cursor: 'pointer',
      }}
    >
      Installer l&apos;app
    </button>
  );
}

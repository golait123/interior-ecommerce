import React, { useState, useEffect } from 'react';
import { Download, X, Share, PlusSquare, Smartphone, QrCode, ExternalLink, Check } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [networkUrl, setNetworkUrl] = useState(() => typeof window !== 'undefined' ? window.location.origin : '');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setNetworkUrl(window.location.origin);
    }
    // 1. Check if already running in standalone PWA mode
    const isStandalone = 
      window.matchMedia('(display-mode: standalone)').matches || 
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;

    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    // 2. Check if user dismissed prompt recently
    const dismissedAt = localStorage.getItem('interiorg_pwa_dismissed');

    // 3. Detect iOS Safari
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    const isSafari = /safari/.test(userAgent) && !/chrome|crios|fxios/.test(userAgent);

    if (isIosDevice && isSafari && !isStandalone) {
      setIsIos(true);
      if (!dismissedAt) {
        const timer = setTimeout(() => setShowBanner(true), 3500);
        return () => clearTimeout(timer);
      }
    }

    // 4. Android & Desktop Chrome/Edge beforeinstallprompt listener
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      if (!dismissedAt) {
        setTimeout(() => setShowBanner(true), 3000);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // 5. Manual trigger listener from Header / Footer "Get App" buttons
    const handleManualRequest = () => {
      setShowQrModal(true);
    };
    window.addEventListener('pwa-install-request', handleManualRequest);

    // 6. Detect successful install
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setShowBanner(false);
      setShowQrModal(false);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('pwa-install-request', handleManualRequest);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setShowBanner(false);
        setShowQrModal(false);
        setDeferredPrompt(null);
      }
    } else {
      setShowQrModal(true);
    }
  };

  const handleDismissBanner = () => {
    setShowBanner(false);
    localStorage.setItem('interiorg_pwa_dismissed', Date.now().toString());
  };

  return (
    <>
      {/* 1. Floating Bottom Quick-Prompt Banner */}
      {showBanner && !isInstalled && !showQrModal && (
        <aside aria-label="Install InteriorG App" className="pwa-install-banner">
          <div className="pwa-install-container">
            
            {/* App Icon */}
            <div className="pwa-app-icon">
              <img 
                src="/icons/icon-192.png" 
                alt="InteriorG App" 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>

            {/* Content */}
            <div className="pwa-text-content">
              <div className="pwa-title-row">
                <span className="pwa-title">InteriorG App</span>
                <span className="pwa-badge">Android • iOS • Web</span>
              </div>

              {isIos ? (
                <p className="pwa-desc">
                  Install on iOS: Tap <Share size={12} className="inline mx-0.5 text-[var(--navy)]" /> then select <strong>'Add to Home Screen'</strong> <PlusSquare size={12} className="inline mx-0.5 text-[var(--navy)]" />.
                </p>
              ) : (
                <p className="pwa-desc">
                  Instant offline catalog & 1-tap checkout on your phone.
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="pwa-actions">
              <button
                type="button"
                onClick={() => setShowQrModal(true)}
                className="pwa-qr-btn"
                title="View QR Code for Mobile"
              >
                <QrCode size={14} />
              </button>

              {!isIos && deferredPrompt && (
                <button
                  type="button"
                  onClick={handleInstallClick}
                  className="pwa-install-btn"
                >
                  <Download size={13} />
                  <span>Install</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleDismissBanner}
                className="pwa-dismiss-btn"
                aria-label="Dismiss banner"
              >
                <X size={15} />
              </button>
            </div>

          </div>
        </aside>
      )}

      {/* 2. Interactive QR Code Install Modal (Accessible on Any Device) */}
      {showQrModal && (
        <div className="pwa-modal-backdrop" onClick={() => setShowQrModal(false)}>
          <div className="pwa-modal-card" onClick={(e) => e.stopPropagation()}>
            
            {/* Close Button */}
            <button 
              type="button" 
              onClick={() => setShowQrModal(false)}
              className="pwa-modal-close"
              aria-label="Close modal"
            >
              <X size={18} />
            </button>

            {/* Header */}
            <div className="pwa-modal-header">
              <div className="pwa-modal-icon">
                <img 
                  src="/icons/icon-192.png" 
                  alt="InteriorG Emblem" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              <h3 className="pwa-modal-title">
                Install InteriorG App
              </h3>
              <p className="pwa-modal-subtitle">
                Scan with your phone camera to install directly on Android or iOS.
              </p>
            </div>

            {/* Scannable QR Code */}
            <div className="pwa-qr-wrapper">
              <img 
                src="/qrcode-install.png" 
                alt="Scan to Install InteriorG on Android & iOS" 
                className="pwa-qr-image"
              />
              <div className="pwa-qr-caption">
                <code>{networkUrl}</code>
              </div>
            </div>

            {/* Step-by-step Tabs for Android & iOS */}
            <div className="pwa-steps-grid">
              {/* Android Instructions */}
              <div className="pwa-step-box">
                <div className="pwa-step-head">
                  <Smartphone size={15} className="text-[#3c6e47]" />
                  <span>Android Devices</span>
                </div>
                <ol className="pwa-step-list">
                  <li>Scan QR code using <strong>Google Lens</strong> or your Camera.</li>
                  <li>Open the link in <strong>Chrome</strong> or Samsung Internet.</li>
                  <li>Tap <strong>'Install App'</strong> or Menu (⋮) &rarr; <em>'Add to Home screen'</em>.</li>
                </ol>
              </div>

              {/* iOS Instructions */}
              <div className="pwa-step-box">
                <div className="pwa-step-head">
                  <Share size={15} className="text-[var(--navy)]" />
                  <span>Apple iOS (iPhone / iPad)</span>
                </div>
                <ol className="pwa-step-list">
                  <li>Scan QR code with your iPhone Camera & open in <strong>Safari</strong>.</li>
                  <li>Tap the <strong>Share icon</strong> (<Share size={11} className="inline" />) at the bottom.</li>
                  <li>Scroll down and tap <strong>'Add to Home Screen'</strong> (<PlusSquare size={11} className="inline" />).</li>
                </ol>
              </div>
            </div>

            {/* Desktop Direct Install Button (if browser supports beforeinstallprompt) */}
            {deferredPrompt && (
              <div className="pwa-modal-footer">
                <button
                  type="button"
                  onClick={handleInstallClick}
                  className="pwa-modal-install-btn"
                >
                  <Download size={15} />
                  <span>Install on this Computer / Web</span>
                </button>
              </div>
            )}

          </div>
        </div>
      )}
    </>
  );
}

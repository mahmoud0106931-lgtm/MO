import React, { useEffect, useState } from 'react';
import { WifiOff, CheckCircle2 } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [showReconnected, setShowReconnected] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowReconnected(true);
      const timer = setTimeout(() => setShowReconnected(false), 3000);
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowReconnected(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline && !showReconnected) return null;

  if (showReconnected) {
    return (
      <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-600/90 text-white text-xs font-semibold backdrop-blur-md shadow-lg border border-emerald-400/30 animate-fade-in font-['Cairo',sans-serif]">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-200" />
        <span>تمت استعادة الاتصال بالإنترنت</span>
      </div>
    );
  }

  return (
    <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-600/90 text-white text-xs font-semibold backdrop-blur-md shadow-lg border border-orange-400/30 animate-fade-in font-['Cairo',sans-serif]">
      <WifiOff className="w-3.5 h-3.5 text-orange-200 animate-pulse" />
      <span>وضع عدم الاتصال بالإنترنت · التطبيق وملفاتك تعمل بالكامل بدون نت</span>
    </div>
  );
};

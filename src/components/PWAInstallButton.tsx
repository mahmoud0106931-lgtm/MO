import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Share, X, CheckCircle2, WifiOff } from 'lucide-react';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already installed and running standalone, do not show button
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        onClick={install}
        title="تثبيت MO ميوزك للعمل بدون إنترنت على جهازك"
        className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-bold shadow-md shadow-orange-500/20 active:scale-95 transition-all"
      >
        <Download className="w-3.5 h-3.5" />
        <span>تثبيت بدون نت</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          title="تثبيت على الآيفون للعمل بدون إنترنت"
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 text-orange-300 text-xs font-semibold border border-white/10 transition-all"
        >
          <Download className="w-3 h-3" />
          <span>تثبيت بدون نت</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in font-['Cairo',sans-serif]">
            <div className="w-full max-w-sm rounded-[32px] glass-panel p-6 shadow-2xl border border-white/20 relative">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/80"
                >
                  <X className="w-4 h-4" />
                </button>
                <h3 className="text-sm font-bold text-white">تثبيت التطبيق على آيفون / آيباد</h3>
                <div className="w-8" />
              </div>

              <div className="py-4 space-y-3 text-right">
                <p className="text-xs text-orange-300 font-semibold flex items-center gap-1.5 justify-end">
                  <span>لتشغيل التطبيق وأغانيك في أي وقت دون اتصال بالإنترنت:</span>
                  <WifiOff className="w-4 h-4" />
                </p>
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-2 text-xs text-white/80">
                  <div className="flex items-center gap-2 justify-end">
                    <span>1. اضغط على زر <strong>المشاركة (Share)</strong> في شريط متصفح سفاري</span>
                    <Share className="w-4 h-4 text-orange-400 shrink-0" />
                  </div>
                  <div className="flex items-center gap-2 justify-end">
                    <span>2. مرر للأسفل واضغط على <strong>إضافة إلى الشاشة الرئيسية (Add to Home Screen)</strong></span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="w-full py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition-all"
              >
                فهمت ذلك
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};

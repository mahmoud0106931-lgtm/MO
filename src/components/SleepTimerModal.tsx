import React from 'react';
import { X, Clock, Moon, Check, Sparkles } from 'lucide-react';
import { formatDuration } from '../utils/formatTime';

interface SleepTimerModalProps {
  isOpen: boolean;
  activeSecondsRemaining: number | null;
  onClose: () => void;
  onSetTimer: (minutes: number) => void;
  onCancelTimer: () => void;
}

export const SleepTimerModal: React.FC<SleepTimerModalProps> = ({
  isOpen,
  activeSecondsRemaining,
  onClose,
  onSetTimer,
  onCancelTimer,
}) => {
  if (!isOpen) return null;

  const timerOptions = [
    { mins: 15, label: '15 دقيقة (غفوة سريعة)' },
    { mins: 30, label: '30 دقيقة (استرخاء هادئ)' },
    { mins: 45, label: '45 دقيقة (جلسة مسائية)' },
    { mins: 60, label: 'ساعة كاملة (استغراق في النوم)' },
    { mins: 90, label: 'ساعة ونصف (نوم عميق)' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-2xl animate-fade-in font-['Cairo',sans-serif]">
      <div
        className="w-full max-w-sm rounded-t-[36px] sm:rounded-[36px] glass-panel p-6 flex flex-col relative overflow-hidden border border-white/20 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <button
            onClick={onClose}
            aria-label="إغلاق"
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 hover:text-white transition-all active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            <Moon className="w-5 h-5 text-orange-400" />
            <h2 className="text-base font-bold text-white tracking-wide">
              مؤقت الاسترخاء والنوم
            </h2>
          </div>

          <div className="w-9" />
        </div>

        {/* Active Timer Display */}
        {activeSecondsRemaining !== null && (
          <div className="my-4 p-4 rounded-2xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-between">
            <div>
              <span className="text-xs text-orange-300 font-medium block">
                المؤقت نشط · الإيقاف بعد:
              </span>
              <span className="text-2xl font-bold font-mono text-white tabular-nums">
                {formatDuration(activeSecondsRemaining)}
              </span>
            </div>
            <button
              onClick={onCancelTimer}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white/90 transition-all border border-white/15"
            >
              إلغاء المؤقت
            </button>
          </div>
        )}

        {/* Options */}
        <div className="py-3 space-y-2">
          {timerOptions.map((item) => (
            <button
              key={item.mins}
              onClick={() => {
                onSetTimer(item.mins);
                onClose();
              }}
              className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 text-white transition-all border border-white/5 hover:border-white/15 active:scale-[0.99]"
            >
              <span className="text-sm font-semibold">{item.label}</span>
              <Clock className="w-4 h-4 text-orange-400/70" />
            </button>
          ))}
        </div>

        <p className="text-[11px] text-white/40 text-center mt-1">
          يتوقف الصوت تدريجياً بنعومة عند انقضاء الوقت للحفاظ على نوم هادئ
        </p>
      </div>
    </div>
  );
};

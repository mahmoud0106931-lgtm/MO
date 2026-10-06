import React from 'react';
import {
  Wifi,
  BatteryCharging,
  Smartphone,
  Sparkles,
  Music,
  Scissors,
  LayoutGrid,
  FolderDown,
} from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';

interface HeaderBarProps {
  isPhoneFrame: boolean;
  onTogglePhoneFrame: () => void;
  onToggleVisualizer: () => void;
  isVisualizerActive: boolean;
  onOpenSongPicker: () => void;
  onOpenChapterEditor: () => void;
  onAutoImportPhoneMusic?: () => void;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  isPhoneFrame,
  onTogglePhoneFrame,
  onToggleVisualizer,
  isVisualizerActive,
  onOpenSongPicker,
  onOpenChapterEditor,
  onAutoImportPhoneMusic,
}) => {
  return (
    <header className="w-full max-w-5xl mx-auto pt-3 pb-2 px-3 sm:px-6 flex items-center justify-between text-xs text-white/80 select-none z-30 shrink-0 font-['Cairo',sans-serif]">
      {/* Right in RTL: Clock & MO Music Brand Tag */}
      <div className="flex items-center gap-2">
        <span className="font-mono font-bold tracking-tight text-white text-[13px] tabular-nums">
          07:05
        </span>
        <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-orange-500/25 border border-orange-500/40 text-[10px] font-bold text-orange-300 font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-ping" />
          <span>MO ميوزك</span>
        </div>
      </div>

      {/* Center: Action Buttons (Install PWA, Song Picker, Chapter Cutter, Studio Mode) */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* PWA Install Button for Offline Capability */}
        <PWAInstallButton />

        {/* Auto-Import Phone Music Button */}
        {onAutoImportPhoneMusic && (
          <button
            onClick={onAutoImportPhoneMusic}
            title="استيراد جميع أغاني الهاتف تلقائياً"
            className="px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] font-bold transition-all flex items-center gap-1 bg-gradient-to-r from-orange-500/25 to-amber-500/25 hover:from-orange-500 hover:to-amber-500 hover:text-black border border-orange-500/40 text-orange-300 active:scale-95 shadow-sm shrink-0"
          >
            <FolderDown className="w-3.5 h-3.5 text-orange-400" />
            <span>أغاني الهاتف</span>
          </button>
        )}

        <button
          onClick={onOpenSongPicker}
          title="تحديد واستدعاء الأغاني"
          className="px-2.5 py-1 rounded-full text-[11px] font-bold transition-all flex items-center gap-1 bg-white/10 hover:bg-orange-500 hover:text-white border border-white/15 text-white active:scale-95 shadow-sm"
        >
          <Music className="w-3 h-3 text-orange-400 group-hover:text-white" />
          <span>استدعاء</span>
        </button>

        <button
          onClick={onOpenChapterEditor}
          title="تقسيم وتحديد الفصول يدوياً"
          className="px-2.5 py-1 rounded-full text-[11px] font-bold transition-all flex items-center gap-1 bg-orange-500/20 hover:bg-orange-500 text-orange-300 hover:text-white border border-orange-500/40 active:scale-95 shadow-sm"
        >
          <Scissors className="w-3 h-3" />
          <span className="hidden sm:inline">تقسيم يدوي</span>
        </button>

        <button
          onClick={onToggleVisualizer}
          title="تفعيل المؤثرات البصرية للترددات"
          className={`p-1.5 rounded-full text-[11px] font-medium transition-all flex items-center gap-1 border ${
            isVisualizerActive
              ? 'bg-orange-500/20 text-orange-300 border-orange-500/40'
              : 'bg-white/5 text-white/60 border-white/10 hover:bg-white/10'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
        </button>

        {/* Multi-screen mode switch (Studio Console vs Phone Frame) */}
        <button
          onClick={onTogglePhoneFrame}
          title={isPhoneFrame ? 'التبديل إلى وضع الاستوديو الكامل' : 'التبديل إلى وضع الهاتف'}
          className={`px-2.5 py-1 rounded-full transition-all border flex items-center gap-1 text-[11px] font-semibold ${
            !isPhoneFrame
              ? 'bg-orange-500 text-white border-orange-400 shadow-md'
              : 'bg-white/5 text-white/70 border-white/15 hover:bg-white/10'
          }`}
        >
          {isPhoneFrame ? (
            <>
              <LayoutGrid className="w-3 h-3" />
              <span className="hidden sm:inline">استوديو واسع</span>
            </>
          ) : (
            <>
              <Smartphone className="w-3 h-3" />
              <span>وضع الهاتف</span>
            </>
          )}
        </button>
      </div>

      {/* Left in RTL: Icons like screenshot (WiFi, Battery 62%) */}
      <div className="flex items-center gap-2 font-mono text-[11px] text-white/70">
        <Wifi className="w-3.5 h-3.5 text-white/80" />
        <span className="font-bold tracking-wider">62%</span>
        <BatteryCharging className="w-4 h-4 text-emerald-400" />
      </div>
    </header>
  );
};

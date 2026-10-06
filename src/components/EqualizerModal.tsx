import React from 'react';
import { X, Sliders, RotateCcw, Volume2, Gauge } from 'lucide-react';
import { EqualizerSettings } from '../types/music';

interface EqualizerModalProps {
  isOpen: boolean;
  settings: EqualizerSettings;
  playbackRate: number;
  onClose: () => void;
  onUpdateSettings: (newSettings: EqualizerSettings) => void;
  onUpdatePlaybackRate: (rate: number) => void;
}

const PRESETS: Record<string, { bass: number; lowMid: number; mid: number; highMid: number; treble: number; name: string }> = {
  flat: { name: 'متوازن (Flat)', bass: 0, lowMid: 0, mid: 0, highMid: 0, treble: 0 },
  tarab: { name: 'طرب شرقي أصيل', bass: 4, lowMid: 2, mid: 6, highMid: 5, treble: 4 },
  bassBoost: { name: 'مضخم الباس (Mega Bass)', bass: 9, lowMid: 6, mid: 1, highMid: 2, treble: 3 },
  vocal: { name: 'وضوح الصوت والكلمات', bass: -1, lowMid: 2, mid: 7, highMid: 6, treble: 3 },
  studio: { name: 'استوديو محيطي 3D', bass: 5, lowMid: 1, mid: 3, highMid: 5, treble: 7 },
};

export const EqualizerModal: React.FC<EqualizerModalProps> = ({
  isOpen,
  settings,
  playbackRate,
  onClose,
  onUpdateSettings,
  onUpdatePlaybackRate,
}) => {
  if (!isOpen) return null;

  const handleBandChange = (band: keyof Omit<EqualizerSettings, 'isEnabled' | 'preset'>, val: number) => {
    onUpdateSettings({
      ...settings,
      [band]: val,
      preset: 'custom',
    });
  };

  const applyPreset = (key: string) => {
    const preset = PRESETS[key];
    if (preset) {
      onUpdateSettings({
        ...settings,
        bass: preset.bass,
        lowMid: preset.lowMid,
        mid: preset.mid,
        highMid: preset.highMid,
        treble: preset.treble,
        preset: key,
      });
    }
  };

  const handleToggle = () => {
    onUpdateSettings({
      ...settings,
      isEnabled: !settings.isEnabled,
    });
  };

  const handleReset = () => {
    applyPreset('flat');
  };

  const bands = [
    { key: 'bass' as const, label: '60Hz', name: 'بيس عميق', value: settings.bass },
    { key: 'lowMid' as const, label: '250Hz', name: 'دفء النغم', value: settings.lowMid },
    { key: 'mid' as const, label: '1kHz', name: 'صوت الغناء', value: settings.mid },
    { key: 'highMid' as const, label: '4kHz', name: 'حضور الأوتار', value: settings.highMid },
    { key: 'treble' as const, label: '12kHz', name: 'نقاء وتريبل', value: settings.treble },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-xl animate-fade-in">
      <div
        className="w-full max-w-lg rounded-t-[36px] sm:rounded-[36px] glass-panel p-6 flex flex-col relative overflow-hidden border border-white/20 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 shrink-0">
          <button
            onClick={onClose}
            aria-label="إغلاق المعادل"
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 hover:text-white transition-all active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-orange-400" />
            <h2 className="text-base font-bold text-white tracking-wide">معادل الصوت الاستوديو</h2>
          </div>

          {/* Master Toggle */}
          <button
            onClick={handleToggle}
            className={`px-3 py-1 rounded-full text-xs font-bold font-mono transition-all flex items-center gap-1.5 ${
              settings.isEnabled
                ? 'bg-orange-500 text-white shadow-[0_0_12px_rgba(249,115,22,0.6)]'
                : 'bg-white/10 text-white/50'
            }`}
          >
            <span>{settings.isEnabled ? 'ON' : 'OFF'}</span>
          </button>
        </div>

        {/* Preset Selector */}
        <div className="py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-white/60 font-medium">الأنماط الصوتية الجاهزة</span>
            <button
              onClick={handleReset}
              className="text-xs text-orange-400/80 hover:text-orange-300 flex items-center gap-1 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>إعادة ضبط</span>
            </button>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {Object.entries(PRESETS).map(([key, item]) => {
              const isSelected = settings.preset === key;
              return (
                <button
                  key={key}
                  onClick={() => applyPreset(key)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    isSelected
                      ? 'bg-orange-500 text-white shadow-md'
                      : 'bg-white/5 text-white/70 hover:bg-white/10'
                  }`}
                >
                  {item.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* 5-Band Vertical Slider Racks */}
        <div className="py-6 px-2 bg-black/30 rounded-2xl border border-white/5 my-2">
          <div className="grid grid-cols-5 gap-2 sm:gap-4 items-end text-center">
            {bands.map((band) => (
              <div key={band.key} className="flex flex-col items-center gap-2">
                <span className="text-xs font-mono font-bold text-orange-400 tabular-nums">
                  {band.value > 0 ? `+${band.value}` : band.value}dB
                </span>

                {/* Vertical Range Slider */}
                <div className="h-40 flex items-center justify-center relative py-2">
                  <input
                    type="range"
                    min="-12"
                    max="12"
                    step="1"
                    disabled={!settings.isEnabled}
                    value={band.value}
                    onChange={(e) => handleBandChange(band.key, Number(e.target.value))}
                    className="h-36 w-2 accent-orange-500 cursor-pointer appearance-none bg-white/20 rounded-full [writing-mode:vertical-lr] [direction:rtl] disabled:opacity-30"
                  />
                </div>

                <div className="flex flex-col items-center">
                  <span className="text-[11px] font-mono font-bold text-white/90">
                    {band.label}
                  </span>
                  <span className="text-[9px] text-white/50 truncate max-w-[60px]">
                    {band.name}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Speed / Tempo Control */}
        <div className="pt-3 pb-1 flex items-center justify-between border-t border-white/10">
          <div className="flex items-center gap-2 text-xs text-white/70">
            <Gauge className="w-4 h-4 text-orange-400" />
            <span>سرعة التشغيل (Playback Speed)</span>
          </div>

          <div className="flex items-center gap-1.5">
            {[0.75, 1.0, 1.25, 1.5].map((rate) => (
              <button
                key={rate}
                onClick={() => onUpdatePlaybackRate(rate)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                  playbackRate === rate
                    ? 'bg-orange-500 text-white'
                    : 'bg-white/10 text-white/70 hover:bg-white/15'
                }`}
              >
                {rate}x
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useEffect, useRef, useState } from 'react';
import { X, Music2, Share2, Sparkles, Copy, Check } from 'lucide-react';
import { Track } from '../types/music';
import { formatDuration } from '../utils/formatTime';

interface LyricsModalProps {
  isOpen: boolean;
  track: Track;
  currentTime: number;
  onClose: () => void;
  onSeek: (time: number) => void;
}

export const LyricsModal: React.FC<LyricsModalProps> = ({
  isOpen,
  track,
  currentTime,
  onClose,
  onSeek,
}) => {
  const activeLineRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  // Find active line index
  let activeIndex = -1;
  for (let i = 0; i < track.lyrics.length; i++) {
    if (currentTime >= track.lyrics[i].time) {
      activeIndex = i;
    } else {
      break;
    }
  }

  // Smooth scroll to active line
  useEffect(() => {
    if (isOpen && activeLineRef.current && containerRef.current) {
      activeLineRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [activeIndex, isOpen]);

  if (!isOpen) return null;

  const handleCopy = () => {
    if (navigator.clipboard) {
      const fullText = track.lyrics.map((l) => l.text).join('\n');
      navigator.clipboard.writeText(fullText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-2xl animate-fade-in font-['Cairo',sans-serif]">
      <div
        className="w-full max-w-lg h-[84vh] sm:h-[700px] rounded-t-[36px] sm:rounded-[36px] glass-panel p-6 flex flex-col relative overflow-hidden border border-white/20 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-1/4 w-48 h-48 bg-orange-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              aria-label="إغلاق الكلمات"
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 hover:text-white transition-all active:scale-95"
            >
              <X className="w-5 h-5" />
            </button>
            <span className="text-[11px] text-white/50 hidden sm:inline">
              انقر على أي بيت للانتقال الفوري إليه
            </span>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center gap-1.5">
              <span className="px-2 py-0.5 rounded-md bg-orange-500 text-white font-mono text-[9px] font-bold">
                KARAOKE SYNC
              </span>
              <h2 className="text-base font-bold text-white tracking-wide">
                الكلمات الغنائية المتزامنة
              </h2>
            </div>
            <p className="text-xs text-orange-400 font-medium mt-0.5">{track.title} · {track.artist}</p>
          </div>

          <div className="w-9 h-9 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-orange-400" />
          </div>
        </div>

        {/* Lyrics Scrollable Area */}
        <div
          ref={containerRef}
          className="flex-1 overflow-y-auto py-8 space-y-6 text-center select-none"
        >
          {track.lyrics.length > 0 ? (
            track.lyrics.map((line, idx) => {
              const isActive = idx === activeIndex;
              const isPast = idx < activeIndex;

              return (
                <div
                  key={idx}
                  ref={isActive ? activeLineRef : null}
                  onClick={() => onSeek(line.time)}
                  className={`group cursor-pointer transition-all duration-300 px-4 py-2.5 rounded-2xl ${
                    isActive
                      ? 'scale-105 bg-orange-500/20 shadow-[0_4px_20px_rgba(249,115,22,0.3)] border border-orange-400/40'
                      : 'hover:bg-white/5 opacity-60 hover:opacity-90'
                  }`}
                >
                  <p
                    className={`text-lg sm:text-xl font-bold transition-all leading-relaxed ${
                      isActive
                        ? 'text-white drop-shadow-[0_0_12px_rgba(255,255,255,0.7)]'
                        : isPast
                        ? 'text-white/45'
                        : 'text-white/60'
                    }`}
                  >
                    {line.text}
                  </p>
                  <span className="text-[11px] font-mono text-white/30 tracking-wider mt-1 inline-block tabular-nums">
                    {formatDuration(line.time)}
                  </span>
                </div>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-white/50 space-y-3">
              <Music2 className="w-12 h-12 text-white/20" />
              <p className="text-sm">لا تتوفر كلمات مكتوبة لهذا المقطع حالياً</p>
              <p className="text-xs text-white/40">يمكنك الاستماع والاستمتاع بالنغم مع معادل الصوت</p>
            </div>
          )}
        </div>

        {/* Modal Bottom Indicator */}
        <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-white/50 shrink-0">
          <span>الموضع الحالي: {formatDuration(currentTime)}</span>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'تم نسخ الكلمات!' : 'نسخ النص'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

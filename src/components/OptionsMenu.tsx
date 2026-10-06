import React from 'react';
import {
  X,
  Share2,
  Heart,
  Upload,
  Info,
  Sliders,
  Sparkles,
  Music4,
} from 'lucide-react';
import { Track } from '../types/music';

interface OptionsMenuProps {
  isOpen: boolean;
  track: Track;
  isLiked: boolean;
  onClose: () => void;
  onToggleLike: () => void;
  onOpenEQ: () => void;
  onOpenUpload: () => void;
  onOpenSongPicker?: () => void;
}

export const OptionsMenu: React.FC<OptionsMenuProps> = ({
  isOpen,
  track,
  isLiked,
  onClose,
  onToggleLike,
  onOpenEQ,
  onOpenUpload,
  onOpenSongPicker,
}) => {
  if (!isOpen) return null;

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: track.title,
          text: `استمع إلى ${track.title} - ${track.artist} على MO ميوزك`,
          url: window.location.href,
        })
        .catch(() => {});
    } else {
      navigator.clipboard?.writeText(window.location.href);
      alert('تم نسخ رابط التشغيل للمشاركة!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-xl animate-fade-in font-['Cairo',sans-serif]">
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
          <div className="text-center">
            <span className="text-[10px] text-orange-400 font-bold block font-mono">MO MUSIC</span>
            <h2 className="text-base font-bold text-white">خيارات الأغنية والتسجيل</h2>
          </div>
          <div className="w-9" />
        </div>

        {/* Track Snapshot */}
        <div className="flex items-center gap-3 my-4 p-3 rounded-2xl bg-white/5 border border-white/5">
          <img
            src={track.coverSrc}
            alt={track.title}
            referrerPolicy="no-referrer"
            className="w-12 h-12 rounded-xl object-cover"
          />
          <div className="text-right flex-1 truncate">
            <h3 className="text-sm font-bold text-white truncate">{track.title}</h3>
            <p className="text-xs text-white/50 truncate">{track.artist}</p>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-300 font-mono font-bold">
            HD 320k
          </span>
        </div>

        {/* Action Items */}
        <div className="space-y-2">
          {onOpenSongPicker && (
            <button
              onClick={() => {
                onClose();
                onOpenSongPicker();
              }}
              className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-orange-500/15 hover:bg-orange-500/25 border border-orange-500/30 text-white transition-all"
            >
              <span className="text-sm font-bold text-orange-300">تحديد واستدعاء الأغاني (المكتبة)</span>
              <Sparkles className="w-5 h-5 text-orange-400" />
            </button>
          )}

          <button
            onClick={() => {
              onToggleLike();
              onClose();
            }}
            className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 text-white transition-all"
          >
            <span className="text-sm font-semibold">
              {isLiked ? 'إزالة من المفضلة' : 'إضافة إلى المفضلة'}
            </span>
            <Heart
              className={`w-5 h-5 ${isLiked ? 'fill-red-500 text-red-500' : 'text-white/60'}`}
            />
          </button>

          <button
            onClick={() => {
              onClose();
              onOpenEQ();
            }}
            className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 text-white transition-all"
          >
            <span className="text-sm font-semibold">معادل الصوت والمؤثرات (EQ)</span>
            <Sliders className="w-5 h-5 text-orange-400" />
          </button>

          <button
            onClick={() => {
              onClose();
              onOpenUpload();
            }}
            className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 text-white transition-all"
          >
            <span className="text-sm font-semibold">استدعاء أغنية أو تسجيل جديد</span>
            <Upload className="w-5 h-5 text-white/60" />
          </button>

          <button
            onClick={handleShare}
            className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 text-white transition-all"
          >
            <span className="text-sm font-semibold">مشاركة الأغنية الحالية</span>
            <Share2 className="w-5 h-5 text-white/60" />
          </button>
        </div>

        {/* Audio Quality Specs */}
        <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-white/40 font-mono">
          <span>دقة الصوت: 48,000Hz 24-bit</span>
          <span>عدد الفصول: {track.chapters.length}</span>
        </div>
      </div>
    </div>
  );
};

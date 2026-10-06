import React, { useState, useEffect } from 'react';
import { X, MapPin, Check, Sparkles } from 'lucide-react';
import { formatDuration } from '../utils/formatTime';

interface QuickAddMarkerDialogProps {
  isOpen: boolean;
  timestamp: number;
  existingTitle?: string;
  isEditing?: boolean;
  onClose: () => void;
  onSave: (title: string, timestamp: number) => void;
  onDelete?: () => void;
}

export const QuickAddMarkerDialog: React.FC<QuickAddMarkerDialogProps> = ({
  isOpen,
  timestamp,
  existingTitle = '',
  isEditing = false,
  onClose,
  onSave,
  onDelete,
}) => {
  const [title, setTitle] = useState(existingTitle);
  const [time, setTime] = useState(timestamp);

  useEffect(() => {
    setTitle(existingTitle);
    setTime(timestamp);
  }, [existingTitle, timestamp, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSave(title.trim(), time);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in font-['Cairo',sans-serif]">
      <div
        className="w-full max-w-sm rounded-[32px] glass-panel p-5 border border-white/20 shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-1.5 text-center">
            <MapPin className="w-4 h-4 text-orange-400" />
            <h3 className="text-sm font-bold text-white">
              {isEditing ? 'إعادة تسمية وتعديل المقطع' : 'تحديد مقطع جديد بيدك'}
            </h3>
          </div>
          <div className="w-8" />
        </div>

        <form onSubmit={handleSubmit} className="py-4 space-y-3.5">
          {/* Timestamp Indicator & Nudge */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/10">
            <span className="text-xs text-white/60">موضع العلامة في الأغنية:</span>
            <div className="flex items-center gap-2">
              <span className="text-base font-mono font-bold text-orange-300 tabular-nums">
                {formatDuration(time)}
              </span>
            </div>
          </div>

          {/* Name Input */}
          <div className="text-right">
            <label className="text-xs text-white/70 block mb-1.5 font-semibold">
              اسم المقطع أو الأغنية:
            </label>
            <input
              type="text"
              autoFocus
              required
              placeholder="اكتب اسم المقطع (مثل: بنت الناس، الكوبليه الأول)..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full h-11 px-3.5 rounded-xl bg-white/10 border border-white/15 text-sm text-white placeholder-white/30 focus:outline-none focus:border-orange-500 text-right font-medium"
            />
          </div>

          {/* Quick preset suggestions */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] text-white/60">
            <span>اقتراحات:</span>
            {['بنت الناس', 'تقاسيم عود', 'الكوبليه الأول', 'المقطع الثاني', 'صولو نغم'].map((sug) => (
              <button
                type="button"
                key={sug}
                onClick={() => setTitle(sug)}
                className="px-2 py-0.5 rounded-lg bg-white/5 hover:bg-white/15 text-white/80 whitespace-nowrap transition-colors"
              >
                {sug}
              </button>
            ))}
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center gap-2">
            {isEditing && onDelete && (
              <button
                type="button"
                onClick={() => {
                  onDelete();
                  onClose();
                }}
                className="h-11 px-3 rounded-xl bg-red-500/15 hover:bg-red-500 text-red-400 hover:text-white text-xs font-bold transition-all border border-red-500/20"
              >
                حذف العلامة
              </button>
            )}
            <button
              type="submit"
              className="flex-1 h-11 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow-lg shadow-orange-500/25 transition-all flex items-center justify-center gap-1.5 active:scale-95"
            >
              <Check className="w-4 h-4" />
              <span>{isEditing ? 'حفظ التسمية الجديدة' : 'تثبيت العلامة على الشريط'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

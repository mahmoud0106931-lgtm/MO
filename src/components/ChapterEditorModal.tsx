import React, { useState } from 'react';
import {
  X,
  Scissors,
  Plus,
  Trash2,
  Play,
  RotateCcw,
  Check,
  Clock,
  Sparkles,
  Layers,
  ChevronDown,
} from 'lucide-react';
import { Track, Chapter } from '../types/music';
import { formatDuration } from '../utils/formatTime';

interface ChapterEditorModalProps {
  isOpen: boolean;
  track: Track;
  currentTime: number;
  duration: number;
  onClose: () => void;
  onSaveChapters: (chapters: Chapter[]) => void;
  onSeek: (time: number) => void;
}

export const ChapterEditorModal: React.FC<ChapterEditorModalProps> = ({
  isOpen,
  track,
  currentTime,
  duration,
  onClose,
  onSaveChapters,
  onSeek,
}) => {
  const [chapters, setChapters] = useState<Chapter[]>(() => {
    // Clone chapters to allow editing
    return track.chapters.map((c) => ({ ...c }));
  });

  if (!isOpen) return null;

  const effectiveDuration = duration > 0 ? duration : track.duration;

  // Add chapter at current time
  const handleAddAtCurrentTime = () => {
    const roundTime = Math.floor(currentTime);
    const existingIndex = chapters.findIndex((c) => Math.abs(c.startTime - roundTime) < 3);
    if (existingIndex !== -1) {
      alert('يوجد فصل زمني قريب جداً من هذا الموضع بالفعل');
      return;
    }

    const newChapter: Chapter = {
      id: `manual-ch-${Date.now()}`,
      title: `مقطع جديد (${formatDuration(roundTime)})`,
      startTime: roundTime,
      endTime: roundTime + 60,
    };

    const updated = [...chapters, newChapter].sort((a, b) => a.startTime - b.startTime);
    // Recalculate end times
    for (let i = 0; i < updated.length; i++) {
      if (i < updated.length - 1) {
        updated[i].endTime = updated[i + 1].startTime;
      } else {
        updated[i].endTime = effectiveDuration;
      }
    }
    setChapters(updated);
  };

  // Add new chapter at custom position
  const handleAddNewChapter = () => {
    const lastChapter = chapters[chapters.length - 1];
    const newStartTime = lastChapter ? Math.min(effectiveDuration - 10, lastChapter.endTime) : 0;
    const newChapter: Chapter = {
      id: `manual-ch-${Date.now()}`,
      title: `فصل ${chapters.length + 1}`,
      startTime: newStartTime,
      endTime: effectiveDuration,
    };
    const updated = [...chapters, newChapter].sort((a, b) => a.startTime - b.startTime);
    setChapters(updated);
  };

  // Update chapter field
  const handleUpdateChapter = (id: string, updates: Partial<Chapter>) => {
    setChapters((prev) =>
      prev
        .map((c) => (c.id === id ? { ...c, ...updates } : c))
        .sort((a, b) => a.startTime - b.startTime)
    );
  };

  // Remove chapter
  const handleRemoveChapter = (id: string) => {
    if (chapters.length <= 1) {
      alert('يجب أن تحتوي الأغنية على فصل واحد على الأقل');
      return;
    }
    const filtered = chapters.filter((c) => c.id !== id);
    // Fix end times
    for (let i = 0; i < filtered.length; i++) {
      if (i < filtered.length - 1) {
        filtered[i].endTime = filtered[i + 1].startTime;
      } else {
        filtered[i].endTime = effectiveDuration;
      }
    }
    setChapters(filtered);
  };

  // Automatic Equal Division Preset (تقسيم تلقائي متساوي)
  const handleAutoDivide = (count: number) => {
    const segmentLength = Math.floor(effectiveDuration / count);
    const newChapters: Chapter[] = [];
    for (let i = 0; i < count; i++) {
      const start = i * segmentLength;
      const end = i === count - 1 ? effectiveDuration : (i + 1) * segmentLength;
      newChapters.push({
        id: `auto-div-${i}-${Date.now()}`,
        title: i === 0 ? 'مقدمة الأغنية' : i === count - 1 ? 'خاتمة التسجيل' : `المقطع ${i + 1}`,
        startTime: start,
        endTime: end,
      });
    }
    setChapters(newChapters);
  };

  const handleSave = () => {
    onSaveChapters(chapters);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-2xl animate-fade-in font-['Cairo',sans-serif]">
      <div
        className="w-full max-w-2xl h-[92vh] sm:h-[750px] rounded-t-[36px] sm:rounded-[36px] glass-panel p-5 sm:p-7 flex flex-col relative overflow-hidden border border-white/20 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 shrink-0">
          <button
            onClick={onClose}
            aria-label="إغلاق"
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 hover:text-white transition-all active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="text-center">
            <div className="flex items-center justify-center gap-1.5">
              <span className="px-2 py-0.5 rounded-md bg-orange-500 text-white font-mono text-[10px] font-bold">
                STUDIO PRO
              </span>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-wide">
                تقسيم وتحديد الفصول يدوياً
              </h2>
            </div>
            <p className="text-xs text-orange-400 font-medium mt-0.5">{track.title}</p>
          </div>

          <button
            onClick={handleSave}
            className="px-4 py-1.5 rounded-full bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition-all shadow-md shadow-orange-500/30 flex items-center gap-1.5 active:scale-95"
          >
            <Check className="w-4 h-4" />
            <span>حفظ الفصول</span>
          </button>
        </div>

        {/* Quick Current Playhead Action Bar */}
        <div className="my-3 p-3.5 rounded-2xl bg-orange-500/15 border border-orange-500/30 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-orange-400" />
            <span className="text-xs text-white/80">الموضع الحالي للصوت:</span>
            <span className="text-sm font-mono font-bold text-white bg-black/40 px-2 py-0.5 rounded-lg tabular-nums">
              {formatDuration(currentTime)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleAddAtCurrentTime}
              className="px-3.5 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-orange-500/20 active:scale-95 transition-all"
            >
              <Scissors className="w-3.5 h-3.5" />
              <span>قص وإضافة فصل هنا</span>
            </button>
            <button
              onClick={handleAddNewChapter}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>إضافة فصل</span>
            </button>
          </div>
        </div>

        {/* Quick Equal Split Template Buttons & Clear All */}
        <div className="flex items-center justify-between mb-3 px-1 shrink-0 flex-wrap gap-2">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-white/50 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-orange-400" />
              <span>تقسيم جاهز:</span>
            </span>
            {[3, 4, 6].map((count) => (
              <button
                key={count}
                onClick={() => handleAutoDivide(count)}
                className="px-2 py-0.5 rounded-lg bg-white/5 hover:bg-white/15 text-[11px] font-bold text-white/80 transition-all border border-white/10"
              >
                {count} فصول
              </button>
            ))}
          </div>

          <button
            onClick={() => setChapters([])}
            className="px-2.5 py-0.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-semibold transition-all border border-red-500/20 flex items-center gap-1"
          >
            <Trash2 className="w-3 h-3" />
            <span>مسح الكل والبدء من الصفر</span>
          </button>
        </div>

        {/* Visual Ruler / Mini Timeline preview */}
        <div className="relative w-full h-8 bg-black/40 rounded-xl border border-white/10 p-1 mb-3 shrink-0 overflow-hidden">
          {/* Chapter segments visually */}
          {chapters.map((chap, idx) => {
            const startPct = (chap.startTime / effectiveDuration) * 100;
            const endPct = (chap.endTime / effectiveDuration) * 100;
            const widthPct = Math.max(1, endPct - startPct);

            return (
              <div
                key={chap.id}
                onClick={() => onSeek(chap.startTime)}
                title={`${chap.title} (${formatDuration(chap.startTime)})`}
                className="absolute top-1 bottom-1 rounded cursor-pointer border-r border-black/40 flex items-center px-1 truncate transition-all hover:brightness-125"
                style={{
                  left: `${startPct}%`,
                  width: `${widthPct}%`,
                  backgroundColor: idx % 2 === 0 ? 'rgba(249, 115, 22, 0.45)' : 'rgba(168, 85, 247, 0.45)',
                }}
              >
                <span className="text-[9px] text-white/90 font-bold truncate">
                  {chap.title}
                </span>
              </div>
            );
          })}

          {/* Current playhead tick */}
          <div
            className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_8px_white] pointer-events-none z-20"
            style={{ left: `${(currentTime / effectiveDuration) * 100}%` }}
          />
        </div>

        {/* Scrollable Chapter Editor Rows */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
          {chapters.map((chapter, index) => (
            <div
              key={chapter.id}
              className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-white/20 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
            >
              {/* Left / Info & Title Edit */}
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <span className="w-7 h-7 rounded-lg bg-orange-500/20 text-orange-400 font-mono text-xs font-bold flex items-center justify-center shrink-0">
                  {index + 1}
                </span>

                <div className="flex-1 min-w-0">
                  <input
                    type="text"
                    value={chapter.title}
                    onChange={(e) => handleUpdateChapter(chapter.id, { title: e.target.value })}
                    placeholder="اسم الفصل (مثال: بنت الناس)..."
                    className="w-full bg-white/10 border border-white/10 rounded-xl px-3 py-1.5 text-sm font-bold text-white placeholder-white/30 focus:outline-none focus:border-orange-500 text-right"
                  />
                </div>
              </div>

              {/* Time Controls & Actions */}
              <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0">
                {/* Start Time Adjuster */}
                <div className="flex items-center gap-1.5 bg-black/40 px-2.5 py-1 rounded-xl border border-white/5">
                  <span className="text-[11px] text-white/50">البداية:</span>
                  <input
                    type="number"
                    min="0"
                    max={effectiveDuration}
                    value={chapter.startTime}
                    onChange={(e) =>
                      handleUpdateChapter(chapter.id, { startTime: Number(e.target.value) })
                    }
                    className="w-16 bg-transparent text-xs font-mono font-bold text-orange-300 focus:outline-none text-center"
                  />
                  <span className="text-[10px] text-white/40 font-mono">
                    ({formatDuration(chapter.startTime)})
                  </span>
                </div>

                {/* Preview Chapter Play button */}
                <button
                  onClick={() => onSeek(chapter.startTime)}
                  title="الاستماع لهذا الفصل"
                  className="w-8 h-8 rounded-xl bg-white/10 hover:bg-orange-500 hover:text-white flex items-center justify-center text-white/70 transition-all"
                >
                  <Play className="w-3.5 h-3.5 fill-current translate-x-[-0.5px]" />
                </button>

                {/* Set start to current time */}
                <button
                  onClick={() =>
                    handleUpdateChapter(chapter.id, { startTime: Math.floor(currentTime) })
                  }
                  title="تعيين البداية عند موضع الصوت الحالي"
                  className="px-2 py-1 rounded-xl bg-white/5 hover:bg-white/15 text-[10px] text-white/60 hover:text-white transition-all whitespace-nowrap"
                >
                  تثبيت الحالي
                </button>

                {/* Delete button */}
                <button
                  onClick={() => handleRemoveChapter(chapter.id)}
                  title="حذف الفصل"
                  className="w-8 h-8 rounded-xl bg-red-500/10 hover:bg-red-500 hover:text-white flex items-center justify-center text-red-400 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer info */}
        <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-white/50 shrink-0">
          <span>عدد الفصول الحالية: {chapters.length}</span>
          <span className="text-orange-400">تظهر الفصول كعلامات برتقالية متوهجة على شريط الأغنية</span>
        </div>
      </div>
    </div>
  );
};

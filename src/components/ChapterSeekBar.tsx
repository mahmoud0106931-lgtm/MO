import React, { useState, useRef } from 'react';
import { Track, Chapter } from '../types/music';
import { formatDuration, getCurrentChapter } from '../utils/formatTime';
import { QuickAddMarkerDialog } from './QuickAddMarkerDialog';
import { MapPin, Plus, Sparkles } from 'lucide-react';

interface ChapterSeekBarProps {
  track: Track;
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
  onChapterSelect?: (chapter: Chapter) => void;
  onOpenChapterEditor?: () => void;
  onAddChapterByHand?: (title: string, startTime: number) => void;
  onUpdateChapterByHand?: (chapterId: string, newTitle: string, newStartTime: number) => void;
  onDeleteChapterByHand?: (chapterId: string) => void;
}

export const ChapterSeekBar: React.FC<ChapterSeekBarProps> = ({
  track,
  currentTime,
  duration,
  onSeek,
  onChapterSelect,
  onOpenChapterEditor,
  onAddChapterByHand,
  onUpdateChapterByHand,
  onDeleteChapterByHand,
}) => {
  const progressBarRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragTime, setDragTime] = useState<number | null>(null);
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [holdingChapterId, setHoldingChapterId] = useState<string | null>(null);

  // Long press timer refs
  const longPressTimerRef = useRef<{ [key: string]: number }>({});
  const isLongPressTriggeredRef = useRef<{ [key: string]: boolean }>({});

  // Dialog state for editing/naming chapter
  const [dialogState, setDialogState] = useState<{
    isOpen: boolean;
    timestamp: number;
    existingTitle?: string;
    chapterId?: string;
    isEditing?: boolean;
  }>({
    isOpen: false,
    timestamp: 0,
  });

  const effectiveDuration = duration > 0 ? duration : track.duration;
  const displayTime = isDragging && dragTime !== null ? dragTime : currentTime;
  const progressPercent = Math.min(100, Math.max(0, (displayTime / effectiveDuration) * 100));

  // Determine active chapter based on display time
  const activeChapter = getCurrentChapter(track, displayTime);

  const calculateTimeFromEvent = (
    e: MouseEvent | TouchEvent | PointerEvent | React.MouseEvent | React.TouchEvent | React.PointerEvent
  ): number | null => {
    if (!progressBarRef.current) return null;
    let clientX: number | undefined;

    if ('touches' in e && e.touches && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
    } else if ('changedTouches' in e && e.changedTouches && e.changedTouches.length > 0) {
      clientX = e.changedTouches[0].clientX;
    } else if ('clientX' in e && typeof e.clientX === 'number') {
      clientX = e.clientX;
    }

    if (clientX === undefined) return null;

    const rect = progressBarRef.current.getBoundingClientRect();
    const clickX = clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    return ratio * effectiveDuration;
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const newTime = calculateTimeFromEvent(e);
    if (newTime !== null) {
      setIsDragging(true);
      setDragTime(newTime);
      try {
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
      } catch {}
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const time = calculateTimeFromEvent(e);
    if (time !== null) {
      setHoverTime(time);
      if (isDragging) {
        setDragTime(time);
      }
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const newTime = calculateTimeFromEvent(e);
    const finalTime = newTime !== null ? newTime : dragTime;
    setIsDragging(false);
    setDragTime(null);
    if (finalTime !== null) {
      onSeek(finalTime);
    }
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}
  };

  const handlePointerCancel = () => {
    if (isDragging) {
      setIsDragging(false);
      setDragTime(null);
    }
  };

  const handleMouseLeave = () => {
    setHoverTime(null);
  };

  // Open hand-placement dialog for current time
  const handleOpenAddAtCurrent = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDialogState({
      isOpen: true,
      timestamp: Math.floor(displayTime),
      isEditing: false,
    });
  };

  // Long press & single tap handlers for chapters (Directly above marker position)
  const handleChapterPressStart = (e: React.PointerEvent | React.MouseEvent, chapter: Chapter) => {
    e.stopPropagation();
    const key = chapter.id;
    isLongPressTriggeredRef.current[key] = false;
    setHoldingChapterId(key);

    if (longPressTimerRef.current[key]) {
      clearTimeout(longPressTimerRef.current[key]);
    }

    longPressTimerRef.current[key] = window.setTimeout(() => {
      isLongPressTriggeredRef.current[key] = true;
      setHoldingChapterId(null);

      // Haptic feedback if on mobile
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        try {
          navigator.vibrate(60);
        } catch {}
      }

      // Open rename dialog on long press!
      setDialogState({
        isOpen: true,
        timestamp: chapter.startTime,
        existingTitle: chapter.title,
        chapterId: chapter.id,
        isEditing: true,
      });
    }, 450); // 450ms long press threshold
  };

  const handleChapterPressEnd = (e: React.PointerEvent | React.MouseEvent, chapter: Chapter) => {
    e.stopPropagation();
    const key = chapter.id;
    setHoldingChapterId(null);

    if (longPressTimerRef.current[key]) {
      clearTimeout(longPressTimerRef.current[key]);
      delete longPressTimerRef.current[key];
    }

    // Single click / short tap -> PLAY this chapter!
    if (!isLongPressTriggeredRef.current[key]) {
      onSeek(chapter.startTime);
      onChapterSelect?.(chapter);
    }
    isLongPressTriggeredRef.current[key] = false;
  };

  const handleChapterPressCancel = (chapter: Chapter) => {
    const key = chapter.id;
    setHoldingChapterId(null);
    if (longPressTimerRef.current[key]) {
      clearTimeout(longPressTimerRef.current[key]);
      delete longPressTimerRef.current[key];
    }
    isLongPressTriggeredRef.current[key] = false;
  };

  // Save from dialog
  const handleDialogSave = (title: string, timestamp: number) => {
    if (dialogState.isEditing && dialogState.chapterId) {
      onUpdateChapterByHand?.(dialogState.chapterId, title, timestamp);
    } else {
      onAddChapterByHand?.(title, timestamp);
    }
  };

  // Delete from dialog
  const handleDialogDelete = () => {
    if (dialogState.chapterId) {
      onDeleteChapterByHand?.(dialogState.chapterId);
    }
  };

  const hasChapters = track.chapters && track.chapters.length > 0;

  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null);

  const handleSelectChapter = (chapter: Chapter) => {
    setSelectedChapterId(chapter.id);
    onSeek(chapter.startTime);
    onChapterSelect?.(chapter);
  };

  return (
    <div className="w-full select-none py-2 px-1 font-['Cairo',sans-serif]">
      {/* Empty prompt if no chapters exist yet */}
      {!hasChapters && (
        <div className="flex items-center justify-center mb-2 pointer-events-auto">
          <button
            onClick={handleOpenAddAtCurrent}
            className="px-3.5 py-1.5 rounded-xl bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/40 text-orange-300 text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
          >
            <MapPin className="w-3.5 h-3.5 text-orange-400" />
            <span>حدد أول مقطع بيدك عند [{formatDuration(displayTime)}]</span>
          </button>
        </div>
      )}

      {/* 
        Progress Bar Container: Sleek Timeline with Exact Matching Badge above Selected/Active Marker
      */}
      <div
        ref={progressBarRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        onPointerLeave={handleMouseLeave}
        className="relative pt-8 sm:pt-9 pb-2 flex items-center cursor-pointer group touch-none overflow-visible"
      >
        {/* Track Line Background */}
        <div className="relative w-full h-1.5 sm:h-2 rounded-full bg-white/20 backdrop-blur-sm overflow-visible">
          {/* Active Filled Track */}
          <div
            className="absolute top-0 left-0 h-full rounded-full bg-gradient-to-r from-orange-400/90 via-orange-500 to-amber-500"
            style={{ width: `${progressPercent}%` }}
          />

          {/* Chapter Markers on the timeline */}
          {hasChapters &&
            track.chapters.map((chapter) => {
              const markerPercent = Math.max(0, Math.min(100, (chapter.startTime / effectiveDuration) * 100));
              const isPassed = markerPercent <= progressPercent;
              // Only show when explicitly clicked / selected by the user, or during long-press
              const isSelected = selectedChapterId === chapter.id;
              const isHolding = holdingChapterId === chapter.id;
              const isNearRightEdge = markerPercent > 84;
              const isNearLeftEdge = markerPercent < 16;

              return (
                <div
                  key={chapter.id}
                  style={{ left: `${markerPercent}%` }}
                  className={`absolute bottom-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-auto transition-all ${
                    isHolding ? 'z-50' : isSelected ? 'z-40' : 'z-20'
                  }`}
                >
                  {/* Badge appearing above marker ONLY WHEN CLICKED with THE EXACT SAME DESIGN AS THE BOTTOM PILL */}
                  {(isSelected || isHolding) && (
                    <div
                      onPointerDown={(e) => handleChapterPressStart(e, chapter)}
                      onPointerUp={(e) => {
                        handleChapterPressEnd(e, chapter);
                        handleSelectChapter(chapter);
                      }}
                      onPointerCancel={() => handleChapterPressCancel(chapter)}
                      onPointerLeave={() => handleChapterPressCancel(chapter)}
                      title={`${chapter.title} - نقرة: تشغيل | ضغطة مطولة: إعادة التسمية`}
                      className={`absolute bottom-2.5 cursor-pointer select-none transition-all duration-200 active:scale-95 flex flex-col items-center group/marker ${
                        isNearRightEdge
                          ? 'translate-x-[-20%]'
                          : isNearLeftEdge
                          ? 'translate-x-[20%]'
                          : ''
                      }`}
                    >
                      {/* Exact Same Design as the Bottom Pill */}
                      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all shadow-[0_0_15px_#f97316] ring-1 ring-amber-300 bg-gradient-to-r from-orange-500 to-amber-500 text-black scale-105 whitespace-nowrap">
                        <span className="w-1.5 h-1.5 rounded-full shrink-0 bg-black animate-pulse" />
                        <span className="truncate max-w-[120px] font-['Cairo',sans-serif] leading-tight">
                          {chapter.title}
                        </span>
                        <span className="font-mono text-[10px] opacity-80 tabular-nums">
                          ({formatDuration(chapter.startTime)})
                        </span>
                      </div>

                      {/* Caret arrow pointing directly into timeline bead */}
                      <div className="w-0 h-0 border-x-[5px] border-x-transparent border-t-[6px] border-t-amber-500 transition-colors" />
                    </div>
                  )}

                  {/* Luminous Marker Bead directly on the timeline */}
                  <div
                    onPointerDown={(e) => handleChapterPressStart(e, chapter)}
                    onPointerUp={(e) => {
                      handleChapterPressEnd(e, chapter);
                      handleSelectChapter(chapter);
                    }}
                    onPointerCancel={() => handleChapterPressCancel(chapter)}
                    title={`${chapter.title} (${formatDuration(chapter.startTime)})`}
                    className={`rounded-full transition-all duration-200 cursor-pointer -translate-y-1/2 ${
                      isSelected
                        ? 'w-2.5 h-3.5 bg-white ring-2 ring-orange-500 shadow-[0_0_12px_#f97316]'
                        : isPassed
                        ? 'w-2 h-3 bg-orange-500 shadow-[0_0_6px_#f97316]'
                        : 'w-2 h-3 bg-orange-400/90 shadow-[0_0_4px_rgba(249,115,22,0.5)]'
                    }`}
                  />
                </div>
              );
            })}

          {/* Glowing Orange Thumb Knob */}
          <div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3.5 h-6 sm:w-4 sm:h-7 rounded-full bg-orange-500 border border-white/40 shadow-[0_0_12px_#f97316,0_0_24px_rgba(249,115,22,0.5)] transition-transform duration-75 z-20 group-hover:scale-110 active:scale-125 pointer-events-none"
            style={{ left: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Timestamp Indicators and Quick Add Marker Action (LTR for intuitive left-to-right timeline) */}
      <div
        dir="ltr"
        className="flex items-center justify-between text-xs font-medium text-white/70 tracking-wider px-0.5 mt-1 font-['Plus_Jakarta_Sans',sans-serif] tabular-nums select-none"
      >
        {/* Left: Elapsed Time */}
        <span className="font-mono text-white/80">{formatDuration(displayTime)}</span>

        {/* Center: Action button */}
        <div dir="rtl" className="flex items-center gap-2">
          <button
            onClick={handleOpenAddAtCurrent}
            title="تثبيت وتسمية مقطع بيدك عند موضع التشغيل الحالي"
            className="text-[11px] text-orange-400 hover:text-orange-300 font-bold font-['Cairo',sans-serif] flex items-center gap-1 px-2.5 py-1 rounded-xl bg-orange-500/15 hover:bg-orange-500/25 border border-orange-500/30 transition-all active:scale-95 shadow-sm"
          >
            <MapPin className="w-3 h-3 text-orange-400" />
            <span>+ تحديد مقطع بيدك</span>
          </button>
        </div>

        {/* Right: Total Duration */}
        <span className="font-mono text-white/50">{formatDuration(effectiveDuration)}</span>
      </div>

      {/* Quick Chapters Carousel Ribbon (Shows ALL chapters clearly below) */}
      {hasChapters && (
        <div className="w-full flex items-center gap-1.5 overflow-x-auto pt-2.5 pb-0.5 no-scrollbar select-none">
          {track.chapters.map((chapter) => {
            const isSelected = selectedChapterId === chapter.id || (!selectedChapterId && activeChapter?.id === chapter.id);
            return (
              <button
                key={chapter.id}
                onClick={() => handleSelectChapter(chapter)}
                onPointerDown={(e) => handleChapterPressStart(e, chapter)}
                onPointerUp={(e) => handleChapterPressEnd(e, chapter)}
                onPointerCancel={() => handleChapterPressCancel(chapter)}
                title={`${chapter.title} - نقرة: تشغيل | مطولاً: إعادة التسمية`}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all shrink-0 active:scale-95 ${
                  isSelected
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-black shadow-[0_0_12px_#f97316] ring-1 ring-amber-300 scale-105'
                    : 'bg-white/10 hover:bg-white/20 text-white/80 hover:text-white border border-white/10'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                    isSelected ? 'bg-black animate-pulse' : 'bg-orange-400'
                  }`}
                />
                <span className="truncate max-w-[110px] font-['Cairo',sans-serif]">{chapter.title}</span>
                <span className="font-mono text-[10px] opacity-75 tabular-nums">({formatDuration(chapter.startTime)})</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Quick Add/Edit Marker Modal Dialog */}
      <QuickAddMarkerDialog
        isOpen={dialogState.isOpen}
        timestamp={dialogState.timestamp}
        existingTitle={dialogState.existingTitle}
        isEditing={dialogState.isEditing}
        onClose={() => setDialogState({ isOpen: false, timestamp: 0 })}
        onSave={handleDialogSave}
        onDelete={handleDialogDelete}
      />
    </div>
  );
};

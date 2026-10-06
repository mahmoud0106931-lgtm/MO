import React, { useRef } from 'react';
import {
  X,
  Play,
  Upload,
  Music,
  CheckCircle2,
  Disc3,
  Bookmark,
  Share2,
  MapPin,
  Scissors,
} from 'lucide-react';
import { Track, Chapter } from '../types/music';
import { formatDuration, getCurrentChapter } from '../utils/formatTime';

interface ChaptersQueueDrawerProps {
  isOpen: boolean;
  tracks: Track[];
  currentTrack: Track;
  currentTime: number;
  isPlaying: boolean;
  onClose: () => void;
  onSelectTrack: (track: Track) => void;
  onSelectChapter: (chapter: Chapter) => void;
  onUploadCustomAudio: (file: File) => void;
  onOpenSongPicker?: () => void;
  onOpenChapterEditor?: () => void;
}

export const ChaptersQueueDrawer: React.FC<ChaptersQueueDrawerProps> = ({
  isOpen,
  tracks,
  currentTrack,
  currentTime,
  isPlaying,
  onClose,
  onSelectTrack,
  onSelectChapter,
  onUploadCustomAudio,
  onOpenSongPicker,
  onOpenChapterEditor,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const activeChapter = getCurrentChapter(currentTrack, currentTime);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onUploadCustomAudio(e.target.files[0]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-xl animate-fade-in font-['Cairo',sans-serif]">
      <div
        className="w-full max-w-lg h-[88vh] sm:h-[720px] rounded-t-[36px] sm:rounded-[36px] glass-panel p-6 flex flex-col relative overflow-hidden border border-white/20 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 shrink-0">
          <button
            onClick={onClose}
            aria-label="إغلاق القائمة"
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 hover:text-white transition-all active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="text-center">
            <h2 className="text-base font-bold text-white tracking-wide">
              MO ميوزك · الفصول وقوائم التشغيل
            </h2>
            <p className="text-xs text-orange-400 font-medium">{currentTrack.title}</p>
          </div>

          {/* Quick Song Summon / Upload */}
          <button
            onClick={() => {
              if (onOpenSongPicker) {
                onClose();
                onOpenSongPicker();
              } else {
                fileInputRef.current?.click();
              }
            }}
            title="استدعاء وتحديد الأغاني"
            className="w-9 h-9 rounded-full bg-orange-500/20 hover:bg-orange-500/30 flex items-center justify-center text-orange-400 transition-all active:scale-95"
          >
            <Upload className="w-4 h-4" />
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="audio/*"
            className="hidden"
          />
        </div>

        {/* Switch Available Mixes / Albums */}
        <div className="py-3 border-b border-white/10">
          <span className="text-xs text-white/50 block mb-2 font-medium">اختر التسجيل أو الألبوم:</span>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {tracks.map((t) => {
              const isCurrent = t.id === currentTrack.id;
              return (
                <button
                  key={t.id}
                  onClick={() => onSelectTrack(t)}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl shrink-0 transition-all text-right ${
                    isCurrent
                      ? 'bg-orange-500/20 border border-orange-500/40 text-white'
                      : 'bg-white/5 hover:bg-white/10 text-white/70 border border-white/5'
                  }`}
                >
                  <img
                    src={t.coverSrc}
                    alt={t.title}
                    referrerPolicy="no-referrer"
                    className="w-8 h-8 rounded-lg object-cover"
                  />
                  <div>
                    <div className="text-xs font-bold leading-tight truncate max-w-[120px]">
                      {t.title}
                    </div>
                    <div className="text-[10px] text-white/50 truncate max-w-[120px]">
                      {t.artist}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Chapters Section in the Current Mix */}
        <div className="flex items-center justify-between pt-4 pb-2">
          <span className="text-xs font-bold text-white/80 flex items-center gap-1.5">
            <Disc3 className="w-4 h-4 text-orange-400 animate-spin [animation-duration:8s]" />
            فصول الأغنية ({currentTrack.chapters.length})
          </span>
          <button
            onClick={() => {
              onClose();
              onOpenChapterEditor?.();
            }}
            className="text-xs text-orange-400 hover:text-orange-300 font-bold flex items-center gap-1"
          >
            <Scissors className="w-3.5 h-3.5" />
            <span>تحديد الفصول يدوياً</span>
          </button>
        </div>

        {/* Chapters List */}
        <div className="flex-1 overflow-y-auto space-y-2 py-1 pr-1">
          {currentTrack.chapters.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-white/50 space-y-3 text-center p-4">
              <MapPin className="w-10 h-10 text-orange-400/50" />
              <p className="text-xs text-white/70">
                هذه الأغنية لا تحتوي فصولاً بعد. أنت من يحدد أماكن وأسماء الفصول بيدك!
              </p>
              <button
                onClick={() => {
                  onClose();
                  onOpenChapterEditor?.();
                }}
                className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow-md shadow-orange-500/25 transition-all"
              >
                + حدد فصول الأغنية بيدك الآن
              </button>
            </div>
          ) : (
            currentTrack.chapters.map((chapter, idx) => {
            const isCurrent = activeChapter?.id === chapter.id;

            return (
              <div
                key={chapter.id}
                onClick={() => onSelectChapter(chapter)}
                className={`group flex items-center justify-between p-3 rounded-2xl cursor-pointer transition-all border ${
                  isCurrent
                    ? 'bg-orange-500/15 border-orange-500/40 shadow-[0_4px_16px_rgba(249,115,22,0.15)]'
                    : 'bg-white/[0.04] border-white/5 hover:bg-white/10 hover:border-white/15'
                }`}
              >
                {/* Left: Info */}
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-mono text-xs font-bold transition-all ${
                      isCurrent
                        ? 'bg-orange-500 text-white shadow-md'
                        : 'bg-white/10 text-white/60 group-hover:bg-white/20'
                    }`}
                  >
                    {isCurrent && isPlaying ? (
                      <span className="flex gap-0.5 items-end h-3.5">
                        <span className="w-1 bg-white animate-pulse h-full" />
                        <span className="w-1 bg-white animate-pulse h-2" />
                        <span className="w-1 bg-white animate-pulse h-3" />
                      </span>
                    ) : (
                      idx + 1
                    )}
                  </div>

                  <div className="text-right">
                    <h3
                      className={`text-sm font-bold transition-colors ${
                        isCurrent ? 'text-orange-300' : 'text-white group-hover:text-orange-200'
                      }`}
                    >
                      {chapter.title}
                    </h3>
                    <p className="text-xs text-white/50">{chapter.artist || currentTrack.artist}</p>
                  </div>
                </div>

                {/* Right: Timestamp */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-white/40 tabular-nums">
                    {formatDuration(chapter.startTime)}
                  </span>
                  {isCurrent && <CheckCircle2 className="w-4 h-4 text-orange-400" />}
                </div>
              </div>
            );
          }))}
        </div>

        {/* Custom Upload Helper */}
        <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-white/50 shrink-0">
          <span>يدعم ملفات MP3 / WAV / M4A المباشرة</span>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="text-orange-400 hover:text-orange-300 font-semibold"
          >
            + إضافة أغنية من الهاتف
          </button>
        </div>
      </div>
    </div>
  );
};

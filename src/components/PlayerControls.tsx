import React, { useState } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Heart,
  MoreVertical,
  MessageSquareQuote,
  Sliders,
  ListMusic,
  Clock,
  Volume2,
  VolumeX,
  Scissors,
  Shuffle,
  Repeat,
  Repeat1,
  Sparkles,
} from 'lucide-react';
import { Track, Chapter, RepeatMode } from '../types/music';
import { ChapterSeekBar } from './ChapterSeekBar';

interface PlayerControlsProps {
  track: Track;
  isPlaying: boolean;
  isLiked: boolean;
  currentTime: number;
  duration: number;
  isEqActive: boolean;
  isMuted: boolean;
  volume: number;
  isShuffle?: boolean;
  repeatMode?: RepeatMode;
  playbackRate?: number;
  onPlayPause: () => void;
  onPrev: () => void;
  onNext: () => void;
  onSeek: (time: number) => void;
  onToggleLike: () => void;
  onOpenLyrics: () => void;
  onOpenEQ: () => void;
  onOpenQueue: () => void;
  onOpenSongPicker: () => void;
  onOpenChapterEditor?: () => void;
  onOpenSleepTimer: () => void;
  onOpenOptions: () => void;
  onChapterSelect?: (chapter: Chapter) => void;
  onToggleMute: () => void;
  onVolumeChange: (val: number) => void;
  onToggleShuffle?: () => void;
  onToggleRepeat?: () => void;
  onCycleSpeed?: () => void;
  onAddChapterByHand?: (title: string, startTime: number) => void;
  onUpdateChapterByHand?: (chapterId: string, newTitle: string, newStartTime: number) => void;
  onDeleteChapterByHand?: (chapterId: string) => void;
}

export const PlayerControls: React.FC<PlayerControlsProps> = ({
  track,
  isPlaying,
  isLiked,
  currentTime,
  duration,
  isEqActive,
  isMuted,
  volume,
  isShuffle = false,
  repeatMode = 'off',
  playbackRate = 1.0,
  onPlayPause,
  onPrev,
  onNext,
  onSeek,
  onToggleLike,
  onOpenLyrics,
  onOpenEQ,
  onOpenQueue,
  onOpenSongPicker,
  onOpenChapterEditor,
  onOpenSleepTimer,
  onOpenOptions,
  onChapterSelect,
  onToggleMute,
  onVolumeChange,
  onToggleShuffle,
  onToggleRepeat,
  onCycleSpeed,
  onAddChapterByHand,
  onUpdateChapterByHand,
  onDeleteChapterByHand,
}) => {
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);

  return (
    <div className="w-full rounded-t-[38px] glass-panel px-5 sm:px-6 pt-5 pb-7 sm:pb-8 transition-all select-none">
      {/* Track Info Header Row - Title on Right (RTL), Action Icons on Left */}
      <div className="flex items-center justify-between gap-4 mb-3">
        {/* Right side in RTL (Dominant Title & Subtitle) - Click to pick song */}
        <div
          onClick={onOpenSongPicker}
          role="button"
          tabIndex={0}
          title="انقر لتصفح واختيار مقطع صوتي آخر"
          className="flex flex-col text-right cursor-pointer group"
        >
          <div className="flex items-center gap-1.5">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-white drop-shadow-md font-['Plus_Jakarta_Sans',sans-serif] group-hover:text-orange-300 transition-colors">
              {track.title}
            </h1>
            <span className="text-white/40 group-hover:text-orange-400 text-xs transition-colors">▾</span>
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs sm:text-sm font-normal text-white/60 tracking-wide group-hover:text-white/80 transition-colors">
              {track.artist}
            </span>
            <span className="text-[10px] px-2 py-0.2 rounded-full bg-white/10 text-orange-300 font-mono font-bold">
              320kbps HD
            </span>
          </div>
        </div>

        {/* Left side in RTL (More Options + Heart Liked Icon) */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Quick Chapter Cutter Button */}
          {onOpenChapterEditor && (
            <button
              onClick={onOpenChapterEditor}
              title="استوديو تحديد وتقسيم الفصول باليد"
              className="w-10 h-10 rounded-full flex items-center justify-center text-orange-400 hover:text-white hover:bg-orange-500/20 active:scale-95 transition-all"
            >
              <Scissors className="w-4 h-4" />
            </button>
          )}

          {/* More Options Button */}
          <button
            onClick={onOpenOptions}
            aria-label="خيارات الاستوديو والمشاركة"
            title="خيارات الاستوديو والمشاركة"
            className="w-10 h-10 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 active:scale-95 transition-all"
          >
            <MoreVertical className="w-5 h-5" />
          </button>

          {/* Heart / Favorite Button */}
          <button
            onClick={onToggleLike}
            aria-label={isLiked ? 'إزالة من المفضلة' : 'إضافة إلى المفضلة'}
            title={isLiked ? 'إزالة من المفضلة' : 'إضافة إلى المفضلة'}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-90 hover:bg-white/10"
          >
            <Heart
              className={`w-6 h-6 transition-colors ${
                isLiked
                  ? 'fill-red-500 text-red-500 drop-shadow-[0_0_12px_rgba(239,68,68,0.7)]'
                  : 'text-white/80 hover:text-white'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Centerpiece Chapter Timeline Seek Bar */}
      <ChapterSeekBar
        track={track}
        currentTime={currentTime}
        duration={duration}
        onSeek={onSeek}
        onChapterSelect={onChapterSelect}
        onOpenChapterEditor={onOpenChapterEditor}
        onAddChapterByHand={onAddChapterByHand}
        onUpdateChapterByHand={onUpdateChapterByHand}
        onDeleteChapterByHand={onDeleteChapterByHand}
      />

      {/* Secondary Controls Bar: Shuffle, Speed, Volume, Repeat */}
      <div className="flex items-center justify-between px-2 pt-1 pb-2 text-white/70">
        {/* Shuffle Button */}
        <button
          onClick={onToggleShuffle}
          title={isShuffle ? 'الوضع العشوائي: نشط' : 'تفعيل التشغيل العشوائي'}
          className={`p-2 rounded-full transition-all ${
            isShuffle ? 'text-orange-400 bg-orange-500/15' : 'text-white/50 hover:text-white'
          }`}
        >
          <Shuffle className="w-4 h-4" />
        </button>

        {/* Playback Speed Chip */}
        <button
          onClick={onCycleSpeed}
          title="تغيير سرعة الصوت"
          className="px-2 py-0.5 rounded-full bg-white/5 hover:bg-white/15 text-[11px] font-mono font-bold text-white/70 hover:text-white transition-all border border-white/10"
        >
          {playbackRate.toFixed(2).replace(/\.00$/, '')}x
        </button>

        {/* Volume & Mute with Expandable Slider */}
        <div className="relative flex items-center gap-1.5">
          {showVolumeSlider && (
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={isMuted ? 0 : volume}
              onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
              className="w-20 sm:w-24 h-1.5 bg-white/20 rounded-full appearance-none accent-orange-500 cursor-pointer"
            />
          )}
          <button
            onClick={() => setShowVolumeSlider(!showVolumeSlider)}
            onDoubleClick={onToggleMute}
            title="التحكم بمستوى الصوت"
            className="p-1.5 rounded-full text-white/60 hover:text-white transition-colors"
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="w-4 h-4 text-red-400" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Repeat Mode Button */}
        <button
          onClick={onToggleRepeat}
          title={
            repeatMode === 'one'
              ? 'تكرار الأغنية'
              : repeatMode === 'all'
              ? 'تكرار جميع الأغاني'
              : 'إيقاف التكرار'
          }
          className={`p-2 rounded-full transition-all ${
            repeatMode !== 'off'
              ? 'text-orange-400 bg-orange-500/15'
              : 'text-white/50 hover:text-white'
          }`}
        >
          {repeatMode === 'one' ? (
            <Repeat1 className="w-4 h-4" />
          ) : (
            <Repeat className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Main Playback Control Buttons Row */}
      <div className="flex items-center justify-between max-w-sm mx-auto px-2 mb-4">
        {/* Sleep Timer */}
        <button
          onClick={onOpenSleepTimer}
          aria-label="مؤقت النوم الهادئ"
          title="مؤقت النوم الهادئ"
          className="w-11 h-11 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 active:scale-95 transition-all"
        >
          <Clock className="w-5 h-5" />
        </button>

        {/* Previous Track / Chapter Button */}
        <button
          onClick={onPrev}
          aria-label="المقطع السابق"
          title="المقطع السابق"
          className="w-12 h-12 rounded-full flex items-center justify-center text-white hover:text-orange-400 active:scale-90 transition-all hover:bg-white/10"
        >
          <SkipBack className="w-7 h-7 fill-white/20" />
        </button>

        {/* Primary Play / Pause Button */}
        <button
          onClick={onPlayPause}
          aria-label={isPlaying ? 'إيقاف مؤقت' : 'تشغيل النغم'}
          title={isPlaying ? 'إيقاف مؤقت' : 'تشغيل النغم'}
          className="w-16 h-16 rounded-full flex items-center justify-center bg-white text-black shadow-[0_10px_30px_rgba(255,255,255,0.25)] hover:bg-orange-50 active:scale-95 transition-all"
        >
          {isPlaying ? (
            <Pause className="w-7 h-7 fill-black text-black" />
          ) : (
            <Play className="w-8 h-8 fill-black text-black translate-x-[-1px]" />
          )}
        </button>

        {/* Next Track / Chapter Button */}
        <button
          onClick={onNext}
          aria-label="المقطع التالي"
          title="المقطع التالي"
          className="w-12 h-12 rounded-full flex items-center justify-center text-white hover:text-orange-400 active:scale-90 transition-all hover:bg-white/10"
        >
          <SkipForward className="w-7 h-7 fill-white/20" />
        </button>

        {/* Chapters Studio Trigger */}
        <button
          onClick={onOpenChapterEditor}
          aria-label="تقسيم وتحديد المقاطع باليد"
          title="تقسيم وتحديد المقاطع باليد"
          className="w-11 h-11 rounded-full flex items-center justify-center text-orange-400 hover:text-white hover:bg-orange-500/20 active:scale-95 transition-all"
        >
          <Scissors className="w-5 h-5" />
        </button>
      </div>

      {/* Bottom Utility Bar - Matches the 3 pill controls in screenshot:
          [Left: Queue/Chapters]   [Center: "الكلمات" Pill]   [Right: "ON" Equalizer]
      */}
      <div className="flex items-center justify-between pt-2 border-t border-white/[0.08]">
        {/* Left: Queue / Chapters Drawer */}
        <button
          onClick={onOpenQueue}
          aria-label="فصول وقوائم التشغيل"
          className="h-10 px-3 rounded-full flex items-center gap-1.5 text-white/75 hover:text-white hover:bg-white/10 active:scale-95 transition-all"
        >
          <ListMusic className="w-5 h-5 text-orange-400" />
          <span className="text-xs font-semibold">الفصول والمكتبة</span>
        </button>

        {/* Center: Frosted Glass "الكلمات" (Lyrics) Pill Button */}
        <button
          onClick={onOpenLyrics}
          aria-label="عرض الكلمات الغنائية المزامنة"
          className="h-10 px-5 rounded-full glass-pill flex items-center gap-2 text-white shadow-md active:scale-95 transition-all hover:border-white/40"
        >
          <span className="text-sm font-semibold tracking-wide">الكلمات</span>
          <MessageSquareQuote className="w-4 h-4 text-orange-300" />
        </button>

        {/* Right: Equalizer / FX Button with "ON" / "OFF" indicator */}
        <button
          onClick={onOpenEQ}
          aria-label="معادل الصوت الاستوديو والمؤثرات"
          className="h-10 px-3.5 rounded-full flex items-center gap-1.5 text-white/80 hover:text-white hover:bg-white/10 active:scale-95 transition-all"
        >
          <div className="flex items-center gap-1">
            <Sliders className="w-4 h-4 text-orange-400" />
            <span
              className={`text-[11px] font-bold tracking-wider uppercase font-mono ${
                isEqActive ? 'text-orange-400' : 'text-white/40'
              }`}
            >
              {isEqActive ? 'ON' : 'OFF'}
            </span>
          </div>
        </button>
      </div>
    </div>
  );
};

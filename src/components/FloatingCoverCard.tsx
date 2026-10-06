import React from 'react';
import { Track } from '../types/music';

interface FloatingCoverCardProps {
  track: Track;
  isPlaying: boolean;
  onCoverClick?: () => void;
  onOpenSongPicker?: () => void;
}

export const FloatingCoverCard: React.FC<FloatingCoverCardProps> = ({
  track,
  isPlaying,
  onCoverClick,
  onOpenSongPicker,
}) => {
  return (
    <div className="w-full flex justify-center items-center py-3 px-4">
      {/* Outer Frosted Glass Floating Card - Exact aesthetic from screenshot */}
      <div
        onClick={onCoverClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            onCoverClick?.();
          }
        }}
        className={`group relative w-full max-w-[280px] sm:max-w-[310px] cursor-pointer rounded-[32px] p-3 transition-all duration-500 ease-out select-none
          backdrop-blur-2xl bg-white/[0.08] dark:bg-white/[0.06] border border-white/20
          shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7),inset_0_1px_1px_rgba(255,255,255,0.25)]
          ${isPlaying ? 'scale-[1.01] shadow-[0_30px_70px_-10px_rgba(249,115,22,0.25)]' : 'hover:scale-[1.008]'}`}
      >
        {/* Subtle glass reflection highlight */}
        <div className="absolute inset-0 rounded-[32px] bg-gradient-to-tr from-transparent via-white/[0.05] to-white/[0.12] pointer-events-none" />

        {/* Album Artwork Container */}
        <div className="relative aspect-square w-full rounded-[22px] overflow-hidden bg-black/40 shadow-inner">
          <img
            src={track.coverSrc}
            alt={track.title}
            referrerPolicy="no-referrer"
            className={`w-full h-full object-cover transition-transform duration-700 ease-out ${
              isPlaying ? 'scale-105' : 'group-hover:scale-102'
            }`}
          />

          {/* Vinyl subtle ripple highlight */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-white/10 pointer-events-none" />

          {/* Playing indicator ring */}
          {isPlaying && (
            <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-md border border-white/15">
              <span className="w-2 h-2 rounded-full bg-orange-500 animate-ping" />
              <span className="text-[11px] font-medium tracking-wider text-orange-200 uppercase font-mono">
                MO LIVE
              </span>
            </div>
          )}

          {/* Quick change hover pill */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenSongPicker?.();
            }}
            title="تبديل أو استدعاء أغنية"
            className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-[11px] font-medium text-white/90 hover:text-white hover:bg-orange-500/80 transition-all opacity-0 group-hover:opacity-100 flex items-center gap-1"
          >
            <span>تبديل</span>
            <span>⇄</span>
          </button>
        </div>

        {/* Card Subtitle & Title Text - Matches screenshot Lark Recording & 1328_260618 */}
        <div className="mt-3.5 mb-1.5 text-center flex flex-col items-center justify-center">
          <span className="text-xs sm:text-[13px] font-medium tracking-wide text-white/70">
            {track.badgeText || 'MO Music Recording'}
          </span>
          <h2 className="mt-0.5 text-lg sm:text-xl font-bold tracking-tight text-white drop-shadow-sm font-['Plus_Jakarta_Sans',sans-serif]">
            {track.title}
          </h2>
        </div>
      </div>
    </div>
  );
};

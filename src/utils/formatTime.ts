import { Chapter, Track } from '../types/music';

export function formatDuration(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  const totalSeconds = Math.floor(seconds);
  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;

  const pad = (n: number) => n.toString().padStart(2, '0');

  if (hrs > 0) {
    return `${hrs}:${pad(mins)}:${pad(secs)}`;
  }
  return `${pad(mins)}:${pad(secs)}`;
}

export function getCurrentChapter(track: Track, currentTime: number): Chapter | null {
  if (!track.chapters || track.chapters.length === 0) return null;
  const found = track.chapters.find(
    (c) => currentTime >= c.startTime && currentTime < c.endTime
  );
  return found || track.chapters[track.chapters.length - 1] || null;
}

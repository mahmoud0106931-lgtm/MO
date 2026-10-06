export type RepeatMode = 'off' | 'all' | 'one';

export interface Chapter {
  id: string;
  title: string;
  artist?: string;
  startTime: number; // in seconds
  endTime: number;   // in seconds
  description?: string;
}

export interface LyricLine {
  time: number; // in seconds
  text: string;
  translation?: string;
}

export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  badgeText: string; // e.g. "Lark Recording"
  duration: number; // in seconds (e.g. 4395 for 1:13:15)
  coverSrc: string;
  chapters: Chapter[];
  lyrics: LyricLine[];
  accentColor: string; // hex for glow and theme
  isCustomUpload?: boolean;
  category?: string; // e.g. "ريمكسات" | "طرب" | "هادئ" | "تسجيلاتي"
  audioUrl?: string; // Optional direct audio URL
  hasLyricsBadge?: boolean;
  isRecordingIcon?: boolean;
}

export interface EqualizerSettings {
  isEnabled: boolean;
  bass: number;     // 60Hz (-12 to 12 dB)
  lowMid: number;   // 250Hz (-12 to 12 dB)
  mid: number;      // 1000Hz (-12 to 12 dB)
  highMid: number;  // 4000Hz (-12 to 12 dB)
  treble: number;   // 12000Hz (-12 to 12 dB)
  preset: string;
}

import React, { useState, useEffect, useRef } from 'react';
import { INITIAL_TRACKS } from './data/tracks';
import { Track, Chapter, EqualizerSettings, RepeatMode } from './types/music';
import { audioEngine } from './services/audioEngine';
import { getCurrentChapter, formatDuration } from './utils/formatTime';
import { HeaderBar } from './components/HeaderBar';
import { FloatingCoverCard } from './components/FloatingCoverCard';
import { PlayerControls } from './components/PlayerControls';
import { LyricsModal } from './components/LyricsModal';
import { EqualizerModal } from './components/EqualizerModal';
import { ChaptersQueueDrawer } from './components/ChaptersQueueDrawer';
import { SleepTimerModal } from './components/SleepTimerModal';
import { OptionsMenu } from './components/OptionsMenu';
import { AudioVisualizerCanvas } from './components/AudioVisualizerCanvas';
import { SongPickerModal } from './components/SongPickerModal';
import { ChapterEditorModal } from './components/ChapterEditorModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import { saveAudioFileToDB, getAllStoredAudioFiles } from './services/audioStorage';
import {
  Music,
  Plus,
  Scissors,
  Sliders,
  CheckCircle2,
  Sparkles,
  Layers,
  Disc3,
  Search,
  MessageSquareQuote,
  Gauge,
  MapPin,
  Trash2,
  FolderDown,
  Smartphone,
} from 'lucide-react';

export default function App() {
  const [tracks, setTracks] = useState<Track[]>(() => {
    try {
      const saved = localStorage.getItem('mo_music_tracks');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Heal initial tracks that were previously saved with faulty 240s duration:
          return parsed.map((t: Track) => {
            const initialMatch = INITIAL_TRACKS.find((it) => it.id === t.id);
            if (initialMatch && (t.duration === 240 || !t.duration)) {
              return { ...t, duration: initialMatch.duration };
            }
            return t;
          });
        }
      }
    } catch {}
    return INITIAL_TRACKS;
  });
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(0);
  const currentTrack = tracks[currentTrackIndex] || tracks[0];

  // Playback state - Initialize at 1:02:59 (3779s) matching screenshot
  const [currentTime, setCurrentTime] = useState<number>(3779);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [duration, setDuration] = useState<number>(currentTrack.duration);
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);
  const [volume, setVolume] = useState<number>(0.85);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [likedTrackIds, setLikedTrackIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('mo_music_likes');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return new Set(parsed);
      }
    } catch {}
    return new Set();
  });
  const [isShuffle, setIsShuffle] = useState<boolean>(false);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('off');

  // Equalizer state
  const [eqSettings, setEqSettings] = useState<EqualizerSettings>(() => {
    try {
      const saved = localStorage.getItem('mo_music_eq');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed.isEnabled === 'boolean') return parsed;
      }
    } catch {}
    return {
      isEnabled: true,
      bass: 5,
      lowMid: 2,
      mid: 4,
      highMid: 3,
      treble: 5,
      preset: 'tarab',
    };
  });

  // UI & Modals state
  const [isLyricsOpen, setIsLyricsOpen] = useState<boolean>(false);
  const [isEqOpen, setIsEqOpen] = useState<boolean>(false);
  const [isQueueOpen, setIsQueueOpen] = useState<boolean>(false);
  const [isSleepTimerOpen, setIsSleepTimerOpen] = useState<boolean>(false);
  const [isOptionsOpen, setIsOptionsOpen] = useState<boolean>(false);
  const [isSongPickerOpen, setIsSongPickerOpen] = useState<boolean>(false);
  const [isChapterEditorOpen, setIsChapterEditorOpen] = useState<boolean>(false);

  // Screen layout mode (defaults to phone frame, toggles to wide studio console on desktop)
  const [isPhoneFrame, setIsPhoneFrame] = useState<boolean>(true);
  const [isVisualizerActive, setIsVisualizerActive] = useState<boolean>(true);

  // Sleep Timer state
  const [sleepTimerSeconds, setSleepTimerSeconds] = useState<number | null>(null);

  // Desktop sidebar search query
  const [desktopSearch, setDesktopSearch] = useState('');

  // Audio elements
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const progressTimerRef = useRef<number | null>(null);
  const liveLyricsRef = useRef<HTMLDivElement>(null);

  // Phone Music Auto-Import Refs & Toast Notification
  const autoImportInputRef = useRef<HTMLInputElement>(null);
  const folderImportInputRef = useRef<HTMLInputElement>(null);
  const [isImporting, setIsImporting] = useState<boolean>(false);
  const [importNotification, setImportNotification] = useState<string | null>(null);

  // Automatically load all stored phone songs from IndexedDB on startup
  useEffect(() => {
    async function loadPhoneTracks() {
      try {
        const storedItems = await getAllStoredAudioFiles();
        if (storedItems && storedItems.length > 0) {
          const restoredTracks: Track[] = storedItems.map((item) => {
            const audioUrl = URL.createObjectURL(item.blob);
            return {
              id: item.id,
              title: item.title,
              artist: item.artist || 'ملف صوتي من الهاتف',
              album: 'أغاني الهاتف المستوردة',
              badgeText: 'Phone Audio',
              category: 'ملفاتي',
              duration: item.duration || 180,
              coverSrc: INITIAL_TRACKS[0].coverSrc,
              accentColor: '#f97316',
              chapters: [],
              lyrics: [],
              audioUrl,
              isCustomUpload: true,
            };
          });

          setTracks((prev) => {
            const existingIds = new Set(prev.map((t) => t.id));
            const newToAdd = restoredTracks.filter((t) => !existingIds.has(t.id));
            if (newToAdd.length === 0) return prev;
            return [...newToAdd, ...prev];
          });
        }
      } catch (err) {
        console.warn('Error restoring phone tracks from IndexedDB:', err);
      }
    }

    loadPhoneTracks();
  }, []);

  // Sync duration with track change
  useEffect(() => {
    setDuration(currentTrack.duration);
  }, [currentTrack]);

  // Handle Equalizer changes in audio engine and persist
  useEffect(() => {
    audioEngine.updateEQ(eqSettings, eqSettings.isEnabled);
    try {
      localStorage.setItem('mo_music_eq', JSON.stringify(eqSettings));
    } catch {}
  }, [eqSettings]);

  // Persist tracks metadata and chapters offline
  useEffect(() => {
    try {
      const serializable = tracks.map((t) => ({
        ...t,
        audioUrl: t.isCustomUpload ? undefined : t.audioUrl,
      }));
      localStorage.setItem('mo_music_tracks', JSON.stringify(serializable));
    } catch {}
  }, [tracks]);

  // Persist liked songs offline
  useEffect(() => {
    try {
      localStorage.setItem('mo_music_likes', JSON.stringify(Array.from(likedTrackIds)));
    } catch {}
  }, [likedTrackIds]);

  // Play/Pause handler
  const handlePlayPause = () => {
    audioEngine.resumeContext();
    if (isPlaying) {
      setIsPlaying(false);
      audioEngine.stopSynthMusic();
      if (audioElementRef.current && (currentTrack.isCustomUpload || currentTrack.audioUrl)) {
        audioElementRef.current.pause();
      }
    } else {
      setIsPlaying(true);
      if ((currentTrack.isCustomUpload || currentTrack.audioUrl) && audioElementRef.current) {
        audioElementRef.current.play().catch(() => {});
      } else {
        audioEngine.startSynthMusic(105);
      }
    }
  };

  // Playback timer progression
  useEffect(() => {
    if (isPlaying) {
      progressTimerRef.current = window.setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= duration) {
            handleNextTrack();
            return 0;
          }
          return prev + 1 * playbackRate;
        });
      }, 1000);
    } else if (progressTimerRef.current) {
      clearInterval(progressTimerRef.current);
    }

    return () => {
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    };
  }, [isPlaying, duration, playbackRate]);

  // Sleep Timer countdown
  useEffect(() => {
    if (sleepTimerSeconds === null) return;

    if (sleepTimerSeconds <= 0) {
      setIsPlaying(false);
      audioEngine.stopSynthMusic();
      if (audioElementRef.current) audioElementRef.current.pause();
      setSleepTimerSeconds(null);
      return;
    }

    const timer = setInterval(() => {
      setSleepTimerSeconds((prev) => (prev !== null && prev > 0 ? prev - 1 : null));
    }, 1000);

    return () => clearInterval(timer);
  }, [sleepTimerSeconds]);

  // Switch Track directly
  const handleSelectTrack = (track: Track) => {
    const idx = tracks.findIndex((t) => t.id === track.id);
    if (idx !== -1) {
      setCurrentTrackIndex(idx);
    } else {
      setTracks((prev) => [track, ...prev]);
      setCurrentTrackIndex(0);
    }
    setCurrentTime(0);
    setIsPlaying(true);

    if (track.audioUrl || track.isCustomUpload) {
      if (audioElementRef.current && track.audioUrl) {
        audioElementRef.current.src = track.audioUrl;
        audioEngine.attachAudioElement(audioElementRef.current);
        audioElementRef.current.play().catch(() => {});
      }
    } else {
      audioEngine.resumeContext();
      audioEngine.startSynthMusic(105);
    }
  };

  // Toggle shuffle & repeat
  const handleToggleShuffle = () => {
    setIsShuffle((prev) => !prev);
  };

  const handleToggleRepeat = () => {
    setRepeatMode((prev) => {
      if (prev === 'off') return 'all';
      if (prev === 'all') return 'one';
      return 'off';
    });
  };

  const handleCycleSpeed = () => {
    const speeds = [0.75, 1.0, 1.25, 1.5, 2.0];
    const currentIndex = speeds.indexOf(playbackRate);
    const nextSpeed = speeds[(currentIndex + 1) % speeds.length];
    setPlaybackRate(nextSpeed);
    if (audioElementRef.current) {
      audioElementRef.current.playbackRate = nextSpeed;
    }
  };

  // Next / Previous Track & Chapter
  const handleNextTrack = () => {
    if (repeatMode === 'one') {
      setCurrentTime(0);
      return;
    }

    const currentChapter = getCurrentChapter(currentTrack, currentTime);
    if (currentChapter) {
      const currIdx = currentTrack.chapters.findIndex((c) => c.id === currentChapter.id);
      if (currIdx !== -1 && currIdx < currentTrack.chapters.length - 1) {
        const nextChap = currentTrack.chapters[currIdx + 1];
        setCurrentTime(nextChap.startTime);
        return;
      }
    }

    // Shuffle track selection
    if (isShuffle && tracks.length > 1) {
      let randIdx = currentTrackIndex;
      while (randIdx === currentTrackIndex) {
        randIdx = Math.floor(Math.random() * tracks.length);
      }
      setCurrentTrackIndex(randIdx);
      setCurrentTime(0);
      return;
    }

    if (currentTrackIndex === tracks.length - 1 && repeatMode === 'off') {
      setIsPlaying(false);
      return;
    }

    const nextIdx = (currentTrackIndex + 1) % tracks.length;
    setCurrentTrackIndex(nextIdx);
    setCurrentTime(0);
  };

  const handlePrevTrack = () => {
    const currentChapter = getCurrentChapter(currentTrack, currentTime);
    if (currentChapter && currentTime - currentChapter.startTime > 4) {
      setCurrentTime(currentChapter.startTime);
      return;
    }
    if (currentChapter) {
      const currIdx = currentTrack.chapters.findIndex((c) => c.id === currentChapter.id);
      if (currIdx > 0) {
        const prevChap = currentTrack.chapters[currIdx - 1];
        setCurrentTime(prevChap.startTime);
        return;
      }
    }
    const prevIdx = (currentTrackIndex - 1 + tracks.length) % tracks.length;
    setCurrentTrackIndex(prevIdx);
    setCurrentTime(0);
  };

  // Seek handler
  const handleSeek = (time: number) => {
    setCurrentTime(time);
    if (audioElementRef.current && (currentTrack.isCustomUpload || currentTrack.audioUrl)) {
      audioElementRef.current.currentTime = time;
    }
  };

  // Toggle Like track
  const handleToggleLike = () => {
    setLikedTrackIds((prev) => {
      const next = new Set(prev);
      if (next.has(currentTrack.id)) {
        next.delete(currentTrack.id);
      } else {
        next.add(currentTrack.id);
      }
      return next;
    });
  };

  // Direct hand chapter placement
  const handleAddChapterByHand = (title: string, startTime: number) => {
    const newChap: Chapter = {
      id: `ch-hand-${Date.now()}`,
      title,
      startTime: Math.round(startTime),
      endTime: duration,
      artist: currentTrack.artist,
    };

    const updated = [...currentTrack.chapters, newChap].sort(
      (a, b) => a.startTime - b.startTime
    );

    for (let i = 0; i < updated.length; i++) {
      if (i < updated.length - 1) {
        updated[i].endTime = updated[i + 1].startTime;
      } else {
        updated[i].endTime = duration;
      }
    }

    const newTracks = tracks.map((t) =>
      t.id === currentTrack.id ? { ...t, chapters: updated } : t
    );
    setTracks(newTracks);
  };

  const handleUpdateChapterByHand = (chapterId: string, newTitle: string, newStartTime: number) => {
    const updated = currentTrack.chapters
      .map((c) =>
        c.id === chapterId ? { ...c, title: newTitle, startTime: Math.round(newStartTime) } : c
      )
      .sort((a, b) => a.startTime - b.startTime);

    for (let i = 0; i < updated.length; i++) {
      if (i < updated.length - 1) {
        updated[i].endTime = updated[i + 1].startTime;
      } else {
        updated[i].endTime = duration;
      }
    }

    const newTracks = tracks.map((t) =>
      t.id === currentTrack.id ? { ...t, chapters: updated } : t
    );
    setTracks(newTracks);
  };

  const handleDeleteChapterByHand = (chapterId: string) => {
    const remaining = currentTrack.chapters.filter((c) => c.id !== chapterId);
    for (let i = 0; i < remaining.length; i++) {
      if (i < remaining.length - 1) {
        remaining[i].endTime = remaining[i + 1].startTime;
      } else {
        remaining[i].endTime = duration;
      }
    }
    const newTracks = tracks.map((t) =>
      t.id === currentTrack.id ? { ...t, chapters: remaining } : t
    );
    setTracks(newTracks);
  };

  const handleClearAllChapters = () => {
    const newTracks = tracks.map((t) =>
      t.id === currentTrack.id ? { ...t, chapters: [] } : t
    );
    setTracks(newTracks);
  };

  const handleChapterSelect = (chapter: Chapter) => {
    handleSeek(chapter.startTime);
    if (!isPlaying) {
      handlePlayPause();
    }
  };

  const handleSaveChapters = (newChapters: Chapter[]) => {
    const updatedTracks = tracks.map((t) =>
      t.id === currentTrack.id ? { ...t, chapters: newChapters } : t
    );
    setTracks(updatedTracks);
  };

  const handleVolumeChange = (val: number) => {
    setVolume(val);
    audioEngine.setVolume(val);
    if (audioElementRef.current) {
      audioElementRef.current.volume = val;
    }
    if (val > 0 && isMuted) {
      setIsMuted(false);
      audioEngine.setMute(false);
    }
  };

  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    audioEngine.setMute(nextMuted);
    if (audioElementRef.current) {
      audioElementRef.current.volume = nextMuted ? 0 : volume;
    }
  };

  // Helper to extract true duration of any audio file or URL
  const detectAudioDuration = (source: File | Blob | string): Promise<number> => {
    return new Promise((resolve) => {
      const url = typeof source === 'string' ? source : URL.createObjectURL(source);
      const audio = new Audio();
      audio.preload = 'metadata';

      let resolved = false;
      const done = (dur: number) => {
        if (!resolved) {
          resolved = true;
          resolve(dur > 0 ? dur : 0);
        }
      };

      audio.onloadedmetadata = () => {
        if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration) && audio.duration > 0) {
          done(Math.round(audio.duration));
        } else {
          done(0);
        }
      };

      audio.oncanplaythrough = () => {
        if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration) && audio.duration > 0) {
          done(Math.round(audio.duration));
        }
      };

      audio.onerror = () => done(0);
      setTimeout(() => done(0), 4000);
      audio.src = url;
    });
  };

  // Upload custom song files (from phone or desktop) with TRUE duration & IndexedDB persistence
  const handleUploadFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const newTracksList: Track[] = [];

    for (let idx = 0; idx < fileArray.length; idx++) {
      const file = fileArray[idx];
      const url = URL.createObjectURL(file);
      const cleanName = file.name.replace(/\.[^/.]+$/, '');
      const detectedDur = await detectAudioDuration(file);
      const dur = detectedDur > 0 ? detectedDur : currentTrack.duration;
      const trackId = `custom-file-${Date.now()}-${idx}`;

      // Save to IndexedDB permanently so songs persist offline and on restart
      await saveAudioFileToDB({
        id: trackId,
        title: cleanName,
        artist: 'ملف صوتي من الهاتف',
        duration: dur,
        blob: file,
        addedAt: Date.now(),
      });

      newTracksList.push({
        id: trackId,
        title: cleanName,
        artist: 'ملف صوتي مستورد',
        album: 'ملفاتي الصوتية',
        badgeText: 'Phone Audio',
        category: 'ملفاتي',
        duration: dur,
        coverSrc: currentTrack.coverSrc,
        accentColor: '#f97316',
        chapters: [], // Clean start without premade markers
        lyrics: [],
        audioUrl: url,
        isCustomUpload: true,
      });
    }

    if (newTracksList.length > 0) {
      setTracks((prev) => [...newTracksList, ...prev]);
      setCurrentTrackIndex(0);
      setCurrentTime(0);
      setDuration(newTracksList[0].duration);
      setIsPlaying(true);

      if (audioElementRef.current && newTracksList[0].audioUrl) {
        audioElementRef.current.src = newTracksList[0].audioUrl;
        audioEngine.attachAudioElement(audioElementRef.current);
        audioElementRef.current.play().catch(() => {});
      }

      setImportNotification(`تم استيراد ${newTracksList.length} أغنية من هاتفك بنجاح وحفظها تلقائياً 🎵`);
      setTimeout(() => setImportNotification(null), 5000);
    }
  };

  // Handler for phone auto-import input change
  const handleAutoImportPhoneMusic = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setIsImporting(true);
    await handleUploadFiles(files);
    setIsImporting(false);
    e.target.value = '';
  };

  // Automated Phone Music Scanner & Importer
  const triggerPhoneImport = async () => {
    // 1. Try modern Web File System Access API if supported (Chrome Android / Desktop)
    if (typeof window !== 'undefined' && 'showOpenFilePicker' in window) {
      try {
        const fileHandles = await (window as any).showOpenFilePicker({
          multiple: true,
          types: [
            {
              description: 'أغاني وملفات الهاتف الصوتية',
              accept: {
                'audio/*': ['.mp3', '.m4a', '.wav', '.flac', '.aac', '.ogg', '.opus', '.wma', '.mp4']
              }
            }
          ]
        });
        if (fileHandles && fileHandles.length > 0) {
          setIsImporting(true);
          const filePromises = fileHandles.map((handle: any) => handle.getFile());
          const files = await Promise.all(filePromises);
          await handleUploadFiles(files);
          setIsImporting(false);
          return;
        }
      } catch (err: any) {
        if (err.name === 'AbortError') return;
      }
    }
    // 2. Standard Universal Fallback for phones
    autoImportInputRef.current?.click();
  };

  const handleAddFromUrl = async (url: string, title: string, artist?: string) => {
    const detectedDur = await detectAudioDuration(url);
    const dur = detectedDur > 0 ? detectedDur : 300;
    const newTrack: Track = {
      id: `url-track-${Date.now()}`,
      title: title || 'بث صوتي عبر رابط',
      artist: artist || 'مصدر خارجي',
      album: 'بث صوتي مباشر',
      badgeText: 'Web Stream',
      category: 'ملفاتي',
      duration: dur,
      coverSrc: currentTrack.coverSrc,
      accentColor: '#f97316',
      chapters: [],
      lyrics: [],
      audioUrl: url,
      isCustomUpload: true,
    };

    setTracks((prev) => [newTrack, ...prev]);
    setCurrentTrackIndex(0);
    setCurrentTime(0);
    setDuration(dur);
    setIsPlaying(true);

    if (audioElementRef.current) {
      audioElementRef.current.src = url;
      audioEngine.attachAudioElement(audioElementRef.current);
      audioElementRef.current.play().catch(() => {});
    }
  };

  const handleAddRecordedAudio = async (blob: Blob, title: string) => {
    const objectUrl = URL.createObjectURL(blob);
    const detectedDur = await detectAudioDuration(blob);
    const dur = detectedDur > 0 ? detectedDur : 60;
    const newTrack: Track = {
      id: `rec-${Date.now()}`,
      title,
      artist: 'تسجيل MO الصوتي',
      album: 'تسجيلاتي الخاصة',
      badgeText: 'MO Live Recording',
      category: 'تسجيلاتي',
      duration: dur,
      coverSrc: currentTrack.coverSrc,
      accentColor: '#f97316',
      chapters: [], // EMPTY: User sets chapters by hand!
      lyrics: [{ time: 0, text: `تسجيل صوتي خاص: ${title}` }],
      audioUrl: objectUrl,
      isCustomUpload: true,
    };

    setTracks((prev) => [newTrack, ...prev]);
    setCurrentTrackIndex(0);
    setCurrentTime(0);
    setDuration(dur);
    setIsPlaying(true);

    if (audioElementRef.current) {
      audioElementRef.current.src = objectUrl;
      audioEngine.attachAudioElement(audioElementRef.current);
      audioElementRef.current.play().catch(() => {});
    }
  };

  const isLiked = likedTrackIds.has(currentTrack.id);
  const activeChapter = getCurrentChapter(currentTrack, currentTime);

  // Active lyric line for side panel
  let activeLyricIndex = -1;
  for (let i = 0; i < currentTrack.lyrics.length; i++) {
    if (currentTime >= currentTrack.lyrics[i].time) {
      activeLyricIndex = i;
    } else {
      break;
    }
  }

  // Handle dynamic metadata sync when audio loads
  const handleAudioMetadataLoaded = (e: React.SyntheticEvent<HTMLAudioElement>) => {
    const audio = e.currentTarget;
    if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration) && audio.duration > 0) {
      const realDur = Math.round(audio.duration);
      setDuration(realDur);
      setTracks((prev) =>
        prev.map((t) => (t.id === currentTrack.id ? { ...t, duration: realDur } : t))
      );
    }
  };

  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={async (e) => {
        e.preventDefault();
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
          setIsImporting(true);
          await handleUploadFiles(e.dataTransfer.files);
          setIsImporting(false);
        }
      }}
      className="min-h-screen w-full bg-[#0c0b11] text-white flex flex-col items-center justify-center relative overflow-x-hidden font-['Cairo',sans-serif]"
    >
      {/* Hidden audio element for custom user audio & URLs with real metadata sync */}
      <audio
        ref={audioElementRef}
        onTimeUpdate={(e) => {
          if (currentTrack.isCustomUpload || currentTrack.audioUrl) {
            setCurrentTime((e.target as HTMLAudioElement).currentTime);
          }
        }}
        onLoadedMetadata={handleAudioMetadataLoaded}
        onDurationChange={handleAudioMetadataLoaded}
        onCanPlay={handleAudioMetadataLoaded}
        onEnded={handleNextTrack}
        className="hidden"
      />

      {/* Hidden file inputs for auto-importing phone music */}
      <input
        ref={autoImportInputRef}
        type="file"
        multiple
        accept="audio/*,.mp3,.m4a,.wav,.flac,.aac,.ogg,.opus,.wma,.m4b"
        onChange={handleAutoImportPhoneMusic}
        className="hidden"
      />
      <input
        ref={folderImportInputRef}
        type="file"
        // @ts-ignore
        webkitdirectory=""
        directory=""
        multiple
        accept="audio/*"
        onChange={handleAutoImportPhoneMusic}
        className="hidden"
      />

      {/* Import Toast Notification */}
      {importNotification && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 text-black font-bold text-xs shadow-2xl flex items-center gap-2 animate-bounce select-none border border-amber-300">
          <CheckCircle2 className="w-4 h-4 text-black shrink-0" />
          <span>{importNotification}</span>
        </div>
      )}

      {/* Importing Progress Overlay */}
      {isImporting && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-6 select-none text-center">
          <div className="w-16 h-16 rounded-2xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-400 mb-4 animate-spin">
            <Disc3 className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-white mb-1">جاري استيراد أغاني هاتفك وحفظها...</h3>
          <p className="text-xs text-white/60 max-w-xs">يتم قراءة الملفات، احتساب الفترات الزمنية وتخزينها محلياً لتعمل بدون إنترنت</p>
        </div>
      )}

      {/* Ambient Dreamy Background Glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full blur-[160px] opacity-40 transition-colors duration-1000"
          style={{
            background: `radial-gradient(circle, ${currentTrack.accentColor} 0%, #7c3aed 50%, transparent 75%)`,
          }}
        />
        <div className="absolute top-1/4 -right-20 w-96 h-96 rounded-full bg-purple-700/20 blur-[120px]" />
        <div className="absolute bottom-10 -left-20 w-96 h-96 rounded-full bg-orange-600/20 blur-[130px]" />
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]" />
      </div>

      {/* Offline Status & Connectivity Indicator */}
      <OfflineIndicator />

      {/* Header Bar */}
      <HeaderBar
        isPhoneFrame={isPhoneFrame}
        onTogglePhoneFrame={() => setIsPhoneFrame(!isPhoneFrame)}
        onToggleVisualizer={() => setIsVisualizerActive(!isVisualizerActive)}
        isVisualizerActive={isVisualizerActive}
        onOpenSongPicker={() => setIsSongPickerOpen(true)}
        onOpenChapterEditor={() => setIsChapterEditorOpen(true)}
        onAutoImportPhoneMusic={triggerPhoneImport}
      />

      {/* Main Responsive Viewport Container */}
      <main className="w-full max-w-7xl mx-auto px-1 sm:px-4 lg:px-6 py-1 sm:py-2 relative z-10 flex-1 flex items-center justify-center">
        {/* VIEW 1: Phone Application Mode (Adapts to 100% of mobile screens & centered luxury console on desktop) */}
        {isPhoneFrame ? (
          <div className="w-full max-w-[480px] mx-auto min-h-screen sm:min-h-[850px] sm:max-h-[94vh] rounded-none sm:rounded-[44px] border-none sm:border sm:border-white/15 sm:shadow-[0_25px_80px_rgba(0,0,0,0.9),0_0_50px_rgba(249,115,22,0.15)] overflow-hidden bg-black/50 backdrop-blur-3xl flex flex-col justify-between">
            {/* Quick Song Switcher Ribbon */}
            <div className="w-full px-3.5 pt-2.5 pb-1 select-none">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                <button
                  onClick={triggerPhoneImport}
                  className="flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-black text-[11px] font-bold shrink-0 shadow-sm active:scale-95 transition-all"
                  title="استيراد جميع أغاني الهاتف تلقائياً"
                >
                  <FolderDown className="w-3.5 h-3.5 text-black" />
                  <span>أغاني هاتفي</span>
                </button>
                <button
                  onClick={() => setIsSongPickerOpen(true)}
                  className="flex items-center gap-1 px-3 py-1 rounded-full bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 text-[11px] font-bold shrink-0 border border-orange-500/40 transition-all active:scale-95"
                >
                  <Plus className="w-3 h-3" />
                  <span>استدعاء</span>
                </button>
                <button
                  onClick={() => setIsChapterEditorOpen(true)}
                  className="flex items-center gap-1 px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-orange-300 text-[11px] font-bold shrink-0 border border-white/10 transition-all active:scale-95"
                >
                  <Scissors className="w-3 h-3" />
                  <span>تقسيم</span>
                </button>

                {tracks.map((t, idx) => {
                  const isSelected = idx === currentTrackIndex;
                  return (
                    <button
                      key={t.id}
                      onClick={() => handleSelectTrack(t)}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap transition-all shrink-0 ${
                        isSelected
                          ? 'bg-white/20 text-white border border-white/30 shadow-sm'
                          : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white border border-transparent'
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-orange-400 shrink-0" />
                      <span className="truncate max-w-[110px]">{t.title}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Auto-Import Phone Prompt (Shows when no custom phone songs imported yet) */}
            {tracks.filter((t) => t.isCustomUpload).length === 0 && (
              <div className="mx-3 my-1 p-2.5 rounded-2xl bg-gradient-to-r from-orange-500/20 via-amber-500/15 to-purple-500/15 border border-orange-500/30 flex items-center justify-between gap-2 shadow-md shrink-0 select-none">
                <div className="flex items-center gap-2 min-w-0">
                  <Smartphone className="w-4 h-4 text-orange-400 shrink-0 animate-bounce" />
                  <div className="text-right truncate">
                    <h4 className="text-[11px] font-bold text-white truncate">استيراد كل أغاني الهاتف</h4>
                    <p className="text-[10px] text-white/60 truncate">بشكل تلقائي وبنقرة واحدة</p>
                  </div>
                </div>
                <button
                  onClick={triggerPhoneImport}
                  className="px-2.5 py-1 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-[11px] font-bold shrink-0 transition-all active:scale-95 flex items-center gap-1 shadow-sm"
                >
                  <FolderDown className="w-3 h-3" />
                  <span>استيراد الآن</span>
                </button>
              </div>
            )}

            {/* Center Section: Iconic Floating Cover Card */}
            <div className="flex-1 flex flex-col justify-center items-center py-1">
              <FloatingCoverCard
                track={currentTrack}
                isPlaying={isPlaying}
                onCoverClick={() => setIsLyricsOpen(true)}
                onOpenSongPicker={() => setIsSongPickerOpen(true)}
              />

              {isVisualizerActive && (
                <div className="w-full mt-1 transition-opacity duration-300">
                  <AudioVisualizerCanvas
                    isPlaying={isPlaying}
                    accentColor={currentTrack.accentColor}
                  />
                </div>
              )}
            </div>

            {/* Bottom Player Panel */}
            <PlayerControls
              track={currentTrack}
              isPlaying={isPlaying}
              isLiked={isLiked}
              currentTime={currentTime}
              duration={duration}
              isEqActive={eqSettings.isEnabled}
              isMuted={isMuted}
              volume={volume}
              isShuffle={isShuffle}
              repeatMode={repeatMode}
              playbackRate={playbackRate}
              onPlayPause={handlePlayPause}
              onPrev={handlePrevTrack}
              onNext={handleNextTrack}
              onSeek={handleSeek}
              onToggleLike={handleToggleLike}
              onToggleShuffle={handleToggleShuffle}
              onToggleRepeat={handleToggleRepeat}
              onCycleSpeed={handleCycleSpeed}
              onOpenLyrics={() => setIsLyricsOpen(true)}
              onOpenEQ={() => setIsEqOpen(true)}
              onOpenQueue={() => setIsQueueOpen(true)}
              onOpenSongPicker={() => setIsSongPickerOpen(true)}
              onOpenChapterEditor={() => setIsChapterEditorOpen(true)}
              onOpenSleepTimer={() => setIsSleepTimerOpen(true)}
              onOpenOptions={() => setIsOptionsOpen(true)}
              onChapterSelect={handleChapterSelect}
              onToggleMute={handleToggleMute}
              onVolumeChange={handleVolumeChange}
              onAddChapterByHand={handleAddChapterByHand}
              onUpdateChapterByHand={handleUpdateChapterByHand}
              onDeleteChapterByHand={handleDeleteChapterByHand}
            />

            {/* Mobile Bottom Navigation Dock (شريط التنقل السريع لتطبيق الهاتف) */}
            <div className="w-full px-4 py-2 border-t border-white/10 bg-black/60 backdrop-blur-xl flex items-center justify-around text-[10px] text-white/70 select-none shrink-0 font-['Cairo',sans-serif]">
              <button
                onClick={triggerPhoneImport}
                className="flex flex-col items-center gap-0.5 hover:text-orange-400 active:scale-95 transition-all text-orange-300"
                title="استيراد جميع أغاني الهاتف تلقائياً"
              >
                <FolderDown className="w-4 h-4 text-orange-400" />
                <span className="font-bold">أغاني الهاتف</span>
              </button>
              <button
                onClick={() => setIsSongPickerOpen(true)}
                className="flex flex-col items-center gap-0.5 hover:text-white active:scale-95 transition-all"
                title="مكتبة الأغاني"
              >
                <Music className="w-4 h-4 text-white/70" />
                <span>المكتبة</span>
              </button>
              <button
                onClick={() => setIsChapterEditorOpen(true)}
                className="flex flex-col items-center gap-0.5 hover:text-white active:scale-95 transition-all"
                title="تقسيم وتحديد الفصول يدوياً"
              >
                <Scissors className="w-4 h-4 text-orange-300" />
                <span>الفصول</span>
              </button>
              <button
                onClick={() => setIsEqOpen(true)}
                className="flex flex-col items-center gap-0.5 hover:text-white active:scale-95 transition-all"
                title="المعادل الصوتي"
              >
                <Sliders className="w-4 h-4 text-white/70" />
                <span>المعادل</span>
              </button>
              <button
                onClick={() => setIsLyricsOpen(true)}
                className="flex flex-col items-center gap-0.5 hover:text-white active:scale-95 transition-all"
                title="الكلمات المزامنة"
              >
                <MessageSquareQuote className="w-4 h-4 text-white/70" />
                <span>الكلمات</span>
              </button>
            </div>
          </div>
        ) : (
          /* VIEW 2: Wide Multi-Screen Studio Console (Desktop & Tablet Optimized) */
          <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch py-3">
            {/* RIGHT COLUMN (lg:col-span-3): Music Library & Chapters Studio */}
            <div className="hidden lg:flex lg:col-span-3 flex-col glass-panel rounded-3xl p-5 border border-white/10 h-[740px]">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <Disc3 className="w-5 h-5 text-orange-400" />
                  <h3 className="text-sm font-bold text-white">مكتبة واستدعاء الأغاني</h3>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={triggerPhoneImport}
                    className="p-1.5 rounded-lg bg-orange-500/20 text-orange-400 hover:bg-orange-500 hover:text-white transition-all"
                    title="استيراد أغاني الهاتف تلقائياً"
                  >
                    <FolderDown className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setIsSongPickerOpen(true)}
                    className="p-1.5 rounded-lg bg-orange-500/20 text-orange-400 hover:bg-orange-500 hover:text-white transition-all"
                    title="استدعاء ملفات جديدة"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Quick Search */}
              <div className="relative my-3">
                <input
                  type="text"
                  placeholder="ابحث عن أغنية أو فنان..."
                  value={desktopSearch}
                  onChange={(e) => setDesktopSearch(e.target.value)}
                  className="w-full h-9 pl-3 pr-8 rounded-xl bg-white/10 border border-white/10 text-xs text-white placeholder-white/40 focus:outline-none focus:border-orange-500 text-right"
                />
                <Search className="w-3.5 h-3.5 text-white/40 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Tracks List */}
              <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                {tracks
                  .filter((t) => t.title.includes(desktopSearch) || t.artist.includes(desktopSearch))
                  .map((t, idx) => {
                    const isSelected = idx === currentTrackIndex;
                    return (
                      <div
                        key={t.id}
                        onClick={() => handleSelectTrack(t)}
                        className={`p-2.5 rounded-xl cursor-pointer transition-all flex items-center justify-between border ${
                          isSelected
                            ? 'bg-orange-500/20 border-orange-500/40 text-white'
                            : 'bg-white/[0.03] border-white/5 hover:bg-white/10 text-white/70'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <img
                            src={t.coverSrc}
                            alt={t.title}
                            className="w-9 h-9 rounded-lg object-cover shrink-0"
                          />
                          <div className="truncate text-right">
                            <h4
                              className={`text-xs font-bold truncate ${
                                isSelected ? 'text-orange-300' : 'text-white'
                              }`}
                            >
                              {t.title}
                            </h4>
                            <p className="text-[10px] text-white/50 truncate">{t.artist}</p>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono text-white/40 tabular-nums shrink-0">
                          {formatDuration(t.duration)}
                        </span>
                      </div>
                    );
                  })}
              </div>

              {/* Chapters & Studio Splitter Button */}
              <div className="pt-3 border-t border-white/10 shrink-0 space-y-2">
                <button
                  onClick={() => handleAddChapterByHand(`مقطع ${currentTrack.chapters.length + 1}`, currentTime)}
                  className="w-full py-2.5 px-3 rounded-2xl bg-orange-500/20 hover:bg-orange-500 text-orange-300 hover:text-white border border-orange-500/40 text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm active:scale-95"
                >
                  <MapPin className="w-4 h-4" />
                  <span>📍 حدد مقطع بيدك عند [{formatDuration(currentTime)}]</span>
                </button>
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsChapterEditorOpen(true)}
                    className="flex-1 py-2 px-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
                  >
                    <Scissors className="w-3.5 h-3.5" />
                    <span>تعديل الفصول</span>
                  </button>
                  {currentTrack.chapters.length > 0 && (
                    <button
                      onClick={handleClearAllChapters}
                      title="مسح جميع الفصول والبدء من جديد بيدك"
                      className="py-2 px-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-semibold transition-all"
                    >
                      مسح الكل
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* CENTER COLUMN (lg:col-span-6): Core Music Player Glass Console */}
            <div className="lg:col-span-6 flex flex-col justify-between items-center glass-panel rounded-3xl p-5 border border-white/15 shadow-2xl relative overflow-hidden">
              {/* Top Quick Ribbon on Medium screens */}
              <div className="w-full flex items-center justify-between pb-2 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-300 font-mono text-[10px] font-bold">
                    HD STUDIO 320k
                  </span>
                  <span className="text-xs text-white/60">
                    {currentTrack.chapters.length} فصول زمنية
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleAddChapterByHand(`مقطع ${currentTrack.chapters.length + 1}`, currentTime)}
                    className="px-2.5 py-1 rounded-full bg-orange-500/25 hover:bg-orange-500 text-orange-300 hover:text-white text-xs font-bold transition-all flex items-center gap-1 border border-orange-500/30"
                  >
                    <MapPin className="w-3 h-3" />
                    <span>+ حدد بيدك</span>
                  </button>
                  <button
                    onClick={() => setIsChapterEditorOpen(true)}
                    className="px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-all flex items-center gap-1"
                  >
                    <Scissors className="w-3.5 h-3.5" />
                    <span>تقسيم</span>
                  </button>
                  <button
                    onClick={() => setIsSongPickerOpen(true)}
                    className="px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-all flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>استدعاء</span>
                  </button>
                </div>
              </div>

              {/* Iconic Floating Cover Card */}
              <div className="py-2 flex flex-col items-center justify-center">
                <FloatingCoverCard
                  track={currentTrack}
                  isPlaying={isPlaying}
                  onCoverClick={() => setIsLyricsOpen(true)}
                  onOpenSongPicker={() => setIsSongPickerOpen(true)}
                />

                {isVisualizerActive && (
                  <div className="w-full mt-1">
                    <AudioVisualizerCanvas
                      isPlaying={isPlaying}
                      accentColor={currentTrack.accentColor}
                    />
                  </div>
                )}
              </div>

              {/* Player Controls & Chapter Seek Bar */}
              <div className="w-full">
                <PlayerControls
                  track={currentTrack}
                  isPlaying={isPlaying}
                  isLiked={isLiked}
                  currentTime={currentTime}
                  duration={duration}
                  isEqActive={eqSettings.isEnabled}
                  isMuted={isMuted}
                  volume={volume}
                  isShuffle={isShuffle}
                  repeatMode={repeatMode}
                  playbackRate={playbackRate}
                  onPlayPause={handlePlayPause}
                  onPrev={handlePrevTrack}
                  onNext={handleNextTrack}
                  onSeek={handleSeek}
                  onToggleLike={handleToggleLike}
                  onToggleShuffle={handleToggleShuffle}
                  onToggleRepeat={handleToggleRepeat}
                  onCycleSpeed={handleCycleSpeed}
                  onOpenLyrics={() => setIsLyricsOpen(true)}
                  onOpenEQ={() => setIsEqOpen(true)}
                  onOpenQueue={() => setIsQueueOpen(true)}
                  onOpenSongPicker={() => setIsSongPickerOpen(true)}
                  onOpenChapterEditor={() => setIsChapterEditorOpen(true)}
                  onOpenSleepTimer={() => setIsSleepTimerOpen(true)}
                  onOpenOptions={() => setIsOptionsOpen(true)}
                  onChapterSelect={handleChapterSelect}
                  onToggleMute={handleToggleMute}
                  onVolumeChange={handleVolumeChange}
                  onAddChapterByHand={handleAddChapterByHand}
                  onUpdateChapterByHand={handleUpdateChapterByHand}
                  onDeleteChapterByHand={handleDeleteChapterByHand}
                />
              </div>
            </div>

            {/* LEFT COLUMN (lg:col-span-3): Live Synced Lyrics & Equalizer Rack */}
            <div className="hidden lg:flex lg:col-span-3 flex-col glass-panel rounded-3xl p-5 border border-white/10 h-[740px]">
              {/* Lyrics Header */}
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <MessageSquareQuote className="w-5 h-5 text-orange-400" />
                  <h3 className="text-sm font-bold text-white">الكلمات المزامنة</h3>
                </div>
                <button
                  onClick={() => setIsLyricsOpen(true)}
                  className="text-[11px] text-orange-400 hover:text-orange-300 font-semibold"
                >
                  تكبير
                </button>
              </div>

              {/* Live Lyrics Auto-scroll */}
              <div
                ref={liveLyricsRef}
                className="flex-1 overflow-y-auto py-4 space-y-4 text-center select-none"
              >
                {currentTrack.lyrics.length > 0 ? (
                  currentTrack.lyrics.map((line, idx) => {
                    const isActive = idx === activeLyricIndex;
                    return (
                      <div
                        key={idx}
                        onClick={() => handleSeek(line.time)}
                        className={`p-2 rounded-xl transition-all cursor-pointer ${
                          isActive
                            ? 'bg-orange-500/20 text-orange-300 font-bold border border-orange-500/30'
                            : 'text-white/50 hover:text-white/80'
                        }`}
                      >
                        <p className="text-sm">{line.text}</p>
                        <span className="text-[10px] text-white/30 font-mono mt-0.5 inline-block">
                          {formatDuration(line.time)}
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-white/40">
                    <Music className="w-8 h-8 mb-2 opacity-50" />
                    <p className="text-xs">لا تتوفر كلمات مكتوبة</p>
                  </div>
                )}
              </div>

              {/* Quick EQ Presets Bar in Sidebar */}
              <div className="pt-3 border-t border-white/10 space-y-2">
                <div className="flex items-center justify-between text-xs text-white/60">
                  <span>المعادل الصوتي: {eqSettings.isEnabled ? 'مفعل' : 'معطل'}</span>
                  <button
                    onClick={() => setIsEqOpen(true)}
                    className="text-orange-400 hover:text-orange-300 font-semibold text-[11px]"
                  >
                    فتح المعادل
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    onClick={() => {
                      setEqSettings((prev) => ({
                        ...prev,
                        bass: 7,
                        mid: 3,
                        treble: 5,
                        preset: 'tarab',
                      }));
                    }}
                    className={`p-2 rounded-xl text-xs font-semibold text-center border transition-all ${
                      eqSettings.preset === 'tarab'
                        ? 'bg-orange-500/25 border-orange-500/40 text-orange-300'
                        : 'bg-white/5 border-white/5 text-white/70 hover:bg-white/10'
                    }`}
                  >
                    طرب شرقي
                  </button>
                  <button
                    onClick={() => {
                      setEqSettings((prev) => ({
                        ...prev,
                        bass: 9,
                        mid: 1,
                        treble: 4,
                        preset: 'bassBoost',
                      }));
                    }}
                    className={`p-2 rounded-xl text-xs font-semibold text-center border transition-all ${
                      eqSettings.preset === 'bassBoost'
                        ? 'bg-orange-500/25 border-orange-500/40 text-orange-300'
                        : 'bg-white/5 border-white/5 text-white/70 hover:bg-white/10'
                    }`}
                  >
                    مضخم الباس
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Modals & Dialogs */}
      <LyricsModal
        isOpen={isLyricsOpen}
        track={currentTrack}
        currentTime={currentTime}
        onClose={() => setIsLyricsOpen(false)}
        onSeek={handleSeek}
      />

      <EqualizerModal
        isOpen={isEqOpen}
        settings={eqSettings}
        playbackRate={playbackRate}
        onClose={() => setIsEqOpen(false)}
        onUpdateSettings={setEqSettings}
        onUpdatePlaybackRate={(rate) => {
          setPlaybackRate(rate);
          if (audioElementRef.current) audioElementRef.current.playbackRate = rate;
        }}
      />

      <ChaptersQueueDrawer
        isOpen={isQueueOpen}
        tracks={tracks}
        currentTrack={currentTrack}
        currentTime={currentTime}
        isPlaying={isPlaying}
        onClose={() => setIsQueueOpen(false)}
        onSelectTrack={handleSelectTrack}
        onSelectChapter={handleChapterSelect}
        onUploadCustomAudio={(file) => handleUploadFiles([file])}
        onOpenChapterEditor={() => setIsChapterEditorOpen(true)}
      />

      <SleepTimerModal
        isOpen={isSleepTimerOpen}
        activeSecondsRemaining={sleepTimerSeconds}
        onClose={() => setIsSleepTimerOpen(false)}
        onSetTimer={(mins) => setSleepTimerSeconds(mins * 60)}
        onCancelTimer={() => setSleepTimerSeconds(null)}
      />

      <OptionsMenu
        isOpen={isOptionsOpen}
        track={currentTrack}
        isLiked={isLiked}
        onClose={() => setIsOptionsOpen(false)}
        onToggleLike={handleToggleLike}
        onOpenEQ={() => setIsEqOpen(true)}
        onOpenUpload={() => setIsSongPickerOpen(true)}
        onOpenSongPicker={() => setIsSongPickerOpen(true)}
      />

      <SongPickerModal
        isOpen={isSongPickerOpen}
        tracks={tracks}
        currentTrackId={currentTrack.id}
        likedTrackIds={likedTrackIds}
        onClose={() => setIsSongPickerOpen(false)}
        onSelectTrack={handleSelectTrack}
        onUploadFiles={handleUploadFiles}
        onAddFromUrl={(title, artist, url) => handleAddFromUrl(url, title, artist)}
        onAddRecordedAudio={handleAddRecordedAudio}
        onAutoImportPhoneMusic={triggerPhoneImport}
      />

      <ChapterEditorModal
        isOpen={isChapterEditorOpen}
        track={currentTrack}
        currentTime={currentTime}
        duration={duration}
        onClose={() => setIsChapterEditorOpen(false)}
        onSaveChapters={handleSaveChapters}
        onSeek={handleSeek}
      />
    </div>
  );
}

import React, { useState, useRef } from 'react';
import {
  X,
  Search,
  Music,
  Upload,
  Link,
  Mic,
  Disc3,
  CheckCircle2,
  Heart,
  Plus,
  Play,
  Clock,
  Sparkles,
  StopCircle,
  FolderDown,
  Smartphone,
} from 'lucide-react';
import { Track } from '../types/music';
import { formatDuration } from '../utils/formatTime';

interface SongPickerModalProps {
  isOpen: boolean;
  tracks: Track[];
  currentTrackId: string;
  likedTrackIds: Set<string>;
  onClose: () => void;
  onSelectTrack: (track: Track) => void;
  onUploadFiles: (files: FileList | File[]) => void;
  onAddFromUrl: (title: string, artist: string, url: string) => void;
  onAddRecordedAudio: (audioBlob: Blob, title: string) => void;
  onAutoImportPhoneMusic?: () => void;
}

export const SongPickerModal: React.FC<SongPickerModalProps> = ({
  isOpen,
  tracks,
  currentTrackId,
  likedTrackIds,
  onClose,
  onSelectTrack,
  onUploadFiles,
  onAddFromUrl,
  onAddRecordedAudio,
  onAutoImportPhoneMusic,
}) => {
  const [activeTab, setActiveTab] = useState<'library' | 'upload' | 'url' | 'record'>('library');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('الكل');

  // URL input state
  const [urlTitle, setUrlTitle] = useState('');
  const [urlArtist, setUrlArtist] = useState('');
  const [urlLink, setUrlLink] = useState('');

  // Voice recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordTitle, setRecordTitle] = useState('تسجيل MO صوتي');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingTimerRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Filter categories
  const categories = ['الكل', 'أغاني الهاتف', 'ريمكسات', 'طرب', 'هادئ', 'المفضلة', 'ملفاتي'];

  // Filtered tracks
  const filteredTracks = tracks.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.chapters.some((c) => c.title.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (selectedCategory === 'الكل') return true;
    if (selectedCategory === 'أغاني الهاتف') return t.badgeText === 'Phone Audio' || t.isCustomUpload;
    if (selectedCategory === 'المفضلة') return likedTrackIds.has(t.id);
    if (selectedCategory === 'ملفاتي') return t.isCustomUpload;
    return t.category === selectedCategory;
  });

  // Handle URL submit
  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlLink.trim()) return;
    onAddFromUrl(
      urlTitle.trim() || 'تسجيل خارجي',
      urlArtist.trim() || 'MO Music Stream',
      urlLink.trim()
    );
    setUrlTitle('');
    setUrlArtist('');
    setUrlLink('');
    setActiveTab('library');
  };

  // Recording Handlers
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      const chunks: BlobPart[] = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setRecordedBlob(blob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);
      recordingTimerRef.current = window.setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Mic access error', err);
      alert('يرجى السماح بالوصول إلى الميكروفون لبدء التسجيل');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
    }
  };

  const saveRecording = () => {
    if (recordedBlob) {
      onAddRecordedAudio(recordedBlob, recordTitle.trim() || 'تسجيل صوتي');
      setRecordedBlob(null);
      setRecordingSeconds(0);
      setActiveTab('library');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-2xl animate-fade-in font-['Cairo',sans-serif]">
      <div
        className="w-full max-w-lg h-[90vh] sm:h-[720px] rounded-t-[36px] sm:rounded-[36px] glass-panel p-5 sm:p-6 flex flex-col relative overflow-hidden border border-white/20 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
          <button
            onClick={onClose}
            aria-label="إغلاق"
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 hover:text-white transition-all active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="text-center">
            <div className="flex items-center justify-center gap-1.5">
              <span className="px-2 py-0.5 rounded-md bg-orange-500 text-white font-mono text-[10px] font-bold tracking-wider uppercase">
                MO Music
              </span>
              <h2 className="text-base font-bold text-white tracking-wide">
                تحديد واستدعاء الأغاني
              </h2>
            </div>
            <p className="text-[11px] text-white/50 mt-0.5">
              اختر من المكتبة أو استدعِ أغانيك بكل سهولة
            </p>
          </div>

          <button
            onClick={() => setActiveTab('upload')}
            className="w-9 h-9 rounded-full bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 flex items-center justify-center transition-all active:scale-95"
            title="استدعاء سريع"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation Controls */}
        <div className="grid grid-cols-4 gap-1 p-1 bg-white/5 rounded-2xl my-3 shrink-0 border border-white/5">
          <button
            onClick={() => setActiveTab('library')}
            className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'library'
                ? 'bg-orange-500 text-white shadow-md'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <Music className="w-3.5 h-3.5" />
            <span>المكتبة</span>
          </button>

          <button
            onClick={() => setActiveTab('upload')}
            className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'upload'
                ? 'bg-orange-500 text-white shadow-md'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>ملفاتي</span>
          </button>

          <button
            onClick={() => setActiveTab('url')}
            className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'url'
                ? 'bg-orange-500 text-white shadow-md'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <Link className="w-3.5 h-3.5" />
            <span>رابط مباشر</span>
          </button>

          <button
            onClick={() => setActiveTab('record')}
            className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'record'
                ? 'bg-orange-500 text-white shadow-md'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <Mic className="w-3.5 h-3.5" />
            <span>تسجيل حي</span>
          </button>
        </div>

        {/* TAB 1: Library & Quick Song Selector */}
        {activeTab === 'library' && (
          <div className="flex-1 flex flex-col min-h-0">
            {/* Search Input */}
            <div className="relative mb-2.5 shrink-0">
              <input
                type="text"
                placeholder="ابحث عن أغنية، فنان، أو مقطع (مثل: بنت الناس)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-11 pl-4 pr-10 rounded-2xl bg-white/10 border border-white/10 text-sm text-white placeholder-white/40 focus:outline-none focus:border-orange-500/50 transition-all text-right"
              />
              <Search className="w-4 h-4 text-white/40 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/50 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Quick Category Filter Bar */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 shrink-0 select-none">
              {onAutoImportPhoneMusic && (
                <button
                  onClick={onAutoImportPhoneMusic}
                  className="px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-all bg-gradient-to-r from-orange-500/25 to-amber-500/25 border border-orange-500/40 text-orange-300 hover:text-white flex items-center gap-1 shrink-0 active:scale-95 shadow-sm"
                  title="استيراد جميع أغاني الهاتف تلقائياً"
                >
                  <FolderDown className="w-3.5 h-3.5 text-orange-400" />
                  <span>+ استيراد من هاتفي</span>
                </button>
              )}
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    selectedCategory === cat
                      ? 'bg-white/20 text-white border border-white/30 shadow-sm'
                      : 'bg-white/5 text-white/60 hover:bg-white/10 border border-transparent'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Tracks List */}
            <div className="flex-1 overflow-y-auto space-y-2 py-1 pr-0.5">
              {filteredTracks.length > 0 ? (
                filteredTracks.map((track) => {
                  const isCurrent = track.id === currentTrackId;

                  return (
                    <div
                      key={track.id}
                      onClick={() => {
                        onSelectTrack(track);
                        onClose();
                      }}
                      className={`group flex items-center justify-between p-3 rounded-2xl cursor-pointer transition-all border ${
                        isCurrent
                          ? 'bg-orange-500/20 border-orange-500/50 shadow-[0_4px_20px_rgba(249,115,22,0.2)]'
                          : 'bg-white/[0.04] border-white/5 hover:bg-white/10 hover:border-white/15'
                      }`}
                    >
                      {/* Track info & art */}
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-black/40">
                          <img
                            src={track.coverSrc}
                            alt={track.title}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                          {isCurrent && (
                            <div className="absolute inset-0 bg-orange-500/40 backdrop-blur-[1px] flex items-center justify-center">
                              <Disc3 className="w-6 h-6 text-white animate-spin [animation-duration:5s]" />
                            </div>
                          )}
                        </div>

                        <div className="text-right min-w-0">
                          <div className="flex items-center gap-2">
                            <h3
                              className={`text-sm font-bold truncate ${
                                isCurrent ? 'text-orange-300' : 'text-white group-hover:text-orange-200'
                              }`}
                            >
                              {track.title}
                            </h3>
                            {track.badgeText && (
                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/10 text-white/60 shrink-0 font-mono">
                                {track.badgeText}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-white/50 truncate mt-0.5">
                            {track.artist} · {track.chapters.length} فصول
                          </p>
                        </div>
                      </div>

                      {/* Right Side: Duration & Action */}
                      <div className="flex items-center gap-2.5 shrink-0">
                        <span className="text-xs font-mono text-white/40 tabular-nums">
                          {formatDuration(track.duration)}
                        </span>
                        {isCurrent ? (
                          <CheckCircle2 className="w-5 h-5 text-orange-400" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-white/5 group-hover:bg-orange-500 group-hover:text-white flex items-center justify-center text-white/60 transition-colors">
                            <Play className="w-4 h-4 fill-current translate-x-[-1px]" />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="flex flex-col items-center justify-center h-48 text-white/40 space-y-2">
                  <Music className="w-10 h-10 opacity-30" />
                  <p className="text-xs">لم يتم العثور على أغانٍ تطابق بحثك</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: Upload Files from Device */}
        {activeTab === 'upload' && (
          <div className="flex-1 flex flex-col justify-center items-center py-4 text-center">
            {onAutoImportPhoneMusic && (
              <button
                onClick={() => {
                  onClose();
                  onAutoImportPhoneMusic();
                }}
                className="w-full mb-3 py-3 px-4 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 text-black text-xs font-bold shadow-lg shadow-orange-500/20 hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <FolderDown className="w-4 h-4 text-black" />
                <span>استيراد جميع أغاني هاتفك تلقائياً وحفظها 📱</span>
              </button>
            )}

            <div
              onClick={() => fileInputRef.current?.click()}
              className="w-full border-2 border-dashed border-white/20 hover:border-orange-500/60 rounded-3xl p-8 flex flex-col items-center justify-center cursor-pointer bg-white/[0.02] hover:bg-orange-500/[0.04] transition-all group"
            >
              <div className="w-16 h-16 rounded-2xl bg-orange-500/15 group-hover:bg-orange-500/25 flex items-center justify-center text-orange-400 mb-4 transition-all group-hover:scale-110">
                <Upload className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-white mb-1">
                استدعاء ملف صوتي من الهاتف أو الكمبيوتر
              </h3>
              <p className="text-xs text-white/50 max-w-xs mb-4">
                اختر ملفات MP3، M4A، WAV، أو FLAC ليتم تحميلها فوراً إلى تطبيق MO ميوزك مع تقطيع الفصول تلقائياً
              </p>
              <span className="px-5 py-2.5 rounded-full bg-orange-500 text-white font-semibold text-xs shadow-lg shadow-orange-500/20 group-hover:bg-orange-600 transition-colors">
                تصفح الملفات
              </span>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="audio/*"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    onUploadFiles(e.target.files);
                    setActiveTab('library');
                  }
                }}
                className="hidden"
              />
            </div>
          </div>
        )}

        {/* TAB 3: Import via Direct URL */}
        {activeTab === 'url' && (
          <div className="flex-1 flex flex-col justify-center py-2">
            <form onSubmit={handleUrlSubmit} className="space-y-4">
              <div className="text-right">
                <label className="text-xs text-white/70 block mb-1.5 font-medium">
                  رابط الملف الصوتي المباشر (URL):
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://example.com/song.mp3"
                  value={urlLink}
                  onChange={(e) => setUrlLink(e.target.value)}
                  className="w-full h-11 px-4 rounded-2xl bg-white/10 border border-white/15 text-sm text-white placeholder-white/30 focus:outline-none focus:border-orange-500/60 text-left font-mono"
                />
              </div>

              <div className="text-right">
                <label className="text-xs text-white/70 block mb-1.5 font-medium">
                  اسم الأغنية أو التسجيل:
                </label>
                <input
                  type="text"
                  placeholder="مثال: ريمكس السهرة 2026"
                  value={urlTitle}
                  onChange={(e) => setUrlTitle(e.target.value)}
                  className="w-full h-11 px-4 rounded-2xl bg-white/10 border border-white/15 text-sm text-white placeholder-white/30 focus:outline-none focus:border-orange-500/60 text-right"
                />
              </div>

              <div className="text-right">
                <label className="text-xs text-white/70 block mb-1.5 font-medium">
                  اسم الفنان أو جهة التسجيل:
                </label>
                <input
                  type="text"
                  placeholder="مثال: MO Music Live"
                  value={urlArtist}
                  onChange={(e) => setUrlArtist(e.target.value)}
                  className="w-full h-11 px-4 rounded-2xl bg-white/10 border border-white/15 text-sm text-white placeholder-white/30 focus:outline-none focus:border-orange-500/60 text-right"
                />
              </div>

              <button
                type="submit"
                className="w-full h-12 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm shadow-lg shadow-orange-500/25 transition-all mt-2 active:scale-[0.99]"
              >
                استدعاء وتشغيل الأغنية الآن
              </button>
            </form>
          </div>
        )}

        {/* TAB 4: Live Voice / Audio Recording */}
        {activeTab === 'record' && (
          <div className="flex-1 flex flex-col justify-center items-center py-4 text-center">
            {!recordedBlob ? (
              <div className="flex flex-col items-center">
                <div className="relative mb-6">
                  <button
                    onClick={isRecording ? stopRecording : startRecording}
                    className={`w-24 h-24 rounded-full flex items-center justify-center transition-all ${
                      isRecording
                        ? 'bg-red-500 text-white shadow-[0_0_30px_rgba(239,68,68,0.7)] animate-pulse'
                        : 'bg-orange-500 text-white hover:bg-orange-600 shadow-[0_0_25px_rgba(249,115,22,0.4)]'
                    }`}
                  >
                    {isRecording ? <StopCircle className="w-10 h-10" /> : <Mic className="w-10 h-10" />}
                  </button>
                  {isRecording && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 animate-ping" />
                  )}
                </div>

                <span className="text-2xl font-bold font-mono text-white mb-2 tabular-nums">
                  {formatDuration(recordingSeconds)}
                </span>
                <p className="text-xs text-white/60 max-w-xs">
                  {isRecording
                    ? 'جاري التسجيل المباشر الآن.. انقر للإيقاف والحفظ'
                    : 'انقر على الميكروفون لبدء تسجيل صوتي خاص بك وإضافته فوراً إلى MO ميوزك'}
                </p>
              </div>
            ) : (
              <div className="w-full max-w-xs space-y-4">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                  <span className="text-xs text-emerald-400 font-semibold block mb-1">
                    ✓ تم اكتمال التسجيل ({formatDuration(recordingSeconds)})
                  </span>
                  <input
                    type="text"
                    value={recordTitle}
                    onChange={(e) => setRecordTitle(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-white/10 border border-white/15 text-sm text-white text-right focus:outline-none focus:border-orange-500 mt-2"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setRecordedBlob(null);
                      setRecordingSeconds(0);
                    }}
                    className="flex-1 h-11 rounded-xl bg-white/10 text-white text-xs font-semibold hover:bg-white/20 transition-all"
                  >
                    إعادة التسجيل
                  </button>
                  <button
                    onClick={saveRecording}
                    className="flex-1 h-11 rounded-xl bg-orange-500 text-white text-xs font-bold hover:bg-orange-600 transition-all shadow-md shadow-orange-500/20"
                  >
                    حفظ في MO ميوزك
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Modal Footer Quick Stats */}
        <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-white/50 shrink-0">
          <span>إجمالي الأغاني المتاحة: {tracks.length}</span>
          <span className="font-mono text-orange-400">MO Music Studio v2.0</span>
        </div>
      </div>
    </div>
  );
};

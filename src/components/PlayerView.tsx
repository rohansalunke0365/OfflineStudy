import { useState, useRef, useEffect } from 'react';
import {
  ArrowLeft,
  Bookmark as BookmarkIcon,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  SkipBack,
  SkipForward,
  RotateCcw,
  Check,
  Sparkles,
  Layers,
  Repeat,
  Radio,
  HelpCircle,
  FileText,
  Clock,
  BookOpen,
  Send,
  Plus,
  Trash2,
  List,
  Search,
  ExternalLink,
  BrainCircuit
} from 'lucide-react';
import {
  Playlist,
  ProgressMap,
  VideoItem,
  Bookmark,
  VideoNote,
  VideoChapter,
  TranscriptCue
} from '../types';
import { ThermodynamicsCanvas } from './ThermodynamicsCanvas';
import { KeyboardHelpModal } from './KeyboardHelpModal';
import {
  generateAISummary,
  sendAITutorMessage,
  generateAIChapters
} from '../services/aiService';
import {
  loadBookmarks,
  saveBookmark,
  deleteBookmark,
  loadNotes,
  saveNote,
  deleteNote,
  loadChapters,
  saveChapters
} from '../services/db';

interface PlayerViewProps {
  currentVideo: VideoItem;
  playlist: Playlist;
  progressMap: ProgressMap;
  onSelectVideo: (video: VideoItem) => void;
  onBack: () => void;
  onSaveProgress: (videoId: string, time: number, duration: number, watched: boolean) => void;
  onToggleSaveToVault: (videoId: string) => void;
  onNavigateToFlashcards?: () => void;
  onNavigateToQuiz?: () => void;
}

export const PlayerView = ({
  currentVideo,
  playlist,
  progressMap,
  onSelectVideo,
  onBack,
  onSaveProgress,
  onToggleSaveToVault,
  onNavigateToFlashcards,
  onNavigateToQuiz,
}: PlayerViewProps) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(currentVideo.duration || 842);
  const [volume, setVolume] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [renderMode, setRenderMode] = useState<'3d' | 'video'>(
    currentVideo.is3dSimulation ? '3d' : 'video'
  );
  const [isLooping, setIsLooping] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isKeyboardHelpOpen, setIsKeyboardHelpOpen] = useState(false);

  // Active Tab for Right Side Drawers
  const [activeTab, setActiveTab] = useState<'queue' | 'ai' | 'bookmarks' | 'notes' | 'chapters' | 'transcript'>('queue');

  // A-B Looping State
  const [loopA, setLoopA] = useState<number | null>(null);
  const [loopB, setLoopB] = useState<number | null>(null);

  // Bookmarks & Notes State
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [notes, setNotes] = useState<VideoNote[]>([]);
  const [chapters, setChapters] = useState<VideoChapter[]>([]);
  const [newNoteText, setNewNoteText] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [bookmarkTitle, setBookmarkTitle] = useState('');
  const [isAddingBookmark, setIsAddingBookmark] = useState(false);

  // AI Assistant State
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [aiSummaryType, setAiSummaryType] = useState<'quick' | 'detailed' | 'revision' | 'oneminute'>('detailed');
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'model'; text: string }>>([
    {
      role: 'model',
      text: `Hello! I'm your Gemini AI Study Assistant for **${currentVideo.title}**. Ask me to explain difficult algorithms, summarize key concepts, or generate flashcards & quizzes!`,
    },
  ]);
  const [inputChat, setInputChat] = useState('');
  const [isChatSending, setIsChatSending] = useState(false);

  // Transcript Search
  const [transcriptSearch, setTranscriptSearch] = useState('');

  const videoRef = useRef<HTMLVideoElement>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const hideControlsTimerRef = useRef<NodeJS.Timeout | null>(null);

  const currentProgress = progressMap[currentVideo.id];
  const isSaved = currentProgress?.savedToVault;

  // Local object URL for real local file handle if present
  const [localBlobUrl, setLocalBlobUrl] = useState<string | null>(null);

  // Sample default transcript if none attached
  const transcriptCues: TranscriptCue[] = currentVideo.transcripts || [
    { id: '1', startTime: 0, endTime: 30, text: `Welcome to ${currentVideo.title}. In this session, we analyze foundational principles and engineering mechanisms.` },
    { id: '2', startTime: 30, endTime: 90, text: 'We start with the core mathematical definition and examine why naive approaches fail in high-throughput environments.' },
    { id: '3', startTime: 90, endTime: 180, text: 'Notice how state transitions occur predictably when invariants are preserved across each execution cycle.' },
    { id: '4', startTime: 180, endTime: 300, text: 'Let us now step through a concrete example with sample parameters to observe asymptotic performance.' },
    { id: '5', startTime: 300, endTime: 480, text: 'Key takeaways: Always verify edge cases, maintain bounds checking, and optimize critical inner loops.' },
  ];

  // Load Bookmarks, Notes, and Chapters for this video
  useEffect(() => {
    async function loadData() {
      const [allB, allN, videoCh] = await Promise.all([
        loadBookmarks(),
        loadNotes(),
        loadChapters(currentVideo.id),
      ]);
      setBookmarks(allB.filter((b) => b.videoId === currentVideo.id));
      setNotes(allN.filter((n) => n.videoId === currentVideo.id));
      setChapters(videoCh.length ? videoCh : [
        { time: 0, title: 'Introduction & Core Objectives', summary: 'Orientation and problem statement' },
        { time: Math.floor((duration || 800) * 0.25), title: 'Theoretical Breakdown', summary: 'Core mechanisms & proofs' },
        { time: Math.floor((duration || 800) * 0.6), title: 'Practical Example Walkthrough', summary: 'Step-by-step implementation' },
        { time: Math.floor((duration || 800) * 0.85), title: 'Summary & Revision Checklist', summary: 'Exam essentials' },
      ]);
    }
    loadData();
  }, [currentVideo.id, duration]);

  useEffect(() => {
    let active = true;
    let url: string | null = null;

    async function loadLocalFile() {
      if (currentVideo.fileHandle) {
        try {
          const file = await currentVideo.fileHandle.getFile();
          if (active) {
            url = URL.createObjectURL(file);
            setLocalBlobUrl(url);
            setRenderMode('video');
          }
        } catch (e) {
          console.warn('Failed to load local file blob', e);
        }
      } else {
        setLocalBlobUrl(null);
        setRenderMode(currentVideo.is3dSimulation ? '3d' : 'video');
      }
    }

    loadLocalFile();

    return () => {
      active = false;
      if (url) URL.revokeObjectURL(url);
    };
  }, [currentVideo]);

  // Restore saved timestamp
  useEffect(() => {
    const saved = progressMap[currentVideo.id];
    if (saved && saved.time && saved.time < (currentVideo.duration || 1000) - 4 && !saved.watched) {
      setCurrentTime(saved.time);
      if (videoRef.current) {
        videoRef.current.currentTime = saved.time;
      }
    } else {
      setCurrentTime(0);
    }
  }, [currentVideo.id]);

  // Handle Video Time Update
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const cur = videoRef.current.currentTime;
      const dur = videoRef.current.duration || duration;
      setCurrentTime(cur);
      setDuration(dur);

      // Check A-B Loop
      if (loopA !== null && loopB !== null && loopB > loopA) {
        if (cur >= loopB) {
          videoRef.current.currentTime = loopA;
        }
      }

      const watched = cur / dur > 0.92;
      onSaveProgress(currentVideo.id, cur, dur, watched);
    }
  };

  // 3D Simulation ticker
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (renderMode === '3d' && isPlaying) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          const next = prev + 1;
          if (loopA !== null && loopB !== null && next >= loopB) {
            return loopA;
          }
          if (next >= duration) {
            if (isLooping) return 0;
            setIsPlaying(false);
            onSaveProgress(currentVideo.id, duration, duration, true);
            return duration;
          }
          onSaveProgress(currentVideo.id, next, duration, next / duration > 0.92);
          return next;
        });
      }, 1000 / playbackRate);
    }
    return () => clearInterval(interval);
  }, [renderMode, isPlaying, duration, playbackRate, isLooping, loopA, loopB, currentVideo.id]);

  // Toggle Play / Pause
  const togglePlay = () => {
    if (renderMode === 'video' && videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play().catch(() => {});
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  // Seek
  const handleSeek = (newTime: number) => {
    setCurrentTime(newTime);
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
    }
  };

  // Change Playback Speed
  const handleSpeedChange = (rate: number) => {
    setPlaybackRate(rate);
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
    }
  };

  // Fullscreen
  const toggleFullscreen = () => {
    if (!playerContainerRef.current) return;
    if (!document.fullscreenElement) {
      playerContainerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Picture in Picture
  const togglePiP = async () => {
    if (videoRef.current && document.pictureInPictureEnabled) {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else {
        await videoRef.current.requestPictureInPicture();
      }
    }
  };

  // Add instant Bookmark
  const handleAddBookmark = async (customTitle?: string) => {
    const title = customTitle || bookmarkTitle.trim() || `Bookmark at ${formatTime(currentTime)}`;
    const newBm: Bookmark = {
      id: `bm_${Date.now()}`,
      videoId: currentVideo.id,
      videoTitle: currentVideo.title,
      folderPath: currentVideo.folderPath,
      time: Math.round(currentTime),
      title,
      createdAt: Date.now(),
    };
    await saveBookmark(newBm);
    setBookmarks((prev) => [newBm, ...prev]);
    setBookmarkTitle('');
    setIsAddingBookmark(false);
  };

  // Add Note
  const handleAddNote = async () => {
    if (!newNoteText.trim()) return;
    const newN: VideoNote = {
      id: `note_${Date.now()}`,
      videoId: currentVideo.id,
      videoTitle: currentVideo.title,
      folderPath: currentVideo.folderPath,
      time: Math.round(currentTime),
      content: newNoteText.trim(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    await saveNote(newN);
    setNotes((prev) => [newN, ...prev]);
    setNewNoteText('');
    setIsAddingNote(false);
  };

  // AI Summarize handler
  const handleGenerateSummary = async (type: 'quick' | 'detailed' | 'revision' | 'oneminute') => {
    setAiSummaryType(type);
    setIsGeneratingSummary(true);
    try {
      const summaryText = await generateAISummary({
        videoTitle: currentVideo.title,
        courseName: playlist.name,
        type,
        contextText: currentVideo.description || transcriptCues.map((c) => c.text).join(' '),
      });
      setAiSummary(summaryText);
    } catch (e: any) {
      setAiSummary(`Could not generate summary: ${e.message}`);
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  // AI Tutor message
  const handleSendChatMessage = async () => {
    if (!inputChat.trim() || isChatSending) return;
    const userMsg = inputChat.trim();
    setInputChat('');
    setChatMessages((prev) => [...prev, { role: 'user', text: userMsg }]);
    setIsChatSending(true);

    try {
      const reply = await sendAITutorMessage(
        userMsg,
        currentVideo.title,
        playlist.name,
        currentVideo.description
      );
      setChatMessages((prev) => [...prev, { role: 'model', text: reply }]);
    } catch (e: any) {
      setChatMessages((prev) => [
        ...prev,
        { role: 'model', text: `Sorry, I encountered an issue: ${e.message}` },
      ]);
    } finally {
      setIsChatSending(false);
    }
  };

  // Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        const step = e.shiftKey ? 10 : 5;
        handleSeek(Math.min(duration, currentTime + step));
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        const step = e.shiftKey ? 10 : 5;
        handleSeek(Math.max(0, currentTime - step));
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        toggleFullscreen();
      } else if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        setIsMuted(!isMuted);
      } else if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        const next = getNextVideo();
        if (next) onSelectVideo(next);
      } else if (e.key === 'p' || e.key === 'P') {
        e.preventDefault();
        const prev = getPrevVideo();
        if (prev) onSelectVideo(prev);
      } else if (e.key === 'b' || e.key === 'B') {
        e.preventDefault();
        setActiveTab('bookmarks');
        handleAddBookmark();
      } else if (e.key === 'c' || e.key === 'C') {
        e.preventDefault();
        setActiveTab('notes');
        setIsAddingNote(true);
      } else if (e.key === '?') {
        e.preventDefault();
        setIsKeyboardHelpOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentTime, duration, isPlaying, isMuted]);

  // Playlist Navigation Helpers
  const currentIndex = playlist.videos.findIndex((v) => v.id === currentVideo.id);
  const getPrevVideo = () => (currentIndex > 0 ? playlist.videos[currentIndex - 1] : null);
  const getNextVideo = () => (currentIndex < playlist.videos.length - 1 ? playlist.videos[currentIndex + 1] : null);

  const prevVideo = getPrevVideo();
  const nextVideo = getNextVideo();

  const formatTime = (sec: number) => {
    if (!sec || isNaN(sec)) return '0:00';
    const s = Math.round(sec);
    const m = Math.floor(s / 60);
    const rem = s % 60;
    return `${m}:${String(rem).padStart(2, '0')}`;
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (hideControlsTimerRef.current) clearTimeout(hideControlsTimerRef.current);
    hideControlsTimerRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3500);
  };

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-65px)] w-full overflow-hidden bg-slate-950 select-none">
      {/* Main Left/Center Player Column */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-y-auto lg:overflow-hidden p-3 md:p-6 space-y-4">
        {/* Header Bar */}
        <header className="flex items-center justify-between z-20 flex-shrink-0">
          <div className="flex items-center space-x-3 md:space-x-4 min-w-0">
            <button
              onClick={onBack}
              className="group flex items-center justify-center w-10 h-10 bg-slate-900 rounded-xl border border-slate-800 shadow-lg hover:border-slate-700 transition-all flex-shrink-0"
              title="Back to playlist"
            >
              <ArrowLeft size={18} className="text-slate-300 group-hover:text-indigo-400 transition-colors" />
            </button>

            <div className="flex flex-col min-w-0">
              <h1 className="font-bold text-base md:text-xl text-slate-100 tracking-tight truncate">
                {currentVideo.title}
              </h1>
              <span className="font-mono text-[11px] md:text-xs text-indigo-400 uppercase tracking-wider font-semibold truncate">
                {currentVideo.chapter || `${playlist.name} • Lecture ${currentIndex + 1}`}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2 md:space-x-3 flex-shrink-0">
            {/* Keyboard Shortcuts Trigger */}
            <button
              onClick={() => setIsKeyboardHelpOpen(true)}
              className="p-2 md:px-3 md:py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300 hover:text-white hover:bg-slate-800 flex items-center gap-1.5 transition-colors"
              title="View Keyboard Shortcuts (?)"
            >
              <HelpCircle size={14} className="text-indigo-400" />
              <span className="hidden sm:inline">Shortcuts</span>
            </button>

            {/* Save to Vault Bookmark */}
            <button
              onClick={() => onToggleSaveToVault(currentVideo.id)}
              className={`h-9 md:h-10 px-3 md:px-4 rounded-xl border font-mono text-[11px] md:text-xs tracking-wider font-bold flex items-center transition-all ${
                isSaved
                  ? 'bg-indigo-600 text-white border-indigo-400/40 shadow-lg shadow-indigo-500/20'
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <BookmarkIcon size={14} className={`mr-1.5 ${isSaved ? 'fill-current' : ''}`} />
              <span>{isSaved ? 'SAVED' : 'SAVE TO VAULT'}</span>
            </button>
          </div>
        </header>

        {/* Center Stage Player Viewport */}
        <section
          ref={playerContainerRef}
          onMouseMove={handleMouseMove}
          className="flex-1 relative rounded-3xl bg-slate-950 border border-slate-800 shadow-2xl overflow-hidden group min-h-[320px] flex flex-col justify-center"
        >
          <div className="absolute inset-0 rounded-3xl ring-1 ring-white/5 pointer-events-none z-30" />

          {/* 3D Simulation Canvas OR Standard Video */}
          {renderMode === '3d' ? (
            <div className="w-full h-full min-h-[360px]">
              <ThermodynamicsCanvas
                isPlaying={isPlaying}
                onTogglePlay={togglePlay}
                title={`Entropy Simulation - ${currentVideo.title}`}
                subtitle={currentVideo.chapter}
              />
            </div>
          ) : (
            <div className="relative w-full h-full aspect-video bg-black flex items-center justify-center">
              <video
                ref={videoRef}
                src={
                  localBlobUrl ||
                  currentVideo.videoUrl ||
                  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4'
                }
                className="w-full h-full object-contain"
                playsInline
                autoPlay={isPlaying}
                loop={isLooping}
                muted={isMuted}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={(e) => setDuration(e.currentTarget.duration || duration)}
                onEnded={() => {
                  if (nextVideo) onSelectVideo(nextVideo);
                }}
                onClick={togglePlay}
              />
            </div>
          )}

          {/* Floating HUD Controls Bar */}
          <div
            className={`absolute inset-x-0 bottom-0 p-4 md:p-6 flex flex-col justify-end transition-opacity duration-300 z-30 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent ${
              showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          >
            {/* Scrubber Bar */}
            <div className="w-full relative py-2 group/scrubber cursor-pointer mb-3">
              <input
                type="range"
                min={0}
                max={duration || 100}
                step={0.1}
                value={currentTime}
                onChange={(e) => handleSeek(parseFloat(e.target.value))}
                className="w-full h-1.5 md:h-2 bg-slate-800 rounded-full appearance-none cursor-pointer accent-indigo-500 focus:outline-none"
              />
              <div
                className="absolute top-2 left-0 h-1.5 md:h-2 bg-indigo-500 rounded-full pointer-events-none shadow-[0_0_10px_#6366f1]"
                style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
              />

              {/* A-B Loop Markers on Scrubber */}
              {loopA !== null && (
                <div
                  className="absolute top-1 w-2 h-4 bg-amber-400 rounded -translate-x-1/2 pointer-events-none shadow"
                  style={{ left: `${(loopA / (duration || 1)) * 100}%` }}
                  title="Loop Point A"
                />
              )}
              {loopB !== null && (
                <div
                  className="absolute top-1 w-2 h-4 bg-rose-400 rounded -translate-x-1/2 pointer-events-none shadow"
                  style={{ left: `${(loopB / (duration || 1)) * 100}%` }}
                  title="Loop Point B"
                />
              )}
            </div>

            {/* Controls Bar */}
            <div className="flex items-center justify-between w-full mx-auto backdrop-blur-2xl bg-slate-950/80 rounded-2xl border border-slate-800 shadow-2xl p-2.5 md:p-3.5">
              {/* Left Group */}
              <div className="flex items-center space-x-2 md:space-x-4">
                <button
                  onClick={togglePlay}
                  className="w-9 h-9 md:w-10 md:h-10 flex items-center justify-center rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 active:scale-95 transition-all"
                  title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
                >
                  {isPlaying ? <Pause size={17} /> : <Play size={17} className="ml-0.5 fill-current" />}
                </button>

                <button
                  onClick={() => prevVideo && onSelectVideo(prevVideo)}
                  disabled={!prevVideo}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-white disabled:opacity-30 transition-colors"
                  title="Previous (P)"
                >
                  <SkipBack size={16} />
                </button>
                <button
                  onClick={() => nextVideo && onSelectVideo(nextVideo)}
                  disabled={!nextVideo}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-white disabled:opacity-30 transition-colors"
                  title="Next (N)"
                >
                  <SkipForward size={16} />
                </button>

                {/* Volume */}
                <div className="hidden sm:flex items-center space-x-2">
                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
                  >
                    {isMuted || volume === 0 ? <VolumeX size={17} /> : <Volume2 size={17} />}
                  </button>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={isMuted ? 0 : volume}
                    onChange={(e) => {
                      const v = parseFloat(e.target.value);
                      setVolume(v);
                      setIsMuted(v === 0);
                      if (videoRef.current) videoRef.current.volume = v;
                    }}
                    className="w-16 md:w-20 h-1 bg-slate-700 rounded-full appearance-none accent-indigo-500"
                  />
                </div>

                {/* Timecode */}
                <div className="font-mono text-xs md:text-sm text-slate-400 flex items-center space-x-1 pl-1">
                  <span className="text-slate-100 font-bold">{formatTime(currentTime)}</span>
                  <span>/</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              {/* Right Group: A-B Repeat, Speed, PiP, Fullscreen */}
              <div className="flex items-center space-x-1.5 md:space-x-2.5">
                {/* A-B Loop Controls */}
                <div className="hidden md:flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-xl px-2 py-1 text-[11px] font-mono">
                  <button
                    onClick={() => setLoopA(currentTime)}
                    className={`px-1.5 py-0.5 rounded ${
                      loopA !== null ? 'bg-amber-500/20 text-amber-300 font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                    title="Set Loop Point A"
                  >
                    [A{loopA !== null ? ` ${formatTime(loopA)}` : ''}
                  </button>
                  <button
                    onClick={() => setLoopB(currentTime)}
                    className={`px-1.5 py-0.5 rounded ${
                      loopB !== null ? 'bg-rose-500/20 text-rose-300 font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                    title="Set Loop Point B"
                  >
                    B]{loopB !== null ? ` ${formatTime(loopB)}` : ''}
                  </button>
                  {(loopA !== null || loopB !== null) && (
                    <button
                      onClick={() => {
                        setLoopA(null);
                        setLoopB(null);
                      }}
                      className="text-slate-500 hover:text-white px-1"
                      title="Clear A-B Loop"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Speed Select Pill (0.5x to 3x) */}
                <select
                  value={playbackRate}
                  onChange={(e) => handleSpeedChange(parseFloat(e.target.value))}
                  className="bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1 text-xs font-mono text-indigo-400 font-bold focus:outline-none cursor-pointer"
                >
                  <option value={0.5} className="bg-slate-900">0.5x</option>
                  <option value={0.75} className="bg-slate-900">0.75x</option>
                  <option value={1} className="bg-slate-900">1.0x</option>
                  <option value={1.25} className="bg-slate-900">1.25x</option>
                  <option value={1.5} className="bg-slate-900">1.5x</option>
                  <option value={1.75} className="bg-slate-900">1.75x</option>
                  <option value={2} className="bg-slate-900">2.0x</option>
                  <option value={2.5} className="bg-slate-900">2.5x</option>
                  <option value={3} className="bg-slate-900">3.0x</option>
                </select>

                <button
                  onClick={() => setIsLooping(!isLooping)}
                  className={`p-2 rounded-xl transition-colors ${
                    isLooping ? 'text-indigo-400 bg-indigo-500/15' : 'text-slate-400 hover:text-white'
                  }`}
                  title="Toggle Full Video Loop"
                >
                  <Repeat size={16} />
                </button>

                <button
                  onClick={toggleFullscreen}
                  className="p-2 rounded-xl text-slate-400 hover:text-white active:scale-95 transition-all"
                  title="Fullscreen (F)"
                >
                  {isFullscreen ? <Minimize size={17} /> : <Maximize size={17} />}
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Right Tabbed Drawer: Queue / AI / Bookmarks / Notes / Chapters / Transcript */}
      <aside className="w-full lg:w-[420px] flex-shrink-0 h-auto lg:h-full backdrop-blur-3xl bg-slate-950/90 border-t lg:border-t-0 lg:border-l border-slate-800 shadow-2xl flex flex-col z-20 overflow-hidden">
        {/* Drawer Tabs Header */}
        <div className="p-3 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center gap-1 overflow-x-auto custom-scrollbar pb-1">
            <button
              onClick={() => setActiveTab('queue')}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all flex items-center gap-1.5 flex-shrink-0 ${
                activeTab === 'queue'
                  ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <List size={13} />
              <span>Queue ({playlist.videos.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('ai')}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all flex items-center gap-1.5 flex-shrink-0 ${
                activeTab === 'ai'
                  ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Sparkles size={13} />
              <span>AI Tutor</span>
            </button>

            <button
              onClick={() => setActiveTab('bookmarks')}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all flex items-center gap-1.5 flex-shrink-0 ${
                activeTab === 'bookmarks'
                  ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <BookmarkIcon size={13} />
              <span>Bookmarks ({bookmarks.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('notes')}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all flex items-center gap-1.5 flex-shrink-0 ${
                activeTab === 'notes'
                  ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <FileText size={13} />
              <span>Notes ({notes.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('chapters')}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all flex items-center gap-1.5 flex-shrink-0 ${
                activeTab === 'chapters'
                  ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <BookOpen size={13} />
              <span>Chapters</span>
            </button>

            <button
              onClick={() => setActiveTab('transcript')}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all flex items-center gap-1.5 flex-shrink-0 ${
                activeTab === 'transcript'
                  ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <span>Transcript</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Queue */}
        {activeTab === 'queue' && (
          <div className="flex-1 overflow-y-auto p-3 space-y-2.5 custom-scrollbar">
            {playlist.videos.map((item, idx) => {
              const isCurrentlyPlaying = item.id === currentVideo.id;
              const isUpNext = idx === currentIndex + 1;
              const itemProgress = progressMap[item.id];
              const isItemWatched = itemProgress?.watched;
              const itemDuration = item.duration || 840;

              return (
                <div
                  key={item.id}
                  onClick={() => onSelectVideo(item)}
                  className={`relative rounded-2xl p-3 flex gap-3.5 cursor-pointer transform transition-all ${
                    isCurrentlyPlaying
                      ? 'bg-slate-900 border border-indigo-500/40 shadow-lg shadow-indigo-500/10'
                      : 'bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 hover:bg-slate-900'
                  }`}
                >
                  {isCurrentlyPlaying && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-indigo-500 rounded-r-full shadow-[0_0_10px_#6366f1]" />
                  )}

                  <div className="w-20 h-14 rounded-xl overflow-hidden relative shadow-inner flex-shrink-0 border border-slate-800 bg-slate-950">
                    {item.thumbnailUrl ? (
                      <img
                        src={item.thumbnailUrl}
                        alt={item.title}
                        className={`w-full h-full object-cover ${
                          isCurrentlyPlaying ? 'opacity-100' : 'opacity-70'
                        }`}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-mono text-xs text-slate-400">
                        #{idx + 1}
                      </div>
                    )}
                    <div className="absolute bottom-1 right-1 bg-slate-950/85 px-1 rounded text-[9px] font-mono text-slate-200 font-bold">
                      {formatTime(itemDuration)}
                    </div>
                  </div>

                  <div className="flex-1 flex flex-col justify-center min-w-0">
                    <h3
                      className={`text-xs font-bold leading-tight line-clamp-2 mb-1 ${
                        isCurrentlyPlaying ? 'text-indigo-400' : 'text-slate-200'
                      }`}
                    >
                      {item.title}
                    </h3>
                    <div className="flex items-center text-[10px] font-mono text-slate-400">
                      {isCurrentlyPlaying ? (
                        <span className="text-indigo-400 font-bold flex items-center gap-1.5">
                          <Radio size={12} className="animate-pulse" />
                          NOW PLAYING
                        </span>
                      ) : isUpNext ? (
                        <span className="text-indigo-300 font-semibold">UP NEXT</span>
                      ) : isItemWatched ? (
                        <span className="text-emerald-400 flex items-center gap-1">
                          <Check size={11} /> WATCHED
                        </span>
                      ) : (
                        <span className="text-slate-500">QUEUED</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Tab 2: Gemini AI Study Assistant */}
        {activeTab === 'ai' && (
          <div className="flex-1 flex flex-col min-h-0 p-3 space-y-3 overflow-hidden">
            {/* Quick Action Chips */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 uppercase font-bold px-1">
                <span>Gemini AI Synthesis</span>
                {isGeneratingSummary && <span className="text-indigo-400 animate-pulse">Thinking...</span>}
              </div>

              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={() => handleGenerateSummary('quick')}
                  disabled={isGeneratingSummary}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[11px] font-mono text-slate-200 text-left transition-colors"
                >
                  ⚡ Quick Summary
                </button>
                <button
                  onClick={() => handleGenerateSummary('revision')}
                  disabled={isGeneratingSummary}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[11px] font-mono text-slate-200 text-left transition-colors"
                >
                  📝 Exam Revision
                </button>
                <button
                  onClick={() => handleGenerateSummary('oneminute')}
                  disabled={isGeneratingSummary}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[11px] font-mono text-slate-200 text-left transition-colors"
                >
                  ⏱️ 1-Minute Recap
                </button>
                <button
                  onClick={() => handleGenerateSummary('detailed')}
                  disabled={isGeneratingSummary}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[11px] font-mono text-slate-200 text-left transition-colors"
                >
                  📚 Full Study Guide
                </button>
              </div>
            </div>

            {/* Generated Summary Box (if generated) */}
            {aiSummary && (
              <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-indigo-500/30 max-h-48 overflow-y-auto space-y-2 text-xs text-slate-200 leading-relaxed custom-scrollbar">
                <div className="flex items-center justify-between text-[10px] font-mono text-indigo-400 font-bold border-b border-slate-800 pb-1">
                  <span>AI Study Guide</span>
                  <button onClick={() => setAiSummary(null)} className="text-slate-500 hover:text-white">
                    ✕
                  </button>
                </div>
                <div className="whitespace-pre-wrap">{aiSummary}</div>
              </div>
            )}

            {/* Chat Conversation History */}
            <div className="flex-1 overflow-y-auto space-y-2.5 p-2 rounded-2xl bg-slate-950/60 border border-slate-800/80 custom-scrollbar">
              {chatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[90%] p-3 rounded-2xl text-xs leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-indigo-600 text-white rounded-br-none'
                        : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-none'
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{msg.text}</div>
                  </div>
                </div>
              ))}
              {isChatSending && (
                <div className="text-[10px] font-mono text-indigo-400 animate-pulse px-2">
                  Gemini Tutor is typing...
                </div>
              )}
            </div>

            {/* Chat Input Box */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                value={inputChat}
                onChange={(e) => setInputChat(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendChatMessage()}
                placeholder={`Ask AI about ${currentVideo.title}...`}
                className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
              <button
                onClick={handleSendChatMessage}
                disabled={isChatSending || !inputChat.trim()}
                className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-40 transition-colors"
              >
                <Send size={14} />
              </button>
            </div>
          </div>
        )}

        {/* Tab 3: Bookmarks */}
        {activeTab === 'bookmarks' && (
          <div className="flex-1 flex flex-col min-h-0 p-3 space-y-3 overflow-hidden">
            {/* Add Bookmark Action */}
            <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-slate-300">
                  Current Time: {formatTime(currentTime)}
                </span>
                <button
                  onClick={() => handleAddBookmark()}
                  className="skeuo-btn px-3 py-1 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs font-mono shadow"
                >
                  + Drop Bookmark (B)
                </button>
              </div>
              {isAddingBookmark && (
                <div className="flex gap-2 pt-1">
                  <input
                    type="text"
                    value={bookmarkTitle}
                    onChange={(e) => setBookmarkTitle(e.target.value)}
                    placeholder="Bookmark label / explanation..."
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    onClick={() => handleAddBookmark()}
                    className="px-3 py-1 bg-indigo-600 text-white text-xs font-mono rounded-xl"
                  >
                    Save
                  </button>
                </div>
              )}
            </div>

            {/* Bookmarks List */}
            <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar">
              {bookmarks.length > 0 ? (
                bookmarks.map((bm) => (
                  <div
                    key={bm.id}
                    className="p-3 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 flex items-center justify-between gap-3 group transition-all"
                  >
                    <button
                      onClick={() => handleSeek(bm.time)}
                      className="flex items-center gap-2 text-left min-w-0"
                    >
                      <span className="px-2 py-0.5 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 font-mono text-xs font-bold">
                        {formatTime(bm.time)}
                      </span>
                      <span className="text-xs font-bold text-slate-200 truncate group-hover:text-indigo-300">
                        {bm.title}
                      </span>
                    </button>
                    <button
                      onClick={() => {
                        deleteBookmark(bm.id);
                        setBookmarks((prev) => prev.filter((b) => b.id !== bm.id));
                      }}
                      className="text-slate-500 hover:text-rose-400 p-1 rounded transition-colors"
                      title="Delete bookmark"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-xs text-slate-500 font-mono">
                  No bookmarks yet. Press <kbd className="px-1 bg-slate-800 rounded text-slate-300">B</kbd> while playing to drop one.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 4: Notes */}
        {activeTab === 'notes' && (
          <div className="flex-1 flex flex-col min-h-0 p-3 space-y-3 overflow-hidden">
            {/* Note Composer */}
            <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-slate-300">
                <span>Attach Note at {formatTime(currentTime)}</span>
                <span className="text-[10px] text-slate-500 font-mono">Hotkey: C</span>
              </div>
              <textarea
                rows={2}
                value={newNoteText}
                onChange={(e) => setNewNoteText(e.target.value)}
                placeholder="Write study formula, key takeaway, or summary note..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
              />
              <div className="flex justify-end">
                <button
                  onClick={handleAddNote}
                  disabled={!newNoteText.trim()}
                  className="skeuo-btn px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-bold text-xs font-mono"
                >
                  Save Timestamp Note
                </button>
              </div>
            </div>

            {/* Notes List */}
            <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar">
              {notes.length > 0 ? (
                notes.map((n) => (
                  <div
                    key={n.id}
                    className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 hover:border-slate-700 transition-all"
                  >
                    <div className="flex items-center justify-between border-b border-slate-800/80 pb-1.5">
                      <button
                        onClick={() => handleSeek(n.time)}
                        className="px-2 py-0.5 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 font-mono text-[11px] font-bold hover:bg-indigo-600 hover:text-white transition-colors"
                      >
                        {formatTime(n.time)}
                      </button>
                      <button
                        onClick={() => {
                          deleteNote(n.id);
                          setNotes((prev) => prev.filter((item) => item.id !== n.id));
                        }}
                        className="text-slate-500 hover:text-rose-400 p-1 transition-colors"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                    <p className="text-xs text-slate-200 whitespace-pre-wrap leading-relaxed">
                      {n.content}
                    </p>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-xs text-slate-500 font-mono">
                  No notes recorded for this lecture yet.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 5: Chapters */}
        {activeTab === 'chapters' && (
          <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
            {chapters.map((ch, idx) => {
              const isPast = currentTime >= ch.time;
              return (
                <div
                  key={idx}
                  onClick={() => handleSeek(ch.time)}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    isPast
                      ? 'bg-slate-900 border-indigo-500/30 text-slate-100'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs">{ch.title}</span>
                    <span className="font-mono text-xs text-indigo-400 font-bold">
                      {formatTime(ch.time)}
                    </span>
                  </div>
                  {ch.summary && (
                    <p className="text-[11px] text-slate-400 mt-1">{ch.summary}</p>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Tab 6: Transcript Search & Seek */}
        {activeTab === 'transcript' && (
          <div className="flex-1 flex flex-col min-h-0 p-3 space-y-3 overflow-hidden">
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={transcriptSearch}
                onChange={(e) => setTranscriptSearch(e.target.value)}
                placeholder="Search transcript text..."
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar">
              {transcriptCues
                .filter((cue) =>
                  cue.text.toLowerCase().includes(transcriptSearch.toLowerCase())
                )
                .map((cue) => {
                  const isCurrent =
                    currentTime >= cue.startTime && currentTime <= cue.endTime;
                  return (
                    <div
                      key={cue.id}
                      onClick={() => handleSeek(cue.startTime)}
                      className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                        isCurrent
                          ? 'bg-indigo-600/15 border-indigo-500 text-slate-100 font-semibold shadow-inner'
                          : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-900'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] font-mono text-indigo-400 mb-1">
                        <span>
                          {formatTime(cue.startTime)} - {formatTime(cue.endTime)}
                        </span>
                        {isCurrent && <span className="animate-pulse">Active</span>}
                      </div>
                      <p className="text-xs leading-relaxed">{cue.text}</p>
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </aside>

      {/* Keyboard Shortcuts Dialog */}
      <KeyboardHelpModal
        isOpen={isKeyboardHelpOpen}
        onClose={() => setIsKeyboardHelpOpen(false)}
      />
    </div>
  );
};

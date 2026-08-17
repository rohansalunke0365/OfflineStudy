import { useState, useEffect, MouseEvent } from 'react';
import { SAMPLE_PLAYLISTS, VAULT_LOGO_URL } from './data/defaultLibrary';
import {
  Playlist,
  ProgressMap,
  RouteState,
  ThemeConfig,
  VideoItem,
  Flashcard,
  QuizResult,
  VideoNote,
  Bookmark,
  AppSettings
} from './types';
import {
  idbGet,
  idbSet,
  loadStoredProgress,
  loadThemePref,
  saveProgressItem,
  saveThemePref,
  loadFlashcards,
  saveFlashcard,
  saveFlashcardsBatch,
  deleteFlashcard,
  loadQuizResults,
  saveQuizResult,
  loadNotes,
  saveNote,
  deleteNote,
  loadBookmarks,
  saveBookmark,
  deleteBookmark,
  loadAppSettings,
  saveAppSettings,
} from './services/db';
import { Vault3DBackground } from './components/Vault3DBackground';
import { TopBar } from './components/TopBar';
import { SideNav } from './components/SideNav';
import { HomeView } from './components/HomeView';
import { PlaylistView } from './components/PlaylistView';
import { PlayerView } from './components/PlayerView';
import { ThemeModal } from './components/ThemeModal';
import { LanAccessModal } from './components/LanAccessModal';
import { AnalyticsView } from './components/AnalyticsView';
import { FlashcardsView } from './components/FlashcardsView';
import { QuizView } from './components/QuizView';
import { NotesView } from './components/NotesView';
import { SettingsView } from './components/SettingsView';
import { downloadStandaloneHtmlFile } from './utils/exportHtml';

const VIDEO_EXTENSIONS = new Set(['mp4', 'mkv', 'webm', 'mov', 'm4v', 'avi', 'ogv', 'flv', 'wmv']);

export default function App() {
  const [playlists, setPlaylists] = useState<Playlist[]>(SAMPLE_PLAYLISTS);
  const [progressMap, setProgressMap] = useState<ProgressMap>({});
  const [currentRoute, setCurrentRoute] = useState<RouteState>({ view: 'home' });
  const [searchQuery, setSearchQuery] = useState('');
  const [themeConfig, setThemeConfig] = useState<ThemeConfig>({
    mode: 'dark',
    custom: {
      bg: '#090d16',
      card: '#0f172a',
      accent: '#6366f1',
      text: '#f8fafc',
    },
  });

  // App Settings
  const [appSettings, setAppSettings] = useState<AppSettings>({
    completionThreshold: 0.92,
    autoAdvance: true,
    defaultPlaybackSpeed: 1,
    theme: {
      mode: 'dark',
      custom: {
        bg: '#090d16',
        card: '#0f172a',
        accent: '#6366f1',
        text: '#f8fafc',
      },
    },
    aiSettings: {
      preferredSummaryStyle: 'detailed',
      temperature: 0.7,
    },
  });

  // StudyVault 2.0 State
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [quizResults, setQuizResults] = useState<QuizResult[]>([]);
  const [notes, setNotes] = useState<VideoNote[]>([]);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);

  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [isLanModalOpen, setIsLanModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [rootHandle, setRootHandle] = useState<FileSystemDirectoryHandle | null>(null);
  const [currentFolderName, setCurrentFolderName] = useState<string | undefined>(undefined);

  // Active Video / Playlist for player
  const [activeVideo, setActiveVideo] = useState<VideoItem | null>(null);
  const [activePlaylist, setActivePlaylist] = useState<Playlist | null>(null);

  // Show toast notification helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Clean filename for titles
  const cleanTitle = (filename: string) => {
    let n = filename.replace(/\.[^.]+$/, '');
    n = n.replace(/\[[^\]]*\]/g, ' ');
    n = n.replace(/\([^)]*\b(1080p|720p|480p|hd|webrip|hevc|x264|x265)\b[^)]*\)/gi, ' ');
    n = n.replace(/[_]+/g, ' ');
    n = n.replace(/[-]{1,}/g, ' - ');
    n = n.replace(/\s{2,}/g, ' ').trim();
    n = n.replace(/^\s*-\s*/, '');
    if (n.length) n = n.charAt(0).toUpperCase() + n.slice(1);
    return n || filename;
  };

  // Natural sorting for names
  const naturalCompare = (a: string, b: string) => {
    return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
  };

  // Initial Load from IndexedDB
  useEffect(() => {
    async function init() {
      const [
        storedProgress,
        savedTheme,
        storedSettings,
        storedCards,
        storedQuizzes,
        storedNotes,
        storedBookmarks,
      ] = await Promise.all([
        loadStoredProgress(),
        loadThemePref(),
        loadAppSettings(),
        loadFlashcards(),
        loadQuizResults(),
        loadNotes(),
        loadBookmarks(),
      ]);

      setProgressMap(storedProgress);
      setThemeConfig(savedTheme);
      setAppSettings(storedSettings);
      applyThemeStyles(savedTheme);

      // Seed sample study data if empty
      if (storedCards.length === 0) {
        const seedCards: Flashcard[] = [
          {
            id: 'card_1',
            videoId: 'entropy-demo-1',
            videoTitle: 'Thermodynamics & Statistical Mechanics',
            folderPath: 'Simulations/Physics',
            front: 'What is the statistical definition of Entropy according to Ludwig Boltzmann?',
            back: 'S = k_B * ln(Omega), where k_B is Boltzmann’s constant and Omega is the number of accessible microstates.',
            topic: 'Boltzmann Distribution',
            difficulty: 'Medium',
            reviewedCount: 1,
            isMastered: false,
          },
          {
            id: 'card_2',
            videoId: 'demo-1',
            videoTitle: 'Distributed Systems & Vector Clocks',
            folderPath: 'Computer Science/Distributed',
            front: 'What fundamental guarantee do Vector Clocks provide over Lamport Timestamps?',
            back: 'Vector clocks allow detecting causal concurrency (determining if two events happened concurrently or if one caused the other).',
            topic: 'Concurrency & Causality',
            difficulty: 'Hard',
            reviewedCount: 0,
            isMastered: false,
          },
          {
            id: 'card_3',
            videoId: 'demo-2',
            videoTitle: 'Deep Learning & Backpropagation Matrix Calculus',
            folderPath: 'AI & Machine Learning',
            front: 'Why is the Jacobian matrix calculation crucial in backpropagation through layers?',
            back: 'It propagates partial derivatives of loss with respect to multi-dimensional tensor activations across computation graph nodes.',
            topic: 'Matrix Calculus',
            difficulty: 'Hard',
            reviewedCount: 2,
            isMastered: true,
          },
        ];
        await saveFlashcardsBatch(seedCards);
        setFlashcards(seedCards);
      } else {
        setFlashcards(storedCards);
      }

      setQuizResults(storedQuizzes);
      setNotes(storedNotes);
      setBookmarks(storedBookmarks);

      // Attempt to check if previous directory handle exists
      try {
        const savedHandle = await idbGet<FileSystemDirectoryHandle>('handles', 'root');
        if (savedHandle) {
          setRootHandle(savedHandle);
          setCurrentFolderName(savedHandle.name);
        }
      } catch {
        // ignore
      }
    }
    init();
  }, []);

  // Apply Theme CSS Variables
  const applyThemeStyles = (theme: ThemeConfig) => {
    const root = document.documentElement;
    if (theme.mode === 'light') {
      root.setAttribute('data-theme', 'light');
      root.classList.remove('dark');
    } else {
      root.setAttribute('data-theme', 'dark');
      root.classList.add('dark');
      if (theme.custom) {
        root.style.setProperty('--bg', theme.custom.bg);
        root.style.setProperty('--bg-card', theme.custom.card);
        root.style.setProperty('--accent', theme.custom.accent);
        root.style.setProperty('--text', theme.custom.text);
      }
    }
  };

  const handleSaveTheme = async (newTheme: ThemeConfig) => {
    setThemeConfig(newTheme);
    applyThemeStyles(newTheme);
    await saveThemePref(newTheme);
    showToast('Theme preferences saved');
  };

  const handleSaveSettings = async (newSettings: AppSettings) => {
    setAppSettings(newSettings);
    await saveAppSettings(newSettings);
  };

  // Real File System Access API scanning
  const pickFolder = async () => {
    if (!('showDirectoryPicker' in window)) {
      showToast('Directory picker is best supported in Chrome, Edge, or Chromium browsers.');
      return;
    }

    try {
      // @ts-expect-error - standard browser API
      const handle: FileSystemDirectoryHandle = await window.showDirectoryPicker();
      await idbSet('handles', 'root', handle);
      setRootHandle(handle);
      setCurrentFolderName(handle.name);
      await scanDirectory(handle);
    } catch (e: unknown) {
      if ((e as Error).name !== 'AbortError') {
        console.error(e);
        showToast('Could not access folder');
      }
    }
  };

  const scanDirectory = async (dirHandle: FileSystemDirectoryHandle) => {
    showToast(`Scanning folder "${dirHandle.name}"...`);
    const groups = new Map<string, { name: string; path: string; videos: VideoItem[] }>();
    let count = 0;

    async function walk(currentHandle: FileSystemDirectoryHandle, pathParts: string[]) {
      // @ts-expect-error - async iterator for directory entries
      for await (const [name, entry] of currentHandle.entries()) {
        if (entry.kind === 'file') {
          const ext = name.split('.').pop()?.toLowerCase() || '';
          if (VIDEO_EXTENSIONS.has(ext)) {
            const folderPath = pathParts.join('/') || dirHandle.name;
            const folderName = pathParts.length ? pathParts[pathParts.length - 1] : dirHandle.name;

            if (!groups.has(folderPath)) {
              groups.set(folderPath, {
                name: folderName,
                path: folderPath,
                videos: [],
              });
            }

            const file = await entry.getFile();
            const id = pathParts.concat(name).join('/');

            groups.get(folderPath)!.videos.push({
              id,
              name,
              title: cleanTitle(name),
              chapter: `ITEM ${groups.get(folderPath)!.videos.length + 1} • ${folderName.toUpperCase()}`,
              fileHandle: entry,
              size: file.size,
              lastModified: file.lastModified,
              folderPath,
              ext,
              duration: 0,
            });
            count++;
          }
        } else if (entry.kind === 'directory') {
          await walk(entry, pathParts.concat(name));
        }
      }
    }

    await walk(dirHandle, []);

    if (count === 0) {
      showToast('No video files found in selected folder');
      return;
    }

    const newPlaylists: Playlist[] = [];
    for (const [path, g] of groups) {
      g.videos.sort((a, b) => naturalCompare(a.name, b.name));
      newPlaylists.push({
        id: `local-${path.replace(/[^a-zA-Z0-9_-]/g, '_')}`,
        name: g.name,
        path: g.path,
        badge: 'Local Folder',
        description: `Local videos discovered in ${g.path}`,
        videos: g.videos,
      });
    }

    setPlaylists([...newPlaylists, ...SAMPLE_PLAYLISTS]);
    showToast(
      `Loaded ${count} video${count === 1 ? '' : 's'} across ${newPlaylists.length} playlist${
        newPlaylists.length === 1 ? '' : 's'
      }`
    );
    setCurrentRoute({ view: 'home' });
  };

  const rescanFolder = async () => {
    if (rootHandle) {
      try {
        await scanDirectory(rootHandle);
      } catch {
        pickFolder();
      }
    } else {
      pickFolder();
    }
  };

  // Play Video Action
  const handlePlayVideo = (video: VideoItem) => {
    const parentPlaylist =
      playlists.find((p) => p.videos.some((v) => v.id === video.id)) || playlists[0];
    setActiveVideo(video);
    setActivePlaylist(parentPlaylist);
    setCurrentRoute({
      view: 'player',
      playlistId: parentPlaylist.id,
      videoId: video.id,
    });
  };

  // Play Video At Specific Timestamp
  const handlePlayVideoAtTime = (videoId: string, time: number) => {
    const all = playlists.flatMap((p) => p.videos);
    const targetVideo = all.find((v) => v.id === videoId);
    if (!targetVideo) {
      showToast('Video not found in library');
      return;
    }
    const parentPlaylist =
      playlists.find((p) => p.videos.some((v) => v.id === targetVideo.id)) || playlists[0];

    handleSaveProgress(videoId, time, targetVideo.duration || 1000, false);
    setActiveVideo(targetVideo);
    setActivePlaylist(parentPlaylist);
    setCurrentRoute({
      view: 'player',
      playlistId: parentPlaylist.id,
      videoId: targetVideo.id,
    });
  };

  // Save Video Progress
  const handleSaveProgress = (videoId: string, time: number, duration: number, watched: boolean) => {
    const prev = progressMap[videoId];
    const updated = {
      time,
      duration: duration || prev?.duration || 0,
      watched: watched || prev?.watched || false,
      lastWatched: Date.now(),
      savedToVault: prev?.savedToVault,
    };
    setProgressMap((prevMap) => ({ ...prevMap, [videoId]: updated }));
    saveProgressItem(videoId, updated);
  };

  // Toggle Save to Vault (Bookmark)
  const handleToggleSaveToVault = (videoId: string, e?: MouseEvent) => {
    if (e) e.stopPropagation();
    const prev = progressMap[videoId] || {
      time: 0,
      duration: 0,
      watched: false,
      lastWatched: Date.now(),
    };
    const nextSaved = !prev.savedToVault;
    const updated = { ...prev, savedToVault: nextSaved };

    setProgressMap((prevMap) => ({ ...prevMap, [videoId]: updated }));
    saveProgressItem(videoId, updated);
    showToast(nextSaved ? 'Saved to Vault bookmark archive' : 'Removed from Vault bookmarks');
  };

  // Flashcards Handlers
  const handleSaveFlashcard = async (card: Flashcard) => {
    await saveFlashcard(card);
    setFlashcards((prev) => {
      const idx = prev.findIndex((c) => c.id === card.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = card;
        return copy;
      }
      return [card, ...prev];
    });
  };

  const handleSaveFlashcardsBatch = async (newCards: Flashcard[]) => {
    await saveFlashcardsBatch(newCards);
    setFlashcards((prev) => [...newCards, ...prev]);
  };

  const handleDeleteFlashcard = async (cardId: string) => {
    await deleteFlashcard(cardId);
    setFlashcards((prev) => prev.filter((c) => c.id !== cardId));
    showToast('Deleted flashcard');
  };

  // Quiz Handlers
  const handleSaveQuizResult = async (result: QuizResult) => {
    await saveQuizResult(result);
    setQuizResults((prev) => [result, ...prev]);
  };

  // Notes & Bookmarks Handlers
  const handleDeleteNote = async (noteId: string) => {
    await deleteNote(noteId);
    setNotes((prev) => prev.filter((n) => n.id !== noteId));
    showToast('Deleted note');
  };

  const handleDeleteBookmark = async (bookmarkId: string) => {
    await deleteBookmark(bookmarkId);
    setBookmarks((prev) => prev.filter((b) => b.id !== bookmarkId));
    showToast('Deleted bookmark');
  };

  // Export 1-File Standalone HTML
  const handleExportStandaloneHtml = () => {
    downloadStandaloneHtmlFile();
    showToast('Downloaded standalone StudyVault.html file');
  };

  // Total Counts
  const allVideos = playlists.flatMap((p) => p.videos);
  const continueCount = allVideos.filter((v) => {
    const p = progressMap[v.id];
    return p && p.time > 5 && !p.watched;
  }).length;
  const savedCount = allVideos.filter((v) => progressMap[v.id]?.savedToVault).length;

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans relative overflow-x-hidden">
      {/* 3D Three.js Vault Floating Background */}
      <Vault3DBackground opacity={0.35} interactive={currentRoute.view !== 'player'} />

      {/* Top Navigation Bar */}
      <TopBar
        searchQuery={searchQuery}
        onSearchChange={(q) => setSearchQuery(q)}
        onPickFolder={pickFolder}
        onRescan={rescanFolder}
        hasLocalFolder={!!rootHandle}
        onOpenThemeModal={() => setIsThemeModalOpen(true)}
        onOpenLanModal={() => setIsLanModalOpen(true)}
        onExportStandaloneHtml={handleExportStandaloneHtml}
        currentFolderName={currentFolderName}
      />

      {/* Main Layout Body with Sidebar + View Stage */}
      <div className="flex-1 flex min-h-0 relative z-10">
        {/* Sidebar Nav */}
        {currentRoute.view !== 'player' && (
          <SideNav
            currentRoute={currentRoute}
            onNavigate={(route) => {
              setSearchQuery('');
              setCurrentRoute(route);
            }}
            playlists={playlists}
            continueCount={continueCount}
            savedCount={savedCount}
            totalVideoCount={allVideos.length}
            onPickFolder={pickFolder}
          />
        )}

        {/* Dynamic Route View */}
        <main className="flex-1 overflow-y-auto min-w-0 pb-16 md:pb-0 custom-scrollbar">
          {/* 1. Home View */}
          {currentRoute.view === 'home' && (
            <HomeView
              playlists={playlists}
              progressMap={progressMap}
              onPlayVideo={handlePlayVideo}
              onNavigate={setCurrentRoute}
              onToggleSaveVideo={handleToggleSaveToVault}
              onPickFolder={pickFolder}
              searchQuery={searchQuery}
            />
          )}

          {/* 2. Continue Watching View */}
          {currentRoute.view === 'continue' && (
            <HomeView
              playlists={playlists}
              progressMap={progressMap}
              onPlayVideo={handlePlayVideo}
              onNavigate={setCurrentRoute}
              onToggleSaveVideo={handleToggleSaveToVault}
              onPickFolder={pickFolder}
              searchQuery={searchQuery}
              activeFilter="continue"
            />
          )}

          {/* 3. Saved to Vault View */}
          {currentRoute.view === 'saved' && (
            <HomeView
              playlists={playlists}
              progressMap={progressMap}
              onPlayVideo={handlePlayVideo}
              onNavigate={setCurrentRoute}
              onToggleSaveVideo={handleToggleSaveToVault}
              onPickFolder={pickFolder}
              searchQuery={searchQuery}
              activeFilter="saved"
            />
          )}

          {/* 4. Single Playlist View */}
          {currentRoute.view === 'playlist' && (
            <PlaylistView
              playlist={playlists.find((p) => p.id === currentRoute.playlistId) || playlists[0]}
              progressMap={progressMap}
              onPlayVideo={handlePlayVideo}
              onBack={() => setCurrentRoute({ view: 'home' })}
              onToggleSaveVideo={handleToggleSaveToVault}
            />
          )}

          {/* 5. 3D & Video Player View */}
          {currentRoute.view === 'player' && activeVideo && activePlaylist && (
            <PlayerView
              currentVideo={activeVideo}
              playlist={activePlaylist}
              progressMap={progressMap}
              onSelectVideo={(video) => handlePlayVideo(video)}
              onBack={() => setCurrentRoute({ view: 'playlist', playlistId: activePlaylist.id })}
              onSaveProgress={handleSaveProgress}
              onToggleSaveToVault={handleToggleSaveToVault}
              onNavigateToFlashcards={() => setCurrentRoute({ view: 'flashcards' })}
              onNavigateToQuiz={() => setCurrentRoute({ view: 'quiz' })}
            />
          )}

          {/* 6. Analytics View */}
          {currentRoute.view === 'analytics' && (
            <AnalyticsView
              playlists={playlists}
              progressMap={progressMap}
              quizResults={quizResults}
              onNavigateToCourse={(playlistId) => setCurrentRoute({ view: 'playlist', playlistId })}
            />
          )}

          {/* 7. Flashcards View */}
          {currentRoute.view === 'flashcards' && (
            <FlashcardsView
              flashcards={flashcards}
              playlists={playlists}
              onSaveFlashcard={handleSaveFlashcard}
              onSaveBatch={handleSaveFlashcardsBatch}
              onDeleteFlashcard={handleDeleteFlashcard}
              onShowToast={showToast}
            />
          )}

          {/* 8. Interactive Quizzes View */}
          {currentRoute.view === 'quiz' && (
            <QuizView
              playlists={playlists}
              quizResults={quizResults}
              onSaveQuizResult={handleSaveQuizResult}
              onShowToast={showToast}
            />
          )}

          {/* 9. Notes & Bookmarks Archive View */}
          {currentRoute.view === 'notes' && (
            <NotesView
              notes={notes}
              bookmarks={bookmarks}
              playlists={playlists}
              onPlayVideoAtTime={handlePlayVideoAtTime}
              onDeleteNote={handleDeleteNote}
              onDeleteBookmark={handleDeleteBookmark}
              onShowToast={showToast}
            />
          )}

          {/* 10. Settings & Diagnostics View */}
          {currentRoute.view === 'settings' && (
            <SettingsView
              settings={appSettings}
              onSaveSettings={handleSaveSettings}
              onSaveTheme={handleSaveTheme}
              onShowToast={showToast}
              onRescanLibrary={rescanFolder}
            />
          )}
        </main>
      </div>

      {/* Theme Settings Modal */}
      <ThemeModal
        isOpen={isThemeModalOpen}
        onClose={() => setIsThemeModalOpen(false)}
        currentTheme={themeConfig}
        onSaveTheme={handleSaveTheme}
      />

      {/* Local LAN Access Modal */}
      <LanAccessModal
        isOpen={isLanModalOpen}
        onClose={() => setIsLanModalOpen(false)}
        onExportStandaloneHtml={handleExportStandaloneHtml}
      />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900 border border-slate-700 text-white text-xs md:text-sm font-mono py-2.5 px-5 rounded-2xl shadow-2xl animate-bounce flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_#6366f1]" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}

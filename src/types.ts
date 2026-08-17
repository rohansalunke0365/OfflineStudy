export interface VideoItem {
  id: string;
  name: string;
  title: string;
  chapter?: string;
  description?: string;
  duration?: number; // seconds
  size?: number; // bytes
  lastModified?: number;
  folderPath: string;
  ext: string;
  thumbnailUrl?: string;
  videoUrl?: string;
  fileHandle?: FileSystemFileHandle;
  is3dSimulation?: boolean;
  simulationType?: 'thermodynamics' | 'quantum' | 'circuits' | 'neural';
  tags?: string[];
  transcripts?: TranscriptCue[];
}

export interface Playlist {
  id: string;
  name: string;
  path: string;
  description?: string;
  badge?: string;
  videos: VideoItem[];
  dirDepth?: number;
  _sortKey?: SortKey;
}

export type SortKey = 
  | 'natural'
  | 'dateModAsc'
  | 'dateModDesc'
  | 'az'
  | 'za'
  | 'duration'
  | 'unwatched'
  | 'watched'
  | 'recentWatched';

export interface VideoProgress {
  time: number;
  duration: number;
  watched: boolean;
  lastWatched: number;
  savedToVault?: boolean;
  notes?: string;
  playbackSpeed?: number;
}

export type ProgressMap = Record<string, VideoProgress>;

export interface Bookmark {
  id: string;
  videoId: string;
  videoTitle: string;
  folderPath: string;
  time: number;
  title: string;
  note?: string;
  createdAt: number;
}

export interface VideoNote {
  id: string;
  videoId: string;
  videoTitle: string;
  folderPath: string;
  time: number;
  content: string;
  createdAt: number;
  updatedAt: number;
}

export interface VideoChapter {
  time: number;
  title: string;
  summary?: string;
}

export interface TranscriptCue {
  id: string;
  startTime: number;
  endTime: number;
  text: string;
}

export interface Flashcard {
  id: string;
  videoId: string;
  videoTitle: string;
  folderPath: string;
  front: string;
  back: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  topic: string;
  reviewedCount: number;
  isMastered: boolean;
  lastReviewed?: number;
}

export interface QuizQuestion {
  id: string;
  videoId: string;
  videoTitle: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  topic: string;
  userSelectedIndex?: number;
}

export interface QuizResult {
  id: string;
  videoId: string;
  videoTitle: string;
  score: number;
  total: number;
  percentage: number;
  completedAt: number;
  questions: QuizQuestion[];
}

export interface AppSettings {
  completionThreshold: number; // default 0.92
  autoAdvance: boolean;
  defaultPlaybackSpeed: number;
  theme: ThemeConfig;
  enable3dSimulationDemos: boolean;
}

export type RouteView = 
  | 'home' 
  | 'continue' 
  | 'playlist' 
  | 'player' 
  | 'search' 
  | 'saved' 
  | 'analytics' 
  | 'flashcards' 
  | 'quiz' 
  | 'notes' 
  | 'settings';

export interface RouteState {
  view: RouteView;
  playlistId?: string;
  videoId?: string;
  q?: string;
  tab?: string;
}

export interface ThemeConfig {
  mode: 'dark' | 'light' | 'obsidian' | 'cyber' | 'custom';
  custom: {
    bg: string;
    card: string;
    accent: string;
    text: string;
  };
}

import {
  ProgressMap,
  ThemeConfig,
  Bookmark,
  VideoNote,
  Flashcard,
  QuizResult,
  VideoChapter,
  AppSettings
} from '../types';
import { INITIAL_PROGRESS } from '../data/defaultLibrary';

const DB_NAME = 'studyvault_v2_idb';
const DB_VER = 2;

let dbPromise: Promise<IDBDatabase> | null = null;

export function getDB(): Promise<IDBDatabase> {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !window.indexedDB) {
        reject(new Error('IndexedDB not supported'));
        return;
      }
      const req = indexedDB.open(DB_NAME, DB_VER);
      req.onupgradeneeded = () => {
        const db = req.result;
        const stores = [
          'handles',
          'thumbs',
          'progress',
          'meta',
          'bookmarks',
          'notes',
          'flashcards',
          'quizzes',
          'chapters',
          'ai_cache',
          'settings'
        ];
        stores.forEach((s) => {
          if (!db.objectStoreNames.contains(s)) {
            db.createObjectStore(s);
          }
        });
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }
  return dbPromise;
}

export async function idbGet<T>(storeName: string, key: string): Promise<T | null> {
  try {
    const db = await getDB();
    return new Promise((res) => {
      const tx = db.transaction(storeName, 'readonly').objectStore(storeName).get(key);
      tx.onsuccess = () => res(tx.result ?? null);
      tx.onerror = () => res(null);
    });
  } catch {
    const raw = localStorage.getItem(`sv2_${storeName}_${key}`);
    return raw ? JSON.parse(raw) : null;
  }
}

export async function idbSet<T>(storeName: string, key: string, val: T): Promise<void> {
  try {
    const db = await getDB();
    return new Promise((res, rej) => {
      const tx = db.transaction(storeName, 'readwrite').objectStore(storeName).put(val, key);
      tx.onsuccess = () => res();
      tx.onerror = () => rej(tx.error);
    });
  } catch {
    try {
      localStorage.setItem(`sv2_${storeName}_${key}`, JSON.stringify(val));
    } catch (e) {
      console.warn('Storage error', e);
    }
  }
}

export async function idbDelete(storeName: string, key: string): Promise<void> {
  try {
    const db = await getDB();
    return new Promise((res, rej) => {
      const tx = db.transaction(storeName, 'readwrite').objectStore(storeName).delete(key);
      tx.onsuccess = () => res();
      tx.onerror = () => rej(tx.error);
    });
  } catch {
    localStorage.removeItem(`sv2_${storeName}_${key}`);
  }
}

export async function idbAll<T>(storeName: string): Promise<Record<string, T>> {
  try {
    const db = await getDB();
    return new Promise((res) => {
      const out: Record<string, T> = {};
      const cur = db.transaction(storeName, 'readonly').objectStore(storeName).openCursor();
      cur.onsuccess = (e) => {
        const cursor = (e.target as IDBRequest).result;
        if (cursor) {
          out[cursor.key as string] = cursor.value;
          cursor.continue();
        } else {
          res(out);
        }
      };
      cur.onerror = () => res({});
    });
  } catch {
    const out: Record<string, T> = {};
    const prefix = `sv2_${storeName}_`;
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(prefix)) {
        const itemKey = k.slice(prefix.length);
        try {
          out[itemKey] = JSON.parse(localStorage.getItem(k) || '');
        } catch {
          // ignore
        }
      }
    }
    return out;
  }
}

export async function idbClearStore(storeName: string): Promise<void> {
  try {
    const db = await getDB();
    return new Promise((res, rej) => {
      const tx = db.transaction(storeName, 'readwrite').objectStore(storeName).clear();
      tx.onsuccess = () => res();
      tx.onerror = () => rej(tx.error);
    });
  } catch {
    // clear matching localstorage keys
    const prefix = `sv2_${storeName}_`;
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(prefix)) keysToRemove.push(k);
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k));
  }
}

// Progress Helpers
export async function loadStoredProgress(): Promise<ProgressMap> {
  const loaded = await idbAll<{ time: number; duration: number; watched: boolean; lastWatched: number; savedToVault?: boolean; playbackSpeed?: number }>('progress');
  return { ...INITIAL_PROGRESS, ...loaded };
}

export async function saveProgressItem(id: string, progress: { time: number; duration: number; watched: boolean; lastWatched: number; savedToVault?: boolean; playbackSpeed?: number }) {
  await idbSet('progress', id, progress);
}

// Theme Helpers
export async function loadThemePref(): Promise<ThemeConfig> {
  const saved = await idbGet<ThemeConfig>('meta', 'themePref');
  if (saved) return saved;
  return {
    mode: 'dark',
    custom: {
      bg: '#0f172a',
      card: '#1e293b',
      accent: '#6366f1',
      text: '#f8fafc',
    },
  };
}

export async function saveThemePref(pref: ThemeConfig): Promise<void> {
  await idbSet('meta', 'themePref', pref);
}

// Settings Helpers
export async function loadAppSettings(): Promise<AppSettings> {
  const saved = await idbGet<AppSettings>('settings', 'config');
  if (saved) return saved;
  return {
    completionThreshold: 0.92,
    autoAdvance: true,
    defaultPlaybackSpeed: 1,
    theme: {
      mode: 'dark',
      custom: {
        bg: '#0f172a',
        card: '#1e293b',
        accent: '#6366f1',
        text: '#f8fafc',
      },
    },
    enable3dSimulationDemos: true,
  };
}

export async function saveAppSettings(settings: AppSettings): Promise<void> {
  await idbSet('settings', 'config', settings);
}

// Bookmarks
export async function loadBookmarks(): Promise<Bookmark[]> {
  const map = await idbAll<Bookmark>('bookmarks');
  return Object.values(map).sort((a, b) => b.createdAt - a.createdAt);
}

export async function saveBookmark(bookmark: Bookmark): Promise<void> {
  await idbSet('bookmarks', bookmark.id, bookmark);
}

export async function deleteBookmark(bookmarkId: string): Promise<void> {
  await idbDelete('bookmarks', bookmarkId);
}

// Notes
export async function loadNotes(): Promise<VideoNote[]> {
  const map = await idbAll<VideoNote>('notes');
  return Object.values(map).sort((a, b) => b.updatedAt - a.updatedAt);
}

export async function saveNote(note: VideoNote): Promise<void> {
  await idbSet('notes', note.id, note);
}

export async function deleteNote(noteId: string): Promise<void> {
  await idbDelete('notes', noteId);
}

// Flashcards
export async function loadFlashcards(): Promise<Flashcard[]> {
  const map = await idbAll<Flashcard>('flashcards');
  return Object.values(map);
}

export async function saveFlashcard(card: Flashcard): Promise<void> {
  await idbSet('flashcards', card.id, card);
}

export async function saveFlashcardsBatch(cards: Flashcard[]): Promise<void> {
  for (const card of cards) {
    await idbSet('flashcards', card.id, card);
  }
}

export async function deleteFlashcard(cardId: string): Promise<void> {
  await idbDelete('flashcards', cardId);
}

// Quizzes
export async function loadQuizResults(): Promise<QuizResult[]> {
  const map = await idbAll<QuizResult>('quizzes');
  return Object.values(map).sort((a, b) => b.completedAt - a.completedAt);
}

export async function saveQuizResult(quiz: QuizResult): Promise<void> {
  await idbSet('quizzes', quiz.id, quiz);
}

// Chapters
export async function loadChapters(videoId: string): Promise<VideoChapter[]> {
  const chapters = await idbGet<VideoChapter[]>('chapters', videoId);
  return chapters || [];
}

export async function saveChapters(videoId: string, chapters: VideoChapter[]): Promise<void> {
  await idbSet('chapters', videoId, chapters);
}

// Full Library JSON Metadata Export & Import
export async function exportAllMetadata(): Promise<string> {
  const [progress, bookmarks, notes, flashcards, quizzes, settings] = await Promise.all([
    idbAll('progress'),
    idbAll('bookmarks'),
    idbAll('notes'),
    idbAll('flashcards'),
    idbAll('quizzes'),
    idbGet('settings', 'config'),
  ]);

  const backupData = {
    appName: 'StudyVault 2.0',
    version: '2.0.0',
    exportedAt: new Date().toISOString(),
    progress,
    bookmarks,
    notes,
    flashcards,
    quizzes,
    settings,
  };

  return JSON.stringify(backupData, null, 2);
}

export async function importMetadata(jsonString: string): Promise<{ success: boolean; count: number; error?: string }> {
  try {
    const data = JSON.parse(jsonString);
    let count = 0;

    if (data.progress) {
      for (const [k, v] of Object.entries(data.progress)) {
        await idbSet('progress', k, v);
        count++;
      }
    }
    if (data.bookmarks) {
      for (const [k, v] of Object.entries(data.bookmarks)) {
        await idbSet('bookmarks', k, v);
        count++;
      }
    }
    if (data.notes) {
      for (const [k, v] of Object.entries(data.notes)) {
        await idbSet('notes', k, v);
        count++;
      }
    }
    if (data.flashcards) {
      for (const [k, v] of Object.entries(data.flashcards)) {
        await idbSet('flashcards', k, v);
        count++;
      }
    }
    if (data.quizzes) {
      for (const [k, v] of Object.entries(data.quizzes)) {
        await idbSet('quizzes', k, v);
        count++;
      }
    }
    if (data.settings) {
      await idbSet('settings', 'config', data.settings);
      count++;
    }

    return { success: true, count };
  } catch (err: any) {
    return { success: false, count: 0, error: err.message || 'Invalid JSON format' };
  }
}

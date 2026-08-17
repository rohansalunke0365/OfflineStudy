import { Flashcard, QuizQuestion, VideoChapter } from '../types';

export interface SummarizeParams {
  videoTitle: string;
  courseName: string;
  type?: 'quick' | 'detailed' | 'revision' | 'oneminute';
  contextText?: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export async function generateAISummary(params: SummarizeParams): Promise<string> {
  const res = await fetch('/api/gemini/summarize', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Server responded with status ${res.status}`);
  }

  const data = await res.json();
  return data.summary;
}

export async function sendAITutorMessage(
  message: string,
  videoTitle: string,
  courseName: string,
  contextText?: string
): Promise<string> {
  const res = await fetch('/api/gemini/tutor', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, videoTitle, courseName, contextText }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Server responded with status ${res.status}`);
  }

  const data = await res.json();
  return data.reply;
}

export async function generateAIFlashcards(
  videoTitle: string,
  courseName: string,
  count = 6,
  contextText?: string
): Promise<Array<{ front: string; back: string; difficulty: 'Easy' | 'Medium' | 'Hard'; topic: string }>> {
  const res = await fetch('/api/gemini/flashcards', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ videoTitle, courseName, count, contextText }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Server responded with status ${res.status}`);
  }

  const data = await res.json();
  return data.flashcards || [];
}

export async function generateAIQuiz(
  videoTitle: string,
  courseName: string,
  count = 5,
  contextText?: string
): Promise<Array<Omit<QuizQuestion, 'id' | 'videoId' | 'videoTitle'>>> {
  const res = await fetch('/api/gemini/quiz', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ videoTitle, courseName, count, contextText }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Server responded with status ${res.status}`);
  }

  const data = await res.json();
  return data.quiz || [];
}

export async function generateAIChapters(
  videoTitle: string,
  courseName: string,
  durationSec = 1800,
  contextText?: string
): Promise<VideoChapter[]> {
  const res = await fetch('/api/gemini/chapters', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ videoTitle, courseName, durationSec, contextText }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Server responded with status ${res.status}`);
  }

  const data = await res.json();
  return data.chapters || [];
}

export async function performSemanticSearch(
  query: string,
  libraryList: Array<{ id: string; title: string; course: string; chapter?: string }>
): Promise<{ matches: Array<{ id: string; relevanceScore: number; reason: string }>; conceptExplanation?: string }> {
  const res = await fetch('/api/gemini/semantic-search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, libraryList }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Server responded with status ${res.status}`);
  }

  return await res.json();
}

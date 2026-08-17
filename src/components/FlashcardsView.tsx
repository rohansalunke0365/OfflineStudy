import { useState, useMemo } from 'react';
import { Flashcard, Playlist, VideoItem } from '../types';
import {
  Sparkles,
  RotateCw,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  BookOpen,
  Filter,
  RefreshCw,
  Layers
} from 'lucide-react';
import { generateAIFlashcards } from '../services/aiService';

interface FlashcardsViewProps {
  flashcards: Flashcard[];
  playlists: Playlist[];
  onSaveFlashcard: (card: Flashcard) => void;
  onSaveBatch: (cards: Flashcard[]) => void;
  onDeleteFlashcard: (cardId: string) => void;
  onShowToast: (msg: string) => void;
}

export const FlashcardsView = ({
  flashcards,
  playlists,
  onSaveFlashcard,
  onSaveBatch,
  onDeleteFlashcard,
  onShowToast,
}: FlashcardsViewProps) => {
  const [selectedFolder, setSelectedFolder] = useState<string>('all');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // New Card Modal State
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [newFront, setNewFront] = useState('');
  const [newBack, setNewBack] = useState('');
  const [newTopic, setNewTopic] = useState('');
  const [newDifficulty, setNewDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');

  // AI Gen Selector
  const [selectedVideoForAI, setSelectedVideoForAI] = useState<string>('');

  const allVideos = useMemo(() => playlists.flatMap((p) => p.videos), [playlists]);

  const filteredCards = useMemo(() => {
    if (selectedFolder === 'all') return flashcards;
    return flashcards.filter((c) => c.folderPath === selectedFolder);
  }, [flashcards, selectedFolder]);

  const currentCard = filteredCards[currentIndex] || null;

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % (filteredCards.length || 1));
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + filteredCards.length) % (filteredCards.length || 1));
  };

  const handleToggleMastered = (card: Flashcard) => {
    const updated: Flashcard = {
      ...card,
      isMastered: !card.isMastered,
      reviewedCount: card.reviewedCount + 1,
      lastReviewed: Date.now(),
    };
    onSaveFlashcard(updated);
    onShowToast(updated.isMastered ? 'Marked card as Mastered' : 'Moved to Review Deck');
  };

  const handleRateDifficulty = (card: Flashcard, diff: 'Easy' | 'Medium' | 'Hard') => {
    const updated: Flashcard = {
      ...card,
      difficulty: diff,
      reviewedCount: card.reviewedCount + 1,
      lastReviewed: Date.now(),
    };
    onSaveFlashcard(updated);
    handleNext();
  };

  // Generate Flashcards with Gemini AI
  const handleGenerateAIDeck = async () => {
    const targetVideo = allVideos.find((v) => v.id === selectedVideoForAI) || allVideos[0];
    if (!targetVideo) {
      onShowToast('Please select a video lecture first');
      return;
    }

    setIsGenerating(true);
    onShowToast(`Generating AI flashcard deck for "${targetVideo.title}"...`);

    try {
      const parentPlaylist = playlists.find((p) => p.videos.some((v) => v.id === targetVideo.id));
      const aiCards = await generateAIFlashcards(
        targetVideo.title,
        parentPlaylist?.name || 'Computer Science Course',
        6,
        targetVideo.description
      );

      if (!aiCards || aiCards.length === 0) {
        throw new Error('No flashcards returned');
      }

      const formatted: Flashcard[] = aiCards.map((c, idx) => ({
        id: `card_${Date.now()}_${idx}`,
        videoId: targetVideo.id,
        videoTitle: targetVideo.title,
        folderPath: targetVideo.folderPath,
        front: c.front,
        back: c.back,
        difficulty: c.difficulty || 'Medium',
        topic: c.topic || targetVideo.title,
        reviewedCount: 0,
        isMastered: false,
      }));

      onSaveBatch(formatted);
      onShowToast(`Created ${formatted.length} high-yield flashcards!`);
      setSelectedFolder('all');
      setCurrentIndex(0);
    } catch (err: any) {
      console.error(err);
      onShowToast(err.message || 'Failed to generate AI flashcards');
    } finally {
      setIsGenerating(false);
    }
  };

  // Manual Add Card
  const handleAddManualCard = () => {
    if (!newFront.trim() || !newBack.trim()) {
      onShowToast('Please enter both front and back content');
      return;
    }
    const targetVideo = allVideos[0];
    const card: Flashcard = {
      id: `card_${Date.now()}`,
      videoId: targetVideo ? targetVideo.id : 'manual',
      videoTitle: targetVideo ? targetVideo.title : 'General Concept',
      folderPath: targetVideo ? targetVideo.folderPath : 'General',
      front: newFront.trim(),
      back: newBack.trim(),
      topic: newTopic.trim() || 'General',
      difficulty: newDifficulty,
      reviewedCount: 0,
      isMastered: false,
    };
    onSaveFlashcard(card);
    setNewFront('');
    setNewBack('');
    setNewTopic('');
    setIsNewModalOpen(false);
    onShowToast('New flashcard created');
  };

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-8 animate-fadeIn">
      {/* Top Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-indigo-400 uppercase tracking-widest font-bold mb-1">
            <Layers size={14} />
            <span>Active Recall Deck</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-100 tracking-tight">
            Interactive Flashcards
          </h1>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            Master complex formulas, algorithms, and theory through spaced repetition.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setIsNewModalOpen(true)}
            className="skeuo-btn flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-slate-200 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <Plus size={14} className="text-indigo-400" />
            <span>Custom Card</span>
          </button>
        </div>
      </div>

      {/* AI Deck Generator Box */}
      <div className="p-5 rounded-3xl bg-slate-900/90 border border-indigo-500/30 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 flex-shrink-0">
            <Sparkles size={20} className={isGenerating ? 'animate-spin' : ''} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-200">
              Generate AI Flashcard Deck with Gemini
            </h3>
            <p className="text-xs text-slate-400">
              Instantly create question &amp; answer review cards for any course lecture.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={selectedVideoForAI}
            onChange={(e) => setSelectedVideoForAI(e.target.value)}
            className="flex-1 md:w-56 bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-500"
          >
            <option value="">Choose video lecture...</option>
            {allVideos.map((v) => (
              <option key={v.id} value={v.id}>
                {v.title}
              </option>
            ))}
          </select>

          <button
            onClick={handleGenerateAIDeck}
            disabled={isGenerating}
            className="skeuo-btn flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs font-mono shadow-lg shadow-indigo-500/25 transition-all flex-shrink-0"
          >
            <Sparkles size={14} />
            <span>{isGenerating ? 'Synthesizing...' : 'Generate Deck'}</span>
          </button>
        </div>
      </div>

      {/* Filter Chips by Folder */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <span className="text-xs font-mono text-slate-500 flex items-center gap-1 mr-2 flex-shrink-0">
          <Filter size={12} /> Filter:
        </span>
        <button
          onClick={() => {
            setSelectedFolder('all');
            setCurrentIndex(0);
          }}
          className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all flex-shrink-0 ${
            selectedFolder === 'all'
              ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/30'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          All ({flashcards.length})
        </button>
        {playlists.map((pl) => {
          const count = flashcards.filter((c) => c.folderPath === pl.path).length;
          return (
            <button
              key={pl.id}
              onClick={() => {
                setSelectedFolder(pl.path);
                setCurrentIndex(0);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all flex-shrink-0 ${
                selectedFolder === pl.path
                  ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/30'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {pl.name} ({count})
            </button>
          );
        })}
      </div>

      {/* Main Flashcard Interactive Stage */}
      {filteredCards.length > 0 && currentCard ? (
        <div className="space-y-6">
          {/* Card Stage with 3D Flip Container */}
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className="min-h-[320px] md:min-h-[380px] p-8 md:p-12 rounded-3xl bg-slate-900 border border-slate-800 hover:border-slate-700 shadow-2xl flex flex-col justify-between cursor-pointer transition-all relative overflow-hidden group select-none"
          >
            {/* Top Card Badge / Meta */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
                  {currentCard.topic}
                </span>
                <span
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                    currentCard.difficulty === 'Easy'
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                      : currentCard.difficulty === 'Hard'
                      ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                      : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                  }`}
                >
                  {currentCard.difficulty}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-slate-400 font-semibold">
                  Card {currentIndex + 1} of {filteredCards.length}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteFlashcard(currentCard.id);
                  }}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                  title="Delete card"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>

            {/* Card Content (Front vs Back) */}
            <div className="my-auto py-6 text-center">
              <div className="text-[11px] font-mono uppercase tracking-widest text-indigo-400 font-bold mb-3">
                {isFlipped ? '💡 ANSWER / EXPLANATION' : '❓ CONCEPT / QUESTION'}
              </div>
              <p className="text-lg md:text-2xl font-bold text-slate-100 leading-relaxed max-w-2xl mx-auto">
                {isFlipped ? currentCard.back : currentCard.front}
              </p>
            </div>

            {/* Bottom Flip Hint & Mastered Toggle */}
            <div className="flex items-center justify-between border-t border-slate-800/80 pt-4 text-xs font-mono text-slate-400">
              <div className="flex items-center gap-1.5 text-slate-400 group-hover:text-indigo-400 transition-colors">
                <RotateCw size={13} className="animate-spin-slow" />
                <span>Click card or space to flip</span>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleMastered(currentCard);
                }}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-mono transition-colors ${
                  currentCard.isMastered
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : 'bg-slate-800 text-slate-300 hover:text-white'
                }`}
              >
                <CheckCircle2 size={13} />
                <span>{currentCard.isMastered ? 'Mastered' : 'Mark Mastered'}</span>
              </button>
            </div>
          </div>

          {/* Navigation & Spaced Repetition Rating Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={handlePrev}
                className="skeuo-btn p-3 rounded-2xl bg-slate-900 border border-slate-800 text-slate-200 hover:text-white hover:bg-slate-800 transition-colors"
                title="Previous Card"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={handleNext}
                className="skeuo-btn p-3 rounded-2xl bg-slate-900 border border-slate-800 text-slate-200 hover:text-white hover:bg-slate-800 transition-colors"
                title="Next Card"
              >
                <ChevronRight size={18} />
              </button>
            </div>

            {/* Rating Buttons */}
            {isFlipped && (
              <div className="flex items-center gap-2 animate-fadeIn">
                <span className="text-xs font-mono text-slate-500 mr-2">Rate Recall:</span>
                <button
                  onClick={() => handleRateDifficulty(currentCard, 'Hard')}
                  className="px-3.5 py-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500/20 text-xs font-mono font-bold transition-colors"
                >
                  Hard
                </button>
                <button
                  onClick={() => handleRateDifficulty(currentCard, 'Medium')}
                  className="px-3.5 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 text-xs font-mono font-bold transition-colors"
                >
                  Medium
                </button>
                <button
                  onClick={() => handleRateDifficulty(currentCard, 'Easy')}
                  className="px-3.5 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 text-xs font-mono font-bold transition-colors"
                >
                  Easy (Mastered)
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="p-12 text-center rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <BookOpen size={36} className="text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-slate-200">No Flashcards in this Category</h3>
          <p className="text-xs md:text-sm text-slate-400 max-w-md mx-auto">
            Generate an instant high-yield flashcard deck using the Gemini AI generator above, or create custom revision cards manually.
          </p>
          <button
            onClick={handleGenerateAIDeck}
            className="skeuo-btn inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs font-mono shadow-lg shadow-indigo-600/30"
          >
            <Sparkles size={15} />
            <span>Generate Sample AI Deck</span>
          </button>
        </div>
      )}

      {/* Custom Card Modal */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 space-y-4 text-slate-100">
            <h3 className="text-lg font-bold">Create Custom Flashcard</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-mono text-slate-400 block mb-1">
                  Topic / Subtopic
                </label>
                <input
                  type="text"
                  value={newTopic}
                  onChange={(e) => setNewTopic(e.target.value)}
                  placeholder="e.g. Normalization, B-Trees, Dynamic Programming"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-mono text-slate-400 block mb-1">
                  Front (Question / Prompt)
                </label>
                <textarea
                  rows={3}
                  value={newFront}
                  onChange={(e) => setNewFront(e.target.value)}
                  placeholder="What is Boyce-Codd Normal Form (BCNF)?"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-mono text-slate-400 block mb-1">
                  Back (Answer / Explanation)
                </label>
                <textarea
                  rows={4}
                  value={newBack}
                  onChange={(e) => setNewBack(e.target.value)}
                  placeholder="BCNF requires that for every non-trivial functional dependency X -> Y, X must be a superkey."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-mono text-slate-400 block mb-1">Difficulty</label>
                <div className="flex gap-2">
                  {(['Easy', 'Medium', 'Hard'] as const).map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setNewDifficulty(d)}
                      className={`flex-1 py-1.5 rounded-xl text-xs font-mono transition-colors ${
                        newDifficulty === d
                          ? 'bg-indigo-600 text-white font-bold'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                onClick={() => setIsNewModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-mono text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleAddManualCard}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs font-mono shadow-md shadow-indigo-600/30"
              >
                Save Flashcard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

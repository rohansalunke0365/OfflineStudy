import { useState, useMemo } from 'react';
import { Playlist, QuizQuestion, QuizResult } from '../types';
import {
  Award,
  Sparkles,
  CheckCircle2,
  XCircle,
  HelpCircle,
  RotateCcw,
  ArrowRight,
  ChevronRight,
  BookOpen,
  BrainCircuit,
  Trophy
} from 'lucide-react';
import { generateAIQuiz } from '../services/aiService';

interface QuizViewProps {
  playlists: Playlist[];
  quizResults: QuizResult[];
  onSaveQuizResult: (result: QuizResult) => void;
  onShowToast: (msg: string) => void;
}

export const QuizView = ({
  playlists,
  quizResults,
  onSaveQuizResult,
  onShowToast,
}: QuizViewProps) => {
  const [selectedVideoId, setSelectedVideoId] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeQuestions, setActiveQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [activeResult, setActiveResult] = useState<QuizResult | null>(null);

  const allVideos = useMemo(() => playlists.flatMap((p) => p.videos), [playlists]);

  // Start AI Quiz Generation
  const handleGenerateQuiz = async () => {
    const targetVideo = allVideos.find((v) => v.id === selectedVideoId) || allVideos[0];
    if (!targetVideo) {
      onShowToast('Please select a course video first');
      return;
    }

    setIsGenerating(true);
    onShowToast(`Generating AI knowledge check for "${targetVideo.title}"...`);

    try {
      const parentPlaylist = playlists.find((p) => p.videos.some((v) => v.id === targetVideo.id));
      const rawQuestions = await generateAIQuiz(
        targetVideo.title,
        parentPlaylist?.name || 'Computer Science Module',
        5,
        targetVideo.description
      );

      if (!rawQuestions || rawQuestions.length === 0) {
        throw new Error('No quiz questions returned');
      }

      const formatted: QuizQuestion[] = rawQuestions.map((q, idx) => ({
        id: `q_${Date.now()}_${idx}`,
        videoId: targetVideo.id,
        videoTitle: targetVideo.title,
        question: q.question,
        options: q.options,
        correctIndex: q.correctIndex,
        explanation: q.explanation,
        topic: q.topic || targetVideo.title,
      }));

      setActiveQuestions(formatted);
      setCurrentQuestionIndex(0);
      setUserAnswers({});
      setIsSubmitted(false);
      setActiveResult(null);
      onShowToast(`Quiz ready: 5 questions on ${targetVideo.title}`);
    } catch (err: any) {
      console.error(err);
      onShowToast(err.message || 'Failed to generate quiz');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectOption = (optionIndex: number) => {
    if (isSubmitted) return;
    setUserAnswers((prev) => ({ ...prev, [currentQuestionIndex]: optionIndex }));
  };

  const handleSubmitQuiz = () => {
    if (Object.keys(userAnswers).length < activeQuestions.length) {
      if (!confirm('You have unanswered questions. Are you sure you want to submit?')) {
        return;
      }
    }

    let score = 0;
    const gradedQuestions = activeQuestions.map((q, idx) => {
      const selected = userAnswers[idx];
      if (selected === q.correctIndex) score++;
      return { ...q, userSelectedIndex: selected };
    });

    const total = activeQuestions.length;
    const percentage = Math.round((score / total) * 100);

    const result: QuizResult = {
      id: `quiz_${Date.now()}`,
      videoId: activeQuestions[0]?.videoId || 'unknown',
      videoTitle: activeQuestions[0]?.videoTitle || 'Knowledge Check',
      score,
      total,
      percentage,
      completedAt: Date.now(),
      questions: gradedQuestions,
    };

    setIsSubmitted(true);
    setActiveResult(result);
    onSaveQuizResult(result);
    onShowToast(`Quiz completed! Scored ${score}/${total} (${percentage}%)`);
  };

  const currentQ = activeQuestions[currentQuestionIndex] || null;

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-indigo-400 uppercase tracking-widest font-bold mb-1">
            <BrainCircuit size={14} />
            <span>AI Knowledge Assessment</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-100 tracking-tight">
            Interactive Video Quizzes
          </h1>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            Test your understanding with instant automated quizzes and detailed answer breakdowns.
          </p>
        </div>

        {quizResults.length > 0 && (
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300">
            <Trophy size={14} className="text-amber-400" />
            <span>{quizResults.length} Tests Logged</span>
          </div>
        )}
      </div>

      {/* Quiz Config & Generator Bar */}
      <div className="p-5 rounded-3xl bg-slate-900 border border-indigo-500/30 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 flex-shrink-0">
            <Sparkles size={20} className={isGenerating ? 'animate-spin' : ''} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-200">
              Generate AI Quiz from Lecture
            </h3>
            <p className="text-xs text-slate-400">
              Gemini extracts key formulas, tricky corner cases, and exam-style questions.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={selectedVideoId}
            onChange={(e) => setSelectedVideoId(e.target.value)}
            className="flex-1 md:w-60 bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-500"
          >
            <option value="">Select video lecture...</option>
            {allVideos.map((v) => (
              <option key={v.id} value={v.id}>
                {v.title}
              </option>
            ))}
          </select>

          <button
            onClick={handleGenerateQuiz}
            disabled={isGenerating}
            className="skeuo-btn flex items-center gap-2 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs font-mono shadow-lg shadow-indigo-500/25 transition-all flex-shrink-0"
          >
            <Sparkles size={14} />
            <span>{isGenerating ? 'Drafting...' : 'Start AI Quiz'}</span>
          </button>
        </div>
      </div>

      {/* Active Quiz Question Interface */}
      {activeQuestions.length > 0 && !isSubmitted && currentQ && (
        <div className="space-y-6 animate-fadeIn">
          {/* Question Stage Card */}
          <div className="p-6 md:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-400">
                  Question {currentQuestionIndex + 1} of {activeQuestions.length}
                </span>
                <span className="text-xs font-mono text-slate-400 truncate max-w-xs">
                  {currentQ.topic}
                </span>
              </div>

              {/* Progress Indicator */}
              <div className="flex items-center gap-1.5">
                {activeQuestions.map((_, idx) => (
                  <div
                    key={idx}
                    onClick={() => setCurrentQuestionIndex(idx)}
                    className={`w-7 h-7 rounded-lg text-[10px] font-mono font-bold flex items-center justify-center cursor-pointer transition-all ${
                      currentQuestionIndex === idx
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                        : userAnswers[idx] !== undefined
                        ? 'bg-slate-800 text-slate-200 border border-slate-700'
                        : 'bg-slate-950 text-slate-500 border border-slate-800'
                    }`}
                  >
                    {idx + 1}
                  </div>
                ))}
              </div>
            </div>

            {/* Question Text */}
            <div className="py-2">
              <h2 className="text-base md:text-xl font-bold text-slate-100 leading-relaxed">
                {currentQ.question}
              </h2>
            </div>

            {/* Answer Options */}
            <div className="space-y-3">
              {currentQ.options.map((opt, optIdx) => {
                const isSelected = userAnswers[currentQuestionIndex] === optIdx;
                return (
                  <button
                    key={optIdx}
                    onClick={() => handleSelectOption(optIdx)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center gap-3.5 ${
                      isSelected
                        ? 'bg-indigo-600/15 border-indigo-500 text-slate-100 font-semibold shadow-inner'
                        : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full border flex items-center justify-center font-mono text-xs font-bold flex-shrink-0 ${
                        isSelected
                          ? 'border-indigo-500 bg-indigo-600 text-white'
                          : 'border-slate-700 text-slate-500'
                      }`}
                    >
                      {String.fromCharCode(65 + optIdx)}
                    </div>
                    <span className="text-xs md:text-sm">{opt}</span>
                  </button>
                );
              })}
            </div>

            {/* Bottom Nav / Next / Submit Controls */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              <button
                disabled={currentQuestionIndex === 0}
                onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
                className="px-4 py-2 rounded-xl text-xs font-mono text-slate-400 hover:text-white disabled:opacity-30"
              >
                Previous
              </button>

              {currentQuestionIndex < activeQuestions.length - 1 ? (
                <button
                  onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
                  className="skeuo-btn flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs font-mono shadow-md shadow-indigo-600/30"
                >
                  <span>Next Question</span>
                  <ChevronRight size={15} />
                </button>
              ) : (
                <button
                  onClick={handleSubmitQuiz}
                  className="skeuo-btn flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs font-mono shadow-lg shadow-emerald-600/30"
                >
                  <CheckCircle2 size={16} />
                  <span>Submit &amp; Grade Quiz</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Quiz Result View / Detailed Score Report */}
      {isSubmitted && activeResult && (
        <div className="space-y-6 animate-fadeIn">
          {/* Result Score Card */}
          <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl text-center space-y-4 relative overflow-hidden">
            <div className="inline-flex p-4 rounded-3xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 mb-2">
              <Trophy size={42} className="text-amber-400" />
            </div>

            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-100">
              Quiz Evaluation Summary
            </h2>
            <p className="text-xs font-mono text-slate-400">
              {activeResult.videoTitle} • Logged at {new Date(activeResult.completedAt).toLocaleTimeString()}
            </p>

            <div className="flex items-center justify-center gap-8 py-4">
              <div>
                <div className="text-3xl md:text-5xl font-extrabold font-mono text-emerald-400">
                  {activeResult.score} / {activeResult.total}
                </div>
                <div className="text-[11px] font-mono text-slate-400 uppercase font-semibold mt-1">
                  Correct Answers
                </div>
              </div>

              <div className="w-px h-12 bg-slate-800" />

              <div>
                <div className="text-3xl md:text-5xl font-extrabold font-mono text-indigo-400">
                  {activeResult.percentage}%
                </div>
                <div className="text-[11px] font-mono text-slate-400 uppercase font-semibold mt-1">
                  Mastery Rating
                </div>
              </div>
            </div>

            <div className="flex justify-center gap-4 pt-2">
              <button
                onClick={() => {
                  setIsSubmitted(false);
                  setUserAnswers({});
                  setCurrentQuestionIndex(0);
                }}
                className="skeuo-btn flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-bold"
              >
                <RotateCcw size={14} />
                <span>Retake Quiz</span>
              </button>
              <button
                onClick={handleGenerateQuiz}
                className="skeuo-btn flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-mono font-bold shadow-md shadow-indigo-600/30"
              >
                <Sparkles size={14} />
                <span>Generate New Quiz</span>
              </button>
            </div>
          </div>

          {/* Breakdown of Every Question with Explanation */}
          <div className="space-y-4">
            <h3 className="text-sm font-mono font-bold uppercase tracking-widest text-slate-400 px-1">
              Detailed Question Analysis &amp; Concept Explanations
            </h3>

            {activeResult.questions.map((q, idx) => {
              const isCorrect = q.userSelectedIndex === q.correctIndex;
              return (
                <div
                  key={idx}
                  className={`p-6 rounded-3xl border shadow-lg space-y-3 ${
                    isCorrect
                      ? 'bg-slate-900/80 border-emerald-500/30'
                      : 'bg-slate-900/80 border-rose-500/30'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {isCorrect ? (
                        <CheckCircle2 size={18} className="text-emerald-400" />
                      ) : (
                        <XCircle size={18} className="text-rose-400" />
                      )}
                      <span className="font-bold text-xs md:text-sm text-slate-200">
                        Q{idx + 1}: {q.question}
                      </span>
                    </div>
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                        isCorrect
                          ? 'bg-emerald-500/15 text-emerald-400'
                          : 'bg-rose-500/15 text-rose-400'
                      }`}
                    >
                      {isCorrect ? 'CORRECT' : 'INCORRECT'}
                    </span>
                  </div>

                  {/* Options List */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono pt-1">
                    {q.options.map((opt, optIdx) => {
                      const isOptionCorrect = optIdx === q.correctIndex;
                      const isUserChoice = optIdx === q.userSelectedIndex;
                      return (
                        <div
                          key={optIdx}
                          className={`p-2.5 rounded-xl border flex items-center justify-between ${
                            isOptionCorrect
                              ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-300 font-bold'
                              : isUserChoice
                              ? 'bg-rose-500/10 border-rose-500/50 text-rose-300'
                              : 'bg-slate-950 border-slate-800 text-slate-400'
                          }`}
                        >
                          <span>
                            {String.fromCharCode(65 + optIdx)}. {opt}
                          </span>
                          {isOptionCorrect && (
                            <span className="text-[10px] text-emerald-400">✓ Correct</span>
                          )}
                          {isUserChoice && !isOptionCorrect && (
                            <span className="text-[10px] text-rose-400">✗ Your Pick</span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Explanation Box */}
                  <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-1">
                    <div className="font-mono text-[10px] text-indigo-400 uppercase font-bold flex items-center gap-1">
                      <HelpCircle size={12} />
                      <span>Pedagogical Explanation:</span>
                    </div>
                    <p className="leading-relaxed">{q.explanation}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty State when no quiz is currently loaded */}
      {activeQuestions.length === 0 && (
        <div className="p-12 text-center rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <BookOpen size={36} className="text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-slate-200">No Active Quiz Loaded</h3>
          <p className="text-xs md:text-sm text-slate-400 max-w-md mx-auto">
            Choose any video lecture from your library above to launch an instant AI-powered knowledge check.
          </p>
          <button
            onClick={handleGenerateQuiz}
            className="skeuo-btn inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs font-mono shadow-lg shadow-indigo-600/30"
          >
            <Sparkles size={15} />
            <span>Generate Sample Quiz</span>
          </button>
        </div>
      )}
    </div>
  );
};

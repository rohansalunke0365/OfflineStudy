import { useMemo } from 'react';
import { Playlist, ProgressMap, QuizResult } from '../types';
import {
  TrendingUp,
  Clock,
  CheckCircle2,
  PlayCircle,
  BookOpen,
  Calendar,
  Flame,
  Award,
  BarChart3,
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface AnalyticsViewProps {
  playlists: Playlist[];
  progressMap: ProgressMap;
  quizResults?: QuizResult[];
  onNavigateToCourse: (playlistId: string) => void;
}

export const AnalyticsView = ({
  playlists,
  progressMap,
  quizResults = [],
  onNavigateToCourse,
}: AnalyticsViewProps) => {
  const allVideos = useMemo(() => playlists.flatMap((p) => p.videos), [playlists]);

  const stats = useMemo(() => {
    let totalWatchSec = 0;
    let completedCount = 0;
    let inProgressCount = 0;
    let totalDurationSec = 0;
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    const oneWeek = 7 * oneDay;

    let todaySec = 0;
    let thisWeekSec = 0;

    const dayBuckets: Record<string, number> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now - i * oneDay);
      const key = d.toLocaleDateString(undefined, { weekday: 'short' });
      dayBuckets[key] = 0;
    }

    allVideos.forEach((v) => {
      const p = progressMap[v.id];
      const dur = p?.duration || v.duration || 1800;
      totalDurationSec += dur;

      if (p) {
        totalWatchSec += p.time || 0;
        if (p.watched) {
          completedCount++;
        } else if (p.time > 5) {
          inProgressCount++;
        }

        if (p.lastWatched) {
          const diff = now - p.lastWatched;
          if (diff <= oneDay) {
            todaySec += p.time || 0;
          }
          if (diff <= oneWeek) {
            thisWeekSec += p.time || 0;
            const d = new Date(p.lastWatched);
            const key = d.toLocaleDateString(undefined, { weekday: 'short' });
            if (dayBuckets[key] !== undefined) {
              dayBuckets[key] += Math.round((p.time || 0) / 60);
            }
          }
        }
      }
    });

    const completionRate = allVideos.length
      ? Math.round((completedCount / allVideos.length) * 100)
      : 0;

    const courseBreakdowns = playlists.map((pl) => {
      const plVideos = pl.videos;
      let plWatched = 0;
      let plWatchTime = 0;
      let plTotalDur = 0;

      plVideos.forEach((v) => {
        const p = progressMap[v.id];
        const dur = p?.duration || v.duration || 1800;
        plTotalDur += dur;
        if (p?.watched) plWatched++;
        if (p?.time) plWatchTime += p.time;
      });

      const pct = plVideos.length ? Math.round((plWatched / plVideos.length) * 100) : 0;
      return {
        id: pl.id,
        name: pl.name,
        badge: pl.badge,
        total: plVideos.length,
        watched: plWatched,
        watchTimeSec: plWatchTime,
        totalDurSec: plTotalDur,
        percentage: pct,
      };
    });

    // Calculate Quiz Average
    const avgQuizScore = quizResults.length
      ? Math.round(
          quizResults.reduce((acc, q) => acc + q.percentage, 0) / quizResults.length
        )
      : null;

    return {
      totalWatchSec,
      totalDurationSec,
      completedCount,
      inProgressCount,
      totalCount: allVideos.length,
      completionRate,
      todaySec,
      thisWeekSec,
      dayBuckets,
      courseBreakdowns,
      avgQuizScore,
      studyStreakDays: Math.min(7, Math.max(1, Math.ceil(thisWeekSec / 1200))),
    };
  }, [allVideos, playlists, progressMap, quizResults]);

  const formatHoursMins = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    if (hrs === 0) return `${mins}m`;
    return `${hrs}h ${mins}m`;
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-indigo-400 uppercase tracking-widest font-bold mb-1">
            <BarChart3 size={14} />
            <span>Local Study Telemetry</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-100 tracking-tight">
            Study Analytics &amp; Mastery Metrics
          </h1>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            Calculated directly from your local watch progress, test results, and course milestones.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 px-4 py-2.5 rounded-2xl">
          <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <Flame size={20} className="animate-pulse" />
          </div>
          <div>
            <div className="text-[10px] font-mono text-slate-400 uppercase font-bold">
              Active Streak
            </div>
            <div className="text-base font-extrabold text-amber-400 font-mono">
              {stats.studyStreakDays} Days Streak
            </div>
          </div>
        </div>
      </div>

      {/* Top 4 Bento Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Watch Time */}
        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400 uppercase font-semibold">
              Total Watch Time
            </span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <Clock size={18} />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl md:text-3xl font-extrabold text-slate-100 font-mono">
              {formatHoursMins(stats.totalWatchSec)}
            </div>
            <div className="text-[11px] font-mono text-emerald-400 mt-1">
              +{formatHoursMins(stats.thisWeekSec)} logged this week
            </div>
          </div>
        </div>

        {/* Completion Progress */}
        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400 uppercase font-semibold">
              Curriculum Progress
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <CheckCircle2 size={18} />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl md:text-3xl font-extrabold text-emerald-400 font-mono">
              {stats.completionRate}%
            </div>
            <div className="text-[11px] font-mono text-slate-400 mt-1">
              {stats.completedCount} of {stats.totalCount} lectures completed
            </div>
          </div>
        </div>

        {/* In Progress Modules */}
        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400 uppercase font-semibold">
              In Progress
            </span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <PlayCircle size={18} />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl md:text-3xl font-extrabold text-amber-400 font-mono">
              {stats.inProgressCount}
            </div>
            <div className="text-[11px] font-mono text-slate-400 mt-1">
              Active unfinished video modules
            </div>
          </div>
        </div>

        {/* Knowledge Check Score */}
        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400 uppercase font-semibold">
              Quiz Average
            </span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
              <Award size={18} />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl md:text-3xl font-extrabold text-purple-400 font-mono">
              {stats.avgQuizScore !== null ? `${stats.avgQuizScore}%` : '—'}
            </div>
            <div className="text-[11px] font-mono text-slate-400 mt-1">
              {quizResults.length ? `${quizResults.length} tests taken` : 'No quiz tests yet'}
            </div>
          </div>
        </div>
      </div>

      {/* Middle Row: Weekly Activity Chart + Course Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Activity Bar Visualization */}
        <div className="lg:col-span-1 p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-200 flex items-center gap-2">
              <Calendar size={16} className="text-indigo-400" />
              <span>7-Day Study Activity</span>
            </h3>
            <span className="text-[10px] font-mono text-slate-400">Minutes / Day</span>
          </div>

          <div className="h-44 flex items-end justify-between gap-2 pt-6 px-2">
            {Object.entries(stats.dayBuckets).map(([day, minsVal]) => {
              const mins = Number(minsVal) || 0;
              const heightPct = Math.min(100, Math.max(12, (mins / 90) * 100));
              return (
                <div key={day} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                  <span className="text-[9px] font-mono text-slate-400">{mins}m</span>
                  <div
                    style={{ height: `${heightPct}%` }}
                    className={`w-full rounded-xl transition-all ${
                      mins > 0
                        ? 'bg-gradient-to-t from-indigo-600 to-indigo-400 shadow-lg shadow-indigo-500/20'
                        : 'bg-slate-800'
                    }`}
                  />
                  <span className="text-[10px] font-mono text-slate-400 font-bold">{day}</span>
                </div>
              );
            })}
          </div>

          <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 text-[11px] font-mono text-slate-400 flex items-center justify-between">
            <span>Today's Study Session:</span>
            <span className="text-emerald-400 font-bold">{formatHoursMins(stats.todaySec)}</span>
          </div>
        </div>

        {/* Course-by-Course Progress Progress Bars */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-bold text-sm text-slate-200 flex items-center gap-2">
              <BookOpen size={16} className="text-indigo-400" />
              <span>Course &amp; Subject Progress</span>
            </h3>
            <span className="text-[10px] font-mono text-slate-400">
              {playlists.length} Courses Tracked
            </span>
          </div>

          <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
            {stats.courseBreakdowns.map((c) => (
              <div
                key={c.id}
                onClick={() => onNavigateToCourse(c.id)}
                className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 hover:border-indigo-500/40 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs md:text-sm text-slate-200 group-hover:text-indigo-400 transition-colors">
                      {c.name}
                    </span>
                    {c.badge && (
                      <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-400">
                        {c.badge}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-indigo-400">
                      {c.percentage}%
                    </span>
                    <ArrowRight size={14} className="text-slate-500 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    style={{ width: `${c.percentage}%` }}
                    className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 rounded-full transition-all duration-500"
                  />
                </div>

                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mt-2">
                  <span>
                    {c.watched} / {c.total} completed
                  </span>
                  <span>
                    Watched: {formatHoursMins(c.watchTimeSec)} • Total: {formatHoursMins(c.totalDurSec)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

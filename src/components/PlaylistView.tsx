import { useState, MouseEvent } from 'react';
import { Play, ArrowLeft, ArrowUpDown, Folder, CheckCircle } from 'lucide-react';
import { Playlist, ProgressMap, SortKey, VideoItem } from '../types';
import { VideoCard } from './VideoCard';

interface PlaylistViewProps {
  playlist: Playlist;
  progressMap: ProgressMap;
  onPlayVideo: (video: VideoItem) => void;
  onBack: () => void;
  onToggleSaveVideo: (videoId: string, e: MouseEvent) => void;
}

export const PlaylistView = ({
  playlist,
  progressMap,
  onPlayVideo,
  onBack,
  onToggleSaveVideo,
}: PlaylistViewProps) => {
  const [sortKey, setSortKey] = useState<SortKey>('natural');

  // Natural Compare Helper
  const naturalCompare = (a: string, b: string) => {
    return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
  };

  // Sort logic
  const sortedVideos = [...playlist.videos].sort((a, b) => {
    switch (sortKey) {
      case 'az':
        return a.title.localeCompare(b.title);
      case 'za':
        return b.title.localeCompare(a.title);
      case 'duration':
        return (a.duration || 0) - (b.duration || 0);
      case 'dateModAsc':
        return (a.lastModified || 0) - (b.lastModified || 0);
      case 'dateModDesc':
        return (b.lastModified || 0) - (a.lastModified || 0);
      case 'unwatched':
        return (progressMap[a.id]?.watched ? 1 : 0) - (progressMap[b.id]?.watched ? 1 : 0);
      case 'watched':
        return (progressMap[b.id]?.watched ? 1 : 0) - (progressMap[a.id]?.watched ? 1 : 0);
      case 'natural':
      default:
        return naturalCompare(a.name, b.name);
    }
  });

  const watchedCount = playlist.videos.filter((v) => progressMap[v.id]?.watched).length;
  const progressPct = playlist.videos.length > 0 ? Math.round((watchedCount / playlist.videos.length) * 100) : 0;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Header Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div className="flex items-start gap-4">
          <button
            onClick={onBack}
            className="skeuo-btn p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors mt-0.5"
            title="Back to all playlists"
          >
            <ArrowLeft size={18} />
          </button>

          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono text-indigo-400 uppercase tracking-wider font-semibold">
                {playlist.badge || 'Archive Module'}
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-xs font-mono text-slate-400">
                {playlist.videos.length} videos
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-100 tracking-tight">
              {playlist.name}
            </h1>

            {playlist.description && (
              <p className="text-sm text-slate-400 max-w-2xl mt-1.5 leading-relaxed">
                {playlist.description}
              </p>
            )}
          </div>
        </div>

        {/* Action Controls & Sort dropdown */}
        <div className="flex items-center gap-3 self-end md:self-center flex-wrap">
          {sortedVideos.length > 0 && (
            <button
              onClick={() => onPlayVideo(sortedVideos[0])}
              className="skeuo-btn flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-600/30 border border-indigo-400/30 transition-all"
            >
              <Play size={16} className="fill-current" />
              <span>Play All</span>
            </button>
          )}

          {/* Sort Selector */}
          <div className="relative flex items-center bg-slate-900 border border-slate-800 rounded-xl px-3 py-2">
            <ArrowUpDown size={14} className="text-slate-400 mr-2" />
            <select
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value as SortKey)}
              className="bg-transparent text-xs font-mono text-slate-200 focus:outline-none cursor-pointer pr-4"
            >
              <option value="natural" className="bg-slate-900">Playlist Order (Natural)</option>
              <option value="dateModAsc" className="bg-slate-900">Date Modified (Oldest first)</option>
              <option value="dateModDesc" className="bg-slate-900">Date Modified (Newest first)</option>
              <option value="az" className="bg-slate-900">Title A–Z</option>
              <option value="za" className="bg-slate-900">Title Z–A</option>
              <option value="duration" className="bg-slate-900">Duration</option>
              <option value="unwatched" className="bg-slate-900">Unwatched first</option>
              <option value="watched" className="bg-slate-900">Watched first</option>
            </select>
          </div>
        </div>
      </div>

      {/* Progress summary banner */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between shadow-inner">
        <div className="flex items-center gap-3">
          <CheckCircle size={18} className={progressPct === 100 ? 'text-emerald-400' : 'text-indigo-400'} />
          <span className="text-xs font-mono text-slate-200">
            {watchedCount} of {playlist.videos.length} completed ({progressPct}%)
          </span>
        </div>
        <div className="w-36 h-2 bg-slate-800 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${
              progressPct === 100 ? 'bg-emerald-500' : 'bg-indigo-500 shadow-[0_0_8px_#6366f1]'
            }`}
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Grid of videos in this playlist */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {sortedVideos.map((v, i) => (
          <VideoCard
            key={v.id}
            video={v}
            badgeNumber={sortKey === 'natural' ? i + 1 : undefined}
            progress={progressMap[v.id]}
            onPlay={onPlayVideo}
            onToggleSave={onToggleSaveVideo}
          />
        ))}
      </div>
    </div>
  );
};

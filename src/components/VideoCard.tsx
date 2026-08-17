import { useState, MouseEvent } from 'react';
import { Play, Check, Bookmark, FileVideo, Sparkles } from 'lucide-react';
import { VideoItem, VideoProgress } from '../types';

interface VideoCardProps {
  key?: string;
  video: VideoItem;
  progress?: VideoProgress;
  onPlay: (video: VideoItem) => void;
  onToggleSave?: (videoId: string, e: MouseEvent) => void;
  showFolder?: boolean;
  badgeNumber?: string | number;
}

export const VideoCard = ({
  video,
  progress,
  onPlay,
  onToggleSave,
  showFolder = false,
  badgeNumber,
}: VideoCardProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const durationSec = video.duration || progress?.duration || 0;
  const timeSec = progress?.time || 0;
  const isWatched = progress?.watched || (durationSec > 0 && timeSec / durationSec > 0.92);
  const progressPct = durationSec > 0 ? Math.min(100, Math.round((timeSec / durationSec) * 100)) : 0;
  const isSaved = progress?.savedToVault;

  const formatDuration = (sec: number) => {
    if (!sec || isNaN(sec)) return '--:--';
    const s = Math.round(sec);
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const remS = s % 60;
    if (h > 0) {
      return `${h}:${String(m).padStart(2, '0')}:${String(remS).padStart(2, '0')}`;
    }
    return `${m}:${String(remS).padStart(2, '0')}`;
  };

  const formatBytes = (bytes?: number) => {
    if (!bytes) return '';
    const units = ['B', 'KB', 'MB', 'GB'];
    let b = bytes;
    let i = 0;
    while (b >= 1024 && i < units.length - 1) {
      b /= 1024;
      i++;
    }
    return `${b.toFixed(i > 1 ? 1 : 0)} ${units[i]}`;
  };

  return (
    <article
      onClick={() => onPlay(video)}
      className="skeuo-card group relative bg-slate-900 rounded-2xl overflow-hidden cursor-pointer flex flex-col h-full border border-slate-800 hover:border-indigo-500/50 transition-all duration-300 select-none shadow-xl"
    >
      {/* Thumbnail Container (16:9 ratio) */}
      <div className="relative aspect-video w-full overflow-hidden bg-slate-950">
        {video.thumbnailUrl && !imageError ? (
          <img
            src={video.thumbnailUrl}
            alt={video.title}
            loading="lazy"
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
            className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-105 ${
              isWatched ? 'opacity-70 group-hover:opacity-90 grayscale-[25%]' : 'opacity-85 group-hover:opacity-100'
            }`}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-slate-950 text-slate-400 p-4 text-center">
            <FileVideo size={36} className="mb-2 text-indigo-400/60" />
            <span className="text-[11px] font-mono line-clamp-1 text-slate-400">{video.ext.toUpperCase()} Local Video</span>
          </div>
        )}

        {/* Shimmer Placeholder before load */}
        {!imageLoaded && !imageError && video.thumbnailUrl && (
          <div className="absolute inset-0 bg-slate-800 animate-pulse" />
        )}

        {/* Dark Vignette Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-slate-950/30 pointer-events-none" />

        {/* Top Badges: Sequence Number or Watched / 3D Simulation Tag */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 z-10">
          {badgeNumber !== undefined && (
            <div className="bg-slate-950/80 backdrop-blur-md px-2 py-0.5 rounded-lg text-[11px] font-mono text-slate-200 border border-slate-700 font-bold">
              #{badgeNumber}
            </div>
          )}

          {isWatched ? (
            <div className="bg-emerald-500 text-slate-950 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold flex items-center gap-1 shadow-sm">
              <Check size={11} strokeWidth={3} />
              WATCHED
            </div>
          ) : video.is3dSimulation ? (
            <div className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold flex items-center gap-1 backdrop-blur-md">
              <Sparkles size={11} />
              3D SIM
            </div>
          ) : null}
        </div>

        {/* Bookmark / Save to Vault button */}
        {onToggleSave && (
          <button
            onClick={(e) => onToggleSave(video.id, e)}
            className={`absolute top-2.5 right-2.5 p-1.5 rounded-xl backdrop-blur-md z-10 transition-colors ${
              isSaved
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-slate-950/70 text-slate-300 hover:text-white hover:bg-slate-900 border border-slate-700'
            }`}
            title={isSaved ? 'Remove from Vault' : 'Save to Vault'}
          >
            <Bookmark size={13} className={isSaved ? 'fill-current' : ''} />
          </button>
        )}

        {/* Duration Badge Bottom Right */}
        <div className="absolute bottom-2.5 right-2.5 bg-slate-950/85 backdrop-blur-md px-2.5 py-0.5 rounded-md font-mono text-[11px] text-slate-200 border border-slate-800 font-semibold z-10">
          {formatDuration(durationSec)}
        </div>

        {/* Hover Center Play Action Button */}
        <div className="absolute inset-0 bg-slate-950/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center skeuo-btn shadow-lg shadow-indigo-600/50 transform scale-90 group-hover:scale-100 transition-transform">
            <Play size={20} className="ml-1 fill-current" />
          </div>
        </div>

        {/* Bottom Progress Bar */}
        {progressPct > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-slate-950/80 z-10 overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                isWatched ? 'bg-emerald-500' : 'bg-indigo-500 shadow-[0_0_8px_#6366f1]'
              }`}
              style={{ width: `${progressPct}%` }}
            />
          </div>
        )}
      </div>

      {/* Card Content & Metadata */}
      <div className="p-4 flex flex-col flex-1 justify-between">
        <div>
          {video.chapter ? (
            <div className="text-[10px] font-mono text-indigo-400 uppercase tracking-wider font-semibold line-clamp-1 mb-1">
              {video.chapter}
            </div>
          ) : showFolder ? (
            <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-semibold line-clamp-1 mb-1">
              {video.folderPath}
            </div>
          ) : null}

          <h3 className="font-bold text-sm text-slate-100 line-clamp-2 leading-snug group-hover:text-indigo-400 transition-colors mb-1.5">
            {video.title}
          </h3>

          {video.description && (
            <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-3">
              {video.description}
            </p>
          )}
        </div>

        {/* Footer Meta Row */}
        <div className="pt-2.5 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-500">
          <div className="flex items-center gap-2">
            {video.size && <span>{formatBytes(video.size)}</span>}
            {video.size && progressPct > 0 && <span>•</span>}
            {progressPct > 0 && (
              <span className={isWatched ? 'text-emerald-400 font-semibold' : 'text-indigo-400 font-semibold'}>
                {isWatched ? 'Completed' : `${progressPct}% watched`}
              </span>
            )}
          </div>

          {video.tags && video.tags.length > 0 && (
            <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-md truncate max-w-[100px]">
              {video.tags[0]}
            </span>
          )}
        </div>
      </div>
    </article>
  );
};

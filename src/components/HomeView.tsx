import { MouseEvent } from 'react';
import { Play, Sparkles, Folder, Clock, Bookmark, ArrowRight, ShieldAlert, HardDrive, Wifi, Smartphone, Activity, Server, QrCode } from 'lucide-react';
import { Playlist, ProgressMap, RouteState, VideoItem } from '../types';
import { VideoCard } from './VideoCard';

interface HomeViewProps {
  playlists: Playlist[];
  progressMap: ProgressMap;
  onPlayVideo: (video: VideoItem) => void;
  onNavigate: (route: RouteState) => void;
  onToggleSaveVideo: (videoId: string, e: MouseEvent) => void;
  onPickFolder: () => void;
  onOpenLanModal?: () => void;
  searchQuery?: string;
  activeFilter?: 'all' | 'continue' | 'saved';
}

export const HomeView = ({
  playlists,
  progressMap,
  onPlayVideo,
  onNavigate,
  onToggleSaveVideo,
  onPickFolder,
  onOpenLanModal,
  searchQuery = '',
  activeFilter = 'all'
}: HomeViewProps) => {
  // Collect all videos
  const allVideos: VideoItem[] = playlists.flatMap((p) => p.videos);

  // Filtered by search query if any
  const filteredVideos = searchQuery.trim()
    ? allVideos.filter(
        (v) =>
          v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          v.folderPath.toLowerCase().includes(searchQuery.toLowerCase()) ||
          v.chapter?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          v.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          v.tags?.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : allVideos;

  // Continue watching list (has progress > 3s, not completed yet or recently watched)
  const continueItems = allVideos
    .filter((v) => {
      const p = progressMap[v.id];
      return p && p.time > 5 && !p.watched;
    })
    .sort((a, b) => (progressMap[b.id]?.lastWatched || 0) - (progressMap[a.id]?.lastWatched || 0));

  // Saved to vault items
  const savedItems = allVideos.filter((v) => progressMap[v.id]?.savedToVault);

  // Pick hero video for the 2x2 Bento Feature tile
  const heroVideo = continueItems[0] || allVideos.find((v) => v.is3dSimulation) || allVideos[0];

  // If search is active
  if (searchQuery.trim()) {
    return (
      <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-slate-100 tracking-tight">
              Search Results
            </h1>
            <p className="text-xs font-mono text-slate-400 mt-1">
              Found {filteredVideos.length} archive{filteredVideos.length === 1 ? '' : 's'} matching "{searchQuery}"
            </p>
          </div>
          <button
            onClick={() => onNavigate({ view: 'home' })}
            className="text-xs font-mono text-indigo-400 hover:underline"
          >
            Clear Search
          </button>
        </div>

        {filteredVideos.length === 0 ? (
          <div className="text-center py-16 bg-slate-900/60 rounded-3xl border border-slate-800 p-8">
            <ShieldAlert size={40} className="mx-auto text-indigo-400 mb-3 opacity-60" />
            <h3 className="text-lg font-bold text-slate-100 mb-1">No matching archives found</h3>
            <p className="text-sm text-slate-400 max-w-md mx-auto mb-4">
              Try searching for different keywords, chapters, or map your local folders using the Choose Folder button.
            </p>
            <button
              onClick={onPickFolder}
              className="skeuo-btn px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-sm"
            >
              Choose Video Folder
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredVideos.map((v) => (
              <VideoCard
                key={v.id}
                video={v}
                progress={progressMap[v.id]}
                onPlay={onPlayVideo}
                onToggleSave={onToggleSaveVideo}
                showFolder
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  // Saved Vault Filter View
  if (activeFilter === 'saved') {
    return (
      <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-slate-100 tracking-tight flex items-center gap-2.5">
              <Bookmark className="text-indigo-400" size={24} />
              Saved to Vault
            </h1>
            <p className="text-xs font-mono text-slate-400 mt-1">
              {savedItems.length} bookmarked video archive{savedItems.length === 1 ? '' : 's'}
            </p>
          </div>
        </div>

        {savedItems.length === 0 ? (
          <div className="text-center py-16 bg-slate-900/60 rounded-3xl border border-slate-800 p-8">
            <Bookmark size={40} className="mx-auto text-indigo-400 mb-3 opacity-50" />
            <h3 className="text-lg font-bold text-slate-100 mb-1">No saved items yet</h3>
            <p className="text-sm text-slate-400 max-w-md mx-auto mb-4">
              Click the bookmark icon on any video card or use the "Save to Vault" button in the 3D player to keep priority archives here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {savedItems.map((v) => (
              <VideoCard
                key={v.id}
                video={v}
                progress={progressMap[v.id]}
                onPlay={onPlayVideo}
                onToggleSave={onToggleSaveVideo}
                showFolder
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  // Continue Filter View
  if (activeFilter === 'continue') {
    return (
      <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-slate-100 tracking-tight flex items-center gap-2.5">
              <Clock className="text-indigo-400" size={24} />
              Continue Watching
            </h1>
            <p className="text-xs font-mono text-slate-400 mt-1">
              Resume your progress across active course modules
            </p>
          </div>
        </div>

        {continueItems.length === 0 ? (
          <div className="text-center py-16 bg-slate-900/60 rounded-3xl border border-slate-800 p-8">
            <Clock size={40} className="mx-auto text-indigo-400 mb-3 opacity-50" />
            <h3 className="text-lg font-bold text-slate-100 mb-1">No in-progress archives</h3>
            <p className="text-sm text-slate-400 max-w-md mx-auto mb-4">
              When you play videos in StudyVault, your playback position is automatically saved to local IndexedDB storage.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {continueItems.map((v) => (
              <VideoCard
                key={v.id}
                video={v}
                progress={progressMap[v.id]}
                onPlay={onPlayVideo}
                onToggleSave={onToggleSaveVideo}
                showFolder
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  // Standard Home View with Bento Grid Dashboard
  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-10">
      {/* 1. Bento Grid Modular Dashboard */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Bento Tile 1: Hero 2x2 Feature Archive */}
        {heroVideo && (
          <div className="md:col-span-2 md:row-span-2 bento-tile p-6 md:p-8 relative overflow-hidden group flex flex-col justify-between min-h-[340px]">
            {/* Background cover image & cinematic dark vignette */}
            {heroVideo.thumbnailUrl ? (
              <img
                src={heroVideo.thumbnailUrl}
                alt={heroVideo.title}
                className="absolute inset-0 w-full h-full object-cover opacity-35 group-hover:scale-105 group-hover:opacity-45 transition-all duration-700"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-950" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />

            {/* Top Tag Row */}
            <div className="relative z-10 flex items-center justify-between">
              <div className="text-indigo-400 text-xs font-bold font-mono uppercase tracking-widest flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                Featured Study Vault
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-bold">
                LOCAL READY
              </span>
            </div>

            {/* Bottom Content & CTAs */}
            <div className="relative z-10 space-y-4 mt-16">
              <div>
                <h2 className="text-2xl md:text-3xl font-extrabold text-slate-100 leading-tight mb-2">
                  {heroVideo.title}
                </h2>
                <p className="text-xs md:text-sm text-slate-300 line-clamp-2 max-w-xl">
                  {heroVideo.description || "Master core concepts with interactive 3D physics visualizations and local offline playback."}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300">
                <span className="px-2.5 py-1 bg-white/10 border border-white/10 rounded-lg font-mono">
                  4K 3D CFD
                </span>
                <span className="px-2.5 py-1 bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 rounded-lg font-mono">
                  {heroVideo.chapter || "MODULE 04"}
                </span>
                <span className="font-mono text-slate-400">Offline Instant Sync</span>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => onPlayVideo(heroVideo)}
                  className="skeuo-btn px-6 py-3 bg-white text-slate-950 rounded-xl font-bold text-xs md:text-sm hover:bg-slate-100 transition-colors flex items-center gap-2 shadow-lg"
                >
                  <Play size={16} className="fill-current" />
                  <span>Resume Playback</span>
                </button>
                <button
                  onClick={onPickFolder}
                  className="skeuo-btn px-5 py-3 bg-slate-800/90 text-slate-200 rounded-xl font-bold text-xs md:text-sm border border-slate-700 hover:bg-slate-700 hover:text-white transition-colors"
                >
                  Map Folders
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Bento Tile 2: Primary Storage Metric */}
        <div className="bento-tile p-6 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl">
              <HardDrive className="w-5 h-5 text-indigo-400" />
            </div>
            <span className="text-emerald-400 text-xs font-mono font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" /> ONLINE
            </span>
          </div>
          <div className="mt-4">
            <div className="text-slate-400 text-xs font-medium">Primary Storage</div>
            <div className="text-2xl font-bold text-slate-100 mt-1">
              {allVideos.length * 120 > 1024
                ? `${((allVideos.length * 120) / 1024).toFixed(1)} GB`
                : `${allVideos.length * 120} MB`}
              <span className="text-slate-500 text-sm font-normal ml-1">/ Local Disk</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
              <div className="bg-indigo-500 h-full w-3/5 rounded-full shadow-[0_0_8px_#6366f1]" />
            </div>
          </div>
        </div>

        {/* Bento Tile 3: Current Viewers & LAN Sessions */}
        <div className="bento-tile p-6 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-2xl">
              <Wifi className="w-5 h-5 text-purple-400" />
            </div>
            <span className="text-slate-400 text-xs font-mono font-bold bg-slate-800 px-2 py-0.5 rounded-full">
              ACTIVE
            </span>
          </div>
          <div className="mt-4">
            <div className="text-slate-400 text-xs font-medium">Network Access</div>
            <div className="text-2xl font-bold text-slate-100 mt-1">
              {allVideos.length} <span className="text-slate-500 text-sm font-normal">Files</span>
            </div>
            <div className="text-xs text-slate-400 mt-1 italic">Direct Wi-Fi • Port 3000</div>
          </div>
        </div>

        {/* Bento Tile 4: Easy Mobile Setup / QR Guide Banner */}
        <div
          onClick={onOpenLanModal}
          className="md:col-span-2 bento-tile !bg-indigo-600 border-indigo-500/40 p-6 relative overflow-hidden text-white cursor-pointer group hover:shadow-indigo-500/20 hover:shadow-xl transition-all"
        >
          <div className="absolute right-0 top-0 opacity-10 scale-150 rotate-12 pointer-events-none">
            <Smartphone className="w-32 h-32" />
          </div>
          <div className="flex items-center justify-between h-full relative z-10 gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 text-[10px] font-mono font-bold tracking-wider uppercase mb-2">
                <QrCode size={12} /> Direct LAN Mirroring
              </div>
              <h3 className="text-lg md:text-xl font-bold mb-1">Easy Mobile &amp; Tablet Setup</h3>
              <p className="text-indigo-100 text-xs md:text-sm max-w-sm">
                Stream to your phone, iPad, or TV on your local Wi-Fi with zero cloud uploads.
              </p>
            </div>
            <div className="bg-white p-2.5 rounded-2xl shadow-xl flex-shrink-0 group-hover:scale-105 transition-transform">
              <div className="w-16 h-16 bg-slate-950 rounded-xl flex items-center justify-center p-1">
                <div className="grid grid-cols-3 gap-1 w-full h-full p-0.5">
                  <div className="bg-white rounded-xs"></div>
                  <div className="bg-white rounded-xs"></div>
                  <div className="bg-slate-700 rounded-xs"></div>
                  <div className="bg-slate-700 rounded-xs"></div>
                  <div className="bg-white rounded-xs"></div>
                  <div className="bg-white rounded-xs"></div>
                  <div className="bg-white rounded-xs"></div>
                  <div className="bg-slate-700 rounded-xs"></div>
                  <div className="bg-white rounded-xs"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bento Tile 5: Network Activity / Bitrate Graph */}
        <div className="bento-tile p-5 flex flex-col justify-between">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
            LAN Activity
          </div>
          <div className="flex items-end justify-between h-10 gap-1 my-2">
            <div className="w-full bg-indigo-500/20 h-3 rounded-xs"></div>
            <div className="w-full bg-indigo-500/40 h-7 rounded-xs"></div>
            <div className="w-full bg-indigo-500/30 h-5 rounded-xs"></div>
            <div className="w-full bg-indigo-500 h-10 rounded-xs animate-pulse"></div>
            <div className="w-full bg-indigo-500/60 h-8 rounded-xs"></div>
            <div className="w-full bg-indigo-500/20 h-4 rounded-xs"></div>
            <div className="w-full bg-indigo-500/50 h-6 rounded-xs"></div>
          </div>
          <div className="text-center pt-1 border-t border-slate-800">
            <span className="text-lg font-mono font-bold text-slate-100">842</span>{' '}
            <span className="text-[10px] text-slate-400 uppercase font-mono">Mbps UP</span>
          </div>
        </div>

        {/* Bento Tile 6: Local Mirroring & Ports */}
        <div className="bento-tile p-5 flex flex-col justify-between">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
            Local Ports
          </div>
          <div className="grid grid-cols-2 gap-2 my-1">
            <div className="bg-slate-800 hover:bg-slate-700/80 p-2 rounded-xl transition-colors border border-slate-700 text-center">
              <div className="text-[9px] font-mono text-slate-400">Port 3000</div>
              <div className="text-xs font-bold text-slate-100">Vault UI</div>
            </div>
            <div className="bg-slate-800 hover:bg-slate-700/80 p-2 rounded-xl transition-colors border border-slate-700 text-center">
              <div className="text-[9px] font-mono text-slate-400">Port 9000</div>
              <div className="text-xs font-bold text-slate-100">3D CFD</div>
            </div>
          </div>
          <div className="text-[10px] font-mono text-emerald-400 text-center">All sockets open</div>
        </div>
      </section>

      {/* 2. Continue Watching Bento Section */}
      {continueItems.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg md:text-xl font-bold text-slate-100 flex items-center gap-2 tracking-tight">
              <Clock size={18} className="text-indigo-400" />
              Continue Watching
            </h2>
            <button
              onClick={() => onNavigate({ view: 'continue' })}
              className="text-xs font-mono text-indigo-400 hover:text-white flex items-center gap-1 font-semibold uppercase tracking-wider transition-colors"
            >
              <span>VIEW ALL</span>
              <ArrowRight size={13} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {continueItems.slice(0, 3).map((v) => (
              <VideoCard
                key={v.id}
                video={v}
                progress={progressMap[v.id]}
                onPlay={onPlayVideo}
                onToggleSave={onToggleSaveVideo}
                showFolder
              />
            ))}
          </div>
        </section>
      )}

      {/* 3. Recent Archives / Library Collection */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-lg md:text-xl font-bold text-slate-100 tracking-tight">
              Recent Archives
            </h2>
            <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-widest border border-indigo-500/30 px-2 py-0.5 rounded-full bg-indigo-500/10 font-bold">
              BENTO GRID
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {allVideos.slice(0, 6).map((v) => (
            <VideoCard
              key={v.id}
              video={v}
              progress={progressMap[v.id]}
              onPlay={onPlayVideo}
              onToggleSave={onToggleSaveVideo}
              showFolder
            />
          ))}
        </div>
      </section>

      {/* 4. Local Playlists / Modules Bento Tiles */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg md:text-xl font-bold text-slate-100 flex items-center gap-2 tracking-tight">
            <Folder size={18} className="text-indigo-400" />
            Modules &amp; Playlist Sets
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {playlists.map((pl) => {
            const watchedInPl = pl.videos.filter((v) => progressMap[v.id]?.watched).length;
            const pctPl = pl.videos.length > 0 ? Math.round((watchedInPl / pl.videos.length) * 100) : 0;
            return (
              <div
                key={pl.id}
                onClick={() => onNavigate({ view: 'playlist', playlistId: pl.id })}
                className="bento-tile p-5 cursor-pointer group hover:bg-slate-800/80 transition-all flex flex-col justify-between"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-105 transition-transform shadow-inner">
                    <Folder size={20} className="fill-indigo-400/20" />
                  </div>
                  {pl.badge && (
                    <span className="text-[10px] font-mono text-indigo-300 bg-indigo-500/15 border border-indigo-500/30 px-2.5 py-0.5 rounded-full font-bold">
                      {pl.badge}
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="font-bold text-base text-slate-100 group-hover:text-indigo-400 transition-colors mb-1">
                    {pl.name}
                  </h3>
                  {pl.description && (
                    <p className="text-xs text-slate-400 line-clamp-2 mb-3">
                      {pl.description}
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
                  <span>{pl.videos.length} Archive{pl.videos.length === 1 ? '' : 's'}</span>
                  {pctPl > 0 && (
                    <span className={pctPl === 100 ? 'text-emerald-400 font-semibold' : 'text-indigo-400 font-semibold'}>
                      {pctPl}% Mastered
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

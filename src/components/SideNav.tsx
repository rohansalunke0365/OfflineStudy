import {
  Home,
  Clock,
  Folder,
  Bookmark,
  HardDrive,
  BarChart3,
  Layers,
  Award,
  FileText,
  Settings,
  FolderArchive,
  Sparkles
} from 'lucide-react';
import { Playlist, RouteState } from '../types';

interface SideNavProps {
  currentRoute: RouteState;
  onNavigate: (route: RouteState) => void;
  playlists: Playlist[];
  continueCount: number;
  savedCount: number;
  totalVideoCount: number;
  onPickFolder: () => void;
}

export const SideNav = ({
  currentRoute,
  onNavigate,
  playlists,
  continueCount,
  savedCount,
  totalVideoCount,
  onPickFolder,
}: SideNavProps) => {
  return (
    <>
      {/* Desktop & Tablet Sidebar */}
      <aside className="hidden md:flex w-64 flex-col flex-shrink-0 bg-slate-950/90 backdrop-blur-3xl border-r border-slate-800 shadow-2xl overflow-y-auto h-[calc(100vh-65px)] select-none custom-scrollbar">
        {/* User / Local Archive Status Card */}
        <div className="p-4 border-b border-slate-800/80">
          <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-3 shadow-inner">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center flex-shrink-0">
              <HardDrive size={18} className="text-indigo-400" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-xs text-slate-200 truncate">StudyVault 2.0</span>
              <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
                AI + LAN Active
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 p-3 space-y-1">
          <div className="text-[10px] font-mono font-bold tracking-widest text-slate-500 px-3 py-2 uppercase">
            Bento Dashboard
          </div>

          {/* Home */}
          <button
            onClick={() => onNavigate({ view: 'home' })}
            className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs md:text-sm font-medium transition-all ${
              currentRoute.view === 'home'
                ? 'bg-indigo-600/15 text-indigo-400 font-bold border border-indigo-500/30 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <div className="flex items-center gap-3">
              <Home size={16} className={currentRoute.view === 'home' ? 'text-indigo-400' : 'text-slate-400'} />
              <span>Library Hub</span>
            </div>
            <span className="text-[11px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full">
              {totalVideoCount}
            </span>
          </button>

          {/* Continue Watching */}
          <button
            onClick={() => onNavigate({ view: 'continue' })}
            className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs md:text-sm font-medium transition-all ${
              currentRoute.view === 'continue'
                ? 'bg-indigo-600/15 text-indigo-400 font-bold border border-indigo-500/30 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <div className="flex items-center gap-3">
              <Clock size={16} className={currentRoute.view === 'continue' ? 'text-indigo-400' : 'text-slate-400'} />
              <span>Continue</span>
            </div>
            {continueCount > 0 && (
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                {continueCount}
              </span>
            )}
          </button>

          {/* Saved to Vault */}
          <button
            onClick={() => onNavigate({ view: 'saved' })}
            className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs md:text-sm font-medium transition-all ${
              currentRoute.view === 'saved'
                ? 'bg-indigo-600/15 text-indigo-400 font-bold border border-indigo-500/30 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <div className="flex items-center gap-3">
              <Bookmark size={16} className={currentRoute.view === 'saved' ? 'text-indigo-400' : 'text-slate-400'} />
              <span>Saved Vault</span>
            </div>
            {savedCount > 0 && (
              <span className="text-[10px] font-mono text-purple-400 bg-purple-500/15 border border-purple-500/30 px-2 py-0.5 rounded-full font-bold">
                {savedCount}
              </span>
            )}
          </button>

          {/* Study Tools Section */}
          <div className="pt-3">
            <div className="text-[10px] font-mono font-bold tracking-widest text-slate-500 px-3 py-1.5 uppercase flex items-center gap-1">
              <Sparkles size={11} className="text-indigo-400" />
              <span>AI Study Suite</span>
            </div>

            {/* Analytics */}
            <button
              onClick={() => onNavigate({ view: 'analytics' })}
              className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${
                currentRoute.view === 'analytics'
                  ? 'bg-indigo-600/15 text-indigo-400 font-bold border border-indigo-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <BarChart3 size={15} className={currentRoute.view === 'analytics' ? 'text-indigo-400' : 'text-slate-400'} />
                <span>Analytics</span>
              </div>
            </button>

            {/* Flashcards */}
            <button
              onClick={() => onNavigate({ view: 'flashcards' })}
              className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${
                currentRoute.view === 'flashcards'
                  ? 'bg-indigo-600/15 text-indigo-400 font-bold border border-indigo-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <Layers size={15} className={currentRoute.view === 'flashcards' ? 'text-indigo-400' : 'text-slate-400'} />
                <span>Flashcards</span>
              </div>
            </button>

            {/* Quizzes */}
            <button
              onClick={() => onNavigate({ view: 'quiz' })}
              className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${
                currentRoute.view === 'quiz'
                  ? 'bg-indigo-600/15 text-indigo-400 font-bold border border-indigo-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <Award size={15} className={currentRoute.view === 'quiz' ? 'text-indigo-400' : 'text-slate-400'} />
                <span>Quizzes</span>
              </div>
            </button>

            {/* Notes & Bookmarks */}
            <button
              onClick={() => onNavigate({ view: 'notes' })}
              className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${
                currentRoute.view === 'notes'
                  ? 'bg-indigo-600/15 text-indigo-400 font-bold border border-indigo-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <FileText size={15} className={currentRoute.view === 'notes' ? 'text-indigo-400' : 'text-slate-400'} />
                <span>Notes Archive</span>
              </div>
            </button>

            {/* Settings */}
            <button
              onClick={() => onNavigate({ view: 'settings' })}
              className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${
                currentRoute.view === 'settings'
                  ? 'bg-indigo-600/15 text-indigo-400 font-bold border border-indigo-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <Settings size={15} className={currentRoute.view === 'settings' ? 'text-indigo-400' : 'text-slate-400'} />
                <span>Settings</span>
              </div>
            </button>
          </div>

          {/* Playlists / Subfolder Modules */}
          <div className="pt-3">
            <div className="text-[10px] font-mono font-bold tracking-widest text-slate-500 px-3 py-1.5 uppercase flex items-center justify-between">
              <span>Modules &amp; Sets</span>
              <span className="text-[9px] text-slate-400 font-normal">{playlists.length}</span>
            </div>

            <div className="space-y-0.5 mt-1">
              {playlists.map((pl) => {
                const isActive = currentRoute.view === 'playlist' && currentRoute.playlistId === pl.id;
                return (
                  <button
                    key={pl.id}
                    onClick={() => onNavigate({ view: 'playlist', playlistId: pl.id })}
                    className={`w-full flex items-center justify-between px-3.5 py-1.5 rounded-xl text-xs text-left transition-all ${
                      isActive
                        ? 'bg-slate-900 text-indigo-400 font-bold border border-slate-700'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Folder
                        size={13}
                        className={isActive ? 'text-indigo-400 fill-indigo-400/20' : 'text-slate-500'}
                      />
                      <span className="truncate">{pl.name}</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500 ml-2 flex-shrink-0">
                      {pl.videos.length}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom Folder Picker Action */}
        <div className="p-3 border-t border-slate-800/80">
          <button
            onClick={onPickFolder}
            className="skeuo-btn w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-mono text-slate-200 flex items-center justify-center gap-2 transition-all group"
          >
            <FolderArchive size={14} className="text-indigo-400 group-hover:scale-110 transition-transform" />
            <span>Map Local Folder</span>
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-950/95 backdrop-blur-3xl border-t border-slate-800 px-3 py-2 flex justify-around items-center shadow-2xl">
        <button
          onClick={() => onNavigate({ view: 'home' })}
          className={`flex flex-col items-center p-1.5 rounded-lg transition-transform ${
            currentRoute.view === 'home' ? 'text-indigo-400 scale-105' : 'text-slate-400'
          }`}
        >
          <Home size={18} />
          <span className="text-[10px] font-mono mt-0.5">Library</span>
        </button>

        <button
          onClick={() => onNavigate({ view: 'continue' })}
          className={`flex flex-col items-center p-1.5 rounded-lg transition-transform ${
            currentRoute.view === 'continue' ? 'text-indigo-400 scale-105' : 'text-slate-400'
          }`}
        >
          <Clock size={18} />
          <span className="text-[10px] font-mono mt-0.5">Continue</span>
        </button>

        <button
          onClick={() => onNavigate({ view: 'flashcards' })}
          className={`flex flex-col items-center p-1.5 rounded-lg transition-transform ${
            currentRoute.view === 'flashcards' ? 'text-indigo-400 scale-105' : 'text-slate-400'
          }`}
        >
          <Layers size={18} />
          <span className="text-[10px] font-mono mt-0.5">Cards</span>
        </button>

        <button
          onClick={() => onNavigate({ view: 'analytics' })}
          className={`flex flex-col items-center p-1.5 rounded-lg transition-transform ${
            currentRoute.view === 'analytics' ? 'text-indigo-400 scale-105' : 'text-slate-400'
          }`}
        >
          <BarChart3 size={18} />
          <span className="text-[10px] font-mono mt-0.5">Stats</span>
        </button>

        <button
          onClick={onPickFolder}
          className="flex flex-col items-center p-1.5 rounded-lg text-emerald-400 transition-transform"
        >
          <Folder size={18} />
          <span className="text-[10px] font-mono mt-0.5">Folder</span>
        </button>
      </nav>
    </>
  );
};

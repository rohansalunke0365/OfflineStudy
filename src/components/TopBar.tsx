import { useState } from 'react';
import { Search, Folder, RefreshCw, Palette, Wifi, Download, ShieldCheck, HardDrive } from 'lucide-react';
import { VAULT_LOGO_URL } from '../data/defaultLibrary';

interface TopBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onPickFolder: () => void;
  onRescan: () => void;
  hasLocalFolder: boolean;
  onOpenThemeModal: () => void;
  onOpenLanModal: () => void;
  onExportStandaloneHtml: () => void;
  currentFolderName?: string;
}

export const TopBar = ({
  searchQuery,
  onSearchChange,
  onPickFolder,
  onRescan,
  hasLocalFolder,
  onOpenThemeModal,
  onOpenLanModal,
  onExportStandaloneHtml,
  currentFolderName
}: TopBarProps) => {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    await onExportStandaloneHtml();
    setTimeout(() => setIsExporting(false), 800);
  };

  return (
    <header className="sticky top-0 w-full z-40 bg-slate-950/90 backdrop-blur-2xl border-b border-slate-800 shadow-2xl px-4 md:px-6 py-3.5 flex items-center justify-between gap-4 transition-colors">
      {/* Brand & Version Badge */}
      <div
        className="flex items-center gap-3 select-none flex-shrink-0 cursor-pointer"
        onClick={() => onSearchChange('')}
      >
        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center font-bold text-xl text-white shadow-lg shadow-indigo-500/25 border border-indigo-400/30 flex-shrink-0">
          <img
            src={VAULT_LOGO_URL}
            alt="StudyVault"
            className="w-7 h-7 object-contain drop-shadow"
          />
        </div>

        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-100 flex items-center">
              StudyVault
              <span className="text-indigo-400 font-normal text-[11px] font-mono ml-2.5 px-2.5 py-0.5 border border-indigo-400/30 bg-indigo-500/10 rounded-full hidden sm:inline-block">
                Local Server v2.4
              </span>
            </h1>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-400">
            <span>LAN &amp; Offline Storage</span>
            {hasLocalFolder && (
              <span className="text-emerald-400 font-semibold flex items-center gap-0.5">
                • <ShieldCheck size={11} className="inline" /> Synced
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="flex-1 max-w-md relative mx-2 hidden sm:block">
        <Search
          size={15}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
        />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search Bento archives, 3D simulations, modules…"
          className="w-full bg-slate-900 border border-slate-800 text-slate-100 rounded-xl py-2 pl-10 pr-4 text-xs md:text-sm font-sans placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-inner"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-slate-400 hover:text-white bg-slate-800 px-1.5 py-0.5 rounded"
          >
            ESC
          </button>
        )}
      </div>

      {/* Action Buttons & Local Access Telemetry Badge */}
      <div className="flex items-center gap-3 flex-shrink-0">
        {/* Local Access LAN Telemetry Widget */}
        <div
          onClick={onOpenLanModal}
          className="hidden lg:flex items-center gap-3 bg-slate-900 hover:bg-slate-800/80 border border-slate-800 px-3.5 py-1.5 rounded-2xl cursor-pointer transition-colors group"
          title="Click to view Local LAN streaming instructions"
        >
          <div className="text-right">
            <div className="text-[9.5px] font-mono text-slate-500 uppercase tracking-widest font-bold">
              Local Access
            </div>
            <div className="text-xs font-mono text-emerald-400 font-semibold flex items-center gap-1 justify-end">
              <span>192.168.1.xxx:3000</span>
            </div>
          </div>
          <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center group-hover:border-emerald-500/40 transition-colors">
            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500 animate-pulse" />
          </div>
        </div>

        {/* LAN Access Guide Modal Button */}
        <button
          onClick={onOpenLanModal}
          className="skeuo-btn flex lg:hidden items-center gap-2 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-medium text-slate-200 hover:text-indigo-400 hover:bg-slate-800 transition-colors"
          title="Access on LAN / Mobile Devices"
        >
          <Wifi size={14} className="text-indigo-400" />
          <span className="hidden sm:inline">LAN</span>
        </button>

        {/* Theme Settings Modal */}
        <button
          onClick={onOpenThemeModal}
          className="skeuo-btn p-2 sm:px-3 sm:py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-medium text-slate-200 hover:text-indigo-400 hover:bg-slate-800 flex items-center gap-2 transition-colors"
          title="Customize Theme"
        >
          <Palette size={14} className="text-indigo-400" />
          <span className="hidden xl:inline">Theme</span>
        </button>

        {/* Export Standalone HTML SPA */}
        <button
          onClick={handleExport}
          disabled={isExporting}
          className="skeuo-btn hidden xl:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300 hover:text-emerald-400 hover:bg-slate-800 transition-colors"
          title="Download Portable 1-File HTML SPA"
        >
          <Download size={13} className={isExporting ? "animate-bounce" : ""} />
          <span>Export SPA</span>
        </button>

        {/* Rescan Button (when folder connected) */}
        {hasLocalFolder && (
          <button
            onClick={onRescan}
            className="skeuo-btn p-2 sm:px-3 sm:py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-medium text-slate-200 hover:text-white hover:bg-slate-800 flex items-center gap-1.5 transition-colors"
            title="Rescan local videos folder"
          >
            <RefreshCw size={14} className="text-indigo-400" />
            <span className="hidden lg:inline">Rescan</span>
          </button>
        )}

        {/* Choose Folder Primary CTA */}
        <button
          onClick={onPickFolder}
          className="skeuo-btn flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs md:text-sm shadow-lg shadow-indigo-600/30 border border-indigo-400/30 transition-all duration-200"
          title="Pick video directory with File System Access API"
        >
          <Folder size={15} className="fill-white/20" />
          <span className="truncate max-w-[110px] sm:max-w-none">
            {currentFolderName ? currentFolderName : 'Choose folder'}
          </span>
        </button>
      </div>
    </header>
  );
};

import { useState } from 'react';
import { AppSettings, ThemeConfig } from '../types';
import {
  Settings,
  Palette,
  Sliders,
  Database,
  Download,
  Upload,
  Trash2,
  RefreshCw,
  ShieldCheck,
  Check,
  AlertTriangle
} from 'lucide-react';
import {
  exportAllMetadata,
  importMetadata,
  idbClearStore
} from '../services/db';

interface SettingsViewProps {
  settings: AppSettings;
  onSaveSettings: (settings: AppSettings) => void;
  onSaveTheme: (theme: ThemeConfig) => void;
  onShowToast: (msg: string) => void;
  onRescanLibrary: () => void;
}

export const SettingsView = ({
  settings,
  onSaveSettings,
  onSaveTheme,
  onShowToast,
  onRescanLibrary,
}: SettingsViewProps) => {
  const [activeTab, setActiveTab] = useState<'general' | 'theme' | 'data'>('general');

  // Form State
  const [completionThreshold, setCompletionThreshold] = useState(
    Math.round((settings.completionThreshold || 0.92) * 100)
  );
  const [autoAdvance, setAutoAdvance] = useState(settings.autoAdvance ?? true);
  const [defaultSpeed, setDefaultSpeed] = useState(settings.defaultPlaybackSpeed || 1);

  // Theme draft state
  const [draftTheme, setDraftTheme] = useState<ThemeConfig>({
    mode: settings.theme.mode || 'dark',
    custom: {
      bg: settings.theme.custom?.bg || '#0f172a',
      card: settings.theme.custom?.card || '#1e293b',
      accent: settings.theme.custom?.accent || '#6366f1',
      text: settings.theme.custom?.text || '#f8fafc',
    },
  });

  const [importJsonText, setImportJsonText] = useState('');
  const [isImporting, setIsImporting] = useState(false);

  // Theme presets
  const presets = [
    { name: 'Indigo Bento', mode: 'dark', bg: '#090d16', card: '#0f172a', accent: '#6366f1', text: '#f8fafc' },
    { name: 'Obsidian Jet', mode: 'obsidian', bg: '#08080a', card: '#121214', accent: '#38bdf8', text: '#f1f5f9' },
    { name: 'Emerald Cyber', mode: 'cyber', bg: '#04100c', card: '#091e17', accent: '#10b981', text: '#ecfdf5' },
    { name: 'Amber Glow', mode: 'custom', bg: '#12100b', card: '#1c1811', accent: '#f59e0b', text: '#fef3c7' },
    { name: 'Purple Neon', mode: 'custom', bg: '#100b1a', card: '#1a1129', accent: '#a855f7', text: '#faf5ff' },
    { name: 'Studio Light', mode: 'light', bg: '#f8fafc', card: '#ffffff', accent: '#4f46e5', text: '#0f172a' },
  ];

  const handleApplyPreset = (p: typeof presets[0]) => {
    const updated: ThemeConfig = {
      mode: p.mode as any,
      custom: { bg: p.bg, card: p.card, accent: p.accent, text: p.text },
    };
    setDraftTheme(updated);
    onSaveTheme(updated);
    onShowToast(`Applied ${p.name} theme`);
  };

  const handleSaveGeneral = () => {
    const updated: AppSettings = {
      ...settings,
      completionThreshold: completionThreshold / 100,
      autoAdvance,
      defaultPlaybackSpeed: defaultSpeed,
    };
    onSaveSettings(updated);
    onShowToast('General preferences saved successfully');
  };

  // Export JSON metadata
  const handleExportBackup = async () => {
    try {
      const json = await exportAllMetadata();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `StudyVault_Backup_${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      onShowToast('Exported full library metadata JSON');
    } catch (err: any) {
      onShowToast(`Export failed: ${err.message}`);
    }
  };

  // Import JSON metadata
  const handleImportBackup = async () => {
    if (!importJsonText.trim()) {
      onShowToast('Please paste a JSON backup payload');
      return;
    }
    setIsImporting(true);
    try {
      const res = await importMetadata(importJsonText.trim());
      if (res.success) {
        onShowToast(`Successfully restored ${res.count} records from backup!`);
        setImportJsonText('');
        setTimeout(() => window.location.reload(), 1200);
      } else {
        onShowToast(`Import failed: ${res.error}`);
      }
    } catch (err: any) {
      onShowToast(`Import error: ${err.message}`);
    } finally {
      setIsImporting(false);
    }
  };

  // Clear Thumbnail Cache
  const handleClearThumbs = async () => {
    if (confirm('Clear local cached video thumbnails? They will regenerate dynamically when viewed.')) {
      await idbClearStore('thumbs');
      onShowToast('Cleared thumbnail cache');
    }
  };

  // Clear AI Cache
  const handleClearAICache = async () => {
    if (confirm('Clear cached AI summaries and chats?')) {
      await idbClearStore('ai_cache');
      onShowToast('Cleared AI cache');
    }
  };

  // Reset Progress
  const handleResetProgress = async () => {
    if (confirm('Reset all video watch timestamps and completion history?')) {
      await idbClearStore('progress');
      onShowToast('All watch progress reset to 0%');
      setTimeout(() => window.location.reload(), 1000);
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-indigo-400 uppercase tracking-widest font-bold mb-1">
            <Settings size={14} />
            <span>Preferences &amp; Diagnostics</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-100 tracking-tight">
            StudyVault Settings
          </h1>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            Configure video player physics, theme palettes, local cache storage, and metadata backups.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 p-1 rounded-2xl bg-slate-900 border border-slate-800 w-fit">
        <button
          onClick={() => setActiveTab('general')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono transition-all ${
            activeTab === 'general'
              ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Sliders size={14} />
          <span>Playback &amp; Logic</span>
        </button>

        <button
          onClick={() => setActiveTab('theme')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono transition-all ${
            activeTab === 'theme'
              ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Palette size={14} />
          <span>Appearance &amp; Palette</span>
        </button>

        <button
          onClick={() => setActiveTab('data')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono transition-all ${
            activeTab === 'data'
              ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Database size={14} />
          <span>Backup &amp; Cache</span>
        </button>
      </div>

      {/* 1. Playback & Logic Tab */}
      {activeTab === 'general' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-6">
            <h3 className="text-sm font-mono font-bold uppercase tracking-widest text-slate-400">
              Study Player Configuration
            </h3>

            {/* Completion Threshold */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs md:text-sm font-bold text-slate-200">
                  Automatic Completion Threshold
                </label>
                <span className="text-xs font-mono text-indigo-400 font-bold bg-slate-800 px-2 py-0.5 rounded-md">
                  {completionThreshold}%
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Mark lectures as watched when playback reaches this percentage of the total duration.
              </p>
              <input
                type="range"
                min="70"
                max="99"
                value={completionThreshold}
                onChange={(e) => setCompletionThreshold(Number(e.target.value))}
                className="w-full accent-indigo-500"
              />
            </div>

            {/* Auto Advance */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              <div>
                <label className="text-xs md:text-sm font-bold text-slate-200 block">
                  Autoplay Next Playlist Video
                </label>
                <p className="text-xs text-slate-400">
                  Seamlessly advance to the next lecture in the queue when current video finishes.
                </p>
              </div>
              <button
                onClick={() => setAutoAdvance(!autoAdvance)}
                className={`w-12 h-6 rounded-full transition-colors relative p-1 ${
                  autoAdvance ? 'bg-indigo-600' : 'bg-slate-800'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    autoAdvance ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Default Playback Speed */}
            <div className="pt-4 border-t border-slate-800 space-y-2">
              <label className="text-xs md:text-sm font-bold text-slate-200 block">
                Default Preferred Speed
              </label>
              <div className="flex flex-wrap gap-2">
                {[0.75, 1, 1.25, 1.5, 1.75, 2].map((s) => (
                  <button
                    key={s}
                    onClick={() => setDefaultSpeed(s)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-mono transition-colors ${
                      defaultSpeed === s
                        ? 'bg-indigo-600 text-white font-bold'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {s}x
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex justify-end">
              <button
                onClick={handleSaveGeneral}
                className="skeuo-btn px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs font-mono shadow-md shadow-indigo-600/30"
              >
                Save Playback Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Theme & Palette Tab */}
      {activeTab === 'theme' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-6">
            <h3 className="text-sm font-mono font-bold uppercase tracking-widest text-slate-400">
              Curated Theme Presets
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {presets.map((p) => (
                <div
                  key={p.name}
                  onClick={() => handleApplyPreset(p)}
                  className="p-4 rounded-2xl border border-slate-800 hover:border-indigo-500/50 cursor-pointer transition-all space-y-3 bg-slate-950/70 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-200">{p.name}</span>
                    <div
                      className="w-3.5 h-3.5 rounded-full shadow"
                      style={{ backgroundColor: p.accent }}
                    />
                  </div>
                  <div className="flex gap-1.5 h-6 rounded-lg overflow-hidden border border-slate-800">
                    <div className="flex-1" style={{ backgroundColor: p.bg }} />
                    <div className="flex-1" style={{ backgroundColor: p.card }} />
                    <div className="flex-1" style={{ backgroundColor: p.accent }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 3. Data Backup & Cache Tab */}
      {activeTab === 'data' && (
        <div className="space-y-6">
          {/* Metadata Export & Import */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            <h3 className="text-sm font-mono font-bold uppercase tracking-widest text-slate-400">
              Library Metadata Backup (JSON)
            </h3>
            <p className="text-xs text-slate-400">
              Export and restore all bookmarks, timestamp notes, flashcards, quiz scores, and watch progress. (Does not copy the actual raw video files).
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={handleExportBackup}
                className="skeuo-btn flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-bold"
              >
                <Download size={14} className="text-indigo-400" />
                <span>Export Metadata (.json)</span>
              </button>
            </div>

            {/* Paste JSON Import */}
            <div className="pt-4 border-t border-slate-800 space-y-3">
              <label className="text-xs font-bold text-slate-300 block">
                Restore Metadata from JSON Payload
              </label>
              <textarea
                rows={3}
                value={importJsonText}
                onChange={(e) => setImportJsonText(e.target.value)}
                placeholder='Paste exported StudyVault JSON content here {"appName": "StudyVault 2.0", ...}'
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500"
              />
              <button
                onClick={handleImportBackup}
                disabled={isImporting || !importJsonText.trim()}
                className="skeuo-btn flex items-center gap-2 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-xs font-mono font-bold"
              >
                <Upload size={14} />
                <span>Restore Backup Payload</span>
              </button>
            </div>
          </div>

          {/* Destructive / Cache Management */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-rose-500/20 shadow-xl space-y-4">
            <div className="flex items-center gap-2 text-rose-400 text-xs font-mono uppercase font-bold">
              <AlertTriangle size={14} />
              <span>Storage Maintenance &amp; Reset</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <button
                onClick={handleClearThumbs}
                className="p-3 rounded-2xl bg-slate-950 border border-slate-800 hover:border-rose-500/40 text-left text-xs text-slate-300 space-y-1 transition-colors"
              >
                <span className="font-bold block text-slate-200">Clear Thumbnails</span>
                <span className="text-[10px] text-slate-500">
                  Delete cached canvas preview images.
                </span>
              </button>

              <button
                onClick={handleClearAICache}
                className="p-3 rounded-2xl bg-slate-950 border border-slate-800 hover:border-rose-500/40 text-left text-xs text-slate-300 space-y-1 transition-colors"
              >
                <span className="font-bold block text-slate-200">Purge AI Cache</span>
                <span className="text-[10px] text-slate-500">
                  Clear generated AI summaries &amp; responses.
                </span>
              </button>

              <button
                onClick={handleResetProgress}
                className="p-3 rounded-2xl bg-slate-950 border border-rose-500/30 hover:bg-rose-500/10 text-left text-xs text-rose-300 space-y-1 transition-colors"
              >
                <span className="font-bold block text-rose-200">Reset Progress</span>
                <span className="text-[10px] text-rose-400/70">
                  Reset all video watch history to 0%.
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

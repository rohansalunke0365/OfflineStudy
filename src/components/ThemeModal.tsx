import { useState } from 'react';
import { X, Check, Palette, Sparkles, Sun, Moon } from 'lucide-react';
import { ThemeConfig } from '../types';

interface ThemeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: ThemeConfig;
  onSaveTheme: (theme: ThemeConfig) => void;
}

const PRESETS = [
  { id: 'amber', label: 'Vault Amber', accent: '#e8a33d', bg: '#121316', card: '#1f1f23', text: '#ececec' },
  { id: 'cyan', label: 'Midnight Cyan', accent: '#00f2ff', bg: '#090e17', card: '#111927', text: '#e6f7ff' },
  { id: 'emerald', label: 'Emerald Matrix', accent: '#4caf6e', bg: '#0b140f', card: '#14241b', text: '#e8f5e9' },
  { id: 'purple', label: 'Royal Plasma', accent: '#9a6fe0', bg: '#130d1d', card: '#1f152f', text: '#f3e8ff' },
  { id: 'red', label: 'Laser Core', accent: '#e05a4f', bg: '#170c0c', card: '#261414', text: '#ffebee' },
  { id: 'obsidian', label: 'Deep Obsidian', accent: '#c8c6c8', bg: '#050506', card: '#101014', text: '#f0f0f2' },
  { id: 'light', label: 'Studio Light', accent: '#b8752a', bg: '#f5f4f0', card: '#ffffff', text: '#201f1c' }
];

export const ThemeModal = ({
  isOpen,
  onClose,
  currentTheme,
  onSaveTheme,
}: ThemeModalProps) => {
  const [selectedMode, setSelectedMode] = useState<ThemeConfig['mode']>(currentTheme.mode);
  const [customColors, setCustomColors] = useState(currentTheme.custom);

  if (!isOpen) return null;

  const handleSelectPreset = (preset: typeof PRESETS[0]) => {
    if (preset.id === 'light') {
      setSelectedMode('light');
    } else {
      setSelectedMode('dark');
    }
    setCustomColors({
      bg: preset.bg,
      card: preset.card,
      accent: preset.accent,
      text: preset.text,
    });
  };

  const handleSave = () => {
    onSaveTheme({
      mode: selectedMode,
      custom: customColors,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-[#1a1b1e] border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] p-6 space-y-6 text-white">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-[#e8a33d]/20 text-[#ffb956]">
              <Palette size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight">Theme &amp; Aesthetics</h2>
              <p className="text-xs font-mono text-[#9a9ba2]">Customize your 3D study interface</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#9a9ba2] hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Theme Presets */}
        <div className="space-y-3">
          <label className="text-xs font-mono font-semibold uppercase tracking-wider text-[#9a9ba2]">
            Curated Themes
          </label>
          <div className="grid grid-cols-2 gap-2.5">
            {PRESETS.map((p) => {
              const isSelected = customColors.accent === p.accent && (p.id === 'light' ? selectedMode === 'light' : selectedMode !== 'light');
              return (
                <button
                  key={p.id}
                  onClick={() => handleSelectPreset(p)}
                  className={`skeuo-card p-3 rounded-xl border flex items-center gap-3 text-left transition-all ${
                    isSelected
                      ? 'border-[#e8a33d] bg-white/10 shadow-[0_0_15px_rgba(232,163,61,0.2)]'
                      : 'border-white/5 bg-[#1f1f23] hover:bg-[#292a2d]'
                  }`}
                >
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center shadow-inner border border-white/20 flex-shrink-0"
                    style={{ backgroundColor: p.accent }}
                  >
                    {isSelected && <Check size={13} className="text-black" strokeWidth={3} />}
                  </div>
                  <span className="text-xs font-bold truncate">{p.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom Hex Color Overrides */}
        <div className="space-y-3 pt-2 border-t border-white/10">
          <label className="text-xs font-mono font-semibold uppercase tracking-wider text-[#9a9ba2]">
            Custom Palettes
          </label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <span className="text-[11px] font-mono text-[#9a9ba2] block mb-1">Accent Glow</span>
              <div className="flex items-center gap-2 bg-[#121316] border border-white/10 p-1.5 rounded-lg">
                <input
                  type="color"
                  value={customColors.accent}
                  onChange={(e) => setCustomColors({ ...customColors, accent: e.target.value })}
                  className="w-7 h-7 rounded border-none bg-transparent cursor-pointer"
                />
                <span className="font-mono text-xs uppercase">{customColors.accent}</span>
              </div>
            </div>

            <div>
              <span className="text-[11px] font-mono text-[#9a9ba2] block mb-1">Canvas Background</span>
              <div className="flex items-center gap-2 bg-[#121316] border border-white/10 p-1.5 rounded-lg">
                <input
                  type="color"
                  value={customColors.bg}
                  onChange={(e) => setCustomColors({ ...customColors, bg: e.target.value })}
                  className="w-7 h-7 rounded border-none bg-transparent cursor-pointer"
                />
                <span className="font-mono text-xs uppercase">{customColors.bg}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm text-[#9a9ba2] hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="skeuo-btn px-5 py-2 rounded-lg bg-[#ffb956] hover:bg-[#e8a33d] text-black font-bold text-sm shadow-[0_0_15px_rgba(255,185,86,0.3)] transition-all"
          >
            Apply Theme
          </button>
        </div>
      </div>
    </div>
  );
};

import { X, Keyboard, Command } from 'lucide-react';

interface KeyboardHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardHelpModal = ({ isOpen, onClose }: KeyboardHelpModalProps) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: 'Space', desc: 'Play / Pause video' },
    { key: '← / →', desc: 'Seek Backward / Forward 5 seconds' },
    { key: 'Shift + ← / →', desc: 'Seek Backward / Forward 10 seconds' },
    { key: 'N', desc: 'Jump to Next lecture in playlist' },
    { key: 'P', desc: 'Jump to Previous lecture in playlist' },
    { key: 'M', desc: 'Toggle Mute / Unmute' },
    { key: 'F', desc: 'Toggle Fullscreen' },
    { key: 'B', desc: 'Add instant Bookmark at current timestamp' },
    { key: 'C', desc: 'Open timestamped Note composer' },
    { key: 'Esc', desc: 'Exit fullscreen / Close active panel' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 md:p-8 space-y-6 text-slate-100">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
              <Keyboard size={22} />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-slate-100">
                Keyboard Shortcuts
              </h2>
              <p className="text-xs font-mono text-slate-400">
                High-speed player controls &amp; study hotkeys
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-2.5 max-h-[60vh] overflow-y-auto pr-1">
          {shortcuts.map((s, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/80 border border-slate-800/80 hover:border-slate-700 transition-colors"
            >
              <span className="text-xs md:text-sm text-slate-300 font-medium">{s.desc}</span>
              <kbd className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 font-mono text-xs font-bold text-indigo-300 shadow-inner">
                {s.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="flex justify-end pt-2 border-t border-slate-800">
          <button
            onClick={onClose}
            className="skeuo-btn px-6 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs font-mono transition-colors"
          >
            Got it, Close
          </button>
        </div>
      </div>
    </div>
  );
};

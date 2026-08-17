import { useState } from 'react';
import { X, Wifi, Download, Laptop, Smartphone, Terminal, Shield, Copy, Check, QrCode } from 'lucide-react';

interface LanAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExportStandaloneHtml: () => void;
}

export const LanAccessModal = ({
  isOpen,
  onClose,
  onExportStandaloneHtml,
}: LanAccessModalProps) => {
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(id);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  const handleExport = () => {
    setIsExporting(true);
    onExportStandaloneHtml();
    setTimeout(() => setIsExporting(false), 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 md:p-8 space-y-6 text-slate-100 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
              <Wifi size={22} />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight flex items-center gap-2 text-slate-100">
                Local LAN &amp; Multi-Device Access
              </h2>
              <p className="text-xs font-mono text-slate-400">
                100% Private • Direct Wi-Fi Access • Zero Cloud Sharing
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

        {/* Highlight Banner */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-start gap-3">
          <Shield size={20} className="text-emerald-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-slate-400 leading-relaxed">
            <span className="text-slate-100 font-bold block mb-0.5">Your Videos Never Leave Your Local Machine</span>
            StudyVault reads videos directly via your browser's local File System sandbox. When accessing via LAN, video data streams purely across your home Wi-Fi network with zero external internet uploads.
          </div>
        </div>

        {/* Option 1: Standalone Single-File HTML Exporter */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-2">
              <Download size={15} />
              Method 1 • Portable 1-File HTML SPA (Easiest)
            </span>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold">
              RECOMMENDED
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <p className="text-xs text-slate-300 leading-relaxed">
              Export the entire StudyVault application as a <strong>standalone, self-contained single .html file</strong>. You can copy it onto a USB flash drive, AirDrop/Bluetooth to your phone or iPad, and double-click to run in any browser instantly offline!
            </p>
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="skeuo-btn w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs font-mono flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all"
            >
              <Download size={15} className={isExporting ? 'animate-bounce' : ''} />
              <span>{isExporting ? 'Generating Standalone HTML...' : 'Download Standalone StudyVault.html'}</span>
            </button>
          </div>
        </div>

        {/* Option 2: Local WiFi Network Streaming */}
        <div className="space-y-3">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-2">
            <Laptop size={15} />
            Method 2 • Stream on Phone/Tablet over Local Wi-Fi (LAN)
          </span>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-4 text-xs">
            <div className="space-y-2">
              <div className="text-slate-200 font-semibold flex items-center gap-2">
                <span>1. Run a 1-second local server on your PC</span>
              </div>
              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 font-mono text-[11px] text-indigo-300 flex items-center justify-between">
                <span>npx serve -p 3000</span>
                <button
                  onClick={() => copyToClipboard('npx serve -p 3000', 'npx')}
                  className="text-slate-400 hover:text-white p-1"
                  title="Copy command"
                >
                  {copiedCmd === 'npx' ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                </button>
              </div>
              <div className="text-[11px] text-slate-400">
                (Or Python: <code className="text-indigo-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">python -m http.server 3000</code>)
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-800">
              <div className="text-slate-200 font-semibold flex items-center gap-2">
                <Smartphone size={14} className="text-indigo-400" />
                <span>2. Open browser on your Phone / Tablet on the same Wi-Fi</span>
              </div>
              <p className="text-slate-400">
                Open Chrome or Safari on your phone and enter your PC's local IP address:
              </p>
              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 font-mono text-[11px] text-emerald-400 flex items-center justify-between">
                <span>http://192.168.1.xxx:3000</span>
                <span className="text-[10px] text-slate-400">LAN Port 3000</span>
              </div>
            </div>
          </div>
        </div>

        {/* Close CTA */}
        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="skeuo-btn px-6 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs font-mono transition-colors"
          >
            Got it, Close
          </button>
        </div>
      </div>
    </div>
  );
};

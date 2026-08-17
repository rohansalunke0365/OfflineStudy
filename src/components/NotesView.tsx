import { useState, useMemo } from 'react';
import { Bookmark, VideoNote, VideoItem, Playlist } from '../types';
import {
  FileText,
  Bookmark as BookmarkIcon,
  Search,
  Trash2,
  ExternalLink,
  Download,
  Calendar,
  Clock,
  Filter,
  Layers
} from 'lucide-react';

interface NotesViewProps {
  notes: VideoNote[];
  bookmarks: Bookmark[];
  playlists: Playlist[];
  onPlayVideoAtTime: (videoId: string, time: number) => void;
  onDeleteNote: (noteId: string) => void;
  onDeleteBookmark: (bookmarkId: string) => void;
  onShowToast: (msg: string) => void;
}

export const NotesView = ({
  notes,
  bookmarks,
  playlists,
  onPlayVideoAtTime,
  onDeleteNote,
  onDeleteBookmark,
  onShowToast,
}: NotesViewProps) => {
  const [activeTab, setActiveTab] = useState<'notes' | 'bookmarks'>('notes');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('all');

  const allVideos = useMemo(() => playlists.flatMap((p) => p.videos), [playlists]);

  const formatTimestamp = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const filteredNotes = useMemo(() => {
    return notes.filter((n) => {
      const matchesSearch =
        n.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.videoTitle.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCourse = selectedCourse === 'all' || n.folderPath === selectedCourse;
      return matchesSearch && matchesCourse;
    });
  }, [notes, searchQuery, selectedCourse]);

  const filteredBookmarks = useMemo(() => {
    return bookmarks.filter((b) => {
      const matchesSearch =
        b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.videoTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (b.note && b.note.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCourse = selectedCourse === 'all' || b.folderPath === selectedCourse;
      return matchesSearch && matchesCourse;
    });
  }, [bookmarks, searchQuery, selectedCourse]);

  // Export all notes as Markdown file
  const handleExportMarkdown = () => {
    let md = `# StudyVault 2.0 — Lecture Notes & Study Bookmarks\nGenerated: ${new Date().toLocaleString()}\n\n`;

    md += `## Notes (${notes.length})\n\n`;
    notes.forEach((n) => {
      md += `### ${n.videoTitle} [${formatTimestamp(n.time)}]\n`;
      md += `${n.content}\n\n`;
    });

    md += `## Bookmarks (${bookmarks.length})\n\n`;
    bookmarks.forEach((b) => {
      md += `* **[${formatTimestamp(b.time)}]** ${b.videoTitle} — *${b.title}* ${
        b.note ? `(${b.note})` : ''
      }\n`;
    });

    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `StudyVault_Notes_${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
    onShowToast('Exported notes as Markdown file');
  };

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-8 animate-fadeIn">
      {/* Header & Export Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-indigo-400 uppercase tracking-widest font-bold mb-1">
            <FileText size={14} />
            <span>Personal Knowledge Base</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-100 tracking-tight">
            Study Notes &amp; Timestamps
          </h1>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            Jump straight into any lecture moment linked directly with your notes and bookmarks.
          </p>
        </div>

        <button
          onClick={handleExportMarkdown}
          className="skeuo-btn flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-slate-200 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <Download size={14} className="text-indigo-400" />
          <span>Export Markdown (.md)</span>
        </button>
      </div>

      {/* Tabs + Search & Course Filters */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Tab switcher */}
        <div className="flex items-center gap-2 p-1 rounded-2xl bg-slate-900 border border-slate-800">
          <button
            onClick={() => setActiveTab('notes')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono transition-all ${
              activeTab === 'notes'
                ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileText size={14} />
            <span>Notes ({notes.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('bookmarks')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono transition-all ${
              activeTab === 'bookmarks'
                ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <BookmarkIcon size={14} />
            <span>Bookmarks ({bookmarks.length})</span>
          </button>
        </div>

        {/* Search & Course Selector */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter notes..."
              className="w-full bg-slate-900 border border-slate-800 text-xs text-slate-200 rounded-xl pl-9 pr-3 py-2 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="bg-slate-900 border border-slate-800 text-xs text-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Courses</option>
            {playlists.map((pl) => (
              <option key={pl.id} value={pl.path}>
                {pl.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Tab Content */}
      {activeTab === 'notes' && (
        <div className="space-y-4">
          {filteredNotes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredNotes.map((n) => (
                <div
                  key={n.id}
                  className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-3 flex flex-col justify-between hover:border-slate-700 transition-all group"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
                      <div className="flex items-center gap-2 min-w-0">
                        <button
                          onClick={() => onPlayVideoAtTime(n.videoId, n.time)}
                          className="px-2 py-0.5 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 font-mono text-[11px] font-bold hover:bg-indigo-600 hover:text-white transition-colors flex items-center gap-1 flex-shrink-0"
                          title="Jump to video timestamp"
                        >
                          <Clock size={11} />
                          <span>{formatTimestamp(n.time)}</span>
                        </button>
                        <span className="text-xs font-bold text-slate-200 truncate">
                          {n.videoTitle}
                        </span>
                      </div>

                      <button
                        onClick={() => onDeleteNote(n.id)}
                        className="p-1 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors flex-shrink-0"
                        title="Delete note"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    <div className="pt-3 text-xs md:text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">
                      {n.content}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-3 border-t border-slate-800/60">
                    <span>{new Date(n.updatedAt).toLocaleDateString()}</span>
                    <button
                      onClick={() => onPlayVideoAtTime(n.videoId, n.time)}
                      className="text-indigo-400 group-hover:text-indigo-300 flex items-center gap-1 font-bold"
                    >
                      <span>Open Video</span>
                      <ExternalLink size={11} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
              <FileText size={36} className="text-slate-600 mx-auto" />
              <h3 className="text-base font-bold text-slate-200">No Notes Saved Yet</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                While watching any lecture video, press <kbd className="px-1 py-0.5 bg-slate-800 border border-slate-700 rounded text-slate-300 font-mono">C</kbd> or click "Add Note" to attach timestamped notes.
              </p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'bookmarks' && (
        <div className="space-y-4">
          {filteredBookmarks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredBookmarks.map((b) => (
                <div
                  key={b.id}
                  className="p-4 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-3 flex flex-col justify-between hover:border-indigo-500/40 transition-all group"
                >
                  <div>
                    <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                      <button
                        onClick={() => onPlayVideoAtTime(b.videoId, b.time)}
                        className="px-2.5 py-0.5 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 font-mono text-xs font-bold hover:bg-indigo-600 hover:text-white transition-colors flex items-center gap-1"
                        title="Jump to video timestamp"
                      >
                        <Clock size={12} />
                        <span>{formatTimestamp(b.time)}</span>
                      </button>

                      <button
                        onClick={() => onDeleteBookmark(b.id)}
                        className="p-1 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors"
                        title="Delete bookmark"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>

                    <div className="pt-2">
                      <h4 className="font-bold text-xs md:text-sm text-slate-200">{b.title}</h4>
                      <p className="text-[11px] font-mono text-slate-400 mt-0.5 truncate">
                        {b.videoTitle}
                      </p>
                      {b.note && (
                        <p className="text-xs text-slate-400 mt-2 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                          {b.note}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-2 border-t border-slate-800/60">
                    <span>{new Date(b.createdAt).toLocaleDateString()}</span>
                    <button
                      onClick={() => onPlayVideoAtTime(b.videoId, b.time)}
                      className="text-indigo-400 flex items-center gap-1 font-bold"
                    >
                      <span>Play</span>
                      <ExternalLink size={10} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
              <BookmarkIcon size={36} className="text-slate-600 mx-auto" />
              <h3 className="text-base font-bold text-slate-200">No Bookmarks Saved</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Press <kbd className="px-1 py-0.5 bg-slate-800 border border-slate-700 rounded text-slate-300 font-mono">B</kbd> while watching any lecture to drop instant timestamp bookmarks.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

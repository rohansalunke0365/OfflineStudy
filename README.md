# 🎓 StudyVault 2.0 — AI-Powered Offline Study Library & Video Vault

**StudyVault** is a local-first, offline-capable study platform and video archive player designed for students, researchers, self-learners, and engineers. It transforms local video courses, downloaded lectures, and educational files into an interactive study workspace featuring Bento dashboards, timestamped note-taking, active recall flashcards, AI-generated quizzes, and Gemini-powered lecture tutoring.

---

## ⚡ Key Highlights

- 📁 **100% Offline Local Video Playback**: Direct access to `.mp4`, `.mkv`, `.webm`, `.mov`, `.avi`, `.m4v` files on your local drive using the native File System Access API. Zero cloud upload required.
- 🤖 **Gemini AI Study Suite**: Instant lecture summarization (Quick, Detailed, Exam Revision, 1-Minute), contextual AI tutoring, automated chapter breakdown, and AI flashcard generation.
- 🗂️ **Spaced Repetition Flashcard Decks**: 3D flip card viewer with difficulty ratings (Easy, Medium, Hard), mastery trackers, and custom deck builder.
- 📝 **Timestamped Notes & Bookmarks**: Drop bookmarks at exact seconds (<kbd>B</kbd>), take timestamped notes (<kbd>C</kbd>), and export notes directly to Markdown (`.md`).
- 📊 **Study Analytics Dashboard**: 7-day study telemetry, course completion percentages, quiz scores, and daily watch streaks.
- 🔁 **Smart Video Player**: A-B repeat looping, adjustable speed ($0.5\times$ to $3.0\times$), interactive click-to-seek transcripts, and picture-in-picture mode.
- 🌐 **Zero-Install Standalone Export**: 1-Click download of a single self-contained `StudyVault.html` file that runs in any browser completely offline with no Node.js required.
- 📡 **Local LAN Streaming**: Stream your local library across other laptops, tablets, or phones on the same Wi-Fi router with zero cellular data usage.

---

## 🚀 Quick Start Guide (Running on Your Local Machine)

### Prerequisites

- **Node.js**: v18.0.0 or higher ([Download Node.js](https://nodejs.org/))
- **Browser**: Google Chrome, Microsoft Edge, Brave, or any Chromium-based browser (for full File System Access API support).

---

### Step 1: Clone or Download the Project

If exported as a ZIP from AI Studio:
1. Extract the ZIP to a directory on your machine (e.g. `C:\StudyVault` or `~/StudyVault`).
2. Open your terminal or Command Prompt in that directory.

If cloning via Git:
```bash
git clone https://github.com/your-username/studyvault.git
cd studyvault
```

---

### Step 2: Install Dependencies

```bash
npm install
```

---

### Step 3: Configure Environment Variables (Optional)

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Add your Gemini API key (only required for live AI summarization, chat tutor, and AI quiz generation):
```env
GEMINI_API_KEY=your_actual_gemini_api_key_here
```

> 💡 *Note: You can get a free Gemini API key at [Google AI Studio](https://aistudio.google.com/app/apikey). If no key is provided, all offline video playback, note-taking, manual flashcards, and local analytics still function completely.*

---

### Step 4: Run the Development Server

```bash
npm run dev
```

Open your browser and navigate to:
```
http://localhost:3000
```

---

### Step 5: Build for Production / Standalone Hosting

To create an optimized production build:
```bash
npm run build
npm start
```

---

## 📦 Zero-Install Mode (1-File Standalone App)

If you or a peer do not have Node.js installed, you can use the standalone HTML single-file build:

1. In the top navigation bar of StudyVault, click the **LAN & Offline** icon.
2. Click **Download Standalone (1-File HTML)**.
3. Save the `StudyVault.html` file to your desktop or USB drive.
4. **Double-click `StudyVault.html` in Chrome or Edge**.
5. Click **"Map Local Folder"** to load your videos with 100% offline persistence in IndexedDB.

---

## 🎯 How to Use StudyVault

### 1. Mapping a Video Library
1. Click **"Map Local Folder"** in the top bar or sidebar.
2. Select the directory on your computer containing your course lectures or subfolders.
3. Grant read permissions when prompted by your browser.
4. StudyVault automatically scans and groups videos into structured playlists based on folder hierarchy.

### 2. Studying with the Video Player
- **Speed Tuning**: Use the speed selector to switch between $0.5\times$, $1.0\times$, $1.25\times$, $1.5\times$, $2.0\times$, $2.5\times$, or $3.0\times$.
- **A-B Looping**: Set point A and point B to continually loop a difficult section until mastered.
- **Notes & Bookmarks**: Press <kbd>C</kbd> while watching to pause and jot down a timestamped note, or press <kbd>B</kbd> to drop a quick bookmark.
- **AI Sidebar**: Toggle the **AI Tutor** drawer on the right side to ask questions about the current lecture, generate instant summaries, or extract key concepts.

### 3. Reviewing Flashcards
1. Navigate to **Flashcards** in the sidebar.
2. Click on any card to trigger a 3D flip revealing the answer.
3. Rate your recall as **Hard**, **Medium**, or **Easy** to calibrate your review schedule.
4. Use **AI Generate Deck** to instantly create 5 flashcards from the current lecture.

### 4. Taking Knowledge Check Quizzes
1. Navigate to **Quizzes** in the sidebar.
2. Generate an AI quiz from any loaded playlist or lecture.
3. Complete the questions and receive instant scoring, detailed explanations, and an exam completion certificate.

---

## ⌨️ Keyboard Shortcuts Reference

| Shortcut | Action |
| :--- | :--- |
| <kbd>Space</kbd> / <kbd>K</kbd> | Play / Pause video |
| <kbd>→</kbd> / <kbd>←</kbd> | Seek forward / backward by 5 seconds |
| <kbd>Shift</kbd> + <kbd>→</kbd> / <kbd>←</kbd> | Seek forward / backward by 10 seconds |
| <kbd>↑</kbd> / <kbd>↓</kbd> | Volume up / down (10% increments) |
| <kbd>M</kbd> | Mute / Unmute audio |
| <kbd>F</kbd> | Toggle Fullscreen |
| <kbd>B</kbd> | Quick Bookmark at current timestamp |
| <kbd>C</kbd> | Open Timestamped Note Composer |
| <kbd>N</kbd> | Next video in playlist |
| <kbd>P</kbd> | Previous video in playlist |
| <kbd>0</kbd> – <kbd>9</kbd> | Jump to 0% – 90% of the video duration |

---

## 📱 Local LAN Streaming Guide

You can stream videos hosted on your desktop PC directly to your iPad, Android tablet, phone, or laptop over your home Wi-Fi network:

1. Connect your PC and mobile device to the **same Wi-Fi network**.
2. Find your PC's local IP address:
   - **Windows**: Open Command Prompt and type `ipconfig` (look for `IPv4 Address`, e.g. `192.168.1.15`).
   - **macOS / Linux**: Open Terminal and type `ifconfig` or `ip a` (look for `inet 192.168.x.x`).
3. Start StudyVault on your PC:
   ```bash
   npm run dev
   ```
4. On your mobile device's browser, visit:
   ```
   http://YOUR_PC_IP:3000
   ```
   *(e.g., `http://192.168.1.15:3000`)*

---

## 🛠️ Tech Stack & Architecture

- **Frontend**: React 18, TypeScript, Tailwind CSS, Lucide React, Three.js (3D Vault Canvas).
- **Storage**: IndexedDB (Native browser database for offline progress, notes, flashcards, and settings).
- **File Access**: Chromium File System Access API (`showDirectoryPicker`, `FileSystemFileHandle`).
- **Backend API**: Express.js server on Node.js.
- **AI Model**: Google Gemini 2.5 Flash via `@google/genai` SDK.

---

## 📁 Project Structure

```
studyvault/
├── public/                  # Static assets & icons
├── src/
│   ├── components/          # React UI components
│   │   ├── PlayerView.tsx   # Video player & study drawer
│   │   ├── HomeView.tsx     # Bento library dashboard
│   │   ├── FlashcardsView.tsx # 3D active recall decks
│   │   ├── QuizView.tsx     # Interactive AI knowledge quizzes
│   │   ├── NotesView.tsx    # Timestamped notes & markdown export
│   │   ├── AnalyticsView.tsx # 7-day study telemetry & metrics
│   │   ├── TopBar.tsx       # Header search, folder map, LAN dialog
│   │   └── SideNav.tsx      # Sidebar navigation & course tree
│   ├── services/
│   │   └── db.ts            # IndexedDB persistence layer
│   ├── utils/
│   │   └── exportHtml.ts    # Single-file standalone HTML bundler
│   ├── types.ts             # TypeScript interfaces and definitions
│   ├── App.tsx              # Main application coordinator
│   └── main.tsx             # React DOM entry point
├── server.ts                # Express backend & Gemini API proxy
├── metadata.json            # Application metadata
├── package.json             # NPM dependencies and scripts
└── README.md                # This complete guide
```

---

## ❓ Troubleshooting & FAQs

#### Q: The folder picker doesn't open.
**A**: Ensure you are using a browser that supports the File System Access API (such as Google Chrome, Microsoft Edge, Opera, or Brave). Some mobile browsers and Firefox restrict directory picker APIs for security reasons.

#### Q: Do my videos get uploaded to the cloud?
**A**: **No.** Videos are read directly from your local hard drive into the browser's video element using object URLs or local file handles. No video data ever leaves your computer.

#### Q: Will my notes and progress be saved if I close the tab?
**A**: **Yes.** All watch progress, completed timestamps, flashcard ratings, quiz records, and notes are automatically saved to your browser's persistent IndexedDB storage. You can also export a full JSON backup anytime in **Settings**.

---

## 📄 License
MIT License. Built for focused, distraction-free studying.

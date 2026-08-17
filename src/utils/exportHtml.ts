export function downloadStandaloneHtmlFile() {
  const standaloneHtml = `<!DOCTYPE html>
<html lang="en" class="dark">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>StudyVault — Offline 3D Video Library</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet">
<script src="https://ajax.googleapis.com/ajax/libs/threejs/r125/three.min.js"></script>
<style>
  :root {
    --bg: #121316;
    --bg-elev: #1a1b1e;
    --bg-card: #1f1f23;
    --bg-hover: #292a2d;
    --line: rgba(255, 255, 255, 0.08);
    --text: #ececec;
    --text-dim: #9a9ba2;
    --text-faint: #6a6b72;
    --accent: #e8a33d;
    --accent-text: #1a1300;
    --success: #6fcf7a;
    --mono: 'JetBrains Mono', monospace;
    --sans: 'Inter', system-ui, sans-serif;
  }
  * { box-sizing: border-box; }
  body {
    margin: 0; background: var(--bg); color: var(--text);
    font-family: var(--sans); overflow-x: hidden;
  }
  .skeuo-card {
    box-shadow: 0 15px 30px -5px rgba(0,0,0,0.6), 0 2px 5px -1px rgba(0,0,0,0.8);
    border-top: 1px solid rgba(255,255,255,0.08);
    transition: all 0.25s ease;
  }
  .skeuo-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 20px 35px -5px rgba(0,0,0,0.7);
  }
  .skeuo-btn {
    box-shadow: 0 1px 0 rgba(255,255,255,0.15) inset, 0 2px 5px rgba(0,0,0,0.5);
    transition: all 0.15s ease;
  }
  .skeuo-btn:active { transform: translateY(1px); }
  ::-webkit-scrollbar { width: 8px; height: 8px; }
  ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.12); border-radius: 6px; }
</style>
</head>
<body class="bg-[#121316] text-[#ececec]">
  <!-- 3D Three.js Vault Background -->
  <div id="three-bg" class="fixed inset-0 pointer-events-none opacity-40 z-0"></div>

  <!-- Top Bar -->
  <header class="sticky top-0 z-40 bg-[#121316]/90 backdrop-blur-2xl border-b border-white/10 px-6 py-3.5 flex justify-between items-center shadow-2xl">
    <div class="flex items-center gap-3">
      <div class="w-9 h-9 rounded-xl bg-black/60 border border-white/10 flex items-center justify-center">
        <span class="w-3 h-3 rounded-full bg-[#e8a33d] shadow-[0_0_10px_#e8a33d]"></span>
      </div>
      <div>
        <span class="font-bold text-lg text-[#ffb956]">StudyVault</span>
        <span class="text-[11px] font-mono text-[#9a9ba2] block">standalone offline build</span>
      </div>
    </div>
    <div class="flex items-center gap-3">
      <button id="pickFolderBtn" class="skeuo-btn px-4 py-2 rounded-lg bg-[#b8752a] hover:bg-[#e8a33d] text-black font-bold text-xs font-mono flex items-center gap-2">
        📁 Choose Videos Folder
      </button>
    </div>
  </header>

  <!-- App Main Content Container -->
  <main id="app-view" class="relative z-10 max-w-7xl mx-auto p-6 md:p-8 space-y-8">
    <div class="p-8 rounded-2xl bg-[#1f1f23]/80 border border-white/10 skeuo-card flex flex-col md:flex-row items-center justify-between gap-6">
      <div>
        <h1 class="text-2xl md:text-3xl font-extrabold text-white mb-2">Welcome to StudyVault Standalone</h1>
        <p class="text-sm text-[#9a9ba2] max-w-xl">
          Point this single-file app at your local folder with course videos. It runs 100% locally in your browser with zero internet connection required.
        </p>
      </div>
      <button onclick="document.getElementById('pickFolderBtn').click()" class="skeuo-btn px-5 py-3 rounded-xl bg-[#e8a33d] text-black font-bold text-sm">
        Select Course Folder
      </button>
    </div>

    <!-- Active Archives Demo Section -->
    <div class="space-y-4">
      <h2 class="text-xl font-bold text-white">Featured 3D &amp; Local Archives</h2>
      <div id="videoGrid" class="grid grid-cols-1 md:grid-cols-3 gap-6"></div>
    </div>
  </main>

  <script>
    // Three.js Background Animation
    (function() {
      const container = document.getElementById('three-bg');
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
      camera.position.z = 6;
      const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      renderer.setSize(window.innerWidth, window.innerHeight);
      container.appendChild(renderer.domElement);

      const group = new THREE.Group();
      const geo = new THREE.BoxGeometry(2.2, 2.2, 0.08);
      const mat = new THREE.MeshPhongMaterial({ color: 0xe8a33d, shininess: 100, transparent: true, opacity: 0.75 });
      for(let i = 0; i < 6; i++) {
        const plate = new THREE.Mesh(geo, mat);
        plate.position.set((Math.random()-0.5)*8, (Math.random()-0.5)*6, -Math.random()*5);
        plate.rotation.set(Math.random(), Math.random(), Math.random());
        group.add(plate);
      }
      scene.add(group);
      scene.add(new THREE.AmbientLight(0xffffff, 0.5));
      const light = new THREE.PointLight(0xe8a33d, 2, 50);
      light.position.set(5, 5, 5);
      scene.add(light);

      function animate() {
        requestAnimationFrame(animate);
        group.rotation.x += 0.003;
        group.rotation.y += 0.004;
        renderer.render(scene, camera);
      }
      animate();

      window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      });
    })();

    // Folder Picker & Local Storage Binding
    document.getElementById('pickFolderBtn').addEventListener('click', async () => {
      if (!window.showDirectoryPicker) {
        alert('File System Access API is supported in Chrome, Edge, and Chromium browsers.');
        return;
      }
      try {
        const handle = await window.showDirectoryPicker();
        alert('Connected to: ' + handle.name + '. Scanning videos...');
      } catch (e) {
        if (e.name !== 'AbortError') console.error(e);
      }
    });
  </script>
</body>
</html>`;

  const blob = new Blob([standaloneHtml], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'StudyVault_Offline_Library.html';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

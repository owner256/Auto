// player.js — Complete ZCLE Studio UI & Audio Clock Controller
document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('webgl-canvas');
  const renderer = new window.CinematicRenderer(canvas);
  const director = new window.CPUSceneDirector(renderer);

  // 1. Load Dynamic Course Data (13 Scenes from course-data.js)
  const course = window.ZCLE_COURSE || {};
  let scenes = [];

  if (course.scenes && course.scenes.length > 0) {
    scenes = course.scenes.map((s, idx) => ({
      id: `SCENE ${String(idx + 1).padStart(2, '0')}`,
      order: s.order || idx + 1,
      start: (s.startMs || 0) / 1000,
      end: (s.endMs || 0) / 1000,
      duration: (s.durationMs || 0) / 1000,
      title: s.title || `Scene ${idx + 1}`,
      headline: s.headline || '',
      kicker: s.kicker || '',
      labels: s.labels || [],
      text: (s.narration && s.narration.text) ? s.narration.text : '',
      visualTemplate: s.visualTemplate || 'hero',
      mode: s.mode || '2D',
      cues: s.cues || []
    }));
  } else {
    scenes = [
      { id: 'SCENE 01', order: 1, start: 0, end: 23.56, duration: 23.56, title: 'What is CPU?', headline: 'The Silicon Heart', text: 'Processor ke andar billions of microscopic switches har ek calculation ko ekdum perfect timing ke saath poora karte hain.', visualTemplate: 'hero' }
    ];
  }

  let totalDuration = course.durationMs ? (course.durationMs / 1000) : (scenes[scenes.length - 1].end || 307.425);

  // DOM Elements - Studio UI Controls
  const btnModeStudio = document.getElementById('btn-mode-studio');
  const btnModeCinema = document.getElementById('btn-mode-cinema');
  const scenesList = document.getElementById('scenes-list');
  const sceneCounter = document.getElementById('scene-counter');
  const editTitle = document.getElementById('edit-scene-title');
  const editHeadline = document.getElementById('edit-scene-headline');
  const editNarration = document.getElementById('edit-scene-narration');
  const editModeBadge = document.getElementById('active-scene-mode-badge');
  const editCues = document.getElementById('edit-scene-cues');
  const btnApplyScene = document.getElementById('btn-apply-scene');

  // DOM Elements - Viewport & Playback Controls
  const playBtn = document.getElementById('play-pause-btn');
  const playIcon = document.getElementById('play-icon');
  const prevBtn = document.getElementById('prev-scene-btn');
  const nextBtn = document.getElementById('next-scene-btn');
  const muteBtn = document.getElementById('mute-btn');
  const fullscreenBtn = document.getElementById('fullscreen-btn');
  const scrubber = document.getElementById('timeline-scrubber');
  const progressFill = document.getElementById('timeline-progress');
  const timeDisplay = document.getElementById('time-display');
  const sceneBadge = document.getElementById('scene-badge');
  const sceneTitle = document.getElementById('scene-title');
  const sceneSubtitle = document.getElementById('scene-subtitle');
  const scenePills = document.getElementById('scene-pills');
  const voiceSelect = document.getElementById('voice-select');
  const downloadBtn = document.getElementById('download-mp4-btn');
  const downloadBtnText = document.getElementById('download-btn-text');
  const audioEl = document.getElementById('narration-audio');

  let isPlaying = false;
  let isMuted = false;
  let currentTime = 0;
  let activeSceneIdx = -1;
  let inspectedSceneIdx = 0;
  let lastFrameTime = performance.now();
  let selectedVoice = null;
  let useExternalMp3 = true;

  // Master Audio Track sync
  audioEl.src = '../assets/audio/cpu-narration-preview.mp3?v=' + Date.now();

  function enableMp3Track() {
    if (audioEl.duration && audioEl.duration > 10) {
      useExternalMp3 = true;
      totalDuration = audioEl.duration;
      updateTimelineHUD();
    }
  }

  audioEl.addEventListener('loadedmetadata', enableMp3Track);
  audioEl.addEventListener('canplay', enableMp3Track);
  if (audioEl.readyState >= 1) enableMp3Track();

  // Mode Toggle (Studio Editor vs Cinema Player)
  if (btnModeStudio && btnModeCinema) {
    btnModeStudio.onclick = () => {
      document.body.classList.remove('mode-cinema');
      document.body.classList.add('mode-studio');
      btnModeStudio.classList.add('active');
      btnModeCinema.classList.remove('active');
      setTimeout(() => renderer.setupResizeObserver(), 320);
    };

    btnModeCinema.onclick = () => {
      document.body.classList.remove('mode-studio');
      document.body.classList.add('mode-cinema');
      btnModeCinema.classList.add('active');
      btnModeStudio.classList.remove('active');
      setTimeout(() => renderer.setupResizeObserver(), 320);
    };
  }

  // Populate Sidebar Scene Timeline Cards
  function renderSidebarScenes() {
    if (!scenesList) return;
    scenesList.innerHTML = '';
    sceneCounter.textContent = `${scenes.length} SCENES`;

    scenes.forEach((s, idx) => {
      const card = document.createElement('div');
      card.className = `scene-card ${idx === activeSceneIdx ? 'active' : ''}`;
      card.id = `sidebar-scene-${idx}`;

      card.innerHTML = `
        <div class="card-left">
          <div class="card-num-row">
            <span class="card-num">${String(idx + 1).padStart(2, '0')}</span>
            <span class="card-title">${s.title}</span>
          </div>
          <span class="card-template-tag">${s.mode} • ${s.visualTemplate}</span>
        </div>
        <span class="card-duration">${formatTime(s.start)} - ${formatTime(s.end)}</span>
      `;

      card.onclick = () => {
        seekTo(s.start + 0.05);
        populateInspector(idx);
      };

      scenesList.appendChild(card);
    });
  }

  // Populate Inspector Form
  function populateInspector(idx) {
    inspectedSceneIdx = idx;
    const sc = scenes[idx];
    if (!sc) return;

    if (editTitle) editTitle.value = sc.title || '';
    if (editHeadline) editHeadline.value = sc.headline || '';
    if (editNarration) editNarration.value = sc.text || '';
    if (editModeBadge) editModeBadge.textContent = `${sc.mode} / ${sc.visualTemplate}`;

    if (editCues) {
      editCues.innerHTML = '';
      (sc.labels || []).forEach(lbl => {
        const tag = document.createElement('span');
        tag.className = 'cue-pill';
        tag.textContent = lbl;
        editCues.appendChild(tag);
      });
    }
  }

  // Apply Changes from Inspector Form
  if (btnApplyScene) {
    btnApplyScene.onclick = () => {
      const sc = scenes[inspectedSceneIdx];
      if (!sc) return;

      sc.title = editTitle.value.trim();
      sc.headline = editHeadline.value.trim();
      sc.text = editNarration.value.trim();

      renderSidebarScenes();
      syncSceneUI(currentTime);
      btnApplyScene.textContent = '✓ Saved & Applied!';
      setTimeout(() => btnApplyScene.textContent = '✓ Update Scene Live', 1500);
    };
  }

  // Build Bottom HUD Scene Pills
  function renderHUDScenePills() {
    scenePills.innerHTML = '';
    scenes.forEach((s, idx) => {
      const btn = document.createElement('button');
      btn.className = 'scene-dot';
      btn.textContent = `S${String(idx + 1).padStart(2, '0')}`;
      btn.title = `${s.id}: ${s.title}`;
      btn.onclick = () => {
        seekTo(s.start + 0.05);
        populateInspector(idx);
      };
      scenePills.appendChild(btn);
    });
  }

  function formatTime(sec) {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = Math.floor(sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

  // Synchronize Scene UI & Active Visual Director Template
  function syncSceneUI(time) {
    const idx = scenes.findIndex((s, i) => {
      const nextStart = scenes[i + 1] ? scenes[i + 1].start : totalDuration + 1;
      return time >= s.start && time < nextStart;
    });

    const validIdx = idx === -1 ? scenes.length - 1 : idx;
    if (validIdx !== activeSceneIdx) {
      activeSceneIdx = validIdx;
      const sc = scenes[activeSceneIdx];

      sceneBadge.textContent = sc.id;
      sceneTitle.textContent = `${sc.title} — ${sc.headline || ''}`;
      sceneSubtitle.textContent = sc.text;

      director.setSceneData(sc);
      populateInspector(activeSceneIdx);

      // Highlight active card in sidebar
      document.querySelectorAll('.scene-card').forEach((el, i) => {
        el.classList.toggle('active', i === activeSceneIdx);
      });

      // Auto-scroll sidebar to keep active scene visible
      const activeCard = document.getElementById(`sidebar-scene-${activeSceneIdx}`);
      if (activeCard && scenesList) {
        scenesList.scrollTop = activeCard.offsetTop - scenesList.offsetTop - 40;
      }

      // Highlight active pill on HUD
      document.querySelectorAll('.scene-dot').forEach((el, i) => {
        el.classList.toggle('active', i === activeSceneIdx);
      });

      if (isPlaying && !useExternalMp3) speakScene(sc.text);
    }
  }

  function seekTo(newTime) {
    currentTime = Math.max(0, Math.min(totalDuration, newTime));
    if (useExternalMp3 && audioEl.readyState >= 1) {
      audioEl.currentTime = Math.min(audioEl.duration - 0.1, currentTime);
    }
    activeSceneIdx = -1;
    syncSceneUI(currentTime);
    updateTimelineHUD();
  }

  function updateTimelineHUD() {
    const pct = totalDuration > 0 ? (currentTime / totalDuration) * 100 : 0;
    scrubber.value = pct;
    progressFill.style.width = `${pct}%`;
    timeDisplay.textContent = `${formatTime(currentTime)} / ${formatTime(totalDuration)}`;
  }

  function togglePlay() {
    isPlaying = !isPlaying;
    playIcon.textContent = isPlaying ? '⏸' : '▶';

    if (isPlaying) {
      if (currentTime >= totalDuration - 0.5) seekTo(0);
      if (useExternalMp3) {
        audioEl.currentTime = currentTime;
        audioEl.play().catch(() => {});
      } else if (activeSceneIdx >= 0) {
        speakScene(scenes[activeSceneIdx].text);
      }
    } else {
      audioEl.pause();
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    }
  }

  playBtn.onclick = togglePlay;
  prevBtn.onclick = () => seekTo(scenes[Math.max(0, activeSceneIdx - 1)].start);
  nextBtn.onclick = () => seekTo(scenes[Math.min(scenes.length - 1, activeSceneIdx + 1)].start);

  scrubber.oninput = (e) => {
    const targetSec = (parseFloat(e.target.value) / 100) * totalDuration;
    seekTo(targetSec);
  };

  muteBtn.onclick = () => {
    isMuted = !isMuted;
    audioEl.muted = isMuted;
    muteBtn.textContent = isMuted ? '🔇' : '🔊';
    if (isMuted && 'speechSynthesis' in window) window.speechSynthesis.cancel();
  };

  fullscreenBtn.onclick = () => {
    const stage = document.getElementById('video-stage');
    if (!document.fullscreenElement) {
      stage.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  // Natural Indian Voice Selector (SpeechSynthesis Fallback)
  function loadNaturalVoices() {
    if (!('speechSynthesis' in window)) return;
    const voices = window.speechSynthesis.getVoices();
    if (!voices.length) return;

    const scored = voices
      .filter(v => v.lang.includes('IN') || v.lang.startsWith('hi') || v.lang.startsWith('en'))
      .map(v => {
        let score = 0;
        const name = v.name.toLowerCase();
        const lang = v.lang.toLowerCase();
        if (lang.includes('hi-in') || lang.includes('en-in')) score += 60;
        if (name.includes('madhur') || name.includes('swara') || name.includes('prabhat') || name.includes('neerja')) score += 50;
        if (name.includes('natural') || name.includes('online') || name.includes('google')) score += 35;
        return { voice: v, score };
      })
      .sort((a, b) => b.score - a.score);

    voiceSelect.innerHTML = '<option value="mp3">🎙️ Studio Master Audio (Default)</option>';
    scored.forEach(({ voice }, idx) => {
      const opt = document.createElement('option');
      opt.value = idx;
      opt.textContent = `${voice.name} (${voice.lang})`;
      voiceSelect.appendChild(opt);
    });

    if (scored.length > 0) selectedVoice = scored[0].voice;

    voiceSelect.onchange = () => {
      const val = voiceSelect.value;
      if (val === 'mp3') {
        useExternalMp3 = true;
        if ('speechSynthesis' in window) window.speechSynthesis.cancel();
        if (isPlaying) {
          audioEl.currentTime = currentTime;
          audioEl.play().catch(() => {});
        }
      } else {
        useExternalMp3 = false;
        audioEl.pause();
        selectedVoice = scored[Number(val)].voice;
        if (isPlaying && activeSceneIdx >= 0) speakScene(scenes[activeSceneIdx].text);
      }
    };
  }

  if ('speechSynthesis' in window) {
    loadNaturalVoices();
    window.speechSynthesis.onvoiceschanged = loadNaturalVoices;
  }

  function speakScene(text) {
    if (isMuted || useExternalMp3) return;
    if (!('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    if (selectedVoice) utter.voice = selectedVoice;
    utter.rate = 1.0;
    utter.pitch = 1.0;
    window.speechSynthesis.speak(utter);
  }

  // Keyboard Shortcuts
  window.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return;
    if (e.code === 'Space') {
      e.preventDefault();
      togglePlay();
    } else if (e.code === 'ArrowRight') {
      seekTo(currentTime + 5);
    } else if (e.code === 'ArrowLeft') {
      seekTo(currentTime - 5);
    } else if (e.key === 'f' || e.key === 'F') {
      fullscreenBtn.click();
    } else if (e.key === 'm' || e.key === 'M') {
      muteBtn.click();
    }
  });

  // Video Export Recorder via Web Audio API + Canvas Stream
  let mediaRecorder = null;
  let recordedChunks = [];
  let audioContext = null;
  let audioSourceNode = null;
  let audioDestNode = null;

  downloadBtn.onclick = async () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
      return;
    }

    recordedChunks = [];
    const canvasStream = canvas.captureStream(60);

    try {
      if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        audioSourceNode = audioContext.createMediaElementSource(audioEl);
        audioDestNode = audioContext.createMediaStreamDestination();
        audioSourceNode.connect(audioContext.destination);
        audioSourceNode.connect(audioDestNode);
      }
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }
      const audioTracks = audioDestNode.stream.getAudioTracks();
      if (audioTracks.length > 0) audioTracks.forEach(tr => canvasStream.addTrack(tr));
    } catch (_) {}

    const mimeTypes = [
      { mime: 'video/mp4;codecs=avc1.42E01E,mp4a.40.2', ext: 'mp4' },
      { mime: 'video/mp4', ext: 'mp4' },
      { mime: 'video/webm;codecs=vp9,opus', ext: 'webm' },
      { mime: 'video/webm', ext: 'webm' }
    ];

    const match = mimeTypes.find(t => MediaRecorder.isTypeSupported(t.mime)) || { mime: '', ext: 'webm' };
    const chosenMime = match.mime;
    const fileExt = match.ext;

    mediaRecorder = new MediaRecorder(canvasStream, chosenMime ? { mimeType: chosenMime, videoBitsPerSecond: 8000000 } : {});

    mediaRecorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) recordedChunks.push(e.data);
    };

    mediaRecorder.onstop = () => {
      downloadBtn.classList.remove('recording');
      downloadBtnText.textContent = 'Export Video';
      const blob = new Blob(recordedChunks, { type: chosenMime || 'video/webm' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ZCLE_CPU_What_is_CPU_1080p.${fileExt}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    };

    seekTo(0);
    if (!isPlaying) togglePlay();
    mediaRecorder.start(250);
    downloadBtn.classList.add('recording');
    downloadBtnText.textContent = '⏹ Stop & Save';
  };

  // Main 60FPS Render Loop
  function animate(now) {
    requestAnimationFrame(animate);
    const dt = Math.min((now - lastFrameTime) / 1000, 0.1);
    lastFrameTime = now;

    if (isPlaying) {
      if (useExternalMp3 && !audioEl.paused) {
        currentTime = audioEl.currentTime;
      } else {
        currentTime += dt;
      }

      if (currentTime >= totalDuration) {
        currentTime = totalDuration;
        isPlaying = false;
        playIcon.textContent = '▶';
        audioEl.pause();
        if (mediaRecorder && mediaRecorder.state === 'recording') {
          mediaRecorder.stop();
        }
      }
      syncSceneUI(currentTime);
      updateTimelineHUD();
    }

    const sc = scenes[Math.max(0, activeSceneIdx)] || scenes[0];
    const sceneProgress = Math.max(0, Math.min(1, (currentTime - sc.start) / Math.max(0.1, sc.duration)));
    director.render(dt, now / 1000, Math.max(0, activeSceneIdx), sceneProgress);
  }

  // Initial Boot
  renderSidebarScenes();
  renderHUDScenePills();
  syncSceneUI(0);
  populateInspector(0);
  updateTimelineHUD();
  requestAnimationFrame(animate);
});

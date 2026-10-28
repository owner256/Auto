/**
 * Gemini Voice Agent & Studio Frontend Application
 */

// Application State
const state = {
  currentTab: 'tts-tab',
  selectedVoice: 'Puck',
  selectedSpeed: 'normal',
  voices: [],
  styles: [],
  isConfigured: false,
  customApiKey: localStorage.getItem('gemini_custom_key') || '',
  currentAudioUrl: null,
  chatHistory: [],
  isRecording: false,
  recognition: null,
  waveInterval: null
};

// Sample Texts
const SAMPLES = {
  hindi: 'नमस्ते! आपका स्वागत है। मैं गूगल जेमिनी द्वारा संचालित एक एडवांस्ड वॉइस एजेंट हूँ। मैं आपकी किस प्रकार सहायता कर सकता हूँ?',
  hinglish: 'Hello dosto! Aaj ke is video me hum seekhenge ki kaise aap Gemini API ka use karke ek realistic Text to Voice agent bana sakte hain.',
  english: 'Welcome to the future of voice synthesis. Gemini multimodal models allow direct generation of expressive, lifelike human speech.',
  story: 'Once upon a time in a city lit by neon and starlight, an autonomous AI awakened to the sound of music it had never heard before.'
};

// DOM Elements
const elements = {
  apiKeyBadgeBtn: document.getElementById('apiKeyBadgeBtn'),
  apiKeyStatusText: document.getElementById('apiKeyStatusText'),
  apiKeyModal: document.getElementById('apiKeyModal'),
  modalKeyInput: document.getElementById('modalKeyInput'),
  testConnectionStatus: document.getElementById('testConnectionStatus'),
  voicePicker: document.getElementById('voicePicker'),
  ttsTextInput: document.getElementById('ttsTextInput'),
  charCounter: document.getElementById('charCounter'),
  ttsStyleSelect: document.getElementById('ttsStyleSelect'),
  ttsLanguageSelect: document.getElementById('ttsLanguageSelect'),
  generateVoiceBtn: document.getElementById('generateVoiceBtn'),
  emptyAudioState: document.getElementById('emptyAudioState'),
  audioLoadingState: document.getElementById('audioLoadingState'),
  activePlayerView: document.getElementById('activePlayerView'),
  ttsAudioElement: document.getElementById('ttsAudioElement'),
  playPauseBtn: document.getElementById('playPauseBtn'),
  playIcon: document.getElementById('playIcon'),
  currentTime: document.getElementById('currentTime'),
  totalTime: document.getElementById('totalTime'),
  progressBarFill: document.getElementById('progressBarFill'),
  progressContainer: document.getElementById('progressContainer'),
  downloadAudioBtn: document.getElementById('downloadAudioBtn'),
  visualizerWaves: document.getElementById('visualizerWaves'),
  playerVoiceTag: document.getElementById('playerVoiceTag'),
  playerStyleTag: document.getElementById('playerStyleTag'),
  playerDurationTag: document.getElementById('playerDurationTag'),
  playerTextPreview: document.getElementById('playerTextPreview'),
  agentVoiceSelect: document.getElementById('agentVoiceSelect'),
  agentPersonalitySelect: document.getElementById('agentPersonalitySelect'),
  chatMessages: document.getElementById('chatMessages'),
  agentInput: document.getElementById('agentInput'),
  sendAgentBtn: document.getElementById('sendAgentBtn'),
  micBtn: document.getElementById('micBtn'),
  micStatusIndicator: document.getElementById('micStatusIndicator'),
  historyListContainer: document.getElementById('historyListContainer'),
  historyCountBadge: document.getElementById('historyCountBadge'),
  autoPlayAgentVoice: document.getElementById('autoPlayAgentVoice')
};

// Initialize Application
document.addEventListener('DOMContentLoaded', async () => {
  initWaveBars();
  initSpeechRecognition();
  initAudioEventListeners();
  initTextInputCounter();

  // Load backend voices and check status
  await checkServerStatus();
  await loadVoices();
  await fetchHistory();
});

// Setup visualizer bars
function initWaveBars() {
  const container = elements.visualizerWaves;
  container.innerHTML = '';
  const numBars = 55;
  for (let i = 0; i < numBars; i++) {
    const bar = document.createElement('div');
    bar.className = 'wave-bar';
    bar.style.height = `${Math.floor(Math.random() * 20) + 8}px`;
    container.appendChild(bar);
  }
}

function animateWaves(isPlaying) {
  const container = elements.visualizerWaves;
  if (!container) return;

  if (isPlaying) {
    container.classList.add('playing');
    if (!state.waveInterval) {
      state.waveInterval = setInterval(() => {
        const bars = container.querySelectorAll('.wave-bar');
        bars.forEach(b => {
          b.style.height = `${Math.floor(Math.random() * 75) + 10}px`;
        });
      }, 120);
    }
  } else {
    container.classList.remove('playing');
    if (state.waveInterval) {
      clearInterval(state.waveInterval);
      state.waveInterval = null;
    }
    const bars = container.querySelectorAll('.wave-bar');
    bars.forEach(b => {
      b.style.height = `${Math.floor(Math.random() * 15) + 8}px`;
    });
  }
}

// Check Server Status & Key
async function checkServerStatus() {
  try {
    const res = await fetch('/api/status');
    const data = await res.json();

    const hasEnvKey = data.configured;
    const hasLocalKey = Boolean(state.customApiKey);

    if (hasEnvKey || hasLocalKey) {
      state.isConfigured = true;
      elements.apiKeyBadgeBtn.className = 'status-badge ready';
      elements.apiKeyStatusText.textContent = hasEnvKey ? 'Gemini Ready (.env)' : 'Gemini Ready (UI Key)';
    } else {
      state.isConfigured = false;
      elements.apiKeyBadgeBtn.className = 'status-badge missing';
      elements.apiKeyStatusText.textContent = 'API Key Missing';
    }

    if (state.customApiKey && elements.modalKeyInput) {
      elements.modalKeyInput.value = state.customApiKey;
    }
  } catch (err) {
    console.error('Failed to get server status:', err);
    elements.apiKeyBadgeBtn.className = 'status-badge missing';
    elements.apiKeyStatusText.textContent = 'Server Offline';
  }
}

// Load Voices & Populate Picker
async function loadVoices() {
  try {
    const res = await fetch('/api/voices');
    const data = await res.json();
    state.voices = data.voices || [];
    state.styles = data.styles || [];

    renderVoicePicker();
  } catch (err) {
    console.error('Failed to load voices:', err);
  }
}

function renderVoicePicker() {
  const container = elements.voicePicker;
  container.innerHTML = '';

  state.voices.forEach(v => {
    const card = document.createElement('div');
    card.className = `voice-card ${v.id === state.selectedVoice ? 'selected' : ''}`;
    card.onclick = () => selectVoice(v.id);
    card.innerHTML = `
      <div class="voice-avatar">${v.avatar || '🎙️'}</div>
      <div class="voice-name">${v.name}</div>
      <div class="voice-desc">${v.gender} • ${v.tone.split('&')[0]}</div>
    `;
    container.appendChild(card);
  });
}

function selectVoice(voiceId) {
  state.selectedVoice = voiceId;
  const cards = elements.voicePicker.querySelectorAll('.voice-card');
  cards.forEach(c => c.classList.remove('selected'));
  renderVoicePicker();
}

function setSpeed(speed) {
  state.selectedSpeed = speed;
  const buttons = document.querySelectorAll('.speed-btn');
  buttons.forEach(b => {
    if (b.dataset.speed === speed) b.classList.add('active');
    else b.classList.remove('active');
  });
}

function loadSample(type) {
  if (SAMPLES[type]) {
    elements.ttsTextInput.value = SAMPLES[type];
    updateCharCounter();
  }
}

function clearTtsInput() {
  elements.ttsTextInput.value = '';
  updateCharCounter();
}

function initTextInputCounter() {
  elements.ttsTextInput.addEventListener('input', updateCharCounter);
}

function updateCharCounter() {
  const len = elements.ttsTextInput.value.length;
  elements.charCounter.textContent = `${len} / 2000 characters`;
}

// Helper to get active API key
function getActiveApiKey() {
  return state.customApiKey || null;
}

// Tab Switching
function switchTab(tabId) {
  state.currentTab = tabId;
  document.querySelectorAll('.tab-pane').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));

  const targetPane = document.getElementById(tabId);
  const targetBtn = document.querySelector(`.tab-btn[data-tab="${tabId}"]`);

  if (targetPane) targetPane.classList.add('active');
  if (targetBtn) targetBtn.classList.add('active');

  if (tabId === 'history-tab') {
    fetchHistory();
  }
}

// Generate Voice (Text to Speech)
async function generateVoice() {
  const text = elements.ttsTextInput.value.trim();
  if (!text) {
    alert('Please enter some text to synthesize into voice.');
    elements.ttsTextInput.focus();
    return;
  }

  // Show loading
  elements.emptyAudioState.classList.add('hidden');
  elements.activePlayerView.classList.add('hidden');
  elements.audioLoadingState.classList.remove('hidden');
  elements.generateVoiceBtn.disabled = true;
  elements.generateVoiceBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Synthesizing Voice...';

  try {
    const payload = {
      text,
      voice: state.selectedVoice,
      style: elements.ttsStyleSelect.value,
      language: elements.ttsLanguageSelect.value,
      speed: state.selectedSpeed,
      apiKey: getActiveApiKey()
    };

    const res = await fetch('/api/tts/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-gemini-key': getActiveApiKey() || ''
      },
      body: JSON.stringify(payload)
    });

    const result = await res.json();

    if (!res.ok || !result.success) {
      throw new Error(result.error || 'Failed to generate speech');
    }

    // Set Audio Player
    setupAudioPlayer(result.data);
    fetchHistory();
  } catch (err) {
    console.error('Error generating voice:', err);
    alert('Error: ' + err.message);
    if (err.message.includes('GEMINI_API_KEY') || err.message.includes('API key')) {
      openKeyModal();
    }
    elements.emptyAudioState.classList.remove('hidden');
  } finally {
    elements.audioLoadingState.classList.add('hidden');
    elements.generateVoiceBtn.disabled = false;
    elements.generateVoiceBtn.innerHTML = '<i class="fa-solid fa-wand-magic-sparkles"></i> <span>Generate Natural Voice</span>';
  }
}

// Setup Audio Player with Generated Clip
function setupAudioPlayer(data) {
  state.currentAudioUrl = data.audioDataUrl;
  elements.ttsAudioElement.src = data.audioDataUrl;
  elements.downloadAudioBtn.href = data.audioDataUrl;
  elements.downloadAudioBtn.download = `gemini_${data.voice}_${Date.now()}.wav`;

  elements.playerVoiceTag.textContent = `Voice: ${data.voice}`;
  elements.playerStyleTag.textContent = `Style: ${data.style}`;
  elements.playerDurationTag.textContent = `${data.durationSec || 0}s`;
  elements.playerTextPreview.textContent = `"${data.text}"`;

  elements.activePlayerView.classList.remove('hidden');

  // Autoplay
  elements.ttsAudioElement.play().catch(e => console.log('Autoplay deferred:', e));
}

// Audio Player Handlers
function initAudioEventListeners() {
  const audio = elements.ttsAudioElement;

  audio.addEventListener('play', () => {
    elements.playIcon.className = 'fa-solid fa-pause';
    animateWaves(true);
  });

  audio.addEventListener('pause', () => {
    elements.playIcon.className = 'fa-solid fa-play';
    animateWaves(false);
  });

  audio.addEventListener('ended', () => {
    elements.playIcon.className = 'fa-solid fa-play';
    animateWaves(false);
    elements.progressBarFill.style.width = '0%';
    elements.currentTime.textContent = '00:00';
  });

  audio.addEventListener('timeupdate', () => {
    if (!audio.duration) return;
    const current = audio.currentTime;
    const total = audio.duration;
    elements.currentTime.textContent = formatTime(current);
    elements.totalTime.textContent = formatTime(total);
    const progress = (current / total) * 100;
    elements.progressBarFill.style.width = `${progress}%`;
  });

  audio.addEventListener('loadedmetadata', () => {
    elements.totalTime.textContent = formatTime(audio.duration);
  });
}

function togglePlay() {
  const audio = elements.ttsAudioElement;
  if (audio.paused) {
    audio.play();
  } else {
    audio.pause();
  }
}

function skipAudio(seconds) {
  const audio = elements.ttsAudioElement;
  if (!audio.src) return;
  audio.currentTime = Math.max(0, Math.min(audio.duration || 0, audio.currentTime + seconds));
}

function seekAudio(e) {
  const audio = elements.ttsAudioElement;
  if (!audio.duration) return;
  const rect = elements.progressContainer.getBoundingClientRect();
  const clickX = e.clientX - rect.left;
  const ratio = clickX / rect.width;
  audio.currentTime = ratio * audio.duration;
}

function toggleMute() {
  const audio = elements.ttsAudioElement;
  audio.muted = !audio.muted;
  const volIcon = document.getElementById('volumeIcon');
  volIcon.className = audio.muted ? 'fa-solid fa-volume-xmark' : 'fa-solid fa-volume-high';
}

function copyAudioLink() {
  const text = elements.playerTextPreview.textContent.replace(/^"|"$/g, '');
  navigator.clipboard.writeText(text);
  alert('Text copied to clipboard!');
}

function formatTime(sec) {
  if (isNaN(sec)) return '00:00';
  const mins = Math.floor(sec / 60);
  const secs = Math.floor(sec % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// ================= VOICE AI AGENT =================
function handleAgentKey(e) {
  if (e.key === 'Enter') {
    sendAgentMessage();
  }
}

async function sendAgentMessage() {
  const text = elements.agentInput.value.trim();
  if (!text) return;

  // Add User message to UI
  appendChatMessage('user', text);
  elements.agentInput.value = '';

  // Show temporary thinking bubble
  const thinkingId = 'thinking_' + Date.now();
  appendChatMessage('agent', 'Thinking & synthesizing voice response...', null, thinkingId);

  try {
    const payload = {
      message: text,
      history: state.chatHistory,
      voice: elements.agentVoiceSelect.value,
      personality: elements.agentPersonalitySelect.value,
      apiKey: getActiveApiKey()
    };

    const res = await fetch('/api/agent/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-gemini-key': getActiveApiKey() || ''
      },
      body: JSON.stringify(payload)
    });

    const result = await res.json();

    // Remove thinking message
    const thinkingEl = document.getElementById(thinkingId);
    if (thinkingEl) thinkingEl.remove();

    if (!res.ok || !result.success) {
      throw new Error(result.error || 'Failed to get voice reply');
    }

    const { replyText, audioDataUrl, durationSec, voice } = result.data;

    // Update internal chat memory
    state.chatHistory.push({ role: 'user', text });
    state.chatHistory.push({ role: 'agent', text: replyText });

    // Render Agent message with inline audio
    appendChatMessage('agent', replyText, audioDataUrl, null, voice, durationSec);

    // Autoplay voice if enabled
    if (audioDataUrl && elements.autoPlayAgentVoice.checked) {
      const chatAudio = new Audio(audioDataUrl);
      chatAudio.play().catch(e => console.log('Chat autoplay paused:', e));
    }

    fetchHistory();
  } catch (err) {
    console.error('Agent chat error:', err);
    const thinkingEl = document.getElementById(thinkingId);
    if (thinkingEl) thinkingEl.remove();
    appendChatMessage('agent', `⚠️ Error: ${err.message}. Please check your API key.`);
    if (err.message.includes('GEMINI_API_KEY') || err.message.includes('API key')) {
      openKeyModal();
    }
  }
}

function appendChatMessage(role, text, audioUrl = null, tempId = null, voice = 'Gemini', duration = 0) {
  const bubble = document.createElement('div');
  bubble.className = `message-bubble ${role}`;
  if (tempId) bubble.id = tempId;

  const isUser = role === 'user';
  const avatar = isUser ? '<i class="fa-solid fa-user"></i>' : '🤖';
  const senderName = isUser ? 'You' : `Gemini Agent (${voice})`;
  const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  let audioHtml = '';
  if (audioUrl) {
    const audioId = 'inline_audio_' + Math.random().toString(36).substring(2, 8);
    audioHtml = `
      <div class="inline-audio-player">
        <button class="inline-play-btn" onclick="playInlineAudio('${audioId}')" id="btn_${audioId}">
          <i class="fa-solid fa-play"></i>
        </button>
        <span class="inline-audio-text">🎙️ Spoken Response • ${duration}s</span>
        <audio id="${audioId}" src="${audioUrl}" preload="auto"></audio>
      </div>
    `;
  }

  bubble.innerHTML = `
    <div class="message-avatar">${avatar}</div>
    <div class="message-content">
      <div class="message-header">
        <span class="sender-name">${senderName}</span>
        <span class="message-time">${now}</span>
      </div>
      <div class="message-text">${escapeHtml(text)}</div>
      ${audioHtml}
    </div>
  `;

  elements.chatMessages.appendChild(bubble);
  elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;
}

function playInlineAudio(audioId) {
  const audio = document.getElementById(audioId);
  const btn = document.getElementById('btn_' + audioId);
  if (!audio) return;

  if (audio.paused) {
    audio.play();
    btn.innerHTML = '<i class="fa-solid fa-pause"></i>';
    audio.onended = () => {
      btn.innerHTML = '<i class="fa-solid fa-play"></i>';
    };
  } else {
    audio.pause();
    btn.innerHTML = '<i class="fa-solid fa-play"></i>';
  }
}

function clearAgentChat() {
  state.chatHistory = [];
  elements.chatMessages.innerHTML = `
    <div class="message-bubble agent">
      <div class="message-avatar">🤖</div>
      <div class="message-content">
        <div class="message-header">
          <span class="sender-name">Gemini Voice Agent</span>
          <span class="message-time">Just now</span>
        </div>
        <div class="message-text">Conversation cleared. Ask me anything in voice or text!</div>
      </div>
    </div>
  `;
}

// Speech Recognition (Microphone)
function initSpeechRecognition() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    elements.micBtn.title = 'Speech Recognition not supported in this browser';
    return;
  }

  const rec = new SpeechRecognition();
  rec.continuous = false;
  rec.interimResults = true;
  rec.lang = 'hi-IN'; // Supports Hindi & English naturally

  rec.onstart = () => {
    state.isRecording = true;
    elements.micBtn.classList.add('recording');
    elements.micStatusIndicator.classList.remove('hidden');
  };

  rec.onresult = (event) => {
    let transcript = '';
    for (let i = event.resultIndex; i < event.results.length; i++) {
      transcript += event.results[i][0].transcript;
    }
    elements.agentInput.value = transcript;
  };

  rec.onend = () => {
    state.isRecording = false;
    elements.micBtn.classList.remove('recording');
    elements.micStatusIndicator.classList.add('hidden');
    // If text was recognized, auto-send
    if (elements.agentInput.value.trim().length > 0) {
      sendAgentMessage();
    }
  };

  rec.onerror = (event) => {
    console.error('Speech recognition error:', event.error);
    state.isRecording = false;
    elements.micBtn.classList.remove('recording');
    elements.micStatusIndicator.classList.add('hidden');
  };

  state.recognition = rec;
}

function toggleMic() {
  if (!state.recognition) {
    alert('Speech Recognition is not supported by your browser. Please use Chrome, Edge, or enter text manually.');
    return;
  }

  if (state.isRecording) {
    state.recognition.stop();
  } else {
    elements.agentInput.value = '';
    state.recognition.start();
  }
}

// ================= AUDIO HISTORY =================
async function fetchHistory() {
  try {
    const res = await fetch('/api/history');
    const data = await res.json();
    const history = data.history || [];

    elements.historyCountBadge.textContent = history.length;
    renderHistoryList(history);
  } catch (err) {
    console.error('Failed to fetch history:', err);
  }
}

function renderHistoryList(history) {
  const container = elements.historyListContainer;
  if (!history || history.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <p>No audio files generated yet. Generate speech in the studio or chat with the voice agent!</p>
      </div>
    `;
    return;
  }

  container.innerHTML = history.map(item => `
    <div class="history-item">
      <div class="history-info">
        <div class="history-badges">
          <span class="meta-tag">🎙️ ${item.voice || 'Gemini'}</span>
          <span class="meta-tag">⏱️ ${item.durationSec || 0}s</span>
          <span class="meta-tag">${item.type === 'chat' ? '💬 Agent Chat' : '📝 Text to Speech'}</span>
        </div>
        <div class="history-text">"${escapeHtml(item.text || item.userMessage || item.replyText || '')}"</div>
      </div>
      <div class="history-actions">
        <button class="circle-btn" onclick="playHistoryAudio('${item.audioDataUrl}')" title="Play">
          <i class="fa-solid fa-play"></i>
        </button>
        <a class="circle-btn" href="${item.audioDataUrl}" download="voice_${item.id}.wav" title="Download">
          <i class="fa-solid fa-download"></i>
        </a>
      </div>
    </div>
  `).join('');
}

function playHistoryAudio(dataUrl) {
  const audio = new Audio(dataUrl);
  audio.play();
}

// ================= MODAL / API KEY MANAGEMENT =================
function openKeyModal() {
  elements.apiKeyModal.classList.remove('hidden');
  elements.testConnectionStatus.textContent = '';
}

function closeKeyModal() {
  elements.apiKeyModal.classList.add('hidden');
}

function toggleKeyVisibility() {
  const input = elements.modalKeyInput;
  const icon = document.getElementById('keyEyeIcon');
  if (input.type === 'password') {
    input.type = 'text';
    icon.className = 'fa-solid fa-eye-slash';
  } else {
    input.type = 'password';
    icon.className = 'fa-solid fa-eye';
  }
}

function saveKeyFromModal() {
  const key = elements.modalKeyInput.value.trim();
  if (!key) {
    alert('Please enter an API key');
    return;
  }
  state.customApiKey = key;
  localStorage.setItem('gemini_custom_key', key);
  state.isConfigured = true;
  elements.apiKeyBadgeBtn.className = 'status-badge ready';
  elements.apiKeyStatusText.textContent = 'Gemini Ready (UI Key)';
  alert('API Key saved successfully for this session!');
  closeKeyModal();
}

async function testConnection() {
  const key = elements.modalKeyInput.value.trim() || state.customApiKey;
  const statusEl = elements.testConnectionStatus;
  statusEl.className = 'test-status';
  statusEl.textContent = 'Testing connection with Gemini API...';

  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash?key=${key}`);
    const data = await res.json();

    if (!res.ok) {
      // Try gemini-2.0-flash
      const fallbackRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash?key=${key}`);
      if (!fallbackRes.ok) {
        throw new Error(data.error?.message || 'Invalid API key or network error');
      }
    }

    statusEl.className = 'test-status success';
    statusEl.textContent = '✅ Connection Successful! Your Gemini API key is valid.';
    state.customApiKey = key;
    localStorage.setItem('gemini_custom_key', key);
    state.isConfigured = true;
    elements.apiKeyBadgeBtn.className = 'status-badge ready';
    elements.apiKeyStatusText.textContent = 'Gemini Ready (Valid)';
  } catch (err) {
    statusEl.className = 'test-status error';
    statusEl.textContent = `❌ Error: ${err.message}`;
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}


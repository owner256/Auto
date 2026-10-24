// scenes.js — 13-Scene Cinematic Visual Engine for ZCLE Studio
class CPUSceneDirector {
  constructor(renderer) {
    this.r = renderer;
    this.currentSceneData = null;
  }

  setSceneData(data) {
    this.currentSceneData = data;
  }

  applySceneCamera(sceneIndex, sceneProgress, template) {
    // Dynamic cinematic camera choreography for each scene
    const camTargets = {
      hero:       { x: 0, y: 0, zoom: 1.0, rot: -0.15 + (sceneProgress - 0.5) * 0.12, pitch: 0.42 },
      definition: { x: 0, y: 10, zoom: 1.05, rot: 0.05, pitch: 0.25 },
      ecosystem:  { x: 0, y: 0, zoom: 0.95, rot: -0.05, pitch: 0.32 },
      fde:        { x: 0, y: -5, zoom: 1.0, rot: (sceneProgress - 0.5) * 0.18, pitch: 0.35 },
      cores:      { x: 0, y: 5, zoom: 1.02, rot: -0.08, pitch: 0.28 },
      clock:      { x: 0, y: 0, zoom: 1.0, rot: 0.0, pitch: 0.2 },
      board3d:    { x: 0, y: 0, zoom: 1.15, rot: -0.35 + sceneProgress * 0.65, pitch: 0.55 },
      pipeline:   { x: 0, y: 0, zoom: 1.0, rot: -0.05, pitch: 0.26 },
      chip3d:     { x: 0, y: 0, zoom: 1.25, rot: 0.25 + (sceneProgress - 0.5) * 0.5, pitch: 0.62 },
      memory:     { x: 0, y: 15, zoom: 0.98, rot: 0.08, pitch: 0.3 },
      workloads:  { x: 0, y: 0, zoom: 1.0, rot: -0.04, pitch: 0.24 },
      buying:     { x: 0, y: 0, zoom: 1.0, rot: 0.02, pitch: 0.2 },
      recap:      { x: 0, y: 0, zoom: 0.96, rot: (sceneProgress - 0.5) * 0.15, pitch: 0.35 }
    };

    const target = camTargets[template] || { x: 0, y: 0, zoom: 1.0, rot: 0, pitch: 0.35 };
    this.r.setCameraTarget(target);
  }

  render(dt, elapsed, sceneIndex, sceneProgress) {
    const sc = this.currentSceneData || {};
    const template = sc.visualTemplate || 'hero';

    this.applySceneCamera(sceneIndex, sceneProgress, template);
    this.r.updateCamera(dt, elapsed);

    const ctx = this.r.ctx;
    const W = this.r.width;
    const H = this.r.height;
    const dpr = this.r.dpr;

    ctx.save();
    ctx.scale(dpr, dpr);

    // 1. Deep Cinematic Cyber Gradient Background
    const bg = ctx.createRadialGradient(W * 0.5, H * 0.48, 40, W * 0.5, H * 0.5, Math.max(W, H) * 0.78);
    bg.addColorStop(0, '#09152a');
    bg.addColorStop(0.55, '#050a16');
    bg.addColorStop(1, '#020408');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    const scale = this.r.getResponsiveScale();
    const centerX = W * 0.5 + (this.r.cam.x + this.r.breathX) * scale;
    const centerY = H * 0.47 + (this.r.cam.y + this.r.breathY) * scale;

    // 2. Render Template-Specific Bespoke Animation
    switch (template) {
      case 'hero':
        this.renderHeroScene(ctx, centerX, centerY, scale, elapsed, sceneProgress, sc);
        break;
      case 'definition':
        this.renderDefinitionScene(ctx, centerX, centerY, scale, elapsed, sceneProgress, sc);
        break;
      case 'ecosystem':
        this.renderEcosystemScene(ctx, centerX, centerY, scale, elapsed, sceneProgress, sc);
        break;
      case 'fde':
        this.renderFDEScene(ctx, centerX, centerY, scale, elapsed, sceneProgress, sc);
        break;
      case 'cores':
        this.renderCoresScene(ctx, centerX, centerY, scale, elapsed, sceneProgress, sc);
        break;
      case 'clock':
        this.renderClockScene(ctx, centerX, centerY, scale, elapsed, sceneProgress, sc);
        break;
      case 'board3d':
        this.renderBoard3DScene(ctx, centerX, centerY, scale, elapsed, sceneProgress, sc);
        break;
      case 'pipeline':
        this.renderPipelineScene(ctx, centerX, centerY, scale, elapsed, sceneProgress, sc);
        break;
      case 'chip3d':
        this.renderChip3DScene(ctx, centerX, centerY, scale, elapsed, sceneProgress, sc);
        break;
      case 'memory':
        this.renderMemoryScene(ctx, centerX, centerY, scale, elapsed, sceneProgress, sc);
        break;
      case 'workloads':
        this.renderWorkloadsScene(ctx, centerX, centerY, scale, elapsed, sceneProgress, sc);
        break;
      case 'buying':
        this.renderBuyingScene(ctx, centerX, centerY, scale, elapsed, sceneProgress, sc);
        break;
      case 'recap':
        this.renderRecapScene(ctx, centerX, centerY, scale, elapsed, sceneProgress, sc);
        break;
      default:
        this.renderHeroScene(ctx, centerX, centerY, scale, elapsed, sceneProgress, sc);
        break;
    }

    // 3. Floating Micro-Photons / Depth Particles
    for (const p of this.r.particles) {
      const px = ((p.x + elapsed * 22 * p.z) % W + W) % W;
      const py = ((p.y - elapsed * 12 * p.z) % H + H) % H;
      ctx.fillStyle = `rgba(56, 189, 248, ${p.alpha * 0.7})`;
      ctx.beginPath();
      ctx.arc(px, py, p.size * scale * 0.9, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  // =========================================================================
  // SCENE 01: HERO — The Silicon Heart (Stylized 2.5D CPU Package)
  // =========================================================================
  renderHeroScene(ctx, cx, cy, scale, elapsed, prog, sc) {
    // 3D Perspective CPU Package Base
    this.r.drawBox3D(ctx, 0, 0, 0, 320, 26, 320, cx, cy, scale, '#0f243c', '#00f0ff');
    // Silicon Integrated Heat Spreader (IHS)
    this.r.drawBox3D(ctx, 0, -22, 0, 240, 16, 240, cx, cy, scale, '#1e293b', '#38bdf8');
    // Central Silicon Core Die
    const pulse = 0.5 + 0.5 * Math.sin(elapsed * 4);
    this.r.drawBox3D(ctx, 0, -34, 0, 130, 8, 130, cx, cy, scale, `rgba(0, 240, 255, ${0.45 + pulse * 0.35})`, '#ffffff');

    // Concentric Circular Circuit Traces
    ctx.save();
    ctx.translate(cx, cy + 40 * scale);
    ctx.rotate(this.r.cam.rot * 0.4);
    for (let r = 80; r <= 200; r += 35) {
      ctx.strokeStyle = `rgba(0, 240, 255, ${0.08 + 0.05 * Math.sin(elapsed * 2 + r)})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(0, 0, r * scale, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Glowing Headline Overlay Cards
    ctx.restore();
    this.drawFloatingCard(ctx, cx, cy + 175 * scale, 340 * scale, 56 * scale, 'CENTRAL PROCESSING UNIT', 'General-Purpose Instruction Engine', '#00f0ff');
  }

  // =========================================================================
  // SCENE 02: DEFINITION — [C] [P] [U] Acronym Cards
  // =========================================================================
  renderDefinitionScene(ctx, cx, cy, scale, elapsed, prog, sc) {
    const cards = [
      { letter: 'C', word: 'CENTRAL', desc: 'Primary Computing Hub', col: '#00f0ff', activeAt: 0.15 },
      { letter: 'P', word: 'PROCESSING', desc: 'Calculates Logic & Math', col: '#f59e0b', activeAt: 0.45 },
      { letter: 'U', word: 'UNIT', desc: 'Integrated Silicon Chip', col: '#a855f7', activeAt: 0.72 }
    ];

    const cardW = 190 * scale;
    const cardH = 220 * scale;
    const spacing = 220 * scale;

    cards.forEach((c, idx) => {
      const x = cx + (idx - 1) * spacing;
      const y = cy;
      const isLit = prog >= c.activeAt;

      ctx.save();
      ctx.shadowColor = c.col;
      ctx.shadowBlur = isLit ? 30 : 5;
      ctx.fillStyle = isLit ? 'rgba(15, 23, 42, 0.95)' : 'rgba(10, 15, 26, 0.7)';
      ctx.strokeStyle = isLit ? c.col : 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = isLit ? 2.5 : 1.2;

      this.roundRect(ctx, x - cardW / 2, y - cardH / 2, cardW, cardH, 14 * scale);
      ctx.fill();
      ctx.stroke();

      // Big Glowing Letter
      ctx.shadowBlur = isLit ? 20 : 0;
      ctx.fillStyle = isLit ? c.col : 'rgba(148, 163, 184, 0.4)';
      ctx.font = `900 ${68 * scale}px Inter, sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(c.letter, x, y - 24 * scale);

      // Word & Description
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#ffffff';
      ctx.font = `800 ${17 * scale}px Inter, sans-serif`;
      ctx.fillText(c.word, x, y + 32 * scale);

      ctx.fillStyle = isLit ? '#94a3b8' : '#475569';
      ctx.font = `500 ${12 * scale}px Inter, sans-serif`;
      ctx.fillText(c.desc, x, y + 58 * scale);

      ctx.restore();
    });
  }

  // =========================================================================
  // SCENE 03: ECOSYSTEM — CPU in Center + Connected Peripherals
  // =========================================================================
  renderEcosystemScene(ctx, cx, cy, scale, elapsed, prog, sc) {
    const nodes = [
      { id: 'app', label: 'Applications & OS', x: cx, y: cy - 150 * scale, col: '#38bdf8' },
      { id: 'ram', label: 'System RAM (DDR5)', x: cx + 220 * scale, y: cy, col: '#10b981' },
      { id: 'ssd', label: 'NVMe SSD Storage', x: cx, y: cy + 150 * scale, col: '#f59e0b' },
      { id: 'io',  label: 'Display & Network I/O', x: cx - 220 * scale, y: cy, col: '#a855f7' }
    ];

    // Connecting High-Speed Buses
    nodes.forEach((n, idx) => {
      ctx.save();
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.25)';
      ctx.lineWidth = 3 * scale;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(n.x, n.y);
      ctx.stroke();

      // Flowing Data Packet
      const t = (elapsed * 1.5 + idx * 0.25) % 1;
      const px = cx + (n.x - cx) * t;
      const py = cy + (n.y - cy) * t;

      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 15;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(px, py, 5 * scale, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Peripheral Node Card
      this.drawPillCard(ctx, n.x, n.y, 160 * scale, 48 * scale, n.label, n.col);
    });

    // Central CPU Hub
    ctx.save();
    ctx.shadowColor = '#00f0ff';
    ctx.shadowBlur = 35;
    ctx.fillStyle = '#0b1329';
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 3 * scale;
    this.roundRect(ctx, cx - 75 * scale, cy - 60 * scale, 150 * scale, 120 * scale, 16 * scale);
    ctx.fill();
    ctx.stroke();

    ctx.shadowBlur = 0;
    ctx.fillStyle = '#ffffff';
    ctx.font = `800 ${22 * scale}px Inter, sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('CPU', cx, cy - 8 * scale);
    ctx.fillStyle = '#38bdf8';
    ctx.font = `600 ${11 * scale}px Inter, sans-serif`;
    ctx.fillText('Central Engine', cx, cy + 18 * scale);
    ctx.restore();
  }

  // =========================================================================
  // SCENE 04: FDE CYCLE — Fetch -> Decode -> Execute Loop
  // =========================================================================
  renderFDEScene(ctx, cx, cy, scale, elapsed, prog, sc) {
    const radius = 150 * scale;
    const stages = [
      { num: '01', title: 'FETCH', desc: 'Instruction fetched from memory', angle: -Math.PI / 2, col: '#38bdf8' },
      { num: '02', title: 'DECODE', desc: 'Control Unit parses operation', angle: Math.PI / 6, col: '#f59e0b' },
      { num: '03', title: 'EXECUTE', desc: 'ALU runs calculation / logic', angle: (5 * Math.PI) / 6, col: '#10b981' }
    ];

    // Circular Cycle Flow Ring
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 4 * scale;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.stroke();

    // Orbiting Active Instruction Packet
    const cycleSpeed = elapsed * 1.8;
    const packetX = cx + Math.cos(cycleSpeed) * radius;
    const packetY = cy + Math.sin(cycleSpeed) * radius;

    ctx.shadowColor = '#00f0ff';
    ctx.shadowBlur = 25;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(packetX, packetY, 8 * scale, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Stage Boxes
    stages.forEach((st) => {
      const sx = cx + Math.cos(st.angle) * radius;
      const sy = cy + Math.sin(st.angle) * radius;

      ctx.save();
      ctx.shadowColor = st.col;
      ctx.shadowBlur = 20;
      ctx.fillStyle = '#0a1020';
      ctx.strokeStyle = st.col;
      ctx.lineWidth = 2.2 * scale;
      this.roundRect(ctx, sx - 85 * scale, sy - 42 * scale, 170 * scale, 84 * scale, 12 * scale);
      ctx.fill();
      ctx.stroke();

      ctx.shadowBlur = 0;
      ctx.fillStyle = st.col;
      ctx.font = `800 ${11 * scale}px Inter, sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(`PHASE ${st.num}`, sx, sy - 14 * scale);

      ctx.fillStyle = '#ffffff';
      ctx.font = `800 ${18 * scale}px Inter, sans-serif`;
      ctx.fillText(st.title, sx, sy + 8 * scale);

      ctx.fillStyle = '#94a3b8';
      ctx.font = `500 ${10 * scale}px Inter, sans-serif`;
      ctx.fillText(st.desc, sx, sy + 25 * scale);
      ctx.restore();
    });
  }

  // =========================================================================
  // SCENE 05: CORES & THREADS — Physical Cores vs Logical Lanes
  // =========================================================================
  renderCoresScene(ctx, cx, cy, scale, elapsed, prog, sc) {
    const coreCount = 4;
    const coreW = 125 * scale;
    const coreH = 210 * scale;
    const gap = 20 * scale;
    const startX = cx - ((coreCount * (coreW + gap) - gap) / 2) + coreW / 2;

    for (let i = 0; i < coreCount; i++) {
      const x = startX + i * (coreW + gap);
      const isCoreActive = prog >= (i * 0.2);

      ctx.save();
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = isCoreActive ? 18 : 4;
      ctx.fillStyle = isCoreActive ? '#0d182e' : '#080c16';
      ctx.strokeStyle = isCoreActive ? '#00f0ff' : 'rgba(255, 255, 255, 0.12)';
      ctx.lineWidth = 2 * scale;
      this.roundRect(ctx, x - coreW / 2, cy - coreH / 2, coreW, coreH, 12 * scale);
      ctx.fill();
      ctx.stroke();

      // Core Header
      ctx.fillStyle = '#ffffff';
      ctx.font = `800 ${16 * scale}px Inter, sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(`CORE 0${i + 1}`, x, cy - 65 * scale);

      ctx.fillStyle = '#38bdf8';
      ctx.font = `600 ${11 * scale}px Inter, sans-serif`;
      ctx.fillText('Physical Unit', x, cy - 45 * scale);

      // Two Hardware Thread Lanes inside Core
      for (let t = 0; t < 2; t++) {
        const ty = cy - 10 * scale + t * 45 * scale;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
        ctx.strokeStyle = 'rgba(168, 85, 247, 0.4)';
        ctx.lineWidth = 1.2 * scale;
        this.roundRect(ctx, x - 50 * scale, ty, 100 * scale, 34 * scale, 6 * scale);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#a855f7';
        ctx.font = `700 ${11 * scale}px Inter, sans-serif`;
        ctx.fillText(`Thread 0${t + 1}`, x, ty + 21 * scale);
      }

      ctx.restore();
    }
  }

  // =========================================================================
  // SCENE 06: CLOCK SPEED — GHz Frequency Waveform
  // =========================================================================
  renderClockScene(ctx, cx, cy, scale, elapsed, prog, sc) {
    const waveW = 540 * scale;
    const waveH = 100 * scale;
    const startX = cx - waveW / 2;

    // Glowing Digital Clock Waveform (Square / Sine hybrid)
    ctx.save();
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 3.5 * scale;
    ctx.shadowColor = '#00f0ff';
    ctx.shadowBlur = 20;

    ctx.beginPath();
    for (let x = 0; x <= waveW; x += 4) {
      const t = (x / waveW) * 8 * Math.PI - elapsed * 8;
      const y = cy - Math.sin(t) * waveH * 0.45;
      if (x === 0) ctx.moveTo(startX + x, y);
      else ctx.lineTo(startX + x, y);
    }
    ctx.stroke();
    ctx.restore();

    // Central Metric Cards
    this.drawFloatingCard(ctx, cx, cy - 120 * scale, 360 * scale, 60 * scale, 'CLOCK FREQUENCY: 3.50 GHz', '3,500,000,000 Electric Cycles per Second', '#00f0ff');
    this.drawFloatingCard(ctx, cx, cy + 130 * scale, 420 * scale, 52 * scale, 'NOTE: High GHz ≠ Guaranteed Speed', 'Architecture + IPC + Cache determine real performance', '#f59e0b');
  }

  // =========================================================================
  // SCENE 07: MOTHERBOARD 3D — CPU Socket, RAM Slots, PCIe in Perspective
  // =========================================================================
  renderBoard3DScene(ctx, cx, cy, scale, elapsed, prog, sc) {
    // Motherboard PCB Base Plate
    this.r.drawBox3D(ctx, 0, 0, 0, 480, 16, 440, cx, cy, scale, '#063022', '#10b981');
    // CPU Socket in Center
    this.r.drawBox3D(ctx, -40, -16, -20, 150, 12, 150, cx, cy, scale, '#1e293b', '#00f0ff');
    // CPU Die inserted into Socket
    this.r.drawBox3D(ctx, -40, -28, -20, 120, 10, 120, cx, cy, scale, '#38bdf8', '#ffffff');
    // 4 DDR5 RAM DIMM Slots
    for (let i = 0; i < 4; i++) {
      this.r.drawBox3D(ctx, 90 + i * 22, -20, -20, 14, 28, 140, cx, cy, scale, '#3b82f6', '#93c5fd');
    }
    // PCIe Gen 5 Expansion Slot
    this.r.drawBox3D(ctx, -20, -18, 120, 260, 16, 22, cx, cy, scale, '#f59e0b', '#fbbf24');

    this.drawFloatingCard(ctx, cx, cy + 160 * scale, 360 * scale, 50 * scale, 'MOTHERBOARD ARCHITECTURE', 'CPU Socket • 4x DDR5 Slots • PCIe Gen 5', '#10b981');
  }

  // =========================================================================
  // SCENE 08: PIPELINE — Application to Output Pipeline
  // =========================================================================
  renderPipelineScene(ctx, cx, cy, scale, elapsed, prog, sc) {
    const steps = [
      { id: '1', title: 'User App', sub: 'Clicks Program', col: '#38bdf8' },
      { id: '2', title: 'OS Kernel', sub: 'Schedules Task', col: '#00f0ff' },
      { id: '3', title: 'RAM Fetch', sub: 'Loads Data', col: '#10b981' },
      { id: '4', title: 'CPU Core', sub: 'Executes Code', col: '#f59e0b' },
      { id: '5', title: 'Display Out', sub: 'Renders Pixel', col: '#a855f7' }
    ];

    const boxW = 105 * scale;
    const boxH = 90 * scale;
    const gap = 24 * scale;
    const startX = cx - ((steps.length * (boxW + gap) - gap) / 2) + boxW / 2;

    steps.forEach((st, idx) => {
      const x = startX + idx * (boxW + gap);
      const isLit = prog >= idx * 0.18;

      ctx.save();
      ctx.shadowColor = st.col;
      ctx.shadowBlur = isLit ? 22 : 4;
      ctx.fillStyle = isLit ? '#0e1a32' : '#080d1a';
      ctx.strokeStyle = isLit ? st.col : 'rgba(255, 255, 255, 0.12)';
      ctx.lineWidth = isLit ? 2.5 * scale : 1.2 * scale;
      this.roundRect(ctx, x - boxW / 2, cy - boxH / 2, boxW, boxH, 10 * scale);
      ctx.fill();
      ctx.stroke();

      ctx.shadowBlur = 0;
      ctx.fillStyle = st.col;
      ctx.font = `800 ${10 * scale}px Inter, sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(`0${st.id}`, x, cy - 20 * scale);

      ctx.fillStyle = '#ffffff';
      ctx.font = `800 ${14 * scale}px Inter, sans-serif`;
      ctx.fillText(st.title, x, cy + 5 * scale);

      ctx.fillStyle = '#94a3b8';
      ctx.font = `500 ${10 * scale}px Inter, sans-serif`;
      ctx.fillText(st.sub, x, cy + 24 * scale);

      // Arrow to next step
      if (idx < steps.length - 1) {
        ctx.fillStyle = isLit ? st.col : 'rgba(255, 255, 255, 0.2)';
        ctx.font = `700 ${18 * scale}px Inter, sans-serif`;
        ctx.fillText('→', x + boxW / 2 + gap / 2, cy + 4 * scale);
      }
      ctx.restore();
    });
  }

  // =========================================================================
  // SCENE 09: CHIP 3D — Exploded View of Microarchitecture Layers
  // =========================================================================
  renderChip3DScene(ctx, cx, cy, scale, elapsed, prog, sc) {
    const explode = Math.sin(prog * Math.PI) * 45;

    // Layer 1: Substrate Base
    this.r.drawBox3D(ctx, 0, 50 + explode * 0.4, 0, 300, 14, 300, cx, cy, scale, '#0f2942', '#00f0ff');
    // Layer 2: Silicon Die with Cache & Cores
    this.r.drawBox3D(ctx, 0, 0, 0, 200, 10, 200, cx, cy, scale, '#1e1b4b', '#a855f7');
    // Functional Blocks on Die
    this.r.drawBox3D(ctx, -45, -12, -45, 75, 8, 75, cx, cy, scale, '#00f0ff', '#ffffff'); // ALU
    this.r.drawBox3D(ctx, 45, -12, -45, 75, 8, 75, cx, cy, scale, '#f59e0b', '#ffffff'); // CU
    this.r.drawBox3D(ctx, 0, -12, 45, 160, 8, 65, cx, cy, scale, '#10b981', '#ffffff'); // L3 Cache
    // Layer 3: Copper Heat Spreader (IHS)
    this.r.drawBox3D(ctx, 0, -50 - explode, 0, 260, 14, 260, cx, cy, scale, '#334155', '#94a3b8');

    this.drawFloatingCard(ctx, cx, cy + 165 * scale, 380 * scale, 52 * scale, 'EXPLODED MICROARCHITECTURE', 'Substrate • Silicon Die (ALU/Cache) • IHS Cover', '#a855f7');
  }

  // =========================================================================
  // SCENE 10: MEMORY HIERARCHY — Speed vs Capacity Pyramid
  // =========================================================================
  renderMemoryScene(ctx, cx, cy, scale, elapsed, prog, sc) {
    const levels = [
      { name: 'REGISTERS', speed: '0.5 Nanoseconds', cap: '1 KB', w: 180, col: '#00f0ff' },
      { name: 'L1 / L2 / L3 CACHE', speed: '1 - 10 Nanoseconds', cap: '32 MB', w: 260, col: '#38bdf8' },
      { name: 'SYSTEM RAM (DDR5)', speed: '50 - 80 Nanoseconds', cap: '32 GB', w: 350, col: '#10b981' },
      { name: 'NVMe SSD STORAGE', speed: '50,000 Nanoseconds', cap: '2 TB', w: 450, col: '#f59e0b' }
    ];

    levels.forEach((lv, idx) => {
      const y = cy - 110 * scale + idx * 62 * scale;
      const lw = lv.w * scale;
      const lh = 48 * scale;

      ctx.save();
      ctx.shadowColor = lv.col;
      ctx.shadowBlur = 15;
      ctx.fillStyle = '#0a1324';
      ctx.strokeStyle = lv.col;
      ctx.lineWidth = 2 * scale;
      this.roundRect(ctx, cx - lw / 2, y, lw, lh, 8 * scale);
      ctx.fill();
      ctx.stroke();

      ctx.shadowBlur = 0;
      ctx.fillStyle = '#ffffff';
      ctx.font = `800 ${14 * scale}px Inter, sans-serif`;
      ctx.textAlign = 'left';
      ctx.fillText(lv.name, cx - lw / 2 + 16 * scale, y + 29 * scale);

      ctx.fillStyle = lv.col;
      ctx.font = `700 ${12 * scale}px Inter, sans-serif`;
      ctx.textAlign = 'right';
      ctx.fillText(`${lv.speed} • ${lv.cap}`, cx + lw / 2 - 16 * scale, y + 29 * scale);
      ctx.restore();
    });
  }

  // =========================================================================
  // SCENE 11: WORKLOADS — Gaming vs 3D Rendering vs Office
  // =========================================================================
  renderWorkloadsScene(ctx, cx, cy, scale, elapsed, prog, sc) {
    const apps = [
      { name: 'Office / Browsing', use: 'Single-thread burst', pct: 25, col: '#38bdf8' },
      { name: 'Competitive Gaming', use: 'High IPC & Clock focus', pct: 65, col: '#00f0ff' },
      { name: '3D Rendering / Video', use: 'All cores maxed (100%)', pct: 100, col: '#f59e0b' },
      { name: 'Servers / Compilation', use: 'Heavy parallel queues', pct: 85, col: '#a855f7' }
    ];

    const barW = 480 * scale;
    apps.forEach((app, idx) => {
      const y = cy - 120 * scale + idx * 65 * scale;

      ctx.save();
      ctx.fillStyle = '#ffffff';
      ctx.font = `700 ${14 * scale}px Inter, sans-serif`;
      ctx.textAlign = 'left';
      ctx.fillText(app.name, cx - barW / 2, y);

      ctx.fillStyle = '#94a3b8';
      ctx.font = `500 ${12 * scale}px Inter, sans-serif`;
      ctx.textAlign = 'right';
      ctx.fillText(app.use, cx + barW / 2, y);

      // Background Track
      ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
      this.roundRect(ctx, cx - barW / 2, y + 8 * scale, barW, 16 * scale, 8 * scale);
      ctx.fill();

      // Progress Meter
      const fillW = (barW * (app.pct / 100)) * Math.min(1, prog * 2);
      ctx.shadowColor = app.col;
      ctx.shadowBlur = 12;
      ctx.fillStyle = app.col;
      this.roundRect(ctx, cx - barW / 2, y + 8 * scale, fillW, 16 * scale, 8 * scale);
      ctx.fill();
      ctx.restore();
    });
  }

  // =========================================================================
  // SCENE 12: BUYING CHECKLIST — How to Choose a CPU
  // =========================================================================
  renderBuyingScene(ctx, cx, cy, scale, elapsed, prog, sc) {
    const checks = [
      { item: 'Real Workload Benchmarks', desc: 'Ignore GHz marketing; check actual application scores.' },
      { item: 'Motherboard Socket Compatibility', desc: 'Ensure CPU matches chipset and socket generation.' },
      { item: 'TDP & Thermal Cooling Headroom', desc: 'Budget appropriate air/liquid cooler for wattage.' },
      { item: 'Total Platform Cost Balance', desc: 'Balance CPU price with RAM, Motherboard & GPU.' }
    ];

    const cardW = 460 * scale;
    checks.forEach((chk, idx) => {
      const y = cy - 110 * scale + idx * 60 * scale;
      const isLit = prog >= idx * 0.22;

      ctx.save();
      ctx.fillStyle = isLit ? 'rgba(15, 28, 48, 0.9)' : 'rgba(8, 14, 24, 0.6)';
      ctx.strokeStyle = isLit ? '#10b981' : 'rgba(255, 255, 255, 0.12)';
      ctx.lineWidth = isLit ? 2 * scale : 1 * scale;
      this.roundRect(ctx, cx - cardW / 2, y, cardW, 48 * scale, 10 * scale);
      ctx.fill();
      ctx.stroke();

      // Checkmark icon
      ctx.fillStyle = isLit ? '#10b981' : '#475569';
      ctx.font = `800 ${18 * scale}px Inter, sans-serif`;
      ctx.textAlign = 'left';
      ctx.fillText(isLit ? '✓' : '○', cx - cardW / 2 + 16 * scale, y + 31 * scale);

      ctx.fillStyle = '#ffffff';
      ctx.font = `700 ${14 * scale}px Inter, sans-serif`;
      ctx.fillText(chk.item, cx - cardW / 2 + 45 * scale, y + 22 * scale);

      ctx.fillStyle = '#94a3b8';
      ctx.font = `500 ${10.5 * scale}px Inter, sans-serif`;
      ctx.fillText(chk.desc, cx - cardW / 2 + 45 * scale, y + 38 * scale);
      ctx.restore();
    });
  }

  // =========================================================================
  // SCENE 13: RECAP — Summary Milestones
  // =========================================================================
  renderRecapScene(ctx, cx, cy, scale, elapsed, prog, sc) {
    const tiles = [
      { title: 'Instructions', sub: 'Fetch • Decode • Execute', col: '#00f0ff' },
      { title: 'Parallel Power', sub: 'Physical Cores & Threads', col: '#f59e0b' },
      { title: 'Memory Hierarchy', sub: 'Registers → Cache → RAM', col: '#10b981' },
      { title: 'Real Balance', sub: 'Workload-Driven Choice', col: '#a855f7' }
    ];

    const tileW = 200 * scale;
    const tileH = 110 * scale;
    const gap = 20 * scale;

    const positions = [
      { x: cx - tileW / 2 - gap / 2, y: cy - tileH / 2 - gap / 2 - 20 * scale },
      { x: cx + tileW / 2 + gap / 2, y: cy - tileH / 2 - gap / 2 - 20 * scale },
      { x: cx - tileW / 2 - gap / 2, y: cy + tileH / 2 + gap / 2 - 20 * scale },
      { x: cx + tileW / 2 + gap / 2, y: cy + tileH / 2 + gap / 2 - 20 * scale }
    ];

    tiles.forEach((t, idx) => {
      const pos = positions[idx];
      ctx.save();
      ctx.shadowColor = t.col;
      ctx.shadowBlur = 18;
      ctx.fillStyle = '#0c1527';
      ctx.strokeStyle = t.col;
      ctx.lineWidth = 2 * scale;
      this.roundRect(ctx, pos.x - tileW / 2, pos.y - tileH / 2, tileW, tileH, 12 * scale);
      ctx.fill();
      ctx.stroke();

      ctx.shadowBlur = 0;
      ctx.fillStyle = t.col;
      ctx.font = `800 ${16 * scale}px Inter, sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(t.title, pos.x, pos.y - 8 * scale);

      ctx.fillStyle = '#94a3b8';
      ctx.font = `600 ${11 * scale}px Inter, sans-serif`;
      ctx.fillText(t.sub, pos.x, pos.y + 18 * scale);
      ctx.restore();
    });

    this.drawFloatingCard(ctx, cx, cy + 155 * scale, 340 * scale, 52 * scale, 'LESSON COMPLETED', 'You now understand modern CPU architecture!', '#10b981');
  }

  // =========================================================================
  // UTILITY HELPERS
  // =========================================================================
  drawFloatingCard(ctx, x, y, w, h, title, sub, col) {
    ctx.save();
    ctx.shadowColor = col;
    ctx.shadowBlur = 24;
    ctx.fillStyle = 'rgba(10, 16, 32, 0.95)';
    ctx.strokeStyle = col;
    ctx.lineWidth = 2.2;
    this.roundRect(ctx, x - w / 2, y - h / 2, w, h, 12);
    ctx.fill();
    ctx.stroke();

    ctx.shadowBlur = 0;
    ctx.fillStyle = '#ffffff';
    ctx.font = '800 15px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(title, x, y - 4);

    ctx.fillStyle = col;
    ctx.font = '600 11.5px Inter, sans-serif';
    ctx.fillText(sub, x, y + 15);
    ctx.restore();
  }

  drawPillCard(ctx, x, y, w, h, text, col) {
    ctx.save();
    ctx.shadowColor = col;
    ctx.shadowBlur = 14;
    ctx.fillStyle = 'rgba(8, 14, 28, 0.9)';
    ctx.strokeStyle = col;
    ctx.lineWidth = 1.8;
    this.roundRect(ctx, x - w / 2, y - h / 2, w, h, 20);
    ctx.fill();
    ctx.stroke();

    ctx.shadowBlur = 0;
    ctx.fillStyle = '#ffffff';
    ctx.font = '700 12px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(text, x, y + 4);
    ctx.restore();
  }

  roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, r);
    ctx.closePath();
  }
}

window.CPUSceneDirector = CPUSceneDirector;

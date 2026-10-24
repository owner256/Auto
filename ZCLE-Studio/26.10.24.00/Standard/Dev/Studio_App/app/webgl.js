// webgl.js — 3D Perspective & Cinematic Projection Engine
class CinematicRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: false });
    this.width = 0;
    this.height = 0;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);

    // Camera state with smooth damping
    this.cam = { x: 0, y: 0, zoom: 1.0, rot: -0.15, pitch: 0.45 };
    this.targetCam = { x: 0, y: 0, zoom: 1.0, rot: -0.15, pitch: 0.45 };

    // Mouse drag interaction state for 3D rotation
    this.isDragging = false;
    this.lastMouseX = 0;
    this.lastMouseY = 0;

    // Ambient volumetric depth particles
    this.particles = Array.from({ length: 80 }, () => ({
      x: (Math.random() - 0.5) * 1400,
      y: (Math.random() - 0.5) * 900,
      z: Math.random() * 2 + 0.4,
      size: Math.random() * 2.2 + 0.6,
      alpha: Math.random() * 0.5 + 0.15
    }));

    this.setupResizeObserver();
    this.setupMouseControls();
  }

  setupResizeObserver() {
    const updateSize = () => {
      const rect = this.canvas.parentElement.getBoundingClientRect();
      this.width = Math.max(rect.width, 320);
      this.height = Math.max(rect.height, 240);
      this.canvas.width = Math.floor(this.width * this.dpr);
      this.canvas.height = Math.floor(this.height * this.dpr);
    };
    updateSize();
    const ro = new ResizeObserver(updateSize);
    ro.observe(this.canvas.parentElement);
    window.addEventListener('resize', updateSize);
  }

  setupMouseControls() {
    const el = this.canvas;
    el.addEventListener('mousedown', (e) => {
      this.isDragging = true;
      this.lastMouseX = e.clientX;
      this.lastMouseY = e.clientY;
    });

    window.addEventListener('mousemove', (e) => {
      if (!this.isDragging) return;
      const dx = e.clientX - this.lastMouseX;
      const dy = e.clientY - this.lastMouseY;
      this.lastMouseX = e.clientX;
      this.lastMouseY = e.clientY;

      this.targetCam.rot += dx * 0.006;
      this.targetCam.pitch = Math.max(-0.2, Math.min(1.2, this.targetCam.pitch + dy * 0.004));
    });

    window.addEventListener('mouseup', () => {
      this.isDragging = false;
    });

    // Touch support for mobile/tablets
    el.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        this.isDragging = true;
        this.lastMouseX = e.touches[0].clientX;
        this.lastMouseY = e.touches[0].clientY;
      }
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
      if (!this.isDragging || e.touches.length !== 1) return;
      const dx = e.touches[0].clientX - this.lastMouseX;
      const dy = e.touches[0].clientY - this.lastMouseY;
      this.lastMouseX = e.touches[0].clientX;
      this.lastMouseY = e.touches[0].clientY;

      this.targetCam.rot += dx * 0.007;
      this.targetCam.pitch = Math.max(-0.2, Math.min(1.2, this.targetCam.pitch + dy * 0.005));
    }, { passive: true });

    window.addEventListener('touchend', () => {
      this.isDragging = false;
    });
  }

  setCameraTarget(target) {
    if (!this.isDragging) {
      if (target.x !== undefined) this.targetCam.x = target.x;
      if (target.y !== undefined) this.targetCam.y = target.y;
      if (target.zoom !== undefined) this.targetCam.zoom = target.zoom;
      if (target.rot !== undefined) this.targetCam.rot = target.rot;
      if (target.pitch !== undefined) this.targetCam.pitch = target.pitch;
    }
  }

  // Smooth frame-rate independent camera damping
  updateCamera(dt, elapsed) {
    const smoothSpeed = 4.5;
    const factor = 1 - Math.exp(-smoothSpeed * dt);

    this.cam.x += (this.targetCam.x - this.cam.x) * factor;
    this.cam.y += (this.targetCam.y - this.cam.y) * factor;
    this.cam.zoom += (this.targetCam.zoom - this.cam.zoom) * factor;
    this.cam.rot += (this.targetCam.rot - this.cam.rot) * factor;
    this.cam.pitch += (this.targetCam.pitch - this.cam.pitch) * factor;

    // Handheld cinematic camera micro-drift
    this.breathX = Math.sin(elapsed * 1.1) * 3;
    this.breathY = Math.cos(elapsed * 0.85) * 2.5;
  }

  getResponsiveScale() {
    const minDim = Math.min(this.width, this.height * 1.4);
    return Math.max(0.35, (minDim / 820) * this.cam.zoom);
  }

  // True 3D perspective projection math
  project3D(x, y, z, centerX, centerY, scale) {
    const rad = this.cam.rot;
    const pitch = this.cam.pitch;

    // Rotation around Y axis (Yaw)
    const rx = x * Math.cos(rad) - z * Math.sin(rad);
    const rz = x * Math.sin(rad) + z * Math.cos(rad);

    // Rotation around X axis (Pitch)
    const ry = y * Math.cos(pitch) - rz * Math.sin(pitch);
    const fz = y * Math.sin(pitch) + rz * Math.cos(pitch);

    // Perspective projection with camera distance
    const fov = 550;
    const distance = 650 + fz;
    const factor = (fov / Math.max(15, distance)) * scale;

    return {
      x: centerX + rx * factor,
      y: centerY + ry * factor,
      scale: factor,
      z: distance
    };
  }

  // Draw 3D Box with lighting and perspective shading
  drawBox3D(ctx, x, y, z, w, h, d, centerX, centerY, scale, faceColor, strokeColor) {
    const hw = w / 2, hh = h / 2, hd = d / 2;
    const corners = [
      [-hw, -hh, -hd], [hw, -hh, -hd], [hw, hh, -hd], [-hw, hh, -hd],
      [-hw, -hh,  hd], [hw, -hh,  hd], [hw, hh,  hd], [-hw, hh,  hd]
    ].map(([cx, cy, cz]) => this.project3D(x + cx, y + cy, z + cz, centerX, centerY, scale));

    // Faces: Front, Back, Top, Bottom, Left, Right
    const faces = [
      { pts: [0, 1, 2, 3], light: 0.85 }, // Back
      { pts: [4, 5, 6, 7], light: 1.05 }, // Front
      { pts: [0, 1, 5, 4], light: 1.25 }, // Top
      { pts: [2, 3, 7, 6], light: 0.65 }, // Bottom
      { pts: [0, 3, 7, 4], light: 0.75 }, // Left
      { pts: [1, 2, 6, 5], light: 0.95 }  // Right
    ];

    // Sort faces by average depth (Painter's algorithm)
    faces.sort((a, b) => {
      const za = a.pts.reduce((sum, idx) => sum + corners[idx].z, 0) / 4;
      const zb = b.pts.reduce((sum, idx) => sum + corners[idx].z, 0) / 4;
      return zb - za;
    });

    faces.forEach(({ pts, light }) => {
      ctx.beginPath();
      ctx.moveTo(corners[pts[0]].x, corners[pts[0]].y);
      for (let i = 1; i < pts.length; i++) {
        ctx.lineTo(corners[pts[i]].x, corners[pts[i]].y);
      }
      ctx.closePath();

      // Shaded face fill
      ctx.fillStyle = faceColor;
      ctx.globalAlpha = Math.min(1.0, Math.max(0.2, light * 0.9));
      ctx.fill();

      if (strokeColor) {
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 1.2;
        ctx.globalAlpha = 0.8;
        ctx.stroke();
      }
    });
    ctx.globalAlpha = 1.0;
  }
}

window.CinematicRenderer = CinematicRenderer;

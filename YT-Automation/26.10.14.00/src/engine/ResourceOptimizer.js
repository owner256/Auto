const { USER_AGENTS } = require('../config/constants');

class ResourceOptimizer {
  /**
   * Normalizes any YouTube share/shorts/live/watch URL into a clean watch URL
   * to avoid redirect delays and timeouts.
   */
  static normalizeYouTubeUrl(rawUrl) {
    try {
      const parsed = new URL(rawUrl.trim());
      if (parsed.hostname === 'youtu.be') {
        const videoId = parsed.pathname.slice(1).split('/')[0];
        if (videoId) return `https://www.youtube.com/watch?v=${videoId}`;
      }
      if (parsed.hostname.includes('youtube.com')) {
        if (parsed.pathname.startsWith('/embed/')) {
          const videoId = parsed.pathname.split('/embed/')[1]?.split('/')[0]?.split('?')[0];
          if (videoId) return `https://www.youtube.com/watch?v=${videoId}`;
        }
        if (parsed.pathname.startsWith('/shorts/')) {
          const videoId = parsed.pathname.split('/shorts/')[1]?.split('/')[0]?.split('?')[0];
          if (videoId) return `https://www.youtube.com/watch?v=${videoId}`;
        }
        if (parsed.pathname.startsWith('/live/')) {
          const videoId = parsed.pathname.split('/live/')[1]?.split('/')[0]?.split('?')[0];
          if (videoId) return `https://www.youtube.com/watch?v=${videoId}`;
        }
      }
      return rawUrl.trim();
    } catch (_) {
      return rawUrl.trim();
    }
  }

  /**
   * Configures a page for smooth playback, stealth, and background visibility lock.
   */
  static async optimizePage(page, { sessionIndex = 0, headless = true } = {}) {
    const ua = USER_AGENTS[sessionIndex % USER_AGENTS.length];
    await page.setUserAgent(ua);

    if (headless) {
      await page.setViewport({
        width: 854,
        height: 480,
        deviceScaleFactor: 1
      });
    }

    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => false });
      Object.defineProperty(document, 'hidden', { get: () => false });
      Object.defineProperty(document, 'visibilityState', { get: () => 'visible' });
      document.addEventListener(
        'visibilitychange',
        (e) => e.stopImmediatePropagation(),
        true
      );

      // Live Stream & Long Video Anti-Idle Heartbeat (every 15s)
      // Prevents YouTube "Continue watching?" pause popups and keeps live stream active
      setInterval(() => {
        try {
          window.dispatchEvent(new Event('mousemove'));
          const confirmBtn = document.querySelector(
            'yt-confirm-dialog-renderer #confirm-button button, button[aria-label*="Continue watching"]'
          );
          if (confirmBtn) confirmBtn.click();

          const video = document.querySelector('video');
          if (video && video.paused && !video.ended) {
            video.muted = true;
            video.play().catch(() => {});
          }
        } catch (_) {}
      }, 15000);
    });
  }

  /**
   * Forces YouTube video to start playing immediately, muted, and verifies real playback progress.
   */
  static async ensureVideoPlaying(page, navPromise) {
    if (navPromise) await navPromise;
    await page.waitForSelector('video', { timeout: 25000 });

    // Trigger play via YouTube Player API & HTML5 Video API
    await page.evaluate(async () => {
      const consentBtns = document.querySelectorAll(
        'button[aria-label*="Accept"], button[aria-label*="Reject"], ytd-button-renderer.ytd-consent-bump-v2-lightbox button'
      );
      consentBtns.forEach((b) => b.click());

      const player = document.getElementById('movie_player');
      if (player) {
        try {
          if (typeof player.mute === 'function') player.mute();
          if (typeof player.setPlaybackQualityRange === 'function') {
            player.setPlaybackQualityRange('small', 'small');
          }
          if (typeof player.playVideo === 'function') player.playVideo();
        } catch (_) {}
      }

      const video = document.querySelector('video');
      if (video) {
        video.muted = true;
        video.volume = 0;
        if (video.paused) {
          await video.play().catch(() => {});
        }
      }
    });

    // Wait 2.5 seconds to verify video frames are advancing and title is populated
    await new Promise((r) => setTimeout(r, 2500));

    const status = await page.evaluate(async () => {
      const video = document.querySelector('video');
      const player = document.getElementById('movie_player');
      if (video && video.paused) {
        video.muted = true;
        if (player && typeof player.playVideo === 'function') player.playVideo();
        await video.play().catch(() => {});
      }
      const rawTitle =
        document.querySelector('h1.ytd-watch-metadata yt-formatted-string')?.textContent ||
        document.title.replace(' - YouTube', '').trim() ||
        'YouTube Stream';

      return {
        title: rawTitle.trim(),
        playing: video ? !video.paused && video.readyState >= 2 : false,
        currentTime: video ? Number(video.currentTime.toFixed(1)) : 0
      };
    });

    return status;
  }
}

module.exports = ResourceOptimizer;

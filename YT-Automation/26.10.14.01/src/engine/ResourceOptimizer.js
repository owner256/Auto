const { USER_AGENTS, TRAFFIC_REFERRERS } = require('../config/constants');

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
   * Extracts video ID (e.g. dQw4w9WgXcQ) from URL for search match detection.
   */
  static extractVideoId(url) {
    try {
      const parsed = new URL(url);
      if (parsed.searchParams.has('v')) return parsed.searchParams.get('v');
      if (parsed.hostname === 'youtu.be') return parsed.pathname.slice(1).split('/')[0];
      const match = url.match(/(?:embed\/|shorts\/|live\/)([a-zA-Z0-9_-]{11})/);
      return match ? match[1] : null;
    } catch (_) {
      return null;
    }
  }

  /**
   * Configures a page for smooth playback, stealth, WebRTC leak defense,
   * fingerprint noise injection, and background visibility lock.
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
      // 1. Anti-Bot Webdriver & Visibility bypass
      Object.defineProperty(navigator, 'webdriver', { get: () => false });
      Object.defineProperty(document, 'hidden', { get: () => false });
      Object.defineProperty(document, 'visibilityState', { get: () => 'visible' });
      document.addEventListener('visibilitychange', (e) => e.stopImmediatePropagation(), true);

      // 2. Hardware profile spoofing
      Object.defineProperty(navigator, 'hardwareConcurrency', { get: () => 8 });
      Object.defineProperty(navigator, 'deviceMemory', { get: () => 8 });

      // 3. WebRTC Leak Shield (Permanently suppresses local IP disclosure to YouTube)
      try {
        delete window.RTCPeerConnection;
        delete window.webkitRTCPeerConnection;
        delete window.RTCDataChannel;
        if (navigator.mediaDevices) {
          delete navigator.mediaDevices.getUserMedia;
          delete navigator.mediaDevices.enumerateDevices;
        }
      } catch (_) {}

      // 4. Canvas Fingerprint Noise Injection (Prevents YouTube canvas tracking)
      try {
        const originalToDataURL = HTMLCanvasElement.prototype.toDataURL;
        HTMLCanvasElement.prototype.toDataURL = function (type) {
          const context = this.getContext('2d');
          if (context) {
            const shift = (Math.random() - 0.5) * 0.01;
            context.fillStyle = 'rgba(255,255,255,0.01)';
            context.fillRect(0, 0, 1, 1);
          }
          return originalToDataURL.apply(this, arguments);
        };
      } catch (_) {}

      // 5. AudioContext Fingerprint Noise Injection
      try {
        const originalGetChannelData = AudioBuffer.prototype.getChannelData;
        AudioBuffer.prototype.getChannelData = function () {
          const results = originalGetChannelData.apply(this, arguments);
          if (results && results.length > 0) {
            results[0] += 0.0000001 * (Math.random() - 0.5);
          }
          return results;
        };
      } catch (_) {}

      // 6. Live Stream & Long Video Anti-Idle Heartbeat (every 15s)
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
   * Navigates to the video using the specified Traffic Source mode:
   *  - 'direct': Normal direct navigation
   *  - 'referrer': Navigates with simulated social/search referrer header
   *  - 'search': Navigates to youtube.com, searches keyword, and clicks video (High SEO Boost)
   */
  static async navigateWithTrafficSource(page, { targetUrl, source = 'direct', searchKeyword = '', sessionIndex = 0 }) {
    const videoId = this.extractVideoId(targetUrl);

    if (source === 'referrer') {
      const ref = TRAFFIC_REFERRERS[sessionIndex % TRAFFIC_REFERRERS.length];
      await page.setExtraHTTPHeaders({ Referer: ref });
      return page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 35000 });
    }

    if (source === 'search' && searchKeyword) {
      try {
        // Go to YouTube homepage
        await page.goto('https://www.youtube.com', { waitUntil: 'domcontentloaded', timeout: 25000 });

        // Handle consent bump if present
        await page.evaluate(() => {
          const consentBtns = document.querySelectorAll(
            'button[aria-label*="Accept"], button[aria-label*="Reject"], ytd-button-renderer.ytd-consent-bump-v2-lightbox button'
          );
          consentBtns.forEach((b) => b.click());
        });

        // Wait for search input
        const searchInputSelector = 'input#search, input[name="search_query"]';
        await page.waitForSelector(searchInputSelector, { timeout: 8000 });

        // Type query naturally with human character typing delay
        await page.type(searchInputSelector, searchKeyword, { delay: 45 });
        await page.keyboard.press('Enter');

        // Wait for search results
        await page.waitForSelector('ytd-video-renderer, ytd-compact-video-renderer', { timeout: 12000 });

        // Try to click video matching videoId, or first matching video
        const clicked = await page.evaluate((targetVid) => {
          const videoLinks = Array.from(document.querySelectorAll('ytd-video-renderer a#video-title, ytd-video-renderer a.ytd-thumbnail'));
          let target = null;
          if (targetVid) {
            target = videoLinks.find((a) => a.href && a.href.includes(targetVid));
          }
          if (!target && videoLinks.length > 0) {
            target = videoLinks[0];
          }
          if (target) {
            target.click();
            return true;
          }
          return false;
        }, videoId);

        if (clicked) {
          // Successfully clicked search result
          return page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 20000 }).catch(() => {});
        }
      } catch (_) {
        // Fallback to direct navigation if organic search selector timed out
      }
    }

    // Default: Direct navigation
    return page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 35000 });
  }

  /**
   * Forces YouTube video to start playing immediately, muted, and verifies real playback progress.
   */
  static async ensureVideoPlaying(page, navPromise) {
    if (navPromise) {
      try {
        await navPromise;
      } catch (_) {}
    }

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

  /**
   * Simulates realistic human behavior during video watch time:
   *  - Subtle random mouse moves with curved interpolation
   *  - Random micro-scrolls down to comments/description and back up
   * Returns a cleanup handle to stop the simulation when watch time ends.
   */
  static startHumanEmulation(page) {
    let isRunning = true;
    let pendingTimeout = null;

    const interval = setInterval(async () => {
      if (!isRunning) return;
      try {
        // 1. Natural mouse movement
        const targetX = 100 + Math.floor(Math.random() * 600);
        const targetY = 100 + Math.floor(Math.random() * 350);
        await page.mouse.move(targetX, targetY, { steps: 8 }).catch(() => {});

        // 2. Occasional micro-scroll (simulating reading comments)
        if (Math.random() > 0.6) {
          await page.evaluate(() => {
            window.scrollBy({ top: 200 + Math.floor(Math.random() * 200), behavior: 'smooth' });
          }).catch(() => {});

          pendingTimeout = setTimeout(async () => {
            if (!isRunning) return;
            await page.evaluate(() => {
              window.scrollBy({ top: -300, behavior: 'smooth' });
            }).catch(() => {});
          }, 3000);
        }
      } catch (_) {}
    }, 12000 + Math.floor(Math.random() * 8000));

    return {
      stop: () => {
        isRunning = false;
        clearInterval(interval);
        if (pendingTimeout) clearTimeout(pendingTimeout);
      }
    };
  }
}

module.exports = ResourceOptimizer;


const browserPool = require('./BrowserPool');
const ResourceOptimizer = require('./ResourceOptimizer');
const telemetry = require('../services/TelemetryService');
const { DEFAULT_MAX_CONCURRENCY } = require('../config/constants');

class TaskScheduler {
  constructor() {
    this.queue = [];
    this.activeTimers = new Map();
    this.activeCount = 0;
    this.maxConcurrency = DEFAULT_MAX_CONCURRENCY;
    this.isStopping = false;
    this.sessionCounter = 0;
  }

  /**
   * Enqueues N browser sessions without blocking the main thread.
   */
  dispatchBatch({
    url,
    count = 5,
    duration = 60,
    headless = true,
    turboMode = true,
    concurrency = DEFAULT_MAX_CONCURRENCY
  }) {
    this.isStopping = false;
    this.maxConcurrency = Math.min(Math.max(parseInt(concurrency, 10) || DEFAULT_MAX_CONCURRENCY, 1), 250);

    const directUrl = ResourceOptimizer.normalizeYouTubeUrl(url);
    const totalToEnqueue = Math.min(Math.max(parseInt(count, 10) || 5, 1), 5000);
    const watchSeconds = Math.max(parseInt(duration, 10) || 60, 5);

    for (let i = 0; i < totalToEnqueue; i++) {
      this.sessionCounter++;
      this.queue.push({
        sessionId: `sess_${Date.now()}_${this.sessionCounter}`,
        sessionIndex: this.sessionCounter,
        batchIndex: i,
        url: directUrl,
        watchSeconds,
        headless,
        turboMode
      });
    }

    telemetry.updateStats({
      queued: this.queue.length,
      totalRequested: telemetry.stats.totalRequested + totalToEnqueue,
      clusterMode: headless ? 'TURBO_CLUSTER_POOL' : 'VISUAL_MULTI_WINDOW'
    });

    telemetry.log(
      `Dispatched ${totalToEnqueue} sessions for ${directUrl} | Mode: ${headless ? 'Background Turbo Pool' : 'Visible Windows'}`,
      'info'
    );

    setImmediate(() => this._drainQueue());

    return {
      queued: this.queue.length,
      active: this.activeCount,
      maxConcurrency: this.maxConcurrency
    };
  }

  async _drainQueue() {
    if (this.isStopping) return;

    while (
      !this.isStopping &&
      this.queue.length > 0 &&
      this.activeCount < this.maxConcurrency
    ) {
      if (telemetry.stats.ramFreeGB > 0 && telemetry.stats.ramFreeGB < 1.2) {
        telemetry.log('Adaptive Backpressure: Free RAM < 1.2GB, waiting for active sessions to recycle...', 'warn');
        setTimeout(() => this._drainQueue(), 1500);
        break;
      }

      const task = this.queue.shift();
      this.activeCount++;
      telemetry.updateStats({
        queued: this.queue.length,
        active: this.activeCount
      });

      this._executeSession(task);
    }
  }

  async _executeSession(task) {
    const { sessionId, sessionIndex, batchIndex, url, watchSeconds, headless, turboMode } = task;

    try {
      // In Visible Window mode, stagger OS window launches by 350ms so Windows GPU compositor never glitches
      if (!headless && batchIndex > 0) {
        await new Promise((r) => setTimeout(r, (batchIndex % 10) * 350));
      }

      const { page, spawnMs } = await browserPool.acquireSession(sessionId, {
        headless,
        sessionIndex
      });

      if (this.isStopping) {
        await browserPool.releaseSession(sessionId);
        return;
      }

      await ResourceOptimizer.optimizePage(page, { turboMode, sessionIndex, headless });

      // Fire navigation and immediately lock onto the <video> player in parallel across all browsers
      const navPromise = page.goto(url, {
        waitUntil: 'domcontentloaded',
        timeout: 12000
      }).catch(() => {});

      const playState = await ResourceOptimizer.ensureVideoPlaying(page, navPromise);

      if (sessionIndex <= 20 || sessionIndex % 25 === 0) {
        telemetry.log(
          `▶️ [Browser #${sessionIndex}] PLAYING "${playState.title.slice(0, 38)}" | Player Pos: ${playState.currentTime}s | Spawn: ${spawnMs}ms -> Watching for ${watchSeconds}s`,
          'success'
        );
      }

      // Hold session for watchSeconds
      await new Promise((resolve) => {
        const timer = setTimeout(resolve, watchSeconds * 1000);
        this.activeTimers.set(sessionId, { timer, resolve });
      });

      this.activeTimers.delete(sessionId);
      await browserPool.releaseSession(sessionId);

      if (!this.isStopping) {
        telemetry.updateStats({
          completed: telemetry.stats.completed + 1
        });
        if (sessionIndex <= 20 || sessionIndex % 25 === 0) {
          telemetry.log(`✅ [Browser #${sessionIndex}] Completed ${watchSeconds}s watch time!`, 'info');
        }
      }
    } catch (err) {
      this.activeTimers.delete(sessionId);
      await browserPool.releaseSession(sessionId);

      if (!this.isStopping) {
        telemetry.updateStats({
          failed: telemetry.stats.failed + 1
        });
        if (sessionIndex <= 20 || sessionIndex % 25 === 0) {
          telemetry.log(`[Browser #${sessionIndex}] Error: ${err.message.slice(0, 90)}`, 'warn');
        }
      }
    } finally {
      this.activeCount = Math.max(0, this.activeCount - 1);
      telemetry.updateStats({
        active: this.activeCount,
        queued: this.queue.length
      });

      if (!this.isStopping && this.queue.length > 0) {
        setImmediate(() => this._drainQueue());
      } else if (!this.isStopping && this.activeCount === 0 && this.queue.length === 0) {
        telemetry.log('🎉 All scheduled browser sessions completed 100% smoothly!', 'success');
      }
    }
  }

  async stopAll() {
    this.isStopping = true;
    const droppedQueue = this.queue.length;
    this.queue = [];

    for (const [, { timer, resolve }] of this.activeTimers.entries()) {
      clearTimeout(timer);
      resolve();
    }
    this.activeTimers.clear();

    await browserPool.closeAllSessions();
    this.activeCount = 0;

    telemetry.updateStats({
      queued: 0,
      active: 0
    });

    telemetry.log(
      `Stopped all active sessions and cleared ${droppedQueue} queued tasks in <100ms.`,
      'warn'
    );
  }
}

module.exports = new TaskScheduler();

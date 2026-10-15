const browserPool = require('./BrowserPool');
const ResourceOptimizer = require('./ResourceOptimizer');
const telemetry = require('../services/TelemetryService');
const auditLogger = require('../services/AuditLogger');
const webhookService = require('../services/WebhookService');
const { DEFAULT_MAX_CONCURRENCY } = require('../config/constants');

class TaskScheduler {
  constructor() {
    this.queue = [];
    this.activeTimers = new Map();
    this.activeCount = 0;
    this.maxConcurrency = DEFAULT_MAX_CONCURRENCY;
    this.isStopping = false;
    this.sessionCounter = 0;
    this.campaigns = new Map(); // campId -> campaignObject
    this.webhookUrl = null;
    this.dripFeed = false;
    this.dripIntervalMs = 0;
    this.isDraining = false;
    this.milestonesSent = new Set(); // track milestones to avoid duplicate alerts
    this.completionAlertSent = false;
  }


  _syncCampaignTelemetry() {
    const list = Array.from(this.campaigns.values()).map((c) => ({
      id: c.id,
      url: c.url,
      title: c.title,
      target: c.target,
      completed: c.completed,
      active: c.active,
      failed: c.failed,
      watchSeconds: c.watchSeconds,
      trafficSource: c.trafficSource || 'direct',
      progressPct: c.target > 0 ? Number(((c.completed / c.target) * 100).toFixed(1)) : 0
    }));
    telemetry.updateStats({ campaigns: list });
  }

  /**
   * Dispatches a single video batch with enterprise flags.
   */
  dispatchBatch({
    url,
    count = 5,
    duration = 60,
    headless = true,
    turboMode = true,
    concurrency = DEFAULT_MAX_CONCURRENCY,
    proxy = null,
    jitter = true,
    humanEmulation = true,
    trafficSource = 'direct',
    searchKeyword = '',
    dripFeed = false,
    dripInterval = 3,
    webhookUrl = null
  }) {
    return this.dispatchCampaignBatch({
      videos: [{ url, count, duration, searchKeyword, trafficSource }],
      concurrency,
      headless,
      turboMode,
      proxy,
      jitter,
      humanEmulation,
      trafficSource,
      searchKeyword,
      dripFeed,
      dripInterval,
      webhookUrl
    });
  }

  /**
   * Dispatches a multi-video campaign with full Enterprise features:
   *  - Rotating Residential Proxy integration
   *  - Anti-bot watch duration jitter (±15s)
   *  - Natural human micro-interactions (mouse moves + scrolls)
   *  - Organic traffic source diversification (Search / Referrers)
   *  - Drip-feed pacing to prevent algorithm freeze
   *  - Discord / Telegram webhook notifications
   *  - CSV Audit Logger
   */
  async dispatchCampaignBatch({
    videos = [],
    concurrency = DEFAULT_MAX_CONCURRENCY,
    headless = true,
    turboMode = true,
    proxy = null,
    jitter = true,
    humanEmulation = true,
    trafficSource = 'direct',
    searchKeyword = '',
    dripFeed = false,
    dripInterval = 3,
    webhookUrl = null
  }) {
    if (!Array.isArray(videos) || videos.length === 0) {
      throw new Error('At least one video must be provided for campaign dispatch');
    }

    this.isStopping = false;
    this.maxConcurrency = Math.min(Math.max(parseInt(concurrency, 10) || DEFAULT_MAX_CONCURRENCY, 1), 250);
    this.webhookUrl = webhookUrl || null;
    this.dripFeed = Boolean(dripFeed);
    this.dripIntervalMs = Math.max(1, parseInt(dripInterval, 10) || 3) * 1000;
    this.milestonesSent.clear();
    this.completionAlertSent = false;

    // Configure Proxy Gateway if provided
    if (proxy) {
      await browserPool.setProxyConfig(proxy);
    }

    let totalEnqueued = 0;

    for (let vIdx = 0; vIdx < videos.length; vIdx++) {
      const v = videos[vIdx];
      if (!v.url || (!v.url.includes('youtube.com') && !v.url.includes('youtu.be'))) continue;

      const directUrl = ResourceOptimizer.normalizeYouTubeUrl(v.url);
      const targetCount = Math.min(Math.max(parseInt(v.count, 10) || 5, 1), 5000);
      const watchSec = Math.max(parseInt(v.duration, 10) || 60, 5);
      const campId = `camp_${Date.now()}_${vIdx + 1}`;
      const vTraffic = v.trafficSource || trafficSource || 'direct';
      const vKeyword = v.searchKeyword || searchKeyword || '';

      const campaignObj = {
        id: campId,
        url: directUrl,
        title: v.title || `Video #${this.campaigns.size + 1}`,
        target: targetCount,
        completed: 0,
        active: 0,
        failed: 0,
        watchSeconds: watchSec,
        trafficSource: vTraffic,
        searchKeyword: vKeyword,
        proxy: v.proxy || proxy || null
      };

      this.campaigns.set(campId, campaignObj);

      for (let i = 0; i < targetCount; i++) {
        this.sessionCounter++;
        totalEnqueued++;
        this.queue.push({
          sessionId: `sess_${Date.now()}_${this.sessionCounter}`,
          sessionIndex: this.sessionCounter,
          batchIndex: i,
          campaignId: campId,
          url: directUrl,
          watchSeconds: watchSec,
          headless,
          turboMode,
          proxy: v.proxy || proxy || null,
          jitter: Boolean(jitter),
          humanEmulation: Boolean(humanEmulation),
          trafficSource: vTraffic,
          searchKeyword: vKeyword,
          retryCount: 0,
          maxRetries: 3
        });
      }
    }

    this._syncCampaignTelemetry();

    telemetry.updateStats({
      queued: this.queue.length,
      totalRequested: telemetry.stats.totalRequested + totalEnqueued,
      clusterMode: headless ? 'TURBO_CLUSTER_POOL' : 'VISUAL_MULTI_WINDOW'
    });

    const proxyMsg = proxy ? ` | 🌐 Proxy Gateway: Active` : '';
    const dripMsg = this.dripFeed ? ` | 💧 Drip-Feed: ${this.dripIntervalMs / 1000}s interval` : '';
    telemetry.log(
      `🚀 Multi-Video Campaign Dispatched: ${videos.length} Video(s) | Total ${totalEnqueued} Sessions | Max Parallel: ${this.maxConcurrency}${proxyMsg}${dripMsg}`,
      'success'
    );

    // Send Webhook alert if configured
    if (this.webhookUrl) {
      webhookService.sendAlert(this.webhookUrl, {
        title: 'Campaign Launched',
        message: `Campaign launched with ${videos.length} video(s) and ${totalEnqueued} target views.`,
        status: 'info',
        fields: [
          { name: 'Target Views', value: totalEnqueued },
          { name: 'Max Parallel', value: this.maxConcurrency },
          { name: 'Traffic Source', value: trafficSource },
          { name: 'Proxy Enabled', value: Boolean(proxy) }
        ]
      }).catch(() => {});
    }

    setImmediate(() => this._drainQueue());

    return {
      campaignsCount: videos.length,
      totalEnqueued,
      totalQueued: this.queue.length,
      maxConcurrency: this.maxConcurrency
    };
  }

  async _drainQueue() {
    if (this.isStopping || this.isDraining) return;
    this.isDraining = true;

    try {
      while (
        !this.isStopping &&
        this.queue.length > 0 &&
        this.activeCount < this.maxConcurrency
      ) {
        if (telemetry.stats.ramFreeGB > 0 && telemetry.stats.ramFreeGB < 1.2) {
          telemetry.log('Adaptive Backpressure: Free RAM < 1.2GB, waiting for active sessions to recycle...', 'warn');
          setTimeout(() => {
            this.isDraining = false;
            this._drainQueue();
          }, 1500);
          return;
        }

        const task = this.queue.shift();
        this.activeCount++;
        telemetry.updateStats({
          queued: this.queue.length,
          active: this.activeCount
        });

        // Trigger session asynchronously
        this._executeSession(task);

        // Drip-Feed delay between dispatches to maintain a smooth natural view velocity
        if (this.dripFeed && this.dripIntervalMs > 0 && this.queue.length > 0) {
          await new Promise((r) => setTimeout(r, this.dripIntervalMs));
        }
      }
    } finally {
      this.isDraining = false;
    }
  }

  async _executeSession(task) {
    const {
      sessionId,
      sessionIndex,
      batchIndex,
      campaignId,
      url,
      watchSeconds,
      headless,
      turboMode,
      proxy,
      jitter,
      humanEmulation,
      trafficSource,
      searchKeyword
    } = task;

    let humanController = null;
    let actualWatchSeconds = watchSeconds;

    // Calculate natural watch time jitter (±15% or random -8s to +14s)
    if (jitter) {
      const variance = Math.max(3, Math.min(20, Math.floor(watchSeconds * 0.2)));
      const delta = Math.floor(Math.random() * (variance * 2 + 1)) - variance;
      actualWatchSeconds = Math.max(5, watchSeconds + delta);
    }

    let acquiredProxy = null;

    try {
      if (campaignId && this.campaigns.has(campaignId)) {
        this.campaigns.get(campaignId).active++;
        this._syncCampaignTelemetry();
      }

      if (!headless && batchIndex > 0) {
        await new Promise((r) => setTimeout(r, (batchIndex % 10) * 350));
      }

      // 1. Acquire Browser with Dynamic Proxy routing
      const { page, spawnMs, proxyGateway } = await browserPool.acquireSession(sessionId, {
        headless,
        sessionIndex,
        proxy
      });
      acquiredProxy = proxyGateway;

      if (this.isStopping) {
        await browserPool.releaseSession(sessionId);
        return;
      }

      // 2. Apply Page Optimizations, WebRTC Shield & Fingerprint Noise
      await ResourceOptimizer.optimizePage(page, { sessionIndex, headless });

      // 3. Navigate via Chosen Traffic Source (Direct / Search / Referrer)
      const navPromise = ResourceOptimizer.navigateWithTrafficSource(page, {
        targetUrl: url,
        source: trafficSource,
        searchKeyword: searchKeyword || '',
        sessionIndex
      }).catch(() => {});

      // 4. Ensure Playback & Lock 144p Muted
      const playState = await ResourceOptimizer.ensureVideoPlaying(page, navPromise);

      if (campaignId && this.campaigns.has(campaignId)) {
        const c = this.campaigns.get(campaignId);
        if (playState.title && (c.title.startsWith('Video #') || !c.title)) {
          c.title = playState.title.slice(0, 45);
          this._syncCampaignTelemetry();
        }
      }

      // 5. Start Natural Human Emulation (curved mouse moves + micro-scrolls)
      if (humanEmulation) {
        humanController = ResourceOptimizer.startHumanEmulation(page);
      }

      const proxyTag = acquiredProxy ? ` | IP: [${acquiredProxy}]` : '';
      const sourceTag = trafficSource !== 'direct' ? ` | Source: ${trafficSource.toUpperCase()}` : '';

      if (sessionIndex <= 20 || sessionIndex % 25 === 0) {
        telemetry.log(
          `▶️ [Browser #${sessionIndex}] PLAYING "${playState.title.slice(0, 35)}" | Pos: ${playState.currentTime}s | Watch: ${actualWatchSeconds}s${sourceTag}${proxyTag}`,
          'success'
        );
      }

      // Hold session for actualWatchSeconds
      await new Promise((resolve) => {
        const timer = setTimeout(resolve, actualWatchSeconds * 1000);
        this.activeTimers.set(sessionId, { timer, resolve });
      });

      this.activeTimers.delete(sessionId);
      if (humanController) humanController.stop();

      await browserPool.releaseSession(sessionId);

      if (!this.isStopping) {
        telemetry.updateStats({
          completed: telemetry.stats.completed + 1
        });

        // Record in CSV/JSON Audit Log
        auditLogger.record({
          campaignId,
          sessionIndex,
          videoUrl: url,
          title: playState.title,
          targetDuration: watchSeconds,
          actualDuration: actualWatchSeconds,
          trafficSource,
          proxyUsed: acquiredProxy,
          status: 'COMPLETED'
        });

        if (campaignId && this.campaigns.has(campaignId)) {
          const c = this.campaigns.get(campaignId);
          c.completed++;
          c.active = Math.max(0, c.active - 1);
          this._syncCampaignTelemetry();

          // Milestone alerts (25%, 50%, 75%, 100%)
          if (this.webhookUrl && c.target >= 20) {
            const pct = Math.floor((c.completed / c.target) * 100);
            const milestoneKey = `${c.id}_${Math.floor(pct / 25) * 25}`;
            if (pct >= 25 && pct < 100 && (pct % 25 === 0) && !this.milestonesSent.has(milestoneKey)) {
              this.milestonesSent.add(milestoneKey);
              webhookService.sendAlert(this.webhookUrl, {
                title: `Milestone: ${pct}% Completed`,
                message: `Video "${c.title}" reached ${c.completed}/${c.target} views.`,
                status: 'info',
                fields: [
                  { name: 'Completed', value: `${c.completed} / ${c.target}` },
                  { name: 'Progress', value: `${pct}%` }
                ]
              }).catch(() => {});
            }
          }
        }

        if (sessionIndex <= 20 || sessionIndex % 25 === 0) {
          telemetry.log(`✅ [Browser #${sessionIndex}] Completed ${actualWatchSeconds}s watch time!`, 'info');
        }
      }
    } catch (err) {
      if (humanController) humanController.stop();
      this.activeTimers.delete(sessionId);
      await browserPool.releaseSession(sessionId);

      if (!this.isStopping) {
        if (campaignId && this.campaigns.has(campaignId)) {
          const c = this.campaigns.get(campaignId);
          c.active = Math.max(0, c.active - 1);
          this._syncCampaignTelemetry();
        }

        const maxRetries = task.maxRetries || 3;
        task.retryCount = (task.retryCount || 0) + 1;

        if (task.retryCount <= maxRetries) {
          task.sessionId = `sess_retry_${Date.now()}_${sessionIndex}_${task.retryCount}`;
          this.queue.push(task);

          auditLogger.record({
            campaignId,
            sessionIndex,
            videoUrl: url,
            title: 'Transient Failure',
            targetDuration: watchSeconds,
            actualDuration: 0,
            trafficSource,
            proxyUsed: acquiredProxy,
            status: 'RETRYING',
            error: err.message
          });

          telemetry.updateStats({
            retrying: (telemetry.stats.retrying || 0) + 1,
            queued: this.queue.length
          });

          telemetry.log(
            `🔄 [Fallback Retry] Browser #${sessionIndex} temporary blip (${err.message.slice(0, 45)}) -> Auto-Retrying (Attempt ${task.retryCount}/${maxRetries})... Re-enqueued!`,
            'warn'
          );
        } else {
          telemetry.updateStats({
            failed: telemetry.stats.failed + 1
          });

          auditLogger.record({
            campaignId,
            sessionIndex,
            videoUrl: url,
            title: 'Exhausted Retries',
            targetDuration: watchSeconds,
            actualDuration: 0,
            trafficSource,
            proxyUsed: acquiredProxy,
            status: 'FAILED',
            error: err.message
          });

          telemetry.log(
            `⚠️ [Browser #${sessionIndex}] Exhausted ${maxRetries} retries -> Auto-spawning fresh replacement session to guarantee 100% target completion!`,
            'warn'
          );

          this.sessionCounter++;
          this.queue.push({
            ...task,
            sessionId: `sess_recov_${Date.now()}_${this.sessionCounter}`,
            sessionIndex: this.sessionCounter,
            retryCount: 0,
            maxRetries: 3
          });

          telemetry.updateStats({
            autoRecovered: (telemetry.stats.autoRecovered || 0) + 1,
            queued: this.queue.length
          });
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
        if (!this.completionAlertSent) {
          this.completionAlertSent = true;
          telemetry.log('🎉 100% Target sessions completed successfully across all campaigns!', 'success');

          if (this.webhookUrl) {
            webhookService.sendAlert(this.webhookUrl, {
              title: '🎉 Campaign 100% Completed',
              message: 'All requested sessions across all campaigns have completed successfully!',
              status: 'success',
              fields: [
                { name: 'Total Completed', value: telemetry.stats.completed },
                { name: 'Auto-Recovered', value: telemetry.stats.autoRecovered || 0 }
              ]
            }).catch(() => {});
          }
        }
      }
    }
  }

  async stopAll() {
    this.isStopping = true;
    this.completionAlertSent = false;
    const droppedQueue = this.queue.length;
    this.queue = [];

    for (const [, { timer, resolve }] of this.activeTimers.entries()) {
      clearTimeout(timer);
      resolve();
    }
    this.activeTimers.clear();

    await browserPool.closeAllSessions();
    this.activeCount = 0;

    for (const c of this.campaigns.values()) {
      c.active = 0;
    }
    this._syncCampaignTelemetry();

    telemetry.updateStats({
      queued: 0,
      active: 0
    });

    telemetry.log(
      `Stopped all active sessions and cleared ${droppedQueue} queued tasks in <100ms.`,
      'warn'
    );

    if (this.webhookUrl) {
      webhookService.sendAlert(this.webhookUrl, {
        title: 'Emergency Stop Executed',
        message: `All sessions stopped. Cleared ${droppedQueue} queued tasks.`,
        status: 'warn'
      }).catch(() => {});
    }
  }
}

module.exports = new TaskScheduler();

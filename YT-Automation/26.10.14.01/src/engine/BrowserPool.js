const puppeteer = require('puppeteer');
const { DEFAULT_CLUSTER_SIZE, TURBO_CHROME_FLAGS } = require('../config/constants');
const telemetry = require('../services/TelemetryService');
const ProxyManager = require('./ProxyManager');

class BrowserPool {
  constructor() {
    /** @type {import('puppeteer').Browser[]} */
    this.cluster = [];
    /** @type {Array<{context: import('puppeteer').BrowserContext, page: import('puppeteer').Page, browser: import('puppeteer').Browser}>} */
    this.hotStandbyPool = [];
    this.targetStandbySize = 10;
    this.activeContexts = new Map(); // sessionId -> { context, browser, isDedicatedBrowser }
    this.roundRobinIndex = 0;
    this.isWarming = false;
    this.isRefilling = false;
    this.proxyConfig = null;
  }

  /**
   * Sets or updates active Rotating Proxy configuration.
   * If proxy server changes, smoothly restarts cluster engines with the new proxy flag.
   */
  async setProxyConfig(proxyStr) {
    const newConfig = ProxyManager.parseProxy(proxyStr);
    const oldServer = this.proxyConfig ? this.proxyConfig.serverArg : null;
    const newServer = newConfig ? newConfig.serverArg : null;

    if (oldServer !== newServer) {
      this.proxyConfig = newConfig;
      if (this.cluster.length > 0) {
        telemetry.log(`🌐 Switching Cluster Proxy Gateway to: ${newServer || 'Direct Local IP'}`, 'info');
        await this.shutdownCluster();
        await this.warmUpCluster(DEFAULT_CLUSTER_SIZE);
      }
    } else {
      this.proxyConfig = newConfig;
    }
  }

  /**
   * Pre-warms the master Chromium cluster AND pre-allocates Hot-Standby isolated contexts
   * so user requests have 0ms - 2ms launch latency.
   */
  async warmUpCluster(size = DEFAULT_CLUSTER_SIZE) {
    if (this.isWarming) return;
    this.isWarming = true;

    try {
      const needed = size - this.cluster.length;
      if (needed > 0) {
        const proxyInfo = this.proxyConfig ? ` [Via Gateway: ${this.proxyConfig.serverArg}]` : '';
        telemetry.log(`Pre-warming ${needed} Turbo Chromium Cluster Engine(s)${proxyInfo}...`, 'info');

        const flags = [...TURBO_CHROME_FLAGS];
        if (this.proxyConfig && this.proxyConfig.serverArg) {
          flags.push(`--proxy-server=${this.proxyConfig.serverArg}`);
        }

        const promises = Array.from({ length: needed }).map(async () => {
          const browser = await puppeteer.launch({
            headless: 'new',
            args: flags
          });

          browser.on('disconnected', () => {
            this.cluster = this.cluster.filter((b) => b !== browser);
            telemetry.updateStats({ clusterEnginesReady: this.cluster.length });
          });

          this.cluster.push(browser);
          telemetry.updateStats({
            clusterEnginesReady: this.cluster.length,
            clusterMode: 'TURBO_READY'
          });
          return browser;
        });

        await Promise.all(promises);
      }

      await this._refillStandbyPool();
      telemetry.log(
        `Cluster Ready: ${this.cluster.length} Master Engines + ${this.hotStandbyPool.length} Hot-Standby Contexts online (0ms Launch!).`,
        'success'
      );
    } catch (err) {
      telemetry.log(`Cluster warmup error: ${err.message}`, 'error');
    } finally {
      this.isWarming = false;
    }
  }

  async _createIsolatedContextUnit() {
    if (this.cluster.length === 0) return null;
    const masterBrowser = this.cluster[this.roundRobinIndex % this.cluster.length];
    this.roundRobinIndex++;
    const context = await masterBrowser.createBrowserContext();
    const page = await context.newPage();
    return { context, page, browser: masterBrowser };
  }

  async _refillStandbyPool() {
    if (this.isRefilling || this.cluster.length === 0) return;
    this.isRefilling = true;
    try {
      const deficit = this.targetStandbySize - this.hotStandbyPool.length;
      if (deficit > 0) {
        const units = await Promise.all(
          Array.from({ length: deficit }).map(() => this._createIsolatedContextUnit().catch(() => null))
        );
        for (const u of units) {
          if (u) this.hotStandbyPool.push(u);
        }
      }
    } finally {
      this.isRefilling = false;
    }
  }

  /**
   * Acquires an isolated browser session with dynamic proxy authentication.
   * - In background/scalable mode (headless=true): Grabs a pre-allocated Hot-Standby context in ~1ms.
   * - In visual window mode (headless=false): Opens visible tiled browser windows on screen.
   */
  async acquireSession(sessionId, { headless = true, sessionIndex = 0, proxy = null } = {}) {
    const startTime = Date.now();
    const sessionProxy = proxy ? ProxyManager.parseProxy(proxy) : this.proxyConfig;

    // Check if session needs a dedicated browser because its proxy differs from the cluster
    const clusterProxyArg = this.proxyConfig ? this.proxyConfig.serverArg : null;
    const sessionProxyArg = sessionProxy ? sessionProxy.serverArg : null;
    const needsDedicatedInstance = (!headless) || (sessionProxyArg !== clusterProxyArg);

    if (headless && !needsDedicatedInstance) {
      if (this.cluster.length === 0) {
        await this.warmUpCluster(DEFAULT_CLUSTER_SIZE);
      }

      let unit = this.hotStandbyPool.shift();
      if (unit) {
        setImmediate(() => this._refillStandbyPool());
      } else {
        unit = await this._createIsolatedContextUnit();
      }

      // Resilient fallback: If cluster engines crashed or disconnected, re-warm and retry
      if (!unit || !unit.context || !unit.page) {
        await this.warmUpCluster(DEFAULT_CLUSTER_SIZE);
        unit = this.hotStandbyPool.shift() || (await this._createIsolatedContextUnit());
      }

      if (!unit || !unit.page) {
        throw new Error('Chromium cluster unavailable. Re-initializing engine...');
      }

      // Dynamic Proxy Authentication with Session IP Rotation
      if (sessionProxy && sessionProxy.hasAuth) {
        const auth = ProxyManager.getSessionAuth(sessionProxy, sessionId);
        if (auth) {
          await unit.page.authenticate({
            username: auth.username,
            password: auth.password
          });
        }
      }

      const spawnMs = Math.max(1, Date.now() - startTime);
      telemetry.recordSpawnTime(spawnMs);

      this.activeContexts.set(sessionId, {
        context: unit.context,
        browser: unit.browser,
        isDedicatedBrowser: false
      });

      return { page: unit.page, spawnMs, proxyGateway: sessionProxyArg };
    } else {
      // Dedicated Browser Instance (Visible Window Mode OR Custom Dedicated Proxy)
      const flags = [...TURBO_CHROME_FLAGS];
      if (sessionProxyArg) {
        flags.push(`--proxy-server=${sessionProxyArg}`);
      }

      if (!headless) {
        const col = (sessionIndex - 1) % 3;
        const row = Math.floor((sessionIndex - 1) / 3) % 2;
        const posX = col * 520 + 20;
        const posY = row * 420 + 20;
        flags.push('--window-size=520,420', `--window-position=${posX},${posY}`);
      }

      const browser = await puppeteer.launch({
        headless: headless ? 'new' : false,
        defaultViewport: headless ? { width: 854, height: 480 } : null,
        args: flags
      });

      const pages = await browser.pages();
      const page = pages[0] || (await browser.newPage());

      // Dynamic Proxy Authentication with Session IP Rotation
      if (sessionProxy && sessionProxy.hasAuth) {
        const auth = ProxyManager.getSessionAuth(sessionProxy, sessionId);
        if (auth) {
          await page.authenticate({
            username: auth.username,
            password: auth.password
          });
        }
      }

      const spawnMs = Date.now() - startTime;
      telemetry.recordSpawnTime(spawnMs);

      this.activeContexts.set(sessionId, {
        context: null,
        browser,
        isDedicatedBrowser: true
      });

      return { page, spawnMs, proxyGateway: sessionProxyArg };
    }
  }

  /**
   * Releases a single session cleanly without affecting other sessions.
   */
  async releaseSession(sessionId) {
    const entry = this.activeContexts.get(sessionId);
    if (!entry) return;
    this.activeContexts.delete(sessionId);

    try {
      if (entry.isDedicatedBrowser && entry.browser) {
        await entry.browser.close();
      } else if (entry.context) {
        await entry.context.close();
      }
    } catch (_) {}
  }

  /**
   * Immediately closes all active sessions and resets pool.
   */
  async closeAllSessions() {
    const entries = Array.from(this.activeContexts.keys());
    await Promise.allSettled(entries.map((id) => this.releaseSession(id)));
    this.activeContexts.clear();
  }

  /**
   * Gracefully closes all pre-warmed cluster browsers on CLI exit so taskkill errors never appear.
   */
  async shutdownCluster() {
    await this.closeAllSessions();
    for (const u of this.hotStandbyPool) {
      try {
        await u.context.close();
      } catch (_) {}
    }
    this.hotStandbyPool = [];

    const browsers = [...this.cluster];
    this.cluster = [];
    await Promise.allSettled(
      browsers.map(async (b) => {
        try {
          await b.close();
        } catch (_) {}
      })
    );
  }
}

module.exports = new BrowserPool();

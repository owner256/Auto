const os = require('os');

class TelemetryService {
  constructor() {
    this.clients = new Set();
    this.logs = [];
    this.stats = {
      queued: 0,
      active: 0,
      completed: 0,
      failed: 0,
      retrying: 0,
      autoRecovered: 0,
      totalRequested: 0,
      avgSpawnMs: 0,
      clusterEnginesReady: 0,
      clusterMode: 'IDLE',
      cpuUsagePercent: 0,
      ramUsedGB: 0,
      ramFreeGB: 0,
      ramTotalGB: Number((os.totalmem() / (1024 ** 3)).toFixed(1))
    };

    this._spawnTimes = [];
    this._lastCpuInfo = os.cpus();
    this._startSystemMonitor();
  }

  _calculateCpuPercent() {
    const currentCpus = os.cpus();
    let idleDiff = 0;
    let totalDiff = 0;

    for (let i = 0; i < currentCpus.length; i++) {
      const prev = this._lastCpuInfo[i].times;
      const curr = currentCpus[i].times;

      const prevTotal = prev.user + prev.nice + prev.sys + prev.idle + prev.irq;
      const currTotal = curr.user + curr.nice + curr.sys + curr.idle + curr.irq;

      idleDiff += curr.idle - prev.idle;
      totalDiff += currTotal - prevTotal;
    }

    this._lastCpuInfo = currentCpus;
    if (totalDiff === 0) return 0;
    return Math.min(100, Math.max(0, Math.round(100 - (100 * idleDiff) / totalDiff)));
  }

  _startSystemMonitor() {
    setInterval(() => {
      const freeMem = os.freemem();
      const totalMem = os.totalmem();
      this.stats.cpuUsagePercent = this._calculateCpuPercent();
      this.stats.ramFreeGB = Number((freeMem / (1024 ** 3)).toFixed(2));
      this.stats.ramUsedGB = Number(((totalMem - freeMem) / (1024 ** 3)).toFixed(2));
      this.broadcast();
    }, 1000);
  }

  recordSpawnTime(ms) {
    this._spawnTimes.push(ms);
    if (this._spawnTimes.length > 100) this._spawnTimes.shift();
    const sum = this._spawnTimes.reduce((a, b) => a + b, 0);
    this.stats.avgSpawnMs = Math.round(sum / this._spawnTimes.length);
  }

  updateStats(partial) {
    Object.assign(this.stats, partial);
    this.broadcast();
  }

  log(message, level = 'info') {
    const entry = {
      id: Date.now() + Math.random().toString(36).slice(2, 6),
      time: new Date().toLocaleTimeString(),
      message,
      level
    };
    this.logs.unshift(entry);
    if (this.logs.length > 80) this.logs.pop();
    console.log(`[${entry.time}] [${level.toUpperCase()}] ${message}`);
    this.broadcast({ newLog: entry });
  }

  addClient(res) {
    this.clients.add(res);
    res.write(`data: ${JSON.stringify({ stats: this.stats, logs: this.logs.slice(0, 30) })}\n\n`);
    res.on('close', () => {
      this.clients.delete(res);
    });
  }

  broadcast(extra = {}) {
    if (this.clients.size === 0) return;
    const payload = `data: ${JSON.stringify({ stats: this.stats, ...extra })}\n\n`;
    for (const client of this.clients) {
      try {
        client.write(payload);
      } catch (_) {
        this.clients.delete(client);
      }
    }
  }
}

module.exports = new TelemetryService();


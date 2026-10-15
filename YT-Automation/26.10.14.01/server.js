const express = require('express');
const cors = require('cors');
const path = require('path');
const browserPool = require('./src/engine/BrowserPool');
const taskScheduler = require('./src/engine/TaskScheduler');
const telemetry = require('./src/services/TelemetryService');
const auditLogger = require('./src/services/AuditLogger');
const webhookService = require('./src/services/WebhookService');
const ProxyManager = require('./src/engine/ProxyManager');
const { DEFAULT_CLUSTER_SIZE, DEFAULT_MAX_CONCURRENCY, CPU_CORES, TOTAL_RAM_GB } = require('./src/config/constants');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// 1. Real-Time Server-Sent Events (SSE) Telemetry Stream (0 polling lag)
app.get('/api/telemetry', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();
  telemetry.addClient(res);
});

// 2. Hardware & Engine Status Endpoint
app.get('/api/system-info', (req, res) => {
  res.json({
    cpuCores: CPU_CORES,
    totalRamGB: TOTAL_RAM_GB,
    defaultClusterSize: DEFAULT_CLUSTER_SIZE,
    defaultMaxConcurrency: DEFAULT_MAX_CONCURRENCY,
    stats: telemetry.stats
  });
});

// 3. Rotating Proxy Connectivity & Latency Probe
app.post('/api/proxy/test', async (req, res) => {
  const { proxy } = req.body;
  if (!proxy) {
    return res.status(400).json({ ok: false, error: 'Proxy address required (e.g. http://user:pass@host:port)' });
  }
  const result = await ProxyManager.testProxy(proxy);
  res.json(result);
});

// 4. Webhook Notification Test (Discord / Telegram)
app.post('/api/webhook/test', async (req, res) => {
  const { webhookUrl } = req.body;
  if (!webhookUrl) {
    return res.status(400).json({ ok: false, error: 'Webhook URL required' });
  }
  const result = await webhookService.sendAlert(webhookUrl, {
    title: 'YT Automation Webhook Test',
    message: 'Testing connection from YT Turbo Automation Engine. Alerts are working!',
    status: 'success',
    fields: [
      { name: 'Timestamp', value: new Date().toLocaleTimeString() },
      { name: 'Status', value: 'Connected' }
    ]
  });
  res.json(result);
});

// 5. CSV Audit Report Download
app.get('/api/export/csv', (req, res) => {
  const csvData = auditLogger.toCSV();
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename=yt-audit-report-${Date.now()}.csv`);
  res.send(csvData);
});

// 6. JSON Audit Report
app.get('/api/export/json', (req, res) => {
  res.json({
    success: true,
    totalRecords: auditLogger.getLogs().length,
    records: auditLogger.getLogs()
  });
});

// 7. Non-Blocking Single Video Dispatch API with Enterprise Features
app.post('/api/start', async (req, res) => {
  const {
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
  } = req.body;

  if (!url || (!url.includes('youtube.com') && !url.includes('youtu.be'))) {
    return res.status(400).json({
      success: false,
      message: 'Valid YouTube video URL enter karein!'
    });
  }

  try {
    const dispatchResult = await taskScheduler.dispatchBatch({
      url,
      count,
      duration,
      headless: Boolean(headless),
      turboMode: Boolean(turboMode),
      concurrency,
      proxy,
      jitter,
      humanEmulation,
      trafficSource,
      searchKeyword,
      dripFeed,
      dripInterval,
      webhookUrl
    });

    return res.json({
      success: true,
      message: `Instant Dispatched ${count} sessions! (Max Parallel: ${dispatchResult.maxConcurrency})`,
      ...dispatchResult
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// 8. Multi-Video Campaign Dispatch API with Enterprise Features
app.post('/api/campaign/start', async (req, res) => {
  const {
    videos,
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
  } = req.body;

  if (!Array.isArray(videos) || videos.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Kam se kam ek valid YouTube video provide karein!'
    });
  }

  try {
    const result = await taskScheduler.dispatchCampaignBatch({
      videos,
      concurrency,
      headless: Boolean(headless),
      turboMode: Boolean(turboMode),
      proxy,
      jitter,
      humanEmulation,
      trafficSource,
      searchKeyword,
      dripFeed,
      dripInterval,
      webhookUrl
    });

    return res.json({
      success: true,
      message: `Multi-Video Campaign Launched: ${result.campaignsCount} Videos | Total ${result.totalEnqueued} Views!`,
      ...result
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// 9. Get Active Campaigns
app.get('/api/campaigns', (req, res) => {
  res.json({
    success: true,
    campaigns: Array.from(taskScheduler.campaigns.values())
  });
});

// 10. Instant Emergency Stop & Queue Drain
app.post('/api/stop', async (req, res) => {
  await taskScheduler.stopAll();
  return res.json({
    success: true,
    message: 'All active browser contexts & queued sessions stopped immediately!'
  });
});

// Start HTTP Server & Pre-warm Chromium Cluster in background
app.listen(PORT, async () => {
  console.log(`\n=============================================================`);
  console.log(`🚀 YT TURBO AUTOMATION ENGINE RUNNING AT: http://localhost:${PORT}`);
  console.log(`💻 Hardware Detected: ${CPU_CORES} CPU Cores | ${TOTAL_RAM_GB} GB RAM`);
  console.log(`⚡ Auto-Tuned Cluster: ${DEFAULT_CLUSTER_SIZE} Master Engines | ${DEFAULT_MAX_CONCURRENCY} Max Parallel Contexts`);
  console.log(`🌐 Enterprise Features: Rotating Proxy Gateway, WebRTC Shield, Human Jitter, Search Emulation`);
  console.log(`=============================================================\n`);

  // Pre-warm cluster immediately so user's first click has 0ms cold-start latency
  await browserPool.warmUpCluster(DEFAULT_CLUSTER_SIZE);
});

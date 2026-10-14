const express = require('express');
const cors = require('cors');
const path = require('path');
const browserPool = require('./src/engine/BrowserPool');
const taskScheduler = require('./src/engine/TaskScheduler');
const telemetry = require('./src/services/TelemetryService');
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

// 3. Non-Blocking Instant Dispatch API (<2ms response time even for 1,000 browsers)
app.post('/api/start', (req, res) => {
  const {
    url,
    count = 5,
    duration = 60,
    headless = true,
    turboMode = true,
    concurrency = DEFAULT_MAX_CONCURRENCY
  } = req.body;

  if (!url || (!url.includes('youtube.com') && !url.includes('youtu.be'))) {
    return res.status(400).json({
      success: false,
      message: 'Valid YouTube video URL enter karein!'
    });
  }

  const dispatchResult = taskScheduler.dispatchBatch({
    url,
    count,
    duration,
    headless: Boolean(headless),
    turboMode: Boolean(turboMode),
    concurrency
  });

  return res.json({
    success: true,
    message: `Instant Dispatched ${count} sessions! (Max Parallel: ${dispatchResult.maxConcurrency})`,
    ...dispatchResult
  });
});

// 4. Instant Emergency Stop & Queue Drain
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
  console.log(`=============================================================\n`);

  // Pre-warm cluster immediately so user's first click has 0ms cold-start latency
  await browserPool.warmUpCluster(DEFAULT_CLUSTER_SIZE);
});

#!/usr/bin/env node
/**
 * High-Speed CLI Runner for YT Turbo Cluster Engine
 * Usage:
 *   node cli.js <youtube_url> [count=5] [duration=60] [concurrency=48] [--visible]
 * Example (Background Turbo Mode):
 *   node cli.js "https://youtu.be/LJBu5n8adiY" 5 60
 * Example (Visible Windows on Screen):
 *   node cli.js "https://youtu.be/LJBu5n8adiY" 5 60 48 --visible
 */

const browserPool = require('./src/engine/BrowserPool');
const taskScheduler = require('./src/engine/TaskScheduler');
const telemetry = require('./src/services/TelemetryService');
const { DEFAULT_CLUSTER_SIZE, DEFAULT_MAX_CONCURRENCY } = require('./src/config/constants');

async function runCli() {
  const rawArgs = process.argv.slice(2);
  const isVisible = rawArgs.includes('--visible') || rawArgs.includes('visible');
  const args = rawArgs.filter((a) => a !== '--visible' && a !== 'visible');

  const url = args[0];
  const count = parseInt(args[1] || '5', 10);
  const duration = parseInt(args[2] || '60', 10);
  const concurrency = parseInt(args[3] || String(DEFAULT_MAX_CONCURRENCY), 10);

  if (!url || (!url.includes('youtube.com') && !url.includes('youtu.be'))) {
    console.log('\nUsage: node cli.js <YouTube_URL> [Browser_Count=5] [Watch_Seconds=60] [Max_Parallel=48] [--visible]');
    console.log('Example (Background): node cli.js "https://youtu.be/LJBu5n8adiY" 5 60');
    console.log('Example (Visible Windows): node cli.js "https://youtu.be/LJBu5n8adiY" 5 60 48 --visible\n');
    process.exit(1);
  }

  if (!isVisible) {
    console.log(`\n⚡ Initializing Pre-Warmed Chromium Cluster (${DEFAULT_CLUSTER_SIZE} Engines)...`);
    await browserPool.warmUpCluster(DEFAULT_CLUSTER_SIZE);
  } else {
    console.log(`\n🖥️  Launching in VISIBLE MULTI-WINDOW MODE (${count} Windows on Screen)...`);
  }

  taskScheduler.dispatchBatch({
    url,
    count,
    duration,
    headless: !isVisible,
    turboMode: !isVisible, // Full visuals when visible, Turbo blocker when headless
    concurrency
  });

  // Monitor until queue and active sessions finish
  const checkInterval = setInterval(async () => {
    const { active, queued, completed, failed, retrying, autoRecovered, avgSpawnMs, ramUsedGB } = telemetry.stats;

    if (active === 0 && queued === 0 && completed >= count) {
      clearInterval(checkInterval);
      await browserPool.shutdownCluster();
      console.log(
        `\n=============================================================\n` +
        `✅ 100% TARGET COMPLETED! | Target: ${count}/${count} | Recovered: ${autoRecovered || 0} | Avg Spawn: ${avgSpawnMs}ms | RAM: ${ramUsedGB}GB\n` +
        `=============================================================\n`
      );
      process.exit(0);
    }
  }, 1000);
}

runCli();

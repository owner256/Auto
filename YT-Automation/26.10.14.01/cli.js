#!/usr/bin/env node
/**
 * High-Speed CLI Runner for YT Turbo Cluster Engine (Enterprise Edition)
 * Usage:
 *   1. Single Video (with Enterprise Flags):
 *      node cli.js <url> [count=5] [duration=60] [concurrency=48] [--proxy="http://user:pass@host:port"] [--source=search|referrer|direct] [--keyword="Search Query"] [--drip=5] [--webhook="..."] [--visible]
 *   2. Multi-Video Campaign (from JSON file):
 *      node cli.js --campaign=campaign.example.json [concurrency=48]
 *   3. Inline Multi-Video:
 *      node cli.js --multi "URL1:1000:60,URL2:2500:45,URL3:500:90" [--proxy="..."]
 */

const fs = require('fs');
const path = require('path');
const browserPool = require('./src/engine/BrowserPool');
const taskScheduler = require('./src/engine/TaskScheduler');
const telemetry = require('./src/services/TelemetryService');
const { DEFAULT_CLUSTER_SIZE, DEFAULT_MAX_CONCURRENCY } = require('./src/config/constants');

function getArgValue(args, prefix, defaultValue = null) {
  const match = args.find((a) => a.startsWith(`${prefix}=`));
  if (match) return match.slice(prefix.length + 1);
  const idx = args.indexOf(prefix);
  if (idx !== -1 && idx + 1 < args.length && !args[idx + 1].startsWith('--')) {
    return args[idx + 1];
  }
  return defaultValue;
}

async function runCli() {
  const rawArgs = process.argv.slice(2);
  const isVisible = rawArgs.includes('--visible') || rawArgs.includes('visible');
  const noJitter = rawArgs.includes('--no-jitter');
  const noHuman = rawArgs.includes('--no-human');

  const proxyArg = getArgValue(rawArgs, '--proxy');
  const sourceArg = getArgValue(rawArgs, '--source', 'direct');
  const keywordArg = getArgValue(rawArgs, '--keyword', '');
  const dripArg = getArgValue(rawArgs, '--drip', null);
  const webhookArg = getArgValue(rawArgs, '--webhook', null);

  const positionalArgs = rawArgs.filter(
    (a) =>
      !a.startsWith('--') &&
      a !== 'visible' &&
      !['--proxy', '--source', '--keyword', '--drip', '--webhook'].some((flag) => rawArgs[rawArgs.indexOf(flag) + 1] === a)
  );

  let videos = [];
  let concurrency = DEFAULT_MAX_CONCURRENCY;

  const campaignArg = rawArgs.find((a) => a.startsWith('--campaign=') || a === '--campaign');
  const multiArg = rawArgs.find((a) => a.startsWith('--multi=') || a === '--multi');

  if (campaignArg) {
    const filePath = campaignArg.includes('=') ? campaignArg.split('=')[1] : rawArgs[rawArgs.indexOf('--campaign') + 1];
    const resolvedPath = path.resolve(process.cwd(), filePath);
    if (!fs.existsSync(resolvedPath)) {
      console.error(`\n❌ Error: Campaign JSON file not found at: ${resolvedPath}\n`);
      process.exit(1);
    }
    videos = JSON.parse(fs.readFileSync(resolvedPath, 'utf8'));
  } else if (multiArg) {
    const rawMulti = multiArg.includes('=') ? multiArg.split('=')[1] : rawArgs[rawArgs.indexOf('--multi') + 1];
    const items = rawMulti.split(',');
    videos = items.map((item, idx) => {
      const parts = item.split(':');
      return {
        url: parts[0],
        count: parseInt(parts[1] || '5', 10),
        duration: parseInt(parts[2] || '60', 10),
        title: `Video #${idx + 1}`
      };
    });
  } else {
    const url = positionalArgs[0];
    const count = parseInt(positionalArgs[1] || '5', 10);
    const duration = parseInt(positionalArgs[2] || '60', 10);
    concurrency = parseInt(positionalArgs[3] || String(DEFAULT_MAX_CONCURRENCY), 10);

    if (!url || (!url.includes('youtube.com') && !url.includes('youtu.be'))) {
      console.log('\n=============================================================');
      console.log('🚀 YT Turbo Cluster Engine — Enterprise Multi-Mode CLI');
      console.log('=============================================================');
      console.log('Usage 1 (Single Video):');
      console.log('  node cli.js <YouTube_URL> [Count=5] [Duration=60] [Concurrency=48]');
      console.log('    [--proxy="http://user:pass@host:port"] [--source=direct|search|referrer]');
      console.log('    [--keyword="Search Query"] [--drip=3] [--webhook="URL"] [--visible]');
      console.log('\nUsage 2 (Multi-Video Campaign JSON):');
      console.log('  node cli.js --campaign=campaign.example.json');
      console.log('\nUsage 3 (Inline Multi-Video):');
      console.log('  node cli.js --multi "URL1:1000:60,URL2:2500:45,URL3:500:90" --proxy="..."');
      console.log('=============================================================\n');
      process.exit(1);
    }

    videos = [{ url, count, duration, title: 'Single Video' }];
  }

  const totalTargetCount = videos.reduce((sum, v) => sum + (parseInt(v.count, 10) || 5), 0);

  if (proxyArg) {
    console.log(`🌐 Configuring Proxy Gateway: ${proxyArg.replace(/:(.*?)@/, ':****@')}`);
    await browserPool.setProxyConfig(proxyArg);
  }

  if (!isVisible) {
    console.log(`\n⚡ Initializing Pre-Warmed Chromium Cluster (${DEFAULT_CLUSTER_SIZE} Engines)...`);
    await browserPool.warmUpCluster(DEFAULT_CLUSTER_SIZE);
  } else {
    console.log(`\n🖥️  Launching in VISIBLE MULTI-WINDOW MODE...`);
  }

  console.log(`\n📋 Launching Campaign with ${videos.length} Video(s) (Total ${totalTargetCount} Target Views)...`);
  videos.forEach((v, i) => {
    console.log(`   [Video #${i + 1}] Target: ${v.count} Views | Watch: ${v.duration}s | URL: ${v.url}`);
  });

  if (dripArg) console.log(`💧 Drip-Feed Mode: ${dripArg}s interval between spawns`);
  if (sourceArg !== 'direct') console.log(`🚦 Traffic Source: ${sourceArg.toUpperCase()}${keywordArg ? ` (Keyword: "${keywordArg}")` : ''}`);

  await taskScheduler.dispatchCampaignBatch({
    videos,
    concurrency,
    headless: !isVisible,
    turboMode: !isVisible,
    proxy: proxyArg,
    jitter: !noJitter,
    humanEmulation: !noHuman,
    trafficSource: sourceArg,
    searchKeyword: keywordArg,
    dripFeed: Boolean(dripArg),
    dripInterval: dripArg ? parseInt(dripArg, 10) : 3,
    webhookUrl: webhookArg
  });

  const checkInterval = setInterval(async () => {
    const { active, queued, completed, failed, retrying, autoRecovered, avgSpawnMs, ramUsedGB } = telemetry.stats;

    // Per-campaign progress output
    const campaignSummary = Array.from(taskScheduler.campaigns.values())
      .map((c, i) => `#${i + 1}: ${c.completed}/${c.target}`)
      .join(' | ');

    process.stdout.write(
      `\r[LIVE] Active: ${active} | Queued: ${queued} | Total: ${completed}/${totalTargetCount} | Recovered: ${autoRecovered || 0} | Videos [${campaignSummary}] | RAM: ${ramUsedGB}GB   `
    );

    if (active === 0 && queued === 0 && completed >= totalTargetCount) {
      clearInterval(checkInterval);
      await browserPool.shutdownCluster();
      console.log(
        `\n\n=============================================================\n` +
        `✅ 100% CAMPAIGN COMPLETED! | Target: ${totalTargetCount}/${totalTargetCount} | Videos: ${videos.length} | Recovered: ${autoRecovered || 0} | Avg Spawn: ${avgSpawnMs}ms | RAM: ${ramUsedGB}GB\n` +
        `=============================================================\n`
      );
      process.exit(0);
    }
  }, 1000);

  // Graceful SIGINT listener
  process.on('SIGINT', async () => {
    console.log('\n🛑 Stopping all sessions and shutting down cluster...');
    clearInterval(checkInterval);
    await taskScheduler.stopAll();
    await browserPool.shutdownCluster();
    process.exit(0);
  });
}

runCli();

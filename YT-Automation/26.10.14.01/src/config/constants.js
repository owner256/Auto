const os = require('os');

const CPU_CORES = os.cpus().length;
const TOTAL_RAM_GB = Math.round(os.totalmem() / (1024 ** 3));

// Auto-tune cluster size based on CPU cores and RAM (5 Master Engines for 100% parallel batches of 5)
const DEFAULT_CLUSTER_SIZE = 5;
const DEFAULT_MAX_CONCURRENCY = Math.min(CPU_CORES * 12, 50);

// Native C++ level ad & tracker blocker (0ms overhead, never blocks CDP network pipeline)
const NATIVE_AD_BLOCK_RULES = [
  'MAP *.doubleclick.net 127.0.0.1',
  'MAP *.googlesyndication.com 127.0.0.1',
  'MAP *.google-analytics.com 127.0.0.1',
  'MAP *.googleadservices.com 127.0.0.1',
  'MAP adservice.google.com 127.0.0.1'
].join(', ');

// Proven Windows-compatible Chromium flags for smooth video rendering & background playback
const TURBO_CHROME_FLAGS = [
  '--no-sandbox',
  '--disable-setuid-sandbox',
  '--mute-audio',
  '--autoplay-policy=no-user-gesture-required',
  '--disable-infobars',
  '--disable-notifications',
  '--disable-popup-blocking',
  '--disable-background-timer-throttling',
  '--disable-backgrounding-occluded-windows',
  '--disable-renderer-backgrounding',
  '--disable-sync',
  '--no-first-run',
  '--no-default-browser-check',
  // WebRTC IP leak prevention
  '--disable-webrtc',
  '--enforce-webrtc-ip-permission-check',
  '--disable-features=WebRtcHideLocalIpsWithMdns',
  `--host-resolver-rules=${NATIVE_AD_BLOCK_RULES}`
];

// Diverse User-Agent rotation pool
const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36 Edg/130.0.0.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36'
];

// Diverse organic traffic referrers
const TRAFFIC_REFERRERS = [
  'https://www.google.com/',
  'https://t.co/',
  'https://www.reddit.com/r/videos/',
  'https://l.facebook.com/',
  'https://www.linkedin.com/',
  'https://www.youtube.com/'
];

module.exports = {
  CPU_CORES,
  TOTAL_RAM_GB,
  DEFAULT_CLUSTER_SIZE,
  DEFAULT_MAX_CONCURRENCY,
  TURBO_CHROME_FLAGS,
  USER_AGENTS,
  TRAFFIC_REFERRERS
};


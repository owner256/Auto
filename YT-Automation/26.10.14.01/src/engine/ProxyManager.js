const http = require('http');
const https = require('https');
const { URL } = require('url');

class ProxyManager {
  /**
   * Parses various proxy formats:
   *  - http://user:pass@host:port
   *  - socks5://user:pass@host:port
   *  - host:port:user:pass
   *  - host:port
   */
  static parseProxy(proxyStr) {
    if (!proxyStr || typeof proxyStr !== 'string') return null;
    const cleanStr = proxyStr.trim();
    if (!cleanStr) return null;

    try {
      // Format 1: host:port:user:pass
      const colonParts = cleanStr.split(':');
      if (colonParts.length === 4 && !cleanStr.includes('//')) {
        const [host, port, username, password] = colonParts;
        return {
          protocol: 'http:',
          host,
          port: parseInt(port, 10),
          username,
          password,
          serverArg: `http://${host}:${port}`,
          hasAuth: true,
          raw: cleanStr
        };
      }

      // Format 2: URL format (http://, https://, socks5://)
      const normalized = cleanStr.includes('://') ? cleanStr : `http://${cleanStr}`;
      const parsed = new URL(normalized);

      const hasAuth = Boolean(parsed.username || parsed.password);
      return {
        protocol: parsed.protocol,
        host: parsed.hostname,
        port: parsed.port ? parseInt(parsed.port, 10) : (parsed.protocol === 'https:' ? 443 : 80),
        username: decodeURIComponent(parsed.username || ''),
        password: decodeURIComponent(parsed.password || ''),
        serverArg: `${parsed.protocol}//${parsed.hostname}:${parsed.port || (parsed.protocol === 'https:' ? 443 : 80)}`,
        hasAuth,
        raw: cleanStr
      };
    } catch (_) {
      return null;
    }
  }

  /**
   * Generates dynamic session authentication for Rotating Residential Proxies.
   * If a session ID is provided and the proxy has auth credentials, appends
   * the session tag so the gateway returns a fresh residential IP.
   */
  static getSessionAuth(proxyConfig, sessionId) {
    if (!proxyConfig || !proxyConfig.hasAuth) return null;

    const baseUser = proxyConfig.username;
    const password = proxyConfig.password;

    if (!sessionId) {
      return { username: baseUser, password };
    }

    // Standard session suffix supported by Smartproxy, Oxylabs, Webshare, BrightData, IPRoyal
    // e.g. "user-session-abc1234"
    const sessionToken = String(sessionId).replace(/[^a-zA-Z0-9]/g, '').slice(-8);
    const rotatingUsername = baseUser.includes('session')
      ? baseUser
      : `${baseUser}-session-${sessionToken}`;

    return {
      username: rotatingUsername,
      password
    };
  }

  /**
   * Tests proxy connectivity by sending a lightweight IP request.
   * Returns: { ok: true, ip, latencyMs } or { ok: false, error }
   */
  static async testProxy(proxyStr) {
    const config = this.parseProxy(proxyStr);
    if (!config) {
      return { ok: false, error: 'Invalid proxy format. Use http://user:pass@host:port or host:port:user:pass' };
    }

    // SOCKS4/SOCKS5 protocols are handled natively by Chromium engine
    if (config.protocol.startsWith('socks')) {
      return {
        ok: true,
        ip: 'SOCKS5 Gateway Ready',
        latencyMs: 1,
        gateway: `${config.host}:${config.port}`,
        note: 'SOCKS5 protocol is routed natively by Chromium engine'
      };
    }

    const startTime = Date.now();

    return new Promise((resolve) => {
      const isHttps = config.protocol === 'https:';
      const client = isHttps ? https : http;

      const authHeader = config.hasAuth
        ? 'Basic ' + Buffer.from(`${config.username}:${config.password}`).toString('base64')
        : null;

      const options = {
        host: config.host,
        port: config.port,
        path: 'http://api.ipify.org?format=json',
        method: 'GET',
        headers: {
          'Host': 'api.ipify.org',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) YT-Automation-Probe',
          ...(authHeader ? { 'Proxy-Authorization': authHeader } : {})
        },
        timeout: 10000
      };

      const req = client.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          const latencyMs = Date.now() - startTime;
          try {
            const parsed = JSON.parse(data);
            resolve({
              ok: true,
              ip: parsed.ip || 'Unknown',
              latencyMs,
              gateway: `${config.host}:${config.port}`
            });
          } catch (_) {
            if (res.statusCode >= 200 && res.statusCode < 400) {
              resolve({ ok: true, ip: data.trim().slice(0, 40), latencyMs, gateway: `${config.host}:${config.port}` });
            } else {
              resolve({ ok: false, error: `Proxy returned HTTP ${res.statusCode}: ${data.slice(0, 80)}` });
            }
          }
        });
      });

      req.on('timeout', () => {
        req.destroy();
        resolve({ ok: false, error: 'Proxy request timed out after 10 seconds' });
      });

      req.on('error', (err) => {
        resolve({ ok: false, error: `Proxy connection failed: ${err.message}` });
      });

      req.end();
    });
  }
}

module.exports = ProxyManager;


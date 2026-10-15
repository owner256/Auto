const https = require('https');
const http = require('http');
const { URL } = require('url');

class WebhookService {
  /**
   * Sends an alert notification to Discord Webhook or Telegram Bot.
   */
  static async sendAlert(webhookUrl, { title, message, status = 'info', fields = [] } = {}) {
    if (!webhookUrl || typeof webhookUrl !== 'string' || !webhookUrl.startsWith('http')) {
      return { ok: false, error: 'No valid webhook URL provided' };
    }

    try {
      const parsedUrl = new URL(webhookUrl.trim());

      // 1. Telegram Bot webhook handler
      // e.g. https://api.telegram.org/bot<TOKEN>/sendMessage?chat_id=<CHAT_ID>
      if (parsedUrl.hostname.includes('telegram.org')) {
        return this._sendTelegram(parsedUrl, { title, message, status, fields });
      }

      // 2. Discord Webhook handler
      // e.g. https://discord.com/api/webhooks/...
      if (parsedUrl.hostname.includes('discord.com')) {
        return this._sendDiscord(parsedUrl, { title, message, status, fields });
      }

      // 3. Generic JSON Webhook handler (Slack, Custom API)
      return this._sendGeneric(parsedUrl, { title, message, status, fields });
    } catch (err) {
      return { ok: false, error: err.message };
    }
  }

  static _sendDiscord(urlObj, { title, message, status, fields }) {
    const colorMap = {
      info: 3447003,    // Blue
      success: 5763719, // Green
      warn: 16705372,   // Amber
      error: 15548997   // Red
    };

    const payload = JSON.stringify({
      username: 'YT Turbo Engine',
      avatar_url: 'https://cdn-icons-png.flaticon.com/512/1384/1384060.png',
      embeds: [
        {
          title: `🚀 ${title || 'Automation Notification'}`,
          description: message || '',
          color: colorMap[status] || colorMap.info,
          fields: fields.map((f) => ({ name: f.name, value: String(f.value), inline: true })),
          footer: { text: `YT Engine v26.10.14.01 • ${new Date().toLocaleTimeString()}` }
        }
      ]
    });

    return this._postJson(urlObj, payload);
  }

  static _sendTelegram(urlObj, { title, message, status, fields }) {
    const iconMap = { info: 'ℹ️', success: '✅', warn: '⚠️', error: '🚨' };
    let text = `${iconMap[status] || '🚀'} *${title || 'YT Automation'}*\n\n${message || ''}\n`;

    if (fields && fields.length > 0) {
      text += '\n' + fields.map((f) => `• *${f.name}:* \`${f.value}\``).join('\n');
    }

    const chatId = urlObj.searchParams.get('chat_id');
    const endpoint = new URL(urlObj.origin + urlObj.pathname);

    const payload = JSON.stringify({
      chat_id: chatId,
      text: text,
      parse_mode: 'Markdown'
    });

    return this._postJson(endpoint, payload);
  }

  static _sendGeneric(urlObj, payloadObj) {
    return this._postJson(urlObj, JSON.stringify(payloadObj));
  }

  static _postJson(urlObj, jsonString) {
    return new Promise((resolve) => {
      const client = urlObj.protocol === 'https:' ? https : http;
      const options = {
        hostname: urlObj.hostname,
        port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
        path: urlObj.pathname + urlObj.search,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(jsonString),
          'User-Agent': 'YT-Automation-Engine'
        },
        timeout: 8000
      };

      const req = client.request(options, (res) => {
        let respData = '';
        res.on('data', (c) => { respData += c; });
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve({ ok: true, statusCode: res.statusCode });
          } else {
            resolve({ ok: false, error: `HTTP ${res.statusCode}: ${respData.slice(0, 100)}` });
          }
        });
      });

      req.on('timeout', () => {
        req.destroy();
        resolve({ ok: false, error: 'Webhook request timed out' });
      });

      req.on('error', (err) => {
        resolve({ ok: false, error: err.message });
      });

      req.write(jsonString);
      req.end();
    });
  }
}

module.exports = WebhookService;


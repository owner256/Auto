const fs = require('fs');
const path = require('path');

class AuditLogger {
  constructor() {
    this.logs = [];
    this.maxLogs = 5000;
  }

  record(entry) {
    const record = {
      id: `aud_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toISOString(),
      campaignId: entry.campaignId || 'single',
      sessionIndex: entry.sessionIndex || 0,
      videoUrl: entry.videoUrl || '',
      title: (entry.title || 'YouTube Video').replace(/[\r\n,"]/g, ' '),
      targetDuration: entry.targetDuration || 0,
      actualDuration: entry.actualDuration || 0,
      trafficSource: entry.trafficSource || 'direct',
      proxyUsed: entry.proxyUsed ? entry.proxyUsed.replace(/[\r\n,"]/g, '') : 'Local IP',
      status: entry.status || 'COMPLETED',
      error: entry.error ? String(entry.error).replace(/[\r\n,"]/g, ' ') : ''
    };

    this.logs.unshift(record);
    if (this.logs.length > this.maxLogs) {
      this.logs.pop();
    }
    return record;
  }

  getLogs() {
    return this.logs;
  }

  clear() {
    this.logs = [];
  }

  toCSV() {
    const headers = [
      'Timestamp',
      'Campaign_ID',
      'Session_Index',
      'Video_Title',
      'Video_URL',
      'Target_Duration_Sec',
      'Actual_Watch_Sec',
      'Traffic_Source',
      'Proxy_Gateway',
      'Status',
      'Error_Details'
    ];

    const rows = this.logs.map((item) => {
      return [
        `"${item.timestamp}"`,
        `"${item.campaignId}"`,
        item.sessionIndex,
        `"${item.title}"`,
        `"${item.videoUrl}"`,
        item.targetDuration,
        item.actualDuration,
        `"${item.trafficSource}"`,
        `"${item.proxyUsed}"`,
        `"${item.status}"`,
        `"${item.error}"`
      ].join(',');
    });

    return [headers.join(','), ...rows].join('\r\n');
  }

  toJSON() {
    return JSON.stringify(this.logs, null, 2);
  }
}

module.exports = new AuditLogger();


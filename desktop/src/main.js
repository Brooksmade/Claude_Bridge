// Bridge to Fig Desktop — Status UI

const HEALTH_URL = 'http://localhost:4001/health';
const POLL_INTERVAL = 2000;
const MAX_LOG_ENTRIES = 10;

// State
let lastHealthData = null;
let logEntries = [];
let previousPending = 0;

// DOM elements
const serverDot = document.getElementById('server-dot');
const serverText = document.getElementById('server-text');
const pluginDot = document.getElementById('plugin-dot');
const pluginText = document.getElementById('plugin-text');
const portValue = document.getElementById('port-value');
const serverVersion = document.getElementById('server-version');
const protocolVersion = document.getElementById('protocol-version');
const pendingCommands = document.getElementById('pending-commands');
const logEntriesEl = document.getElementById('log-entries');
const btnClearLog = document.getElementById('btn-clear-log');
const btnCheckUpdate = document.getElementById('btn-check-update');
const updateStatus = document.getElementById('update-status');

// Update server status indicators
function setServerStatus(status) {
  serverDot.className = 'status-dot ' + status;
  if (status === 'running') {
    serverText.textContent = 'Running';
  } else if (status === 'stopped') {
    serverText.textContent = 'Stopped';
  } else {
    serverText.textContent = 'Checking...';
  }
}

// Update plugin status indicators
function setPluginStatus(status) {
  pluginDot.className = 'status-dot ' + status;
  if (status === 'connected') {
    pluginText.textContent = 'Connected';
  } else if (status === 'waiting') {
    pluginText.textContent = 'Waiting for Plugin';
  } else {
    pluginText.textContent = '--';
  }
}

// Add a log entry
function addLogEntry(message, type) {
  const now = new Date();
  const time = now.toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  logEntries.unshift({ time, message, type });

  // Keep only the most recent entries
  if (logEntries.length > MAX_LOG_ENTRIES) {
    logEntries = logEntries.slice(0, MAX_LOG_ENTRIES);
  }

  renderLog();
}

// Render log entries
function renderLog() {
  if (logEntries.length === 0) {
    logEntriesEl.innerHTML = '<div class="log-empty">No activity yet</div>';
    return;
  }

  logEntriesEl.innerHTML = logEntries
    .map(
      (entry) =>
        `<div class="log-entry">
          <span class="log-time">${entry.time}</span>
          <span class="log-message ${entry.type || ''}">${escapeHtml(entry.message)}</span>
        </div>`
    )
    .join('');
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Poll health endpoint
async function pollHealth() {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);

    const response = await fetch(HEALTH_URL, { signal: controller.signal });
    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    lastHealthData = data;

    // Update server status
    setServerStatus('running');

    // Update plugin status based on long-poll tracking
    if (data.pluginConnected) {
      setPluginStatus('connected');
    } else {
      setPluginStatus('waiting');
    }

    // Update info
    serverVersion.textContent = data.serverVersion || '--';
    protocolVersion.textContent = data.protocolVersion != null ? `v${data.protocolVersion}` : '--';
    pendingCommands.textContent = data.pendingCommands != null ? data.pendingCommands : '--';
    portValue.textContent = '4001';

    // Log pending command changes
    if (data.pendingCommands > previousPending) {
      addLogEntry(`Command queued (${data.pendingCommands} pending)`, 'success');
    }
    previousPending = data.pendingCommands || 0;

    // Check for update info from server
    if (data.latestRelease) {
      updateStatus.innerHTML = `Update available: <a href="${escapeHtml(data.latestRelease.url)}" target="_blank">v${escapeHtml(data.latestRelease.version)}</a>`;
      updateStatus.className = 'update-status available';
    }
  } catch (err) {
    setServerStatus('stopped');
    setPluginStatus('');
    serverVersion.textContent = '--';
    protocolVersion.textContent = '--';
    pendingCommands.textContent = '--';

    if (lastHealthData !== null) {
      addLogEntry('Server connection lost', 'error');
      lastHealthData = null;
    }
  }
}

// Clear log button
btnClearLog.addEventListener('click', () => {
  logEntries = [];
  renderLog();
});

// Check for updates button
btnCheckUpdate.addEventListener('click', async () => {
  updateStatus.textContent = 'Checking...';
  updateStatus.className = 'update-status';

  try {
    // Try to use Tauri updater if available
    if (window.__TAURI__) {
      const { check } = window.__TAURI__.updater;
      const update = await check();
      if (update) {
        updateStatus.innerHTML = `Update available: v${update.version}`;
        updateStatus.className = 'update-status available';
        addLogEntry(`Update available: v${update.version}`, 'success');
      } else {
        updateStatus.textContent = 'You are on the latest version';
        setTimeout(() => {
          updateStatus.textContent = '';
        }, 5000);
      }
    } else {
      // Fallback: check via server health
      if (lastHealthData && lastHealthData.latestRelease) {
        updateStatus.innerHTML = `Update available: <a href="${escapeHtml(lastHealthData.latestRelease.url)}" target="_blank">v${escapeHtml(lastHealthData.latestRelease.version)}</a>`;
        updateStatus.className = 'update-status available';
      } else {
        updateStatus.textContent = 'You are on the latest version';
        setTimeout(() => {
          updateStatus.textContent = '';
        }, 5000);
      }
    }
  } catch (err) {
    updateStatus.textContent = 'Failed to check for updates';
    setTimeout(() => {
      updateStatus.textContent = '';
    }, 5000);
  }
});

// Start polling
addLogEntry('Bridge to Fig desktop started', 'success');
pollHealth();
setInterval(pollHealth, POLL_INTERVAL);

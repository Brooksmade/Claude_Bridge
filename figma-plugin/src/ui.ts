// UI state
let commandCount = 0;
let errorCount = 0;
let currentCommandId: string | null = null;
let currentCommandStartTime: number | null = null;
let showErrorsOnly = false;

// DOM elements
const statusIndicator = document.getElementById('statusIndicator') as HTMLElement;
const statusText = document.getElementById('statusText') as HTMLElement;
const commandCountEl = document.getElementById('commandCount') as HTMLElement;
const errorCountEl = document.getElementById('errorCount') as HTMLElement;
const logEntriesEl = document.getElementById('logEntries') as HTMLElement;
const currentCommandEl = document.getElementById('currentCommand') as HTMLElement;
const currentCommandTitleEl = document.getElementById('currentCommandTitle') as HTMLElement;
const currentCommandTypeEl = document.getElementById('currentCommandType') as HTMLElement;
const pendingCloseNoticeEl = document.getElementById('pendingCloseNotice') as HTMLElement;
const errorStatEl = document.getElementById('errorStat') as HTMLElement;
const versionBannerEl = document.getElementById('versionBanner') as HTMLElement;
const versionBannerMessageEl = document.getElementById('versionBannerMessage') as HTMLElement;
const versionBannerDismissEl = document.getElementById('versionBannerDismiss') as HTMLElement;
const downloadBtnEl = document.getElementById('downloadBtn') as HTMLElement;

function formatTime(): string {
  return new Date().toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

function addLog(message: string, type: 'info' | 'success' | 'error' = 'info'): void {
  const entry = document.createElement('div');
  // Detect "Executing:" messages and style them as 'executing'
  const cssType = (type === 'info' && message.startsWith('Executing:')) ? 'executing' : type;
  entry.className = `log-entry ${cssType}`;
  entry.innerHTML = `<span class="log-time">${formatTime()}</span>${message}`;

  logEntriesEl.appendChild(entry);
  logEntriesEl.scrollTop = logEntriesEl.scrollHeight;
}

function updateStatus(connected: boolean): void {
  if (connected) {
    statusIndicator.className = 'status-indicator connected';
    statusText.textContent = 'Connected';
    downloadBtnEl.style.display = 'none';
  } else {
    statusIndicator.className = 'status-indicator disconnected';
    statusText.textContent = 'Disconnected';
    downloadBtnEl.style.display = '';
  }
}

function updateStats(): void {
  commandCountEl.textContent = commandCount.toString();
  errorCountEl.textContent = errorCount.toString();
}

function showCurrentCommand(commandType: string, commandId: string): void {
  currentCommandId = commandId;
  currentCommandStartTime = Date.now();
  currentCommandTitleEl.textContent = 'Running';
  currentCommandTypeEl.textContent = commandType;
  currentCommandEl.classList.add('active');
}

function hideCurrentCommand(showDuration: boolean = false): void {
  if (showDuration && currentCommandStartTime !== null) {
    currentCommandTitleEl.textContent = 'Completed';
    // Keep visible briefly then reset
    setTimeout(() => {
      currentCommandEl.classList.remove('active');
      currentCommandTitleEl.textContent = 'Ready';
      currentCommandTypeEl.textContent = 'Waiting for commands...';
    }, 2000);
  } else {
    currentCommandEl.classList.remove('active');
    currentCommandTitleEl.textContent = 'Ready';
    currentCommandTypeEl.textContent = 'Waiting for commands...';
  }

  currentCommandId = null;
  currentCommandStartTime = null;
}

// Handle messages from the main plugin code
window.onmessage = (event) => {
  const message = event.data.pluginMessage;
  if (!message) return;

  switch (message.type) {
    case 'status':
      updateStatus(message.connected);
      if (message.message) {
        addLog(message.message, message.connected ? 'info' : 'error');
      }
      break;

    case 'command':
      commandCount++;
      updateStats();
      addLog(`Command: ${message.commandType} (${message.commandId.slice(0, 8)}...)`, 'info');
      showCurrentCommand(message.commandType, message.commandId);
      break;

    case 'result':
      // Hide current command when any result arrives (commands run sequentially)
      hideCurrentCommand(true);
      if (message.success) {
        addLog(`Success: ${message.commandId.slice(0, 8)}...`, 'success');
      } else {
        errorCount++;
        updateStats();
        addLog(`Error: ${message.error}`, 'error');
      }
      break;

    case 'log':
      addLog(message.message, message.logType || 'info');
      break;

    case 'versionBanner':
      versionBannerEl.className = `version-banner visible ${message.level || 'info'}`;
      versionBannerEl.style.display = '';
      versionBannerMessageEl.textContent = message.message || '';
      versionBannerDismissEl.style.display = message.dismissible ? '' : 'none';
      break;

    case 'pendingClose':
      pendingCloseNoticeEl.classList.add('visible');
      break;
  }
};

// Version banner dismiss
versionBannerDismissEl.addEventListener('click', () => {
  versionBannerEl.style.display = 'none';
  versionBannerEl.classList.remove('visible');
});

// Download button — open GitHub releases page
downloadBtnEl.addEventListener('click', () => {
  parent.postMessage({ pluginMessage: { type: 'openExternal', url: 'https://github.com/Brooksmade/Claude_Bridge/releases' } }, '*');
});

// Error filter toggle
errorStatEl.addEventListener('click', () => {
  showErrorsOnly = !showErrorsOnly;
  logEntriesEl.classList.toggle('errors-only', showErrorsOnly);
  errorStatEl.classList.toggle('filter-active', showErrorsOnly);
  logEntriesEl.scrollTop = logEntriesEl.scrollHeight;
});

// Initial state
addLog('Plugin UI loaded');

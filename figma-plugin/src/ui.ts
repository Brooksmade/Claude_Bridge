// UI state
let commandCount = 0;
let errorCount = 0;
let currentCommandId: string | null = null;
let currentCommandStartTime: number | null = null;
let elapsedIntervalId: number | null = null;

// DOM elements
const statusIndicator = document.getElementById('statusIndicator') as HTMLElement;
const statusText = document.getElementById('statusText') as HTMLElement;
const commandCountEl = document.getElementById('commandCount') as HTMLElement;
const errorCountEl = document.getElementById('errorCount') as HTMLElement;
const logEl = document.getElementById('log') as HTMLElement;
const currentCommandEl = document.getElementById('currentCommand') as HTMLElement;
const currentCommandTitleEl = document.getElementById('currentCommandTitle') as HTMLElement;
const currentCommandTypeEl = document.getElementById('currentCommandType') as HTMLElement;
const currentCommandElapsedEl = document.getElementById('currentCommandElapsed') as HTMLElement;
const pendingCloseNoticeEl = document.getElementById('pendingCloseNotice') as HTMLElement;

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
  entry.className = `log-entry ${type}`;
  entry.innerHTML = `<span class="log-time">${formatTime()}</span>${message}`;

  // Keep only last 50 entries
  while (logEl.children.length > 50) {
    logEl.removeChild(logEl.firstChild!);
  }

  logEl.appendChild(entry);
  logEl.scrollTop = logEl.scrollHeight;
}

function updateStatus(connected: boolean): void {
  if (connected) {
    statusIndicator.className = 'status-indicator connected';
    statusText.textContent = 'Connected';
  } else {
    statusIndicator.className = 'status-indicator disconnected';
    statusText.textContent = 'Disconnected';
  }
}

function updateStats(): void {
  commandCountEl.textContent = commandCount.toString();
  errorCountEl.textContent = errorCount.toString();
}

function formatElapsed(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) {
    return `${seconds}s`;
  }
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds}s`;
}

function showCurrentCommand(commandType: string, commandId: string): void {
  currentCommandId = commandId;
  currentCommandStartTime = Date.now();
  currentCommandTitleEl.textContent = 'Running Command...';
  currentCommandTypeEl.textContent = commandType;
  currentCommandElapsedEl.textContent = '';
  currentCommandEl.classList.add('active');
}

function hideCurrentCommand(showDuration: boolean = false): void {
  // Show final elapsed time before hiding
  if (showDuration && currentCommandStartTime !== null) {
    const elapsed = Date.now() - currentCommandStartTime;
    currentCommandTitleEl.textContent = 'Completed';
    currentCommandElapsedEl.textContent = formatElapsed(elapsed);
    // Keep visible briefly to show duration
    setTimeout(() => {
      currentCommandEl.classList.remove('active');
      currentCommandTitleEl.textContent = 'Ready';
      currentCommandTypeEl.textContent = 'Waiting for commands...';
      currentCommandElapsedEl.textContent = '';
    }, 2000);
  } else {
    currentCommandEl.classList.remove('active');
    currentCommandTitleEl.textContent = 'Ready';
    currentCommandTypeEl.textContent = 'Waiting for commands...';
    currentCommandElapsedEl.textContent = '';
  }

  currentCommandId = null;
  currentCommandStartTime = null;

  if (elapsedIntervalId !== null) {
    clearInterval(elapsedIntervalId);
    elapsedIntervalId = null;
  }
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

    case 'pendingClose':
      pendingCloseNoticeEl.classList.add('visible');
      break;
  }
};

// Initial state
addLog('Plugin UI loaded');

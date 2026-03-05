// ============================================================================
// Status Page - Frontend Script
// ============================================================================

const API_BASE = '/api';
let currentPage = 1;
let totalPages = 1;
let totalLogs = 0;
let allLogs = [];

const ITEMS_PER_PAGE = 25;

// ============================================================================
// DOM Elements
// ============================================================================

const tableBody = document.getElementById('tableBody');
const currentPageEl = document.getElementById('currentPage');
const totalPagesEl = document.getElementById('totalPages');
const prevPageBtn = document.getElementById('prevPage');
const nextPageBtn = document.getElementById('nextPage');
const systemFilterInput = document.getElementById('systemFilter');
const dateFilterInput = document.getElementById('dateFilter');
const clearFiltersBtn = document.getElementById('clearFilters');
const lastUpdatedEl = document.getElementById('lastUpdated');
const healthyCountEl = document.getElementById('healthyCount');
const warningCountEl = document.getElementById('warningCount');
const criticalCountEl = document.getElementById('criticalCount');

// ============================================================================
// Event Listeners
// ============================================================================

prevPageBtn.addEventListener('click', previousPage);
nextPageBtn.addEventListener('click', nextPage);
systemFilterInput.addEventListener('input', applyFilters);
dateFilterInput.addEventListener('change', applyFilters);
clearFiltersBtn.addEventListener('click', clearFilters);

// ============================================================================
// Initialization
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
  loadLogs();
  updateLastChecked();
  // Refresh every 5 minutes
  setInterval(loadLogs, 5 * 60 * 1000);
});

// ============================================================================
// Fetch & Display Logs
// ============================================================================

async function loadLogs(page = 1) {
  try {
    const params = new URLSearchParams();
    params.append('page', page);
    params.append('limit', ITEMS_PER_PAGE);

    const response = await fetch(`${API_BASE}/logs?${params}`);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.logs || !Array.isArray(data.logs)) {
      console.error('Invalid API response:', data);
      showError('Failed to load logs');
      return;
    }

    allLogs = data.logs;
    currentPage = data.pagination.page;
    totalPages = data.pagination.pages;
    totalLogs = data.pagination.total;

    renderTable(allLogs);
    updatePagination();
    updateSummaryStats();

  } catch (error) {
    console.error('Error loading logs:', error);
    showError(`Failed to load logs: ${error.message}`);
  }
}

function renderTable(logs) {
  if (logs.length === 0) {
    tableBody.innerHTML = '<tr class="loading"><td colspan="5">No logs found</td></tr>';
    return;
  }

  tableBody.innerHTML = logs.map(log => `
    <tr>
      <td>${formatDate(log.check_date)}</td>
      <td><strong>${escapeHtml(log.system)}</strong></td>
      <td>
        <span class="status-badge ${log.status}">
          ${log.status}
        </span>
      </td>
      <td>
        <span class="issues-text">${log.issues ? escapeHtml(log.issues) : '—'}</span>
      </td>
      <td>
        <small>${formatTime(log.created_at)}</small>
      </td>
    </tr>
  `).join('');
}

function updatePagination() {
  currentPageEl.textContent = currentPage;
  totalPagesEl.textContent = totalPages;
  
  prevPageBtn.disabled = currentPage === 1;
  nextPageBtn.disabled = currentPage === totalPages;
}

function updateSummaryStats() {
  const healthy = allLogs.filter(log => log.status === 'healthy').length;
  const warning = allLogs.filter(log => log.status === 'warning').length;
  const critical = allLogs.filter(log => log.status === 'critical').length;

  healthyCountEl.textContent = healthy;
  warningCountEl.textContent = warning;
  criticalCountEl.textContent = critical;
}

// ============================================================================
// Pagination
// ============================================================================

function previousPage() {
  if (currentPage > 1) {
    loadLogs(currentPage - 1);
  }
}

function nextPage() {
  if (currentPage < totalPages) {
    loadLogs(currentPage + 1);
  }
}

// ============================================================================
// Filtering
// ============================================================================

async function applyFilters() {
  try {
    const system = systemFilterInput.value.trim();
    const date = dateFilterInput.value;

    const params = new URLSearchParams();
    params.append('page', 1);
    params.append('limit', ITEMS_PER_PAGE);

    if (system) {
      params.append('system', system);
    }
    if (date) {
      params.append('date', date);
    }

    const response = await fetch(`${API_BASE}/logs?${params}`);
    const data = await response.json();

    allLogs = data.logs;
    currentPage = 1;
    totalPages = data.pagination.pages;

    renderTable(allLogs);
    updatePagination();
    updateSummaryStats();

  } catch (error) {
    console.error('Error applying filters:', error);
    showError('Failed to apply filters');
  }
}

function clearFilters() {
  systemFilterInput.value = '';
  dateFilterInput.value = '';
  loadLogs(1);
}

// ============================================================================
// Utilities
// ============================================================================

function formatDate(dateStr) {
  const date = new Date(dateStr + 'T00:00:00Z');
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

function formatTime(isoStr) {
  try {
    const date = new Date(isoStr);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  } catch {
    return '—';
  }
}

function escapeHtml(text) {
  if (!text) return '';
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

function updateLastChecked() {
  const now = new Date();
  const timeStr = now.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
  lastUpdatedEl.textContent = timeStr;
}

function showError(message) {
  const errorHtml = `<tr class="loading"><td colspan="5">⚠️ ${escapeHtml(message)}</td></tr>`;
  tableBody.innerHTML = errorHtml;
}

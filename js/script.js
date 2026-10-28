/* =============================================================
   Expense & Budget Visualizer — script.js
   Vanilla JS · Local Storage · Canvas Pie Chart
   ============================================================= */

'use strict';

/* ── Constants ────────────────────────────────────────────── */
const STORAGE_KEY_TXN    = 'ebv_transactions';
const STORAGE_KEY_BUDGET = 'ebv_budget';
const STORAGE_KEY_THEME  = 'ebv_theme';
const WARNING_THRESHOLD  = 0.8; // warn at 80 %

const CATEGORY_COLORS = {
  Food:      '#f6ad55',
  Transport: '#63b3ed',
  Fun:       '#fc8181',
};

const CATEGORY_EMOJIS = {
  Food:      '🍔',
  Transport: '🚌',
  Fun:       '🎉',
};

/* ── State ────────────────────────────────────────────────── */
let transactions = [];
let budget       = 1000;

/* ── DOM References ───────────────────────────────────────── */
const form            = document.getElementById('transaction-form');
const itemNameInput   = document.getElementById('item-name');
const amountInput     = document.getElementById('amount');
const categorySelect  = document.getElementById('category');
const nameError       = document.getElementById('name-error');
const amountError     = document.getElementById('amount-error');
const categoryError   = document.getElementById('category-error');

const budgetDisplay   = document.getElementById('budget-display');
const budgetInput     = document.getElementById('budget-input');
const budgetInputRow  = document.getElementById('budget-input-row');
const editBudgetBtn   = document.getElementById('edit-budget-btn');
const saveBudgetBtn   = document.getElementById('save-budget-btn');

const remainingEl     = document.getElementById('remaining');
const totalSpentEl    = document.getElementById('total-spent');
const warningBanner   = document.getElementById('warning-banner');
const warningPct      = document.getElementById('warning-pct');

const txnList         = document.getElementById('transaction-list');
const listEmpty       = document.getElementById('list-empty');
const sortSelect      = document.getElementById('sort-select');

const canvas          = document.getElementById('pie-chart');
const ctx             = canvas.getContext('2d');
const chartLegend     = document.getElementById('chart-legend');
const chartEmpty      = document.getElementById('chart-empty');

const themeToggle     = document.getElementById('theme-toggle');

/* ── Initialise ───────────────────────────────────────────── */
function init() {
  transactions = loadTransactions();
  budget       = loadBudget();
  applyTheme(loadTheme());
  render();
}

/* ── Storage helpers ──────────────────────────────────────── */
function loadTransactions() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY_TXN)) || [];
  } catch {
    return [];
  }
}

function saveTransactions() {
  localStorage.setItem(STORAGE_KEY_TXN, JSON.stringify(transactions));
}

function loadBudget() {
  const val = parseFloat(localStorage.getItem(STORAGE_KEY_BUDGET));
  return isNaN(val) || val <= 0 ? 1000 : val;
}

function saveBudget() {
  localStorage.setItem(STORAGE_KEY_BUDGET, String(budget));
}

function loadTheme() {
  return localStorage.getItem(STORAGE_KEY_THEME) || 'light';
}

function saveTheme(theme) {
  localStorage.setItem(STORAGE_KEY_THEME, theme);
}

/* ── Theme ────────────────────────────────────────────────── */
function applyTheme(theme) {
  document.body.classList.toggle('dark',  theme === 'dark');
  document.body.classList.toggle('light', theme !== 'dark');
  themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
  themeToggle.setAttribute(
    'aria-label',
    theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'
  );
  // Redraw chart so the background / text colours update
  drawPieChart();
}

themeToggle.addEventListener('click', function () {
  const isDark = document.body.classList.contains('dark');
  const next   = isDark ? 'light' : 'dark';
  applyTheme(next);
  saveTheme(next);
});

/* ── Budget edit ──────────────────────────────────────────── */
editBudgetBtn.addEventListener('click', function () {
  budgetInputRow.classList.remove('hidden');
  budgetInput.value = budget;
  budgetInput.focus();
});

saveBudgetBtn.addEventListener('click', saveBudgetValue);

budgetInput.addEventListener('keydown', function (e) {
  if (e.key === 'Enter') saveBudgetValue();
});

function saveBudgetValue() {
  const val = parseFloat(budgetInput.value);
  if (isNaN(val) || val <= 0) {
    budgetInput.classList.add('is-invalid');
    return;
  }
  budgetInput.classList.remove('is-invalid');
  budget = val;
  saveBudget();
  budgetInputRow.classList.add('hidden');
  render();
}

/* ── Form Validation & Submission ─────────────────────────── */
form.addEventListener('submit', function (e) {
  e.preventDefault();
  if (!validateForm()) return;

  const txn = {
    id:       generateId(),
    name:     itemNameInput.value.trim(),
    amount:   parseFloat(amountInput.value),
    category: categorySelect.value,
    date:     new Date().toISOString(),
  };

  transactions.unshift(txn);
  saveTransactions();
  form.reset();
  clearErrors();
  render();
});

function validateForm() {
  var valid = true;
  clearErrors();

  var name   = itemNameInput.value.trim();
  var amount = parseFloat(amountInput.value);
  var cat    = categorySelect.value;

  if (!name) {
    setError(nameError, itemNameInput, 'Item name is required.');
    valid = false;
  } else if (name.length < 2) {
    setError(nameError, itemNameInput, 'Name must be at least 2 characters.');
    valid = false;
  }

  if (amountInput.value === '' || amountInput.value === null) {
    setError(amountError, amountInput, 'Amount is required.');
    valid = false;
  } else if (isNaN(amount) || amount <= 0) {
    setError(amountError, amountInput, 'Amount must be a positive number.');
    valid = false;
  }

  if (!cat) {
    setError(categoryError, categorySelect, 'Please select a category.');
    valid = false;
  }

  return valid;
}

function setError(errorEl, inputEl, msg) {
  errorEl.textContent = msg;
  inputEl.classList.add('is-invalid');
}

function clearErrors() {
  nameError.textContent     = '';
  amountError.textContent   = '';
  categoryError.textContent = '';
  itemNameInput.classList.remove('is-invalid');
  amountInput.classList.remove('is-invalid');
  categorySelect.classList.remove('is-invalid');
}

/* ── Delete ───────────────────────────────────────────────── */
function deleteTransaction(id) {
  transactions = transactions.filter(function (t) { return t.id !== id; });
  saveTransactions();
  render();
}

/* ── Sort ─────────────────────────────────────────────────── */
sortSelect.addEventListener('change', render);

function getSortedTransactions() {
  var mode   = sortSelect.value;
  var sorted = transactions.slice(); // copy

  switch (mode) {
    case 'newest':
      sorted.sort(function (a, b) { return new Date(b.date) - new Date(a.date); });
      break;
    case 'oldest':
      sorted.sort(function (a, b) { return new Date(a.date) - new Date(b.date); });
      break;
    case 'amount-desc':
      sorted.sort(function (a, b) { return b.amount - a.amount; });
      break;
    case 'amount-asc':
      sorted.sort(function (a, b) { return a.amount - b.amount; });
      break;
    case 'name-asc':
      sorted.sort(function (a, b) { return a.name.localeCompare(b.name); });
      break;
    case 'name-desc':
      sorted.sort(function (a, b) { return b.name.localeCompare(a.name); });
      break;
  }

  return sorted;
}

/* ── Render ───────────────────────────────────────────────── */
function render() {
  var totalSpent = 0;
  for (var i = 0; i < transactions.length; i++) {
    totalSpent += transactions[i].amount;
  }
  var remaining = budget - totalSpent;

  // Summary cards
  budgetDisplay.textContent = formatCurrency(budget);
  totalSpentEl.textContent  = formatCurrency(totalSpent);
  remainingEl.textContent   = formatCurrency(remaining);
  remainingEl.style.color   = remaining < 0 ? 'var(--clr-red)' : '';

  // Spending limit warning (≥ 80 %)
  var pct = budget > 0 ? totalSpent / budget : 0;
  if (pct >= WARNING_THRESHOLD) {
    warningBanner.classList.remove('hidden');
    warningPct.textContent = Math.round(pct * 100);
  } else {
    warningBanner.classList.add('hidden');
  }

  renderList();
  drawPieChart();
}

/* ── Transaction List ─────────────────────────────────────── */
function renderList() {
  var sorted = getSortedTransactions();
  txnList.innerHTML = '';

  if (sorted.length === 0) {
    listEmpty.classList.remove('hidden');
    return;
  }

  listEmpty.classList.add('hidden');

  sorted.forEach(function (txn) {
    var li = document.createElement('li');
    li.className = 'transaction-item';

    var dateStr = new Date(txn.date).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
    });

    li.innerHTML =
      '<span class="txn-dot ' + txn.category + '" aria-hidden="true"></span>' +
      '<div class="txn-info">' +
        '<span class="txn-name">'  + escapeHtml(txn.name) + '</span>' +
        '<span class="txn-meta">' +
          '<span class="txn-category ' + txn.category + '">' +
            (CATEGORY_EMOJIS[txn.category] || '') + ' ' + txn.category +
          '</span>' +
          '<span>' + dateStr + '</span>' +
        '</span>' +
      '</div>' +
      '<span class="txn-amount" aria-label="' + formatCurrency(txn.amount) + '">' +
        '&minus;' + formatCurrency(txn.amount) +
      '</span>' +
      '<button class="btn-delete" data-id="' + txn.id + '" aria-label="Delete ' + escapeHtml(txn.name) + '">' +
        '&#x2715;' +
      '</button>';

    txnList.appendChild(li);
  });

  // Attach delete listeners
  var deleteBtns = txnList.querySelectorAll('.btn-delete');
  deleteBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      deleteTransaction(btn.getAttribute('data-id'));
    });
  });
}

/* ── Pie / Donut Chart ────────────────────────────────────── */
function drawPieChart() {
  var isDark = document.body.classList.contains('dark');
  var size   = canvas.width;  // 260 (set in HTML attribute)
  var cx     = size / 2;
  var cy     = size / 2;
  var radius = (size / 2) - 12;

  // Tally totals per category
  var totals = {};
  transactions.forEach(function (t) {
    totals[t.category] = (totals[t.category] || 0) + t.amount;
  });

  var categories = Object.keys(totals);
  var total      = 0;
  categories.forEach(function (c) { total += totals[c]; });

  ctx.clearRect(0, 0, size, size);

  // Empty state — placeholder ring
  if (categories.length === 0) {
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.strokeStyle = isDark ? '#334155' : '#e2e8f0';
    ctx.lineWidth   = 20;
    ctx.stroke();
    chartLegend.innerHTML = '';
    chartEmpty.classList.remove('hidden');
    return;
  }

  chartEmpty.classList.add('hidden');

  // Draw slices
  var startAngle = -Math.PI / 2; // start at top

  categories.forEach(function (cat) {
    var sliceAngle = (totals[cat] / total) * (Math.PI * 2);
    var endAngle   = startAngle + sliceAngle;
    var midAngle   = startAngle + sliceAngle / 2;

    // Filled slice
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, radius, startAngle, endAngle);
    ctx.closePath();
    ctx.fillStyle = CATEGORY_COLORS[cat] || '#a0aec0';
    ctx.fill();

    // Thin separator stroke
    ctx.strokeStyle = isDark ? '#1e293b' : '#ffffff';
    ctx.lineWidth   = 2;
    ctx.stroke();

    // Percentage label (only if slice is ≥ 8 %)
    var pct = (totals[cat] / total) * 100;
    if (pct >= 8) {
      var labelR = radius * 0.65;
      var lx = cx + labelR * Math.cos(midAngle);
      var ly = cy + labelR * Math.sin(midAngle);
      ctx.fillStyle    = '#ffffff';
      ctx.font         = 'bold ' + Math.round(size * 0.055) + 'px Segoe UI, sans-serif';
      ctx.textAlign    = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(Math.round(pct) + '%', lx, ly);
    }

    startAngle = endAngle;
  });

  // Donut hole
  ctx.beginPath();
  ctx.arc(cx, cy, radius * 0.46, 0, Math.PI * 2);
  ctx.fillStyle = isDark ? '#1e293b' : '#ffffff';
  ctx.fill();

  // Centre total label
  ctx.fillStyle    = isDark ? '#f1f5f9' : '#1a202c';
  ctx.font         = 'bold ' + Math.round(size * 0.1) + 'px Segoe UI, sans-serif';
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(formatCurrencyShort(total), cx, cy);

  // Legend
  chartLegend.innerHTML = categories.map(function (cat) {
    var pct = ((totals[cat] / total) * 100).toFixed(1);
    return (
      '<div class="legend-item">' +
        '<span class="legend-dot" style="background:' + CATEGORY_COLORS[cat] + '"></span>' +
        '<span>' + cat + ': ' + formatCurrency(totals[cat]) + ' (' + pct + '%)</span>' +
      '</div>'
    );
  }).join('');
}

/* ── Utilities ────────────────────────────────────────────── */
function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(value);
}

function formatCurrencyShort(value) {
  if (value >= 1000) {
    return '$' + (value / 1000).toFixed(1) + 'k';
  }
  return '$' + Math.round(value);
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Simple UUID fallback (crypto.randomUUID may not exist in all browsers)
function generateId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  // Fallback: timestamp + random string
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

/* ── Boot ─────────────────────────────────────────────────── */
init();

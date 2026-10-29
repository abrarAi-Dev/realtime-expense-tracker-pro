// Realtime Expense Tracker Pro - app logic
// Vanilla JS, localStorage only. No build step, no external libraries.

const STORAGE_KEY = "expenseTrackerPro.v1";

let state = loadState();

function emptyState() {
  return { entries: [], budgets: {}, bills: [] };
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyState();
    const parsed = JSON.parse(raw);
    return {
      entries: Array.isArray(parsed.entries) ? parsed.entries : [],
      budgets: parsed.budgets && typeof parsed.budgets === "object" ? parsed.budgets : {},
      bills: Array.isArray(parsed.bills) ? parsed.bills : []
    };
  } catch (e) {
    return emptyState();
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function money(n) {
  const sign = n < 0 ? "-" : "";
  return sign + "$" + Math.abs(Number(n) || 0).toFixed(2);
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function todayISO() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return y + "-" + m + "-" + day;
}

// ---------- Entries ----------

function totals() {
  let income = 0;
  let expenses = 0;
  state.entries.forEach(function (e) {
    if (e.type === "income") income += Number(e.amount) || 0;
    else expenses += Number(e.amount) || 0;
  });
  return { income, expenses, balance: income - expenses };
}

function renderEntries() {
  const list = document.getElementById("entryList");
  const empty = document.getElementById("entryEmpty");
  const filter = document.getElementById("filterCategory").value;
  const query = document.getElementById("searchInput").value.trim().toLowerCase();

  const sorted = state.entries.slice().sort(function (a, b) {
    return b.date.localeCompare(a.date);
  });

  const visible = sorted.filter(function (e) {
    if (filter && e.category !== filter) return false;
    if (query && e.description.toLowerCase().indexOf(query) === -1) return false;
    return true;
  });

  empty.classList.toggle("hidden", visible.length > 0);
  list.innerHTML = visible.map(function (e) {
    const sign = e.type === "income" ? "+" : "-";
    return '<div class="entry"><div><div>' + escapeHtml(e.description) + '</div>' +
      '<div class="entry-meta">' + escapeHtml(e.category) + " · " + escapeHtml(e.date) + " · " + e.type + '</div></div>' +
      '<div style="display:flex;gap:10px;align-items:center"><span class="amount ' + e.type + '">' + sign + money(e.amount).replace("-", "") + '</span>' +
      '<button class="delete" data-delete-entry="' + e.id + '">Delete</button></div></div>';
  }).join("");

  list.querySelectorAll("[data-delete-entry]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      state.entries = state.entries.filter(function (e) { return e.id !== btn.getAttribute("data-delete-entry"); });
      saveState();
      renderAll();
    });
  });

  const t = totals();
  document.getElementById("balanceValue").textContent = money(t.balance);
  document.getElementById("incomeValue").textContent = money(t.income);
  document.getElementById("expenseValue").textContent = money(t.expenses);
}

// ---------- Budgets ----------

function currentMonthKey() {
  return todayISO().slice(0, 7);
}

function spentThisMonthByCategory() {
  const key = currentMonthKey();
  const map = {};
  state.entries.forEach(function (e) {
    if (e.type !== "expense") return;
    if (!e.date || e.date.slice(0, 7) !== key) return;
    map[e.category] = (map[e.category] || 0) + (Number(e.amount) || 0);
  });
  return map;
}

function renderBudgets() {
  const list = document.getElementById("budgetList");
  const empty = document.getElementById("budgetEmpty");
  const categories = Object.keys(state.budgets);
  const spent = spentThisMonthByCategory();

  empty.classList.toggle("hidden", categories.length > 0);
  list.innerHTML = categories.sort().map(function (cat) {
    const limit = Number(state.budgets[cat]) || 0;
    const used = spent[cat] || 0;
    const pct = limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0;
    const over = limit > 0 && used > limit;
    const warn = !over && limit > 0 && used / limit >= 0.8;
    const cls = over ? "over" : (warn ? "warn" : "");
    let note = "";
    if (over) note = '<div class="warning over">Over budget by ' + money(used - limit) + " this month.</div>";
    else if (warn) note = '<div class="warning">Heads up: you have used ' + pct + "% of this budget.</div>";
    return '<div class="budget"><div class="budget-head"><strong>' + escapeHtml(cat) + '</strong>' +
      '<span>' + money(used) + " of " + money(limit) + " · " + pct + '%</span></div>' +
      '<div class="bar"><div class="bar-fill ' + cls + '" style="width:' + pct + '%"></div></div>' + note + '</div>';
  }).join("");
}

// ---------- Chart (canvas + CSS bars) ----------

function spendingByCategory() {
  const map = {};
  state.entries.forEach(function (e) {
    if (e.type !== "expense") return;
    map[e.category] = (map[e.category] || 0) + (Number(e.amount) || 0);
  });
  return Object.keys(map).map(function (cat) {
    return { category: cat, total: map[cat] };
  }).sort(function (a, b) { return b.total - a.total; });
}

function renderChart() {
  const data = spendingByCategory();
  const bars = document.getElementById("categoryBars");
  const empty = document.getElementById("chartEmpty");
  const canvas = document.getElementById("categoryChart");
  const ctx = canvas.getContext("2d");

  empty.classList.toggle("hidden", data.length > 0);
  canvas.classList.toggle("hidden", data.length === 0);

  const max = data.length ? data[0].total : 0;
  bars.innerHTML = data.map(function (row) {
    const pct = max > 0 ? Math.round((row.total / max) * 100) : 0;
    const color = CATEGORY_COLORS[row.category] || "#4f8cff";
    return '<div class="catbar"><span>' + escapeHtml(row.category) + '</span>' +
      '<div class="catbar-track"><div class="catbar-fill" style="width:' + pct + "%;background:" + color + '"></div></div>' +
      '<span class="catbar-value">' + money(row.total) + "</span></div>";
  }).join("");

  // Canvas bar chart
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (!data.length) return;
  const chartH = 200;
  const baseY = 240;
  const slot = Math.floor((canvas.width - 40) / data.length);
  const barW = Math.max(24, Math.min(72, slot - 18));
  data.forEach(function (row, i) {
    const h = max > 0 ? Math.round((row.total / max) * chartH) : 0;
    const x = 28 + i * slot;
    const y = baseY - h;
    ctx.fillStyle = CATEGORY_COLORS[row.category] || "#4f8cff";
    ctx.fillRect(x, y, barW, h);
    ctx.fillStyle = "#eaf0fb";
    ctx.font = "12px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(money(row.total), x + barW / 2, y - 8);
    ctx.fillStyle = "#9fb0cc";
    const label = row.category.length > 12 ? row.category.slice(0, 11) + "…" : row.category;
    ctx.fillText(label, x + barW / 2, baseY + 22);
  });
  ctx.strokeStyle = "#243354";
  ctx.beginPath();
  ctx.moveTo(20, baseY);
  ctx.lineTo(canvas.width - 12, baseY);
  ctx.stroke();
}

// ---------- Recurring bills ----------

function nextDueDate(dueDay) {
  const now = new Date();
  let year = now.getFullYear();
  let month = now.getMonth();
  function make(y, m, day) {
    const lastDay = new Date(y, m + 1, 0).getDate();
    return new Date(y, m, Math.min(day, lastDay));
  }
  let candidate = make(year, month, dueDay);
  const today = new Date(year, month, now.getDate());
  if (candidate < today) {
    month += 1;
    if (month > 11) { month = 0; year += 1; }
    candidate = make(year, month, dueDay);
  }
  return candidate;
}

function formatDate(d) {
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function renderBills() {
  const list = document.getElementById("billList");
  const empty = document.getElementById("billEmpty");
  empty.classList.toggle("hidden", state.bills.length > 0);

  const withDates = state.bills.map(function (b) {
    const next = nextDueDate(Number(b.dueDay) || 1);
    const days = Math.ceil((next - new Date(new Date().setHours(0, 0, 0, 0))) / 86400000);
    return { bill: b, next, days };
  }).sort(function (a, b) { return a.next - b.next; });

  list.innerHTML = withDates.map(function (row) {
    const b = row.bill;
    const when = row.days === 0 ? "due today" : (row.days === 1 ? "due tomorrow" : "in " + row.days + " days");
    return '<div class="bill"><div><div>' + escapeHtml(b.name) + '</div>' +
      '<div class="bill-meta">' + escapeHtml(b.category) + " · next due " + formatDate(row.next) + " (" + when + ')</div></div>' +
      '<div style="display:flex;gap:10px;align-items:center"><span class="amount expense">' + money(b.amount) + '</span>' +
      '<button class="delete" data-delete-bill="' + b.id + '">Delete</button></div></div>';
  }).join("");

  list.querySelectorAll("[data-delete-bill]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      state.bills = state.bills.filter(function (b) { return b.id !== btn.getAttribute("data-delete-bill"); });
      saveState();
      renderAll();
    });
  });
}

// ---------- Debt payoff planner ----------

function calculatePayoff(balance, aprPercent, monthlyPayment) {
  const monthlyRate = (Number(aprPercent) || 0) / 100 / 12;
  let remaining = Number(balance) || 0;
  let months = 0;
  let totalInterest = 0;
  const payment = Number(monthlyPayment) || 0;

  if (remaining <= 0) return { months: 0, totalInterest: 0, totalPaid: 0, never: false };
  if (payment <= 0) return { never: true, reason: "no-payment" };

  // If the payment does not cover the first month of interest, the balance never falls.
  if (monthlyRate > 0 && payment <= remaining * monthlyRate) {
    return { never: true, reason: "payment-too-low", monthlyInterest: remaining * monthlyRate };
  }

  while (remaining > 0 && months < 1200) {
    const interest = remaining * monthlyRate;
    totalInterest += interest;
    remaining += interest;
    const actual = Math.min(payment, remaining);
    remaining -= actual;
    months += 1;
  }
  if (remaining > 0) return { never: true, reason: "too-long" };
  return {
    months,
    totalInterest,
    totalPaid: (Number(balance) || 0) + totalInterest,
    never: false
  };
}

function payoffDate(months) {
  const d = new Date();
  d.setMonth(d.getMonth() + months);
  return d.toLocaleDateString(undefined, { year: "numeric", month: "long" });
}

function renderDebt() {
  const balance = parseFloat(document.getElementById("debtBalance").value);
  const apr = parseFloat(document.getElementById("debtApr").value);
  const payment = parseFloat(document.getElementById("debtPayment").value);
  const extra = parseFloat(document.getElementById("debtExtra").value) || 0;
  const box = document.getElementById("debtResult");

  if (isNaN(balance) || isNaN(apr) || isNaN(payment)) {
    box.classList.remove("hidden");
    box.innerHTML = "<strong>Fill in balance, APR, and monthly payment first.</strong><br>Extra per month is optional and defaults to $0.";
    return;
  }

  const base = calculatePayoff(balance, apr, payment);
  box.classList.remove("hidden");

  if (base.never) {
    if (base.reason === "payment-too-low") {
      box.innerHTML = "<strong>That payment never clears the debt.</strong><br>At this APR the balance grows by about " +
        money(base.monthlyInterest) + " in interest in the first month alone, which is more than the payment. " +
        "Raise the monthly payment above that amount and run it again.";
    } else {
      box.innerHTML = "<strong>That payment does not clear the debt in a realistic timeframe.</strong><br>Try a higher monthly payment and run it again.";
    }
    return;
  }

  let html = "<div><strong>Debt-free in " + base.months + " months</strong> (" + payoffDate(base.months) + ")</div>" +
    "<div>Total interest: <strong>" + money(base.totalInterest) + "</strong></div>" +
    "<div>Total paid: <strong>" + money(base.totalPaid) + "</strong></div>";

  if (extra > 0) {
    const withExtra = calculatePayoff(balance, apr, payment + extra);
    if (!withExtra.never) {
      const monthsSaved = base.months - withExtra.months;
      const interestSaved = base.totalInterest - withExtra.totalInterest;
      html += "<hr>" +
        "<div>With an extra <strong>" + money(extra) + "/month</strong>:</div>" +
        "<div>Debt-free in <strong>" + withExtra.months + " months</strong> (" + payoffDate(withExtra.months) + ")</div>" +
        "<div>You save <strong>" + monthsSaved + " months</strong> and <strong>" + money(interestSaved) + "</strong> in interest.</div>" +
        "<div>Total interest drops to <strong>" + money(withExtra.totalInterest) + "</strong>.</div>";
    }
  } else {
    html += '<div style="margin-top:8px">Tip: add an extra amount per month above to see how much time and interest a small bump saves. It is usually more than people expect.</div>';
  }

  html += '<div style="margin-top:8px;color:#9fb0cc;font-size:13px">Estimate only. It assumes a fixed APR, the same payment every month, and no new charges on the debt.</div>';
  box.innerHTML = html;
}

// ---------- CSV export ----------

function exportCsv() {
  const rows = [["Date", "Description", "Type", "Category", "Amount"]];
  state.entries.slice().sort(function (a, b) { return a.date.localeCompare(b.date); }).forEach(function (e) {
    rows.push([e.date, e.description, e.type, e.category, Number(e.amount).toFixed(2)]);
  });
  const csv = rows.map(function (r) {
    return r.map(function (cell) {
      const s = String(cell);
      return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
    }).join(",");
  }).join("\n");

  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "realtime-expense-tracker-pro-export.csv";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

// ---------- Wiring ----------

function fillCategorySelects() {
  const entryType = document.getElementById("entryType").value;
  const entryCats = entryType === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  document.getElementById("entryCategory").innerHTML = entryCats.map(function (c) {
    return '<option value="' + escapeHtml(c) + '">' + escapeHtml(c) + "</option>";
  }).join("");

  document.getElementById("budgetCategory").innerHTML = EXPENSE_CATEGORIES.map(function (c) {
    return '<option value="' + escapeHtml(c) + '">' + escapeHtml(c) + "</option>";
  }).join("");

  document.getElementById("billCategory").innerHTML = EXPENSE_CATEGORIES.map(function (c) {
    return '<option value="' + escapeHtml(c) + '">' + escapeHtml(c) + "</option>";
  }).join("");

  document.getElementById("filterCategory").innerHTML = '<option value="">All categories</option>' + ALL_CATEGORIES.map(function (c) {
    return '<option value="' + escapeHtml(c) + '">' + escapeHtml(c) + "</option>";
  }).join("");
}

function renderAll() {
  renderEntries();
  renderBudgets();
  renderChart();
  renderBills();
}

function init() {
  fillCategorySelects();
  document.getElementById("entryDate").value = todayISO();

  document.getElementById("entryType").addEventListener("change", fillCategorySelects);
  document.getElementById("filterCategory").addEventListener("change", renderEntries);
  document.getElementById("searchInput").addEventListener("input", renderEntries);

  document.getElementById("entryForm").addEventListener("submit", function (ev) {
    ev.preventDefault();
    const desc = document.getElementById("entryDesc").value.trim();
    const amount = parseFloat(document.getElementById("entryAmount").value);
    const date = document.getElementById("entryDate").value;
    if (!desc || isNaN(amount) || amount <= 0 || !date) return;
    state.entries.push({
      id: uid(),
      description: desc,
      amount: amount,
      type: document.getElementById("entryType").value,
      category: document.getElementById("entryCategory").value,
      date: date
    });
    saveState();
    ev.target.reset();
    document.getElementById("entryDate").value = todayISO();
    fillCategorySelects();
    renderAll();
  });

  document.getElementById("budgetForm").addEventListener("submit", function (ev) {
    ev.preventDefault();
    const cat = document.getElementById("budgetCategory").value;
    const amount = parseFloat(document.getElementById("budgetAmount").value);
    if (!cat || isNaN(amount) || amount < 0) return;
    state.budgets[cat] = amount;
    saveState();
    ev.target.reset();
    renderAll();
  });

  document.getElementById("billForm").addEventListener("submit", function (ev) {
    ev.preventDefault();
    const name = document.getElementById("billName").value.trim();
    const amount = parseFloat(document.getElementById("billAmount").value);
    const dueDay = parseInt(document.getElementById("billDueDay").value, 10);
    if (!name || isNaN(amount) || isNaN(dueDay) || dueDay < 1 || dueDay > 31) return;
    state.bills.push({
      id: uid(),
      name: name,
      amount: amount,
      dueDay: dueDay,
      category: document.getElementById("billCategory").value
    });
    saveState();
    ev.target.reset();
    renderAll();
  });

  document.getElementById("debtBtn").addEventListener("click", renderDebt);
  document.getElementById("debtSampleBtn").addEventListener("click", function () {
    document.getElementById("debtBalance").value = "5000";
    document.getElementById("debtApr").value = "22.99";
    document.getElementById("debtPayment").value = "200";
    document.getElementById("debtExtra").value = "50";
    renderDebt();
  });

  document.getElementById("exportBtn").addEventListener("click", exportCsv);

  document.getElementById("sampleBtn").addEventListener("click", function () {
    if (state.entries.length && !confirm("Load sample data? This replaces your current entries, budgets, and bills.")) return;
    const s = sampleData();
    state = { entries: s.entries, budgets: s.budgets, bills: s.bills };
    saveState();
    renderAll();
  });

  document.getElementById("clearBtn").addEventListener("click", function () {
    if (!confirm("Clear all data? This removes every entry, budget, and bill stored in this browser.")) return;
    state = emptyState();
    saveState();
    renderAll();
  });

  renderAll();
}

document.addEventListener("DOMContentLoaded", init);

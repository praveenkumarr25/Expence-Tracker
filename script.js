// ===================== CONFIG =====================
const API_BASE = 'https://expence-tracker-u3q5.onrender.com/api';  // Render backend

// ===================== AUTH =======================
async function login() {
  const email = document.getElementById('userId').value;
  const password = document.getElementById('password').value;
  document.getElementById('loginButton').disabled = true;
  document.getElementById('loginButton').textContent = 'Logging in...';
  console.time('login');

  try {
    const res = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    console.timeEnd('login');

    if (res.ok && data.token) {
      localStorage.setItem('token', data.token);
      document.getElementById('login').style.display = 'none';
      document.getElementById('container').style.display = 'block';
      document.getElementById('loginError').textContent = '';
      await loadUserData();
    } else {
      document.getElementById('loginError').textContent =
        data.error || 'Login failed';
    }
  } catch (err) {
    document.getElementById('loginError').textContent = 'Cannot reach server';
  } finally {
    document.getElementById('loginButton').disabled = false;
    document.getElementById('loginButton').textContent = 'Login';
  }
}

async function register() {
  const email = document.getElementById('userId').value;
  const password = document.getElementById('password').value;

  try {
    const res = await fetch(`${API_BASE}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (res.ok && data.token) {
      localStorage.setItem('token', data.token);
      document.getElementById('login').style.display = 'none';
      document.getElementById('container').style.display = 'block';
      document.getElementById('loginError').textContent = '';
      await loadUserData();
    } else {
      document.getElementById('loginError').textContent =
        data.error || 'Register failed';
    }
  } catch (err) {
    document.getElementById('loginError').textContent = 'Cannot reach server';
  }
}

function logout() {
  localStorage.removeItem('token');
  document.getElementById('login').style.display = 'block';
  document.getElementById('container').style.display = 'none';
  document.getElementById('userId').value = '';
  document.getElementById('password').value = '';
  document.getElementById('loginError').textContent = '';
}

// ===================== STATE ======================
let transactions = [];
let currentPeriod = 'monthly';
let expensePieChart, incomeExpenseChart;

// ===================== LOAD USER DATA =============
async function loadUserData() {
  const token = localStorage.getItem('token');
  if (!token) return;

  try {
    const res = await fetch(`${API_BASE}/transactions`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!res.ok) {
      console.error('Failed to load transactions');
      return;
    }

    transactions = await res.json();
    updateCategories();
    updateCharts();
    updateTransactionsTable();
    setTodayDate();
  } catch (err) {
    console.error('Load failed', err);
  }
}

// ===================== UI HELPERS =================
function switchTab(tabName) {
  document.querySelectorAll('.tab-content')
    .forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.menu-btn')
    .forEach(el => el.classList.remove('active'));

  document.getElementById(tabName).classList.add('active');
  event.target.classList.add('active');
  document.querySelector('.menubar').classList.remove('show');

  if (tabName === 'dashboard') {
    setTimeout(() => updateCharts(), 100);
  } else if (tabName === 'all-transactions') {
    updateTransactionsTable();
  }
}

function setTodayDate() {
  const today = new Date().toISOString().split('T')[0];
  const dateInput = document.getElementById('transDate');
  if (dateInput) dateInput.value = today;
}

function updateCategories() {
  const type = document.getElementById('transType').value;
  const categorySelect = document.getElementById('transCategory');
  categorySelect.innerHTML = '';

  if (type === 'Income') {
    const incomeCategories = [
      'Salary', 'Freelance', 'Business', 'Investments', 'Other Income'
    ];
    incomeCategories.forEach(cat => {
      const option = document.createElement('option');
      option.value = cat;
      option.textContent = cat;
      categorySelect.appendChild(option);
    });
  } else {
    const expenseCategories = [
      'Rent', 'Utilities', 'Groceries', 'Transportation', 'Food',
      'Entertainment', 'Shopping', 'Health', 'Education', 'Other Expenses'
    ];
    expenseCategories.forEach(cat => {
      const option = document.createElement('option');
      option.value = cat;
      option.textContent = cat;
      categorySelect.appendChild(option);
    });
  }

  autoFillDescription();
}

function autoFillDescription() {
  const type = document.getElementById('transType').value;
  const category = document.getElementById('transCategory').value;
  const descInput = document.getElementById('transDescription');

  let defaultDesc = '';

  if (type === 'Income') {
    switch (category) {
      case 'Salary': defaultDesc = 'Monthly Salary'; break;
      case 'Freelance': defaultDesc = 'Freelance Work'; break;
      case 'Business': defaultDesc = 'Business Income'; break;
      case 'Investments': defaultDesc = 'Investment Returns'; break;
      case 'Other Income': defaultDesc = 'Other Income'; break;
    }
  } else {
    switch (category) {
      case 'Rent': defaultDesc = 'Monthly Rent'; break;
      case 'Utilities': defaultDesc = 'Utility Bills'; break;
      case 'Groceries': defaultDesc = 'Grocery Shopping'; break;
      case 'Transportation': defaultDesc = 'Transportation'; break;
      case 'Food': defaultDesc = 'Food and Dining'; break;
      case 'Entertainment': defaultDesc = 'Entertainment'; break;
      case 'Shopping': defaultDesc = 'Shopping'; break;
      case 'Health': defaultDesc = 'Health and Medical'; break;
      case 'Education': defaultDesc = 'Education'; break;
      case 'Other Expenses': defaultDesc = 'Other Expenses'; break;
    }
  }

  descInput.value = defaultDesc;
}

// ===================== CRUD: ADD ==================
async function addTransaction() {
  const date = document.getElementById('transDate').value;
  const type = document.getElementById('transType').value;
  const category = document.getElementById('transCategory').value;
  const description = document.getElementById('transDescription').value;
  const amount = parseFloat(document.getElementById('transAmount').value);
  const paymentMethod = document.getElementById('transPaymentMethod').value;

  if (!date || !description || !amount) {
    alert('Please fill all fields!');
    return;
  }

  const token = localStorage.getItem('token');
  if (!token) {
    alert('Please login first');
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/transactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        date, type, category, description, amount, paymentMethod
      })
    });

    if (res.ok) {
      await loadUserData();  // reload from backend
      clearForm();
      alert('✓ Transaction added successfully!');
    } else {
      alert('Save failed');
    }
  } catch (err) {
    alert('Cannot reach server');
  }
}

function clearForm() {
  setTodayDate();
  document.getElementById('transDescription').value = '';
  document.getElementById('transAmount').value = '';
  document.getElementById('transPaymentMethod').value = 'Cash';
  updateCategories();
}

// ===================== CRUD: DELETE ===============
async function deleteTransaction(index) {
  if (!confirm('Delete this transaction?')) return;

  const token = localStorage.getItem('token');
  if (!token) {
    alert('Please login first');
    return;
  }

  try {
    const id = transactions[index]._id; // from backend
    const res = await fetch(`${API_BASE}/transactions/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (res.ok) {
      await loadUserData();
    } else {
      alert('Delete failed');
    }
  } catch (err) {
    alert('Cannot reach server');
  }
}

// ===================== TABLE RENDER ===============
function updateTransactionsTable() {
  const tbody = document.getElementById('tableBody');
  const emptyState = document.getElementById('emptyState');

  tbody.innerHTML = '';

  if (!transactions || transactions.length === 0) {
    emptyState.style.display = 'block';
    return;
  }

  emptyState.style.display = 'none';

  transactions
    .slice()
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .forEach((trans, index) => {
      const row = document.createElement('tr');
      row.className = trans.type.toLowerCase();

      const amountClass = trans.type === 'Income' ? 'income' : 'expense';
      const sign = trans.type === 'Income' ? '+' : '-';

      row.innerHTML = `
        <td>${new Date(trans.date).toLocaleDateString()}</td>
        <td>${trans.type}</td>
        <td>${trans.category}</td>
        <td>${trans.description}</td>
        <td class="${amountClass}">${sign} ₹${Number(trans.amount).toFixed(2)}</td>
        <td>${trans.paymentMethod || '-'}</td>
        <td>
          <button class="delete-btn" onclick="deleteTransaction(${index})">
            Delete
          </button>
        </td>
      `;

      tbody.appendChild(row);
    });
}

// ===================== CHARTS =====================
// NOTE: assumes Chart.js is loaded and your HTML has
// canvases with ids: 'expensePie', 'incomeExpenseChart'.

function updateCharts() {
  // Filter transactions based on currentPeriod
  const now = new Date();
  let filteredTransactions = transactions;

  if (currentPeriod === 'weekly') {
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    filteredTransactions = transactions.filter(t => new Date(t.date) >= weekAgo);
  } else if (currentPeriod === 'monthly') {
    const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    filteredTransactions = transactions.filter(t => new Date(t.date) >= monthAgo);
  } else if (currentPeriod === 'yearly') {
    const yearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
    filteredTransactions = transactions.filter(t => new Date(t.date) >= yearAgo);
  } // 'all' uses all

  const totals = {
    income: 0,
    expense: 0,
    byCategory: {}
  };

  filteredTransactions.forEach(t => {
    const amt = Number(t.amount) || 0;
    if (t.type === 'Income') {
      totals.income += amt;
    } else {
      totals.expense += amt;
      totals.byCategory[t.category] =
        (totals.byCategory[t.category] || 0) + amt;
    }
  });

  // Update dashboard summary cards
  document.getElementById('totalIncome').textContent = `₹${totals.income.toFixed(2)}`;
  document.getElementById('totalExpense').textContent = `₹${totals.expense.toFixed(2)}`;
  const netBalance = totals.income - totals.expense;
  document.getElementById('netBalance').textContent = `₹${netBalance.toFixed(2)}`;

  // Count transactions
  const incomeCount = filteredTransactions.filter(t => t.type === 'Income').length;
  const expenseCount = filteredTransactions.filter(t => t.type === 'Expense').length;
  document.getElementById('incomeCount').textContent = `${incomeCount} transactions`;
  document.getElementById('expenseCount').textContent = `${expenseCount} transactions`;

  // Savings rate
  const savingsRate = totals.income > 0 ? ((netBalance / totals.income) * 100).toFixed(0) : 0;
  document.getElementById('savingsRate').textContent = `${savingsRate}% Savings`;

  const ctxPie = document.getElementById('expensePieChart');
  const ctxBar = document.getElementById('incomeExpenseChart');
  if (!ctxPie || !ctxBar) return;

  // Pie chart (expenses by category)
  const pieLabels = Object.keys(totals.byCategory);
  const pieData = Object.values(totals.byCategory);

  if (expensePieChart) expensePieChart.destroy();
  expensePieChart = new Chart(ctxPie, {
    type: 'pie',
    data: {
      labels: pieLabels,
      datasets: [{
        data: pieData,
        backgroundColor: [
          '#ff6384', '#36a2eb', '#ffcd56', '#4bc0c0',
          '#9966ff', '#ff9f40', '#8bc34a', '#e91e63',
          '#9c27b0', '#607d8b'
        ]
      }]
    },
    options: {
      plugins: { legend: { position: 'bottom' } }
    }
  });

  // Bar chart (income vs expense)
  if (incomeExpenseChart) incomeExpenseChart.destroy();
  incomeExpenseChart = new Chart(ctxBar, {
    type: 'bar',
    data: {
      labels: ['Income', 'Expense'],
      datasets: [{
        label: 'Amount (₹)',
        data: [totals.income, totals.expense],
        backgroundColor: ['#4caf50', '#f44336']
      }]
    },
    options: {
      scales: {
        y: { beginAtZero: true }
      }
    }
  });
}

// ===================== FILTER BY PERIOD =====================
function filterByPeriod(period) {
  currentPeriod = period;
  document.querySelectorAll('.period-btn').forEach(btn => btn.classList.remove('active'));
  event.target.classList.add('active');
  updateCharts();
}

// ===================== INIT =======================
document.addEventListener('DOMContentLoaded', () => {
  setTodayDate();
  updateCategories();

  const token = localStorage.getItem('token');
  if (token) {
    document.getElementById('login').style.display = 'none';
    document.getElementById('container').style.display = 'block';
    loadUserData();
  }
});
function toggleMenu() {
  document.querySelector('.menubar').classList.toggle('show');
}

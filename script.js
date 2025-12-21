const API_BASE = 'http://localhost:5000/api';

async function login() {
  const email = document.getElementById('userId').value;
  const password = document.getElementById('password').value;

  try {
    const res = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();

    if (res.ok && data.token) {
      localStorage.setItem('token', data.token);
      document.getElementById('login').style.display = 'none';
      document.getElementById('container').style.display = 'block';
      loadUserData();
    } else {
      document.getElementById('loginError').textContent = data.error || 'Login failed';
    }
  } catch (err) {
    document.getElementById('loginError').textContent = 'Cannot reach server';
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
      loadUserData();
    } else {
      document.getElementById('loginError').textContent = data.error || 'Register failed';
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

        let transactions = JSON.parse(localStorage.getItem('transactions')) || [
        ];

        let currentPeriod = 'monthly';
        let expensePieChart, incomeExpenseChart;

async function loadUserData() {
  const token = localStorage.getItem('token');
  if (!token) return;

  try {
    const res = await fetch(`${API_BASE}/transactions`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    transactions = await res.json();

    updateCategories();
    updateCharts();
    updateTransactionsTable();
    setTodayDate();
  } catch (err) {
    console.error('Load failed', err);
  }
}


        function switchTab(tabName) {
            document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
            document.querySelectorAll('.menu-btn').forEach(el => el.classList.remove('active'));
            document.getElementById(tabName).classList.add('active');
            event.target.classList.add('active');
            document.querySelector('.menubar').classList.remove('show');
            
            if(tabName === 'dashboard') {
                setTimeout(() => updateCharts(), 100);
            } else if(tabName === 'all-transactions') {
                updateTransactionsTable();
            }
        }

        function setTodayDate() {
            const today = new Date().toISOString().split('T')[0];
            document.getElementById('transDate').value = today;
        }

        function updateCategories() {
            const type = document.getElementById('transType').value;
            const categorySelect = document.getElementById('transCategory');
            categorySelect.innerHTML = '';
            
            if(type === 'Income') {
                const incomeCategories = ['Salary', 'Freelance', 'Business', 'Investments', 'Other Income'];
                incomeCategories.forEach(cat => {
                    const option = document.createElement('option');
                    option.value = cat;
                    option.textContent = cat;
                    categorySelect.appendChild(option);
                });
            } else {
                const expenseCategories = ['Rent', 'Utilities', 'Groceries', 'Transportation', 'Food', 'Entertainment', 'Shopping', 'Health', 'Education', 'Other Expenses'];
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
                switch(category) {
                    case 'Salary': defaultDesc = 'Monthly Salary'; break;
                    case 'Freelance': defaultDesc = 'Freelance Work'; break;
                    case 'Business': defaultDesc = 'Business Income'; break;
                    case 'Investments': defaultDesc = 'Investment Returns'; break;
                    case 'Other Income': defaultDesc = 'Other Income'; break;
                }
            } else {
                switch(category) {
                    case 'Rent': defaultDesc = 'Monthly Rent'; break;
                    case 'Utilities': defaultDesc = 'Utility Bills'; break;
                    case 'Groceries': defaultDesc = 'Grocery Shopping'; break;
                    case 'Transportation': defaultDesc = 'Transportation'; break;
                    case 'Food': defaultDesc = 'Food and Dining'; break;
                    case 'Entertainment': defaultDesc = 'Entertainment'; break;
                    case 'Shopping': defaultDesc = 'Shopping'; break;
                    case 'Health': defaultDesc = 'Health and Medical'; break;
                    case 'Education': defaultDesc = 'Education'; break;
                    // case 'Other Expenses': defaultDesc = 'Other Expenses'; break; // Leave empty
                }
            }
            descInput.value = defaultDesc;
        }

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
      body: JSON.stringify({ date, type, category, description, amount, paymentMethod })
    });

    if (res.ok) {
      clearForm();
      await loadUserData();  // refresh charts + table
    } else {
      alert('Save failed');
    }
  } catch (err) {
    alert('Cannot reach server');
  }
}


            transactions.push({date, type, category, description, amount, paymentMethod});
            localStorage.setItem('transactions', JSON.stringify(transactions));
            
            clearForm();
            alert('✓ Transaction added successfully!');
            updateCharts();
        

        function clearForm() {
            setTodayDate();
            document.getElementById('transDescription').value = '';
            document.getElementById('transAmount').value = '';
            document.getElementById('transPaymentMethod').value = 'Cash';
            updateCategories();
        }

        async function deleteTransaction(index) {
  if (!confirm('Delete this transaction?')) return;

  const token = localStorage.getItem('token');
  if (!token) {
    alert('Please login first');
    return;
  }

  try {
    const id = transactions[index]._id;  // comes from backend
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


        function updateTransactionsTable() {
            const tbody = document.getElementById('tableBody');
            const emptyState = document.getElementById('emptyState');
            tbody.innerHTML = '';

            if(transactions.length === 0) {
                emptyState.style.display = 'block';
                return;
            }
            emptyState.style.display = 'none';

            transactions.sort((a, b) => new Date(b.date) - new Date(a.date)).forEach((trans, index) => {
                const row = document.createElement('tr');
                row.className = trans.type.toLowerCase();
                const amountClass = trans.type === 'Income' ? 'income' : 'expense';
                const sign = trans.type === 'Income' ? '+' : '-';
                row.innerHTML = `
                    <td>${trans.date}</td>
                    <td><span class="badge ${amountClass.toLowerCase()}">${trans.type}</span></td>
                    <td>${trans.category}</td>
                    <td>${trans.description}</td>
                    <td><span class="amount-text ${amountClass}">${sign}₹${trans.amount.toLocaleString('en-IN')}</span></td>
                    <td>${trans.paymentMethod || 'Cash'}</td>
                    <td><button class="delete-btn" onclick="deleteTransaction(${transactions.indexOf(trans)})">Delete</button></td>
                `;
                tbody.appendChild(row);
            });
        }

        function getFilteredTransactions() {
            const now = new Date();
            const currentYear = now.getFullYear();
            const currentMonth = now.getMonth();
            const currentWeek = getWeekNumber(now);

            return transactions.filter(trans => {
                const transDate = new Date(trans.date);
                if(currentPeriod === 'monthly') {
                    return transDate.getMonth() === currentMonth && transDate.getFullYear() === currentYear;
                } else if(currentPeriod === 'yearly') {
                    return transDate.getFullYear() === currentYear;
                } else if(currentPeriod === 'weekly') {
                    return getWeekNumber(transDate) === currentWeek && transDate.getFullYear() === currentYear;
                }
                return true;
            });
        }

        function getWeekNumber(date) {
            const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
            const dayNum = d.getUTCDay() || 7;
            d.setUTCDate(d.getUTCDate() + 4 - dayNum);
            const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
            return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
        }

        function filterByPeriod(period) {
            currentPeriod = period;
            document.querySelectorAll('.period-btn').forEach(btn => btn.classList.remove('active'));
            event.target.classList.add('active');
            updateCharts();
        }

        function updateCharts() {
            const filtered = getFilteredTransactions();
            
            let income = 0, expense = 0;
            const expenseByCat = {};
            let incomeCount = 0, expenseCount = 0;

            filtered.forEach(trans => {
                if(trans.type === 'Income') {
                    income += trans.amount;
                    incomeCount++;
                } else {
                    expense += trans.amount;
                    expenseCount++;
                    expenseByCat[trans.category] = (expenseByCat[trans.category] || 0) + trans.amount;
                }
            });

            const balance = income - expense;
            const savingsRate = income > 0 ? ((balance / income) * 100).toFixed(1) : 0;

            document.getElementById('totalIncome').textContent = `₹${income.toLocaleString('en-IN')}`;
            document.getElementById('totalExpense').textContent = `₹${expense.toLocaleString('en-IN')}`;
            document.getElementById('netBalance').textContent = `₹${balance.toLocaleString('en-IN')}`;
            document.getElementById('incomeCount').textContent = `${incomeCount} transactions`;
            document.getElementById('expenseCount').textContent = `${expenseCount} transactions`;
            document.getElementById('savingsRate').textContent = `${savingsRate}% Savings`;

            // Expense Pie Chart
            const ctxPie = document.getElementById('expensePieChart').getContext('2d');
            if(expensePieChart) expensePieChart.destroy();
            
            expensePieChart = new Chart(ctxPie, {
                type: 'doughnut',
                data: {
                    labels: Object.keys(expenseByCat),
                    datasets: [{
                        data: Object.values(expenseByCat),
                        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF', '#4CAF50', '#FF5722'],
                        borderColor: 'white',
                        borderWidth: 3
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: {
                        legend: { position: 'bottom', labels: { font: { size: 12 }, padding: 15 } }
                    }
                }
            });

            // Income vs Expense Chart
            const ctxBar = document.getElementById('incomeExpenseChart').getContext('2d');
            if(incomeExpenseChart) incomeExpenseChart.destroy();
            
            incomeExpenseChart = new Chart(ctxBar, {
                type: 'bar',
                data: {
                    labels: ['Income', 'Expenses', 'Balance'],
                    datasets: [{
                        label: 'Amount (₹)',
                        data: [income, expense, balance],
                        backgroundColor: ['#2ecc71', '#e74c3c', '#3498db'],
                        borderRadius: 8,
                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: { legend: { display: false } },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: { callback: function(value) { return '₹' + value.toLocaleString('en-IN'); } }
                        }
                    }
                }
            });
        }

        function exportData() {
            const data = JSON.stringify(transactions, null, 2);
            const blob = new Blob([data], {type: 'application/json'});
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'transactions.json';
            a.click();
            URL.revokeObjectURL(url);
        }

        function importData() {
            const file = document.getElementById('importFile').files[0];
            if (!file) {
                alert('Please select a file to import');
                return;
            }
            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    const data = JSON.parse(e.target.result);
                    transactions = data;
                    localStorage.setItem('transactions', JSON.stringify(transactions));
                    updateTransactionsTable();
                    updateCharts();
                    alert('Data imported successfully!');
                } catch (err) {
                    alert('Invalid file format. Please select a valid JSON file.');
                }
            };
            reader.readAsText(file);
        }

        // Initialize
        loadUserData();

        function toggleMenu() {
            document.querySelector('.menubar').classList.toggle('show');
        }
        document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');
  if (token) {
    document.getElementById('login').style.display = 'none';
    document.getElementById('container').style.display = 'block';
    loadUserData();
  }
});

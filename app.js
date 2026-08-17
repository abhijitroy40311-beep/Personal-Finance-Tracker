// Step 1: DOM Elements
const totalBalanceEl = document.getElementById('total-balance');
const totalIncomeEl = document.getElementById('total-income');
const totalExpensesEl = document.getElementById('total-expenses');
const transactionForm = document.getElementById('transaction-form');
const descriptionInput = document.getElementById('description');
const amountInput = document.getElementById('amount');
const typeSelect = document.getElementById('type');
const categorySelect = document.getElementById('category');
const transactionListEl = document.getElementById('transaction-list');
const chartCanvas = document.getElementById('expense-chart');

// Step 2: State Initialization from LocalStorage
let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
let expenseChart = null;

// Step 3: Add New Transaction
function addTransaction(e) {
  e.preventDefault();

  if (!descriptionInput.value.trim() || !amountInput.value) return;

  const transaction = {
    id: Date.now(),
    description: descriptionInput.value,
    amount: parseFloat(amountInput.value),
    type: typeSelect.value,
    category: categorySelect.value,
  };

  transactions.push(transaction);
  updateLocalStorage();
  init();
  transactionForm.reset();
}

// Step 4: Remove Transaction by ID
function removeTransaction(id) {
  transactions = transactions.filter(t => t.id !== id);
  updateLocalStorage();
  init();
};

// Step 5: Calculate Summary Values
function updateSummary() {
  const income = transactions
    .filter(t => t.type === 'income')
    .reduce((acc, t) => acc + t.amount, 0);

  const expenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => acc + t.amount, 0);

  const balance = income - expenses;

  totalBalanceEl.textContent = `$${balance.toFixed(2)}`;
  totalIncomeEl.textContent = `+$${income.toFixed(2)}`;
  totalExpensesEl.textContent = `-$${expenses.toFixed(2)}`;
}

// Step 6: Render Transaction History List
function renderList() {
  transactionListEl.innerHTML = '';

  if (transactions.length === 0) {
    transactionListEl.innerHTML = '<li style="text-align:center; color:#64748b; padding:1rem;">No transactions added yet.</li>';
    return;
  }

  transactions.forEach(t => {
    const li = document.createElement('li');
    li.className = `transaction-item ${t.type}`;
    
    const sign = t.type === 'income' ? '+' : '-';

    li.innerHTML = `
      <div class="transaction-info">
        <span class="transaction-title">${t.description}</span>
        <span class="transaction-category">${t.category}</span>
      </div>
      <div class="transaction-action">
        <span class="amount ${t.type === 'income' ? 'positive' : 'negative'}">
          ${sign}$${t.amount.toFixed(2)}
        </span>
        <button class="delete-btn" onclick="removeTransaction(${t.id})">&times;</button>
      </div>
    `;

    transactionListEl.appendChild(li);
  });
}

// Step 7: Update Chart.js Breakdown
function updateChart() {
  const expenseData = {};

  transactions
    .filter(t => t.type === 'expense')
    .forEach(t => {
      expenseData[t.category] = (expenseData[t.category] || 0) + t.amount;
    });

  const labels = Object.keys(expenseData);
  const data = Object.values(expenseData);

  if (expenseChart) {
    expenseChart.destroy();
  }

  if (labels.length === 0) return;

  expenseChart = new Chart(chartCanvas, {
    type: 'doughnut',
    data: {
      labels: labels,
      datasets: [{
        data: data,
        backgroundColor: ['#ef4444', '#3b82f6', '#f59e0b', '#10b981', '#8b5cf6', '#64748b']
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false
    }
  });
}

// Sync LocalStorage
function updateLocalStorage() {
  localStorage.setItem('transactions', JSON.stringify(transactions));
}

// Initialize Application
function init() {
  renderList();
  updateSummary();
  updateChart();
}

// Event Listeners
transactionForm.addEventListener('submit', addTransaction);

// Run App on Load
init();
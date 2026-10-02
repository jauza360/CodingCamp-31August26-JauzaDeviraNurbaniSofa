// Global State
let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
let chartInstance = null;

// DOM Elements
const form = document.getElementById('transaction-form');
const itemNameInput = document.getElementById('item-name');
const amountInput = document.getElementById('amount');
const categorySelect = document.getElementById('category');
const totalBalanceEl = document.getElementById('total-balance');
const transactionListEl = document.getElementById('transaction-list');
const emptyStateEl = document.getElementById('empty-state');
const chartCtx = document.getElementById('expense-chart').getContext('2d');

// Format Currency
function formatIDR(amount) {
  return 'Rp ' + amount.toLocaleString('id-ID');
}

// Save LocalStorage
function saveToLocalStorage() {
  localStorage.setItem('transactions', JSON.stringify(transactions));
}

// Update Balance
function updateTotalBalance() {
  const total = transactions.reduce((acc, curr) => acc + curr.amount, 0);
  totalBalanceEl.textContent = formatIDR(total);
}

// Render Transaction List
function renderList() {
  transactionListEl.innerHTML = '';

  if (transactions.length === 0) {
    emptyStateEl.style.display = 'block';
    return;
  }

  emptyStateEl.style.display = 'none';

  transactions.forEach((tx) => {
    const li = document.createElement('li');
    li.className = 'transaction-item';

    li.innerHTML = `
      <div class="item-info">
        <span class="item-title">${escapeHTML(tx.name)}</span>
        <span class="item-amount">${formatIDR(tx.amount)}</span>
        <span class="item-category-tag">${tx.category}</span>
      </div>
      <button class="btn-delete" onclick="deleteTransaction(${tx.id})">Delete</button>
    `;

    transactionListEl.appendChild(li);
  });
}

function escapeHTML(str) {
  return str.replace(/[&<>'"]/g, 
    tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
  );
}

// Add Transaction
form.addEventListener('submit', (e) => {
  e.preventDefault();

  const name = itemNameInput.value.trim();
  const amount = Number(amountInput.value);
  const category = categorySelect.value;

  if (!name || isNaN(amount) || amount <= 0 || !category) {
    alert('Please fill in all fields correctly.');
    return;
  }

  const newTransaction = {
    id: Date.now(),
    name,
    amount,
    category
  };

  transactions.unshift(newTransaction);
  saveToLocalStorage();
  form.reset();
  updateUI();
});

// Delete Transaction
function deleteTransaction(id) {
  transactions = transactions.filter((tx) => tx.id !== id);
  saveToLocalStorage();
  updateUI();
}

// Render Pie Chart
function updateChart() {
  const categoryTotals = { Food: 0, Transport: 0, Fun: 0 };

  transactions.forEach((tx) => {
    if (categoryTotals.hasOwnProperty(tx.category)) {
      categoryTotals[tx.category] += tx.amount;
    }
  });

  const dataValues = [
    categoryTotals.Food,
    categoryTotals.Transport,
    categoryTotals.Fun
  ];

  if (chartInstance) {
    chartInstance.data.datasets[0].data = dataValues;
    chartInstance.update();
  } else {
    chartInstance = new Chart(chartCtx, {
      type: 'pie',
      data: {
        labels: ['Food', 'Transport', 'Fun'],
        datasets: [{
          data: dataValues,
          backgroundColor: ['#f43f5e', '#ec4899', '#f472b6'],
          borderWidth: 1,
          borderColor: '#ffffff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              boxWidth: 12,
              padding: 10,
              font: { size: 11 }
            }
          }
        }
      }
    });
  }
}

function updateUI() {
  updateTotalBalance();
  renderList();
  updateChart();
}

document.addEventListener('DOMContentLoaded', updateUI);
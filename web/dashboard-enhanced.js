// Enhanced Dashboard JavaScript
let currentPeriod = 'week';
let countryChart, operatorChart, hourlyChart, staffChart;

// Initialize dashboard when page loads
document.addEventListener('DOMContentLoaded', function() {
  initializeDashboard();
  loadDashboardData();
});

// Initialize dashboard components
function initializeDashboard() {
  // Set up period tab click handlers
  const tabs = document.querySelectorAll('.tab[data-period]');
  tabs.forEach(tab => {
    tab.addEventListener('click', function() {
      const period = this.getAttribute('data-period');
      setActivePeriod(period);
      loadDashboardData();
    });
  });

  // Set up export button handlers
  document.querySelector('.excel').addEventListener('click', () => exportToExcel());
  document.querySelector('.pdf').addEventListener('click', () => exportToPDF());
  document.querySelector('.print').addEventListener('click', () => window.print());

  // Initialize charts
  initializeCharts();
}

// Set active period tab
function setActivePeriod(period) {
  currentPeriod = period;

  // Update tab styles
  const tabs = document.querySelectorAll('.tab[data-period]');
  tabs.forEach(tab => {
    if (tab.getAttribute('data-period') === period) {
      tab.classList.remove('inactive');
      tab.classList.add('tab');
      tab.style.background = '#ff912d';
      tab.style.color = 'white';
    } else {
      tab.classList.add('inactive');
      tab.classList.remove('tab');
      tab.style.background = '#e0e0e0';
      tab.style.color = '#666';
    }
  });
}

// Initialize Chart.js charts
function initializeCharts() {
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      }
    }
  };

  // Country Chart
  const countryCtx = document.getElementById('countryChart').getContext('2d');
  countryChart = new Chart(countryCtx, {
    type: 'pie',
    data: {
      labels: [],
      datasets: [{
        data: [],
        backgroundColor: [
          '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
          '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF'
        ]
      }]
    },
    options: chartOptions
  });

  // Operator Chart
  const operatorCtx = document.getElementById('operatorChart').getContext('2d');
  operatorChart = new Chart(operatorCtx, {
    type: 'bar',
    data: {
      labels: [],
      datasets: [{
        label: 'Жуулчид',
        data: [],
        backgroundColor: '#36A2EB'
      }]
    },
    options: {
      ...chartOptions,
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });

  // Hourly Chart
  const hourlyCtx = document.getElementById('hourlyChart').getContext('2d');
  hourlyChart = new Chart(hourlyCtx, {
    type: 'line',
    data: {
      labels: [],
      datasets: [{
        label: 'Жуулчид',
        data: [],
        borderColor: '#FF6384',
        backgroundColor: 'rgba(255, 99, 132, 0.1)',
        fill: true
      }]
    },
    options: chartOptions
  });

  // Staff Chart
  const staffCtx = document.getElementById('staffChart').getContext('2d');
  staffChart = new Chart(staffCtx, {
    type: 'doughnut',
    data: {
      labels: ['Жолооч', 'Хөтөч'],
      datasets: [{
        data: [],
        backgroundColor: ['#FF6384', '#36A2EB']
      }]
    },
    options: chartOptions
  });
}

// Load all dashboard data
async function loadDashboardData() {
  try {
    // Load statistics
    await loadStatistics();

    // Load chart data
    await loadCountryStats();
    await loadOperatorStats();
    await loadHourlyStats();
    await loadStaffStats();

    // Load table data
    await loadRegistrationsTable();

  } catch (error) {
    console.error('Error loading dashboard data:', error);
    showError('Өгөгдөл ачаалахад алдаа гарлаа');
  }
}

// Load statistics cards
async function loadStatistics() {
  const result = await TouristRegistrationAPI.getStatistics(currentPeriod);

  if (result.success) {
    const stats = result.data;

    document.getElementById('totalTourists').textContent = stats.totalTourists.toLocaleString();
    document.getElementById('totalRevenue').textContent = stats.totalRevenue.toLocaleString() + '₮';
    document.getElementById('totalRegistrations').textContent = stats.totalRegistrations;
    document.getElementById('totalGuides').textContent = stats.totalGuides;
  }
}

// Load country statistics for pie chart
async function loadCountryStats() {
  const result = await TouristRegistrationAPI.getCountryStats(currentPeriod);

  if (result.success) {
    const data = result.data;
    const labels = data.map(item => item.country);
    const values = data.map(item => item.value);

    countryChart.data.labels = labels;
    countryChart.data.datasets[0].data = values;
    countryChart.update();
  }
}

// Load tour operator statistics for bar chart
async function loadOperatorStats() {
  const result = await TouristRegistrationAPI.getTourOperatorStats(currentPeriod);

  if (result.success) {
    const data = result.data;
    const labels = data.map(item => item.operator);
    const values = data.map(item => item.count);

    operatorChart.data.labels = labels;
    operatorChart.data.datasets[0].data = values;
    operatorChart.update();
  }
}

// Load hourly statistics for line chart
async function loadHourlyStats() {
  const result = await TouristRegistrationAPI.getHourlyStats(currentPeriod);

  if (result.success) {
    const data = result.data;
    const labels = data.map(item => `${item.hour}:00`);
    const values = data.map(item => item.totalVisitors);

    hourlyChart.data.labels = labels;
    hourlyChart.data.datasets[0].data = values;
    hourlyChart.update();
  }
}

// Load staff statistics for doughnut chart
async function loadStaffStats() {
  const result = await TouristRegistrationAPI.getDriverGuideStats(currentPeriod);

  if (result.success) {
    const data = result.data;
    staffChart.data.datasets[0].data = [data.drivers, data.guides];
    staffChart.update();
  }
}

// Load registrations table
async function loadRegistrationsTable() {
  const result = await TouristRegistrationAPI.getRegistrations({ period: currentPeriod });

  if (result.success) {
    const registrations = result.data;
    const tableBody = document.getElementById('tableBody');

    // Clear existing rows
    tableBody.innerHTML = '';

    // Add new rows
    registrations.forEach(reg => {
      const row = createTableRow(reg);
      tableBody.appendChild(row);
    });

    // Update footer totals
    updateTableFooter(registrations);
  }
}

// Create table row from registration data
function createTableRow(registration) {
  const row = document.createElement('tr');

  const date = new Date(registration.registrationDate).toLocaleDateString('mn-MN');
  const countries = Array.isArray(registration.countries)
    ? registration.countries.join(', ')
    : registration.countries || '';

  row.innerHTML = `
    <td>${date}</td>
    <td>${registration.vehicleNumber || ''}</td>
    <td>${registration.vehicleType || ''}</td>
    <td>${registration.guideCount || 0}</td>
    <td>${registration.driverCount || 0}</td>
    <td>${registration.tourOperator}</td>
    <td>${registration.touristCount}</td>
    <td>${countries}</td>
    <td>${registration.totalAmount.toLocaleString()}₮</td>
  `;

  return row;
}

// Update table footer with totals
function updateTableFooter(registrations) {
  const totalGuides = registrations.reduce((sum, reg) => sum + (reg.guideCount || 0), 0);
  const totalDrivers = registrations.reduce((sum, reg) => sum + (reg.driverCount || 0), 0);
  const totalTourists = registrations.reduce((sum, reg) => sum + reg.touristCount, 0);
  const totalRevenue = registrations.reduce((sum, reg) => sum + reg.totalAmount, 0);

  document.getElementById('totalGuidesFooter').textContent = totalGuides;
  document.getElementById('totalDriversFooter').textContent = totalDrivers;
  document.getElementById('totalTouristsFooter').textContent = totalTourists;
  document.getElementById('totalRevenueFooter').textContent = totalRevenue.toLocaleString() + '₮';
}

// Export functions
async function exportToExcel() {
  try {
    const result = await TouristRegistrationAPI.exportToExcel({ period: currentPeriod });
    if (!result.success) {
      showError('Excel файл татахад алдаа гарлаа: ' + result.error);
    } else {
      showSuccess('Excel файл амжилттай татагдлаа');
    }
  } catch (error) {
    console.error('Excel export error:', error);
    showError('Excel файл татахад алдаа гарлаа');
  }
}

async function exportToPDF() {
  try {
    const result = await TouristRegistrationAPI.exportToPDF({ period: currentPeriod });
    if (!result.success) {
      showError('PDF файл татахад алдаа гарлаа: ' + result.error);
    } else {
      showSuccess('PDF файл амжилттай татагдлаа');
    }
  } catch (error) {
    console.error('PDF export error:', error);
    showError('PDF файл татахад алдаа гарлаа');
  }
}

// Utility functions
function showError(message) {
  // Simple alert for now - could be enhanced with toast notifications
  alert('❌ ' + message);
}

function showSuccess(message) {
  alert('✅ ' + message);
}

// Auto-refresh data every 5 minutes
setInterval(() => {
  loadDashboardData();
}, 5 * 60 * 1000);

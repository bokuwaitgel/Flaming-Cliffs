// Print functionality
document.querySelector('.print').onclick = () => window.print();

// Excel export functionality
document.querySelector('.excel').onclick = async () => {
  try {
    const result = await TouristRegistrationAPI.exportToExcel();
    if (!result.success) {
      alert('Excel файл татахад алдаа гарлаа: ' + result.error);
    }
  } catch (error) {
    console.error('Excel export error:', error);
    alert('Excel файл татахад алдаа гарлаа. Дахин оролдоно уу.');
  }
};

// PDF export functionality
document.querySelector('.pdf').onclick = async () => {
  try {
    const result = await TouristRegistrationAPI.exportToPDF();
    if (!result.success) {
      alert('PDF файл татахад алдаа гарлаа: ' + result.error);
    }
  } catch (error) {
    console.error('PDF export error:', error);
    alert('PDF файл татахад алдаа гарлаа. Дахин оролдоно уу.');
  }
};

// Load and display registration data
document.addEventListener('DOMContentLoaded', function() {
  loadRegistrationData();
  
  // Add event listeners for time period tabs
  const tabs = document.querySelectorAll('.tab, .header-tabs strong');
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', function() {
      // Remove active class from all tabs
      tabs.forEach(t => {
        t.classList.remove('tab');
        t.style.background = '';
        t.style.color = '';
        t.style.borderRadius = '';
        t.style.fontWeight = 'bold';
      });
      
      // Add active class to clicked tab
      this.classList.add('tab');
      this.style.background = '#ff912d';
      this.style.color = 'white';
      this.style.borderRadius = '20px';
      this.style.padding = '6px 16px';
      
      // Load data based on selected period
      let period = 'today';
      if (index === 1) period = 'week';
      if (index === 2) period = 'month';
      
      loadRegistrationData(period);
    });
  });
});

// Function to load registration data
async function loadRegistrationData(period = 'today') {
  try {
    const filters = { period: period };
    const result = await TouristRegistrationAPI.getRegistrations(filters);
    
    if (result.success) {
      updateRegistrationTable(result.data);
    } else {
      console.error('Failed to load registration data:', result.error);
      // Show static data if API fails
      console.log('Showing static data due to API error');
    }
  } catch (error) {
    console.error('Error loading registration data:', error);
    // Keep existing static data if API is not available
    console.log('API not available, keeping static data');
  }
}

// Function to update the registration table
function updateRegistrationTable(registrations) {
  const tbody = document.querySelector('table tbody');
  if (!tbody) return;

  // Clear existing rows except the total row
  const existingRows = tbody.querySelectorAll('tr:not(:last-child)');
  existingRows.forEach(row => row.remove());

  // Add new rows
  registrations.forEach(registration => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${registration.registrationDate || registration.date}</td>
      <td>${registration.vehicleNumber}</td>
      <td>${registration.vehicleType}</td>
      <td>${registration.guideCount}</td>
      <td>${registration.driverCount}</td>
      <td>${registration.tourOperator}</td>
      <td>${registration.touristCount}</td>
      <td>${registration.countries ? registration.countries.join(', ') : registration.country}</td>
      <td>${registration.totalAmount ? registration.totalAmount.toLocaleString() + '₮' : registration.payment}</td>
    `;
    tbody.insertBefore(row, tbody.lastElementChild);
  });

  // Update totals
  updateTotals(registrations);
}

// Function to update table totals
function updateTotals(registrations) {
  const totalRow = document.querySelector('tfoot tr');
  if (!totalRow) return;

  const totalGuides = registrations.reduce((sum, reg) => sum + (reg.guideCount || 0), 0);
  const totalDrivers = registrations.reduce((sum, reg) => sum + (reg.driverCount || 0), 0);
  const totalTourists = registrations.reduce((sum, reg) => sum + (reg.touristCount || 0), 0);
  const totalAmount = registrations.reduce((sum, reg) => {
    const amount = reg.totalAmount || parseFloat(reg.payment?.replace(/[₮,]/g, '')) || 0;
    return sum + amount;
  }, 0);

  totalRow.innerHTML = `
    <td colspan="3">Нийт</td>
    <td>${totalGuides}</td>
    <td>${totalDrivers}</td>
    <td></td>
    <td>${totalTourists}</td>
    <td></td>
    <td>${totalAmount.toLocaleString()}₮</td>
  `;
}
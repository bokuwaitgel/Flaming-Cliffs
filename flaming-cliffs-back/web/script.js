// Print functionality
const printBtn = document.querySelector('.print');
if (printBtn) printBtn.onclick = () => window.print();

// Excel export functionality
const excelBtn = document.querySelector('.excel');
if (excelBtn) excelBtn.onclick = async () => {
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
const pdfBtn = document.querySelector('.pdf');
if (pdfBtn) pdfBtn.onclick = async () => {
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
  // initial load
  loadRegistrationData();

  // Add event listeners for period tabs
  const tabs = document.querySelectorAll('.period-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', function() {
      tabs.forEach(t => t.classList.remove('bg-amber-500', 'text-white'));
      this.classList.add('bg-amber-500', 'text-white');
      const period = this.dataset.period || 'today';
      loadRegistrationData(period);
    });
  });

  // Search filter
  const searchInput = document.querySelector('#search');
  if (searchInput) {
    let to;
    searchInput.addEventListener('input', function() {
      clearTimeout(to);
      to = setTimeout(() => {
        const term = this.value.trim().toLowerCase();
        filterTable(term);
      }, 250);
    });
  }
});

// Function to load registration data
async function loadRegistrationData(period = 'today') {
  try {
    const filters = { period: period };
    const result = await TouristRegistrationAPI.getRegistrations(filters);
    
    if (result.success) {
  const data = Array.isArray(result.data) ? result.data : (result.data.registrations || []);
  updateRegistrationTable(data);
  updateSummaryCards(result.data);
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
  const body = document.getElementById('registrations-body');
  const emptyState = document.getElementById('empty-state');
  if (!body) return;

  body.innerHTML = '';
  if (!registrations || registrations.length === 0) {
    emptyState && (emptyState.classList.remove('hidden'));
    updateTotals([]);
    return;
  }

  emptyState && (emptyState.classList.add('hidden'));

  registrations.forEach(registration => {
    const tr = document.createElement('tr');
    const date = registration.registrationDate || registration.date || '';
    const countries = registration.countries ? registration.countries.join(', ') : (registration.country || '');
    const amount = registration.totalAmount || parseFloat(registration.payment?.toString().replace(/[₮,]/g, '')) || 0;

    tr.innerHTML = `
      <td class="p-3">${date}</td>
      <td class="p-3">${registration.vehicleNumber || ''}</td>
      <td class="p-3">${registration.vehicleType || ''}</td>
      <td class="p-3">${registration.guideCount || 0}</td>
      <td class="p-3">${registration.driverCount || 0}</td>
      <td class="p-3">${registration.tourOperator || ''}</td>
      <td class="p-3">${registration.touristCount || 0}</td>
      <td class="p-3">${countries}</td>
      <td class="p-3 text-right">${amount.toLocaleString()}₮</td>
    `;
    body.appendChild(tr);
  });

  updateTotals(registrations);
}

// Function to update table totals
function updateTotals(registrations) {
  const guidesEl = document.getElementById('total-guides');
  const driversEl = document.getElementById('total-drivers');
  const touristsEl = document.getElementById('total-tourists');
  const amountEl = document.getElementById('total-amount');

  const totalGuides = (registrations || []).reduce((sum, reg) => sum + (reg.guideCount || 0), 0);
  const totalDrivers = (registrations || []).reduce((sum, reg) => sum + (reg.driverCount || 0), 0);
  const totalTourists = (registrations || []).reduce((sum, reg) => sum + (reg.touristCount || 0), 0);
  const totalAmount = (registrations || []).reduce((sum, reg) => {
    const amount = reg.totalAmount || parseFloat((reg.payment || '').toString().replace(/[₮,]/g, '')) || 0;
    return sum + amount;
  }, 0);

  if (guidesEl) guidesEl.textContent = totalGuides;
  if (driversEl) driversEl.textContent = totalDrivers;
  if (touristsEl) touristsEl.textContent = totalTourists;
  if (amountEl) amountEl.textContent = totalAmount.toLocaleString() + '₮';
}

// Update summary cards in the right column (if API returns aggregate values)
function updateSummaryCards(apiData) {
  // apiData may be an object with totals or the original registrations array
  let totals = {
    guides: 0,
    drivers: 0,
    tourists: 0,
    amount: 0
  };

  if (!apiData) {
    // leave defaults
  } else if (Array.isArray(apiData)) {
    totals.guides = apiData.reduce((s, r) => s + (r.guideCount || 0), 0);
    totals.drivers = apiData.reduce((s, r) => s + (r.driverCount || 0), 0);
    totals.tourists = apiData.reduce((s, r) => s + (r.touristCount || 0), 0);
    totals.amount = apiData.reduce((s, r) => s + (r.totalAmount || parseFloat((r.payment||'').toString().replace(/[₮,]/g,''))||0), 0);
  } else if (typeof apiData === 'object') {
    totals.guides = apiData.totalGuides || apiData.guides || 0;
    totals.drivers = apiData.totalDrivers || apiData.drivers || 0;
    totals.tourists = apiData.totalTourists || apiData.tourists || 0;
    totals.amount = apiData.totalAmount || apiData.amount || 0;
  }

  const cg = document.getElementById('card-guides');
  const cd = document.getElementById('card-drivers');
  const ct = document.getElementById('card-tourists');
  const ca = document.getElementById('card-amount');

  if (cg) cg.textContent = totals.guides;
  if (cd) cd.textContent = totals.drivers;
  if (ct) ct.textContent = totals.tourists;
  if (ca) ca.textContent = totals.amount.toLocaleString() + '₮';
}

function filterTable(term) {
  const rows = document.querySelectorAll('#registrations-body tr');
  if (!rows) return;
  rows.forEach(r => {
    const text = r.textContent.toLowerCase();
    r.style.display = text.includes(term) ? '' : 'none';
  });
}
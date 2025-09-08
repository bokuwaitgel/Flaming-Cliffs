let count = 1;
const countEl = document.getElementById("count");
const countRightEl = document.getElementById("countRight");
const resetBtn = document.getElementById("resetBtn");

document.querySelector(".flex-1").addEventListener("click", (e) => {
  if (e.target !== resetBtn) {
    count++;
    countEl.textContent = count;
    countRightEl.textContent = count;
  }
});

resetBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  count = 1;
  countEl.textContent = count;
  countRightEl.textContent = count;
});

// Tourist count and payment logic
let travelerCount = 1;
const pricePerPerson = 10000;

const countDisplay = document.querySelector("#travelerCount");
const totalCountDisplay = document.querySelector("#totalTravelerCount");
const totalAmountDisplay = document.querySelector("#totalAmount");
const formulaDisplay = document.querySelector("#formulaText");

const updateDisplay = () => {
  countDisplay.textContent = travelerCount;
  totalCountDisplay.textContent = travelerCount;
  totalAmountDisplay.textContent = `${(
    travelerCount * pricePerPerson
  ).toLocaleString()}₮`;
  formulaDisplay.textContent = `${pricePerPerson.toLocaleString()}₮ * ${travelerCount}`;
};

document.querySelector("#resetBtn").addEventListener("click", () => {
  travelerCount = 1;
  updateDisplay();
});

document.querySelector("#increaseBtn").addEventListener("click", () => {
  travelerCount++;
  updateDisplay();
});

document.querySelector("#decreaseBtn").addEventListener("click", () => {
  if (travelerCount > 1) {
    travelerCount--;
    updateDisplay();
  }
});

updateDisplay();

// Global variables
let selectedCountries = [];

const clearAllBtn = document.getElementById("clear-all");

clearAllBtn.addEventListener("click", () => {
  // Clear all input fields
  const driverInput = document.getElementById('driverInput');
  const guideInput = document.getElementById('guideInput');
  const guideNameInput = document.getElementById('guideNameInput');
  const vehicleNumberInput = document.getElementById('vehicleNumberInput');
  const tourOperatorSelect = document.getElementById('tourOperatorSelect');
  const vehicleTypeSelect = document.getElementById('vehicleTypeSelect');
  const countrySelect = document.getElementById('countrySelect');

  if (driverInput) driverInput.value = '';
  if (guideInput) guideInput.value = '';
  if (guideNameInput) guideNameInput.value = '';
  if (vehicleNumberInput) vehicleNumberInput.value = '';
  if (tourOperatorSelect) tourOperatorSelect.selectedIndex = 0;
  if (vehicleTypeSelect) vehicleTypeSelect.selectedIndex = 0;
  if (countrySelect) countrySelect.selectedIndex = 0;

  // Clear selected countries and reset flag styling
  selectedCountries = [];
  document.querySelectorAll('.country-flag').forEach(flag => {
    flag.classList.remove('bg-blue-100', 'border-2', 'border-blue-500');
    flag.classList.add('hover:bg-gray-100');
  });
  
  // Update country display
  const countryDisplay = document.querySelector('.mt-2.text-xs.text-gray-600.italic');
  if (countryDisplay) {
    countryDisplay.textContent = 'Улс сонгоогүй байна';
    countryDisplay.classList.add('text-gray-400');
    countryDisplay.classList.remove('text-blue-600', 'font-medium');
  }

  // Clear the list items
  const list = document.getElementById("items");
  if (list) {
    list.innerHTML = "";
  }

  // Reset counts
  count = 1;
  travelerCount = 1;
  countEl.textContent = count;
  countRightEl.textContent = count;
  updateDisplay();

  console.log("All cleared!");
});

// Form submission handling
document.addEventListener('DOMContentLoaded', function() {
  // Add IDs to form elements for easier access
  const form = document.querySelector('.text-black.rounded-xl.p-6.space-y-6');
  
  // Get form elements using IDs
  const driverInput = document.getElementById('driverInput');
  const guideInput = document.getElementById('guideInput');
  const guideNameInput = document.getElementById('guideNameInput');
  const vehicleNumberInput = document.getElementById('vehicleNumberInput');
  const tourOperatorSelect = document.getElementById('tourOperatorSelect');
  const vehicleTypeSelect = document.getElementById('vehicleTypeSelect');
  const countrySelect = document.getElementById('countrySelect');
  const addCountryBtn = document.getElementById('addCountryBtn');
  const paymentButton = document.getElementById('paymentBtn');
  const saveButton = document.getElementById('saveBtn');

  // Add click handlers for country flags
  document.querySelectorAll('.country-flag').forEach((countryElement) => {
    countryElement.addEventListener('click', function() {
      const countryName = this.getAttribute('data-country');
      
      if (!selectedCountries.includes(countryName)) {
        selectedCountries.push(countryName);
        this.classList.add('bg-blue-100', 'border-2', 'border-blue-500');
        this.classList.remove('hover:bg-gray-100');
        updateCountryDisplay();
      } else {
        // Remove country if already selected
        const index = selectedCountries.indexOf(countryName);
        selectedCountries.splice(index, 1);
        this.classList.remove('bg-blue-100', 'border-2', 'border-blue-500');
        this.classList.add('hover:bg-gray-100');
        updateCountryDisplay();
      }
    });
  });

  // Add country from dropdown
  if (addCountryBtn) {
    addCountryBtn.addEventListener('click', function() {
      const selectedCountry = countrySelect.value;
      if (selectedCountry && !selectedCountries.includes(selectedCountry)) {
        selectedCountries.push(selectedCountry);
        updateCountryDisplay();
        
        // Find and highlight the corresponding flag
        const flagElement = document.querySelector(`[data-country="${selectedCountry}"]`);
        if (flagElement) {
          flagElement.classList.add('bg-blue-100', 'border-2', 'border-blue-500');
          flagElement.classList.remove('hover:bg-gray-100');
        }
        
        // Reset dropdown
        countrySelect.value = '';
      }
    });
  }

  // Update country display
  function updateCountryDisplay() {
    const countryDisplay = document.querySelector('.mt-2.text-xs.text-gray-600.italic');
    if (countryDisplay) {
      if (selectedCountries.length > 0) {
        countryDisplay.textContent = `Сонгогдсон улсууд: ${selectedCountries.join(', ')}`;
        countryDisplay.classList.remove('text-gray-400');
        countryDisplay.classList.add('text-blue-600', 'font-medium');
      } else {
        countryDisplay.textContent = 'Улс сонгоогүй байна';
        countryDisplay.classList.add('text-gray-400');
        countryDisplay.classList.remove('text-blue-600', 'font-medium');
      }
    }
  }

  // Function to handle form submission
  async function submitForm(isPayment = false) {
    // Validate inputs before collecting data
    if (!driverInput || !guideInput || !guideNameInput || !vehicleNumberInput || !tourOperatorSelect || !vehicleTypeSelect) {
      alert('Форм бүрэн ачаалагдаагүй байна. Дахин оролдоно уу.');
      return false;
    }

    // Collect form data with proper validation
    const formData = {
      driverCount: Math.max(0, parseInt(driverInput.value) || 0),
      guideCount: Math.max(0, parseInt(guideInput.value) || 0), 
      guideName: (guideNameInput.value || '').trim(),
      vehicleNumber: (vehicleNumberInput.value || '').trim(),
      tourOperator: tourOperatorSelect.value || '',
      vehicleType: vehicleTypeSelect.value || '',
      touristCount: Math.max(1, travelerCount || 1),
      countries: [...selectedCountries], // Create a copy
      totalAmount: Math.max(0, (travelerCount || 1) * pricePerPerson),
      registrationDate: new Date().toISOString().split('T')[0],
      status: isPayment ? 'paid' : 'saved'
    };

    // Validate form data
    const validation = ValidationUtils.validateRegistrationForm(formData);
    
    if (!validation.isValid) {
      alert('Алдаа:\n' + validation.errors.join('\n'));
      return false;
    }

    // Show loading state
    const button = isPayment ? paymentButton : saveButton;
    const originalText = button.textContent;
    button.textContent = 'Илгээж байна...';
    button.disabled = true;

    try {
      // Submit to API
      const result = await TouristRegistrationAPI.createRegistration(formData);
      
      if (result && result.success) {
        const message = isPayment ? 
          `Бүртгэл амжилттай хадгалагдаж, ${formData.totalAmount.toLocaleString()}₮ төлбөр төлөгдлөө!` :
          'Бүртгэл амжилттай хадгалагдлаа!';
        alert(message);
        
        // Clear form after successful submission
        clearFormData();
        
        // Refresh the table data
        await loadRegistrationData();
        return true;
      } else {
        const errorMsg = result?.error || 'Тодорхойгүй алдаа гарлаа';
        alert('Алдаа гарлаа: ' + errorMsg);
        return false;
      }
    } catch (error) {
      console.error('Submission error:', error);
      let errorMessage = 'Серверт холбогдоход алдаа гарлаа.';
      
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        errorMessage = 'Сервер ажиллахгүй байна. Интернет холболтоо шалгана уу.';
      } else if (error.message.includes('400')) {
        errorMessage = 'Оруулсан мэдээлэл буруу байна.';
      } else if (error.message.includes('500')) {
        errorMessage = 'Серверийн алдаа гарлаа.';
      }
      
      alert(errorMessage + ' Дахин оролдоно уу.');
      return false;
    } finally {
      // Reset button state
      button.textContent = originalText;
      button.disabled = false;
    }
  }

  // Payment button click handler
  if (paymentButton) {
    paymentButton.addEventListener('click', async function(e) {
      e.preventDefault();
      await submitForm(true);
    });
  }

  // Save button click handler
  if (saveButton) {
    saveButton.addEventListener('click', async function(e) {
      e.preventDefault();
      await submitForm(false);
    });
  }

  // Function to clear form data
  function clearFormData() {
    if (driverInput) driverInput.value = '';
    if (guideInput) guideInput.value = '';
    if (guideNameInput) guideNameInput.value = '';
    if (vehicleNumberInput) vehicleNumberInput.value = '';
    if (tourOperatorSelect) tourOperatorSelect.selectedIndex = 0;
    if (vehicleTypeSelect) vehicleTypeSelect.selectedIndex = 0;
    if (countrySelect) countrySelect.selectedIndex = 0;

    // Clear selected countries and reset flag styling
    selectedCountries.length = 0; // Clear array without reassigning
    document.querySelectorAll('.country-flag').forEach(flag => {
      flag.classList.remove('bg-blue-100', 'border-2', 'border-blue-500');
      flag.classList.add('hover:bg-gray-100');
    });
    
    // Reset counts
    count = 1;
    travelerCount = 1;
    if (countEl) countEl.textContent = count;
    if (countRightEl) countRightEl.textContent = count;
    updateDisplay();
    updateCountryDisplay();
  }

  // Initialize country display
  updateCountryDisplay();

  // Load initial data with a small delay to ensure DOM is ready
  setTimeout(() => {
    console.log('DOM ready, looking for registrationTableBody...');
    const tableBody = document.getElementById('registrationTableBody');
    console.log('Found tableBody:', tableBody);
    
    loadRegistrationData();
    setupPeriodFilters();
  }, 100);
});

// Function to load and display registration data
async function loadRegistrationData(period = 'today') {
  // Wait for the element to be available
  let tableBody = document.getElementById('registrationTableBody');
  
  if (!tableBody) {
    console.error('Table body not found');
    return;
  }
  
  // Show loading state
  tableBody.innerHTML = '<tr><td class="p-2 text-center" colspan="9">Мэдээлэл ачааллаж байна...</td></tr>';
  let attempts = 0;
  
  while (!tableBody && attempts < 10) {
    await new Promise(resolve => setTimeout(resolve, 100));
    tableBody = document.getElementById('registrationTableBody');
    attempts++;
  }
  
  if (!tableBody) {
    console.error('registrationTableBody element not found after waiting');
    return;
  }
  
  // Show loading state
  tableBody.innerHTML = '<tr><td class="p-2 text-center" colspan="9">Мэдээлэл ачааллаж байна...</td></tr>';
  
  try {
    const response = await fetch(`http://localhost:3000/api/registrations?period=${period}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const registrations = await response.json();
    updateRegistrationTable(registrations);
    
  } catch (error) {
    console.error('Error loading registration data:', error);
    tableBody.innerHTML = '<tr><td class="p-2 text-center text-red-500" colspan="9">Мэдээлэл ачааллахад алдаа гарлаа</td></tr>';
  }
}

// Function to update the registration table
function updateRegistrationTable(registrations) {
  const tableBody = document.getElementById('registrationTableBody');
  if (!tableBody) return;
  
  // Clear existing rows
  tableBody.innerHTML = '';
  
  if (!registrations || registrations.length === 0) {
    tableBody.innerHTML = '<tr><td class="p-2 text-center" colspan="10">Бүртгэл олдсонгүй</td></tr>';
    return;
  }
  
  // Add registration rows
  registrations.forEach(reg => {
    const row = document.createElement('tr');
    row.className = 'border-t hover:bg-gray-50';
    
    const formattedDate = new Date(reg.registrationDate).toLocaleDateString('mn-MN');
    const countries = Array.isArray(reg.countries) ? reg.countries.join(', ') : '';
    const status = reg.status === 'paid' ? 'Төлбөртэй' : 'Хадгалагдсан';
    const statusClass = reg.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800';
    
    row.innerHTML = `
      <td class="p-2">${formattedDate}</td>
      <td class="p-2">${reg.vehicleNumber || ''}</td>
      <td class="p-2">${reg.vehicleType || ''}</td>
      <td class="p-2">${reg.guideName || ''}</td>
      <td class="p-2">${reg.driverCount || 0}</td>
      <td class="p-2">${reg.tourOperator || ''}</td>
      <td class="p-2">${reg.touristCount || 0}</td>
      <td class="p-2">${countries}</td>
      <td class="p-2">${(reg.totalAmount || 0).toLocaleString()}₮</td>
      <td class="p-2"><span class="px-2 py-1 rounded-full text-xs font-semibold ${statusClass}">${status}</span></td>
    `;
    
    tableBody.appendChild(row);
  });
  
  // Add totals row
  addTotalsRow(registrations);
}

// Function to add totals row
function addTotalsRow(registrations) {
  const tbody = document.getElementById('registrationTableBody');
  if (!tbody) return;

  const totalGuides = registrations.reduce((sum, reg) => sum + (reg.guideCount || 0), 0);
  const totalDrivers = registrations.reduce((sum, reg) => sum + (reg.driverCount || 0), 0);
  const totalTourists = registrations.reduce((sum, reg) => sum + (reg.touristCount || 0), 0);
  const totalAmount = registrations.reduce((sum, reg) => sum + (reg.totalAmount || (reg.touristCount * 10000) || 0), 0);

  const totalRow = document.createElement('tr');
  totalRow.className = 'font-bold bg-gray-100';
  totalRow.innerHTML = `
    <td class="p-2" colspan="3">Нийт</td>
    <td class="p-2">${totalGuides}</td>
    <td class="p-2">${totalDrivers}</td>
    <td class="p-2"></td>
    <td class="p-2">${totalTourists}</td>
    <td class="p-2"></td>
    <td class="p-2">${totalAmount.toLocaleString()}₮</td>
    <td class="p-2"></td>
  `;
  tbody.appendChild(totalRow);
}

// Function to setup period filter buttons
function setupPeriodFilters() {
  const periodButtons = document.querySelectorAll('.period-btn');
  
  periodButtons.forEach(button => {
    button.addEventListener('click', async function() {
      const period = this.getAttribute('data-period');
      
      // Update button styles
      periodButtons.forEach(btn => {
        btn.classList.remove('bg-orange-400', 'text-white');
        btn.classList.add('text-black');
      });
      
      this.classList.add('bg-orange-400', 'text-white');
      this.classList.remove('text-black');
      
      // Load data for selected period
      await loadRegistrationData(period);
    });
  });
}
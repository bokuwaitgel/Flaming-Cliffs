// Constants (centralized configuration)
const PRICE_PER_PERSON = 10000; // ₮ per tourist
const PRICE_FOR_MONGOL = 3000; // ₮ per Mongolian tourist
const DEFAULT_TRAVELER_COUNT = 0;

// Global variables
let countryTouristCounts = {}; // New format: {country: count}
let touristIdCounter = 0;

// Tourist count and payment logic
let count = DEFAULT_TRAVELER_COUNT;
let travelerCount = DEFAULT_TRAVELER_COUNT;
const pricePerPerson = PRICE_PER_PERSON;
const priceForMongol = PRICE_FOR_MONGOL;

const totalCountDisplay = document.querySelector("#totalTravelerCount");
const totalAmountDisplay = document.querySelector("#totalAmount");
const formulaDisplay = document.querySelector("#formulaText");

const updateDisplay = () => {
  console.log('updateDisplay called, travelerCount:', countryTouristCounts); // Debug log
  travelerCount = countryTouristCounts ? Object.values(countryTouristCounts).reduce((sum, cnt) => sum + cnt, 0) : 0;

  travelerMongolian = countryTouristCounts['Монгол'] || 0;
  travelerOther = travelerCount - travelerMongolian;
  // Update all display elements with current traveler count and amount
  const totalTouristEl = document.getElementById('totalTourist'); // Updated to match HTML
  const totalCountEl = document.getElementById('totalTravelerCount');
  const totalAmountEl = document.getElementById('totalAmount');
  const formulaEl = document.getElementById('formulaText');
  
  console.log('Elements found:', {
    totalTourist: !!totalTouristEl,
    totalCount: !!totalCountEl,
    totalAmount: !!totalAmountEl,
    formula: !!formulaEl
  }); // Debug log
  
  if (totalCountEl) totalCountEl.textContent = travelerCount;
  if (totalTouristEl) totalTouristEl.textContent = travelerCount; // Updated to use new ID
  if (totalAmountEl) totalAmountEl.textContent = `${(
    travelerOther * pricePerPerson + travelerMongolian * priceForMongol 
  ).toLocaleString()}₮`;
  if (formulaEl) formulaEl.textContent = `${pricePerPerson.toLocaleString()}₮ /Монгол $${priceForMongol.toLocaleString()}₮ /* ${travelerCount}`;
};

updateDisplay();

// Tourist management functions
function addTourist() {
  const countryInput = document.getElementById('touristCountry');
  const countInput = document.getElementById('touristCount');
  
  const country = countryInput.value;
  const count = parseInt(countInput.value) || 1;
  
  console.log('Adding tourist:', country, count); // Debug log
  
  // Validate required fields
  if (!country) {
    alert('Улс сонгоно уу!');
    return;
  }
  
  if (count < 1 || count > 120) {
    alert('Жуулчдын тоо 1-120 хооронд байх ёстой!');
    return;
  }
  
  // Add to country tourist counts
  if (countryTouristCounts[country]) {
    countryTouristCounts[country] += count;
  } else {
    countryTouristCounts[country] = count;
  }
  
  console.log('Updated countryTouristCounts:', countryTouristCounts); // Debug log
  
  // Clear inputs
  countryInput.selectedIndex = 0;
  countInput.value = '';
  
  // Update display
  updateDisplay();
  updateTouristsList();
  updateTouristCount();
}

function removeTourist(country) {
  if (countryTouristCounts[country]) {
    if (countryTouristCounts[country] > 1) {
      countryTouristCounts[country]--;
    } else {
      delete countryTouristCounts[country];
    }
  }
  updateTouristsList();
  updateTouristCount();
}

function removeAllFromCountry(country) {
  if (countryTouristCounts[country]) {
    delete countryTouristCounts[country];
  }
  updateTouristsList();
  updateTouristCount();
}

function updateTouristsList() {
  const touristsList = document.getElementById('touristsList');
  
  if (!touristsList) return;
  
  const countries = Object.keys(countryTouristCounts);
  
  if (countries.length === 0) {
    touristsList.innerHTML = '<div class="text-gray-500 text-sm italic text-center py-4" id="emptyTouristsMessage">Жуулч нэмээгүй байна</div>';
    return;
  }
  
  let html = '';
  countries.forEach((country) => {
    const count = countryTouristCounts[country];
    const flagUrl = getCountryFlag(country);
    
    html += `
      <div class="flex justify-between items-center bg-gray-50 p-3 rounded-lg border" data-country="${country}">
        <div class="flex items-center gap-3">
          <div class="flex items-center gap-2">
            <img 
              src="${flagUrl}" 
              alt="${country}" 
              class="w-6 h-4 rounded shadow-sm border"
              onerror="this.style.display='none'"
            />
            <div class="text-sm">
              <span class="font-medium text-gray-800">${country}</span>
              <span class="text-gray-600 bg-blue-100 px-2 py-1 rounded-full text-xs ml-2">${count} жуулч</span>
            </div>
          </div>
        </div>
        <div class="flex gap-2">
          <button 
            onclick="removeTourist('${country}')" 
            class="bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 rounded text-xs font-medium transition-colors"
            title="Нэг жуулч хасах"
          >
            -1
          </button>
          <button 
            onclick="removeAllFromCountry('${country}')" 
            class="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs font-medium transition-colors"
            title="Бүх жуулч устгах"
          >
            ❌
          </button>
        </div>
      </div>
    `;
  });
  
  touristsList.innerHTML = html;
}

function updateTouristCount() {
  const totalCount = Object.values(countryTouristCounts).reduce((sum, count) => sum + count, 0);
  
  console.log('updateTouristCount called - totalCount:', totalCount); // Debug log
  console.log('countryTouristCounts:', countryTouristCounts); // Debug log
  
  count = Math.max(0, totalCount);
  travelerCount = Math.max(0, totalCount);
  
  console.log('Updated travelerCount to:', travelerCount); // Debug log
  
  updateDisplay();
}

// Make functions globally available for HTML onclick handlers
window.addTourist = addTourist;
window.removeTourist = removeTourist;
window.removeAllFromCountry = removeAllFromCountry;

function collectTouristData() {
  console.log(countryTouristCounts)
  const touristsArray = Object.entries(countryTouristCounts).map(([country, count]) => ({
    country: country,
    count: count
  }));
  console.log(touristsArray)
  return touristsArray.length > 0 ? touristsArray : [{
    country: 'Unknown',
    count: 1
  }];
}

const clearAllBtn = document.getElementById("clear-all");

if (clearAllBtn) {
  clearAllBtn.addEventListener("click", () => {
  // Clear all input fields
  const driverInput = document.getElementById('driverInput');
  const guideInput = document.getElementById('guideInput');
  const guideNameInput = document.getElementById('guideNameInput');
  const vehicleNumberInput = document.getElementById('vehicleNumberInput');
  const tourOperatorSelect = document.getElementById('tourOperatorSelect');
  const vehicleTypeSelect = document.getElementById('vehicleTypeSelect');

  if (driverInput) driverInput.value = '';
  if (guideInput) guideInput.value = '';
  if (guideNameInput) guideNameInput.value = '';
  if (vehicleNumberInput) vehicleNumberInput.value = '';
  if (tourOperatorSelect) tourOperatorSelect.selectedIndex = 0;
  if (vehicleTypeSelect) vehicleTypeSelect.selectedIndex = 0;

  // Clear tourists array and update display
  countryTouristCounts = {};
  updateTouristsList();

  // Reset counts
  count = DEFAULT_TRAVELER_COUNT;
  travelerCount = DEFAULT_TRAVELER_COUNT;
  if (totalTouristEl) totalTouristEl.textContent = count;
  updateDisplay();

  console.log("All cleared!");
  });
}

// Make functions globally available for HTML onclick handlers
window.addTourist = addTourist;
window.removeTourist = removeTourist;
window.removeAllFromCountry = removeAllFromCountry;

// Country flag mapping
function getCountryFlag(countryName) {
  const flagMap = {
    'Хятад': 'cn',
    'China': 'cn',
    'Орос': 'ru', 
    'Russia': 'ru',
    'Солонгос': 'kr',
    'Korea': 'kr',
    'Korean': 'kr',
    'South Korea': 'kr',
    'Япон': 'jp',
    'Japan': 'jp',
    'АНУ': 'us',
    'USA': 'us',
    'America': 'us',
    'Герман': 'de',
    'Germany': 'de',
    'Франц': 'fr',
    'France': 'fr',
    'Итали': 'it',
    'Italy': 'it',
    'Казахстан': 'kz',
    'Kazakhstan': 'kz',
    'Украйн': 'ua',
    'Ukraine': 'ua',
    'UK': 'gb',
    'Britain': 'gb',
    'Австрали': 'au',
    'Australia': 'au',
    'Канад': 'ca',
    'Canada': 'ca',
    'Poland': 'pl',
    'Турк': 'tr',
    'Turkey': 'tr',
    'Швейцари': 'ch',
    'Switzerland': 'ch',
    'Монгол': 'mn',
    'Mongolia': 'mn'
  };
  
  const code = flagMap[countryName] || 'un'; // Default to UN flag for unknown countries
  return `https://flagcdn.com/w40/${code}.png`;
}

// Make functions globally available for HTML onclick handlers

function removeTouristEntry(entryElement) {
  entryElement.remove();
  updateTouristCount();
}

function updateTouristCount() {
  const touristEntries = document.querySelectorAll('.tourist-entry');
  const totalTouristEl = document.getElementById('totalTourist');
  const newCount = touristEntries.length;
  
  count = newCount;
  travelerCount = newCount;
  
  if (totalTouristEl) totalTouristEl.textContent = count;
  updateDisplay();
  
  // Show/hide remove buttons based on count
  touristEntries.forEach((entry, index) => {
    const removeBtn = entry.querySelector('.remove-tourist');
    if (removeBtn) {
      removeBtn.style.display = newCount > 1 ? 'block' : 'none';
    }
  });
}

function collectTouristData() {
  const touristEntries = document.querySelectorAll('.tourist-entry');
  const tourists = [];
  
  touristEntries.forEach((entry, index) => {
    const name = entry.querySelector('.tourist-name').value.trim();
    const country = entry.querySelector('.tourist-country').value;
    const age = entry.querySelector('.tourist-age').value;
    const gender = entry.querySelector('.tourist-gender').value;
    
    if (name || country) { // Include if at least name or country is provided
      tourists.push({
        id: `tourist_${index + 1}`,
        name: name || `Tourist ${index + 1}`,
        country: country || 'Unknown',
        age: age ? parseInt(age) : null,
        gender: gender || null
      });
    }
  });
  
  return tourists;
}

// Form submission handling
document.addEventListener('DOMContentLoaded', function() {
  // Add event listener for add tourist button
  const addTouristBtn = document.getElementById('addTouristBtn');
  if (addTouristBtn) {
    addTouristBtn.addEventListener('click', addTourist);
  }

  // Initialize tourists list display
  updateTouristsList();
  
  // Get form elements using IDs
  const driverInput = document.getElementById('driverInput');
  const guideInput = document.getElementById('guideInput');
  const guideNameInput = document.getElementById('guideNameInput');
  const vehicleNumberInput = document.getElementById('vehicleNumberInput');
  const tourOperatorSelect = document.getElementById('tourOperatorSelect');
  const vehicleTypeSelect = document.getElementById('vehicleTypeSelect');
  const paymentButton = document.getElementById('paymentBtn');
  const saveButton = document.getElementById('saveBtn');




  // Function to handle form submission
  async function submitForm(isPayment = false) {
    // Validate inputs before collecting data
    if (!driverInput || !guideInput || !guideNameInput || !vehicleNumberInput || !tourOperatorSelect || !vehicleTypeSelect) {
      alert('Форм бүрэн ачаалагдаагүй байна. Дахин оролдоно уу.');
      return false;
    }


    
    // Calculate total tourist count
    const totalTouristCount  = countryTouristCounts ? Object.values(countryTouristCounts).reduce((sum, cnt) => sum + cnt, 0) : 0;
    const mongolianTouristCount = countryTouristCounts['Монгол'] || 0;
    //countryTouristCounts into list
    const tourists = Object.entries(countryTouristCounts).map(([country, count]) => ({
      country,
      count
    }));
    console.log(tourists);

    // Validate that at least one tourist has a country
    const touristsWithCountry = tourists.filter(t => t.country && t.country !== 'Unknown');
    if (touristsWithCountry.length === 0 || totalTouristCount === 0) {
      alert('Хамгийн багадаа нэг жуулчийн улсыг заавал сонгоно уу!');
      return false;
    }

    // Extract countries from tourists
    const countriesFromTourists = [...new Set(tourists.map(t => t.country).filter(c => c && c !== 'Unknown'))];

    // Collect form data with proper validation
    const formData = {
      driverCount: Math.max(0, parseInt(driverInput.value) || 0),
      guideCount: Math.max(0, parseInt(guideInput.value) || 0), 
      guideName: (guideNameInput.value || '').trim(),
      vehicleNumber: (vehicleNumberInput.value || '').trim(),
      tourOperator: tourOperatorSelect.value || '',
      vehicleType: vehicleTypeSelect.value || '',
      touristCount: totalTouristCount,
      tourists: tourists, // Add the detailed tourist data
      countries: countriesFromTourists,
      totalAmount: Math.max(0, (totalTouristCount - mongolianTouristCount) * pricePerPerson + travelerMongolian * priceForMongol),
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

    // Clear tourists array and update display
    countryTouristCounts = {};
    updateTouristsList();
    
    updateDisplay();
  }

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
    console.log("Fetching registration data for period:", period); // Debug log
    console.log("API_BASE_URL:", API_BASE_URL); // Debug log
    console.log("Full URL:", `${API_BASE_URL}/registrations?period=${period}`); // Debug log
    
    const response = await fetch(`${API_BASE_URL}/registrations?period=${period}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    
    const registrations = await response.json();
    console.log('Registration data loaded:', registrations); // Debug log
    console.log('Number of registrations:', registrations.length); // Debug log
    
    // Log each registration details
    registrations.forEach((reg, index) => {
      console.log(`Registration ${index + 1}:`, {
        id: reg.id,
        date: reg.registrationDate,
        vehicleNumber: reg.vehicleNumber,
        vehicleType: reg.vehicleType,
        guideName: reg.guideName,
        driverCount: reg.driverCount,
        guideCount: reg.guideCount,
        touristCount: reg.touristCount,
        tourists: reg.tourists,
        countries: reg.countries,
        totalAmount: reg.totalAmount,
        status: reg.status
      });
    });
    
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
    const status = reg.status === 'paid' ? 'Төлбөртэй' : 'Хадгалагдсан';
    const statusClass = reg.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800';
    
    // Format tourist information with flags
    let touristInfo = '';
    if (reg.tourists && Array.isArray(reg.tourists)) {
      // Check if it's the new format {country, count}
      if (reg.tourists.length > 0 && reg.tourists[0].hasOwnProperty('count')) {
        touristInfo = reg.tourists.map(item => {
          const flagUrl = getCountryFlag(item.country);
          return `<img src="${flagUrl}" alt="${item.country}" class="inline w-4 h-3 rounded border mr-1" onerror="this.style.display='none'"> ${item.country} (${item.count} жуулч)`;
        }).join('<br>');
      } else {
        // Handle old individual tourist format
        touristInfo = reg.tourists.map(tourist => {
          const flagUrl = getCountryFlag(tourist.country);
          const parts = [];
          
          // Add flag image with name
          if (tourist.country) {
            parts.push(`<img src="${flagUrl}" alt="${tourist.country}" class="inline w-4 h-3 rounded border mr-1" onerror="this.style.display='none'">`);
          }
          
          if (tourist.name) parts.push(tourist.name);
          if (tourist.country) parts.push(`(${tourist.country})`);
          if (tourist.age) parts.push(`${tourist.age}нас`);
          if (tourist.gender) parts.push(tourist.gender);
          
          return parts.join(' ');
        }).join('<br><br>');
      }
    } else {
      // Fallback for old format
      const countries = Array.isArray(reg.countries) ? reg.countries.join(', ') : '';
      touristInfo = `${reg.touristCount || 0} жуулч${countries ? ` (${countries})` : ''}`;
    }
    
    row.innerHTML = `
      <td class="p-2">${formattedDate}</td>
      <td class="p-2">${reg.vehicleNumber || ''}</td>
      <td class="p-2">${reg.vehicleType || ''}</td>
      <td class="p-2">${reg.guideName || ''}</td>
      <td class="p-2">${reg.driverCount || 0}</td>
      <td class="p-2">${reg.tourOperator || ''}</td>
      <td class="p-2">${reg.touristCount || 0}</td>
      <td class="p-2 text-xs">${touristInfo}</td>
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
  const totalAmount = registrations.reduce((sum, reg) => {
    // Prefer explicit totalAmount, otherwise derive from touristCount and PRICE_PER_PERSON
    const regAmount = reg.totalAmount ?? ((reg.touristCount || 0) * PRICE_PER_PERSON);
    return sum + (regAmount || 0);
  }, 0);

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
  console.log('Setting up period filters, found buttons:', periodButtons.length); // Debug log
  
  periodButtons.forEach(button => {
    console.log('Adding event listener to button:', button.textContent.trim(), 'with period:', button.getAttribute('data-period')); // Debug log
    
    button.addEventListener('click', async function() {
      const period = this.getAttribute('data-period');
      console.log('Period button clicked:', period); // Debug log
      
      // Update button styles
      periodButtons.forEach(btn => {
        btn.classList.remove('bg-orange-400', 'text-white');
        btn.classList.add('text-black');
      });
      
      this.classList.add('bg-orange-400', 'text-white');
      this.classList.remove('text-black');
      
      // Load data for selected period
      console.log('Loading data for period:', period); // Debug log
      await loadRegistrationData(period);
    });
  });
}
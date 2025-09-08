// Test script for the new tourist with country structure
const axios = require('axios');

const baseURL = 'http://localhost:3000/api';

// Example registration with tourists and countries
const testRegistration = {
  tourOperator: "Test Tour Company",
  tourists: [
    {
      id: "t001",
      name: "John Smith",
      country: "USA",
      age: 35,
      gender: "Male",
      passport: "US123456789"
    },
    {
      id: "t002", 
      name: "Jane Doe",
      country: "Canada",
      age: 28,
      gender: "Female",
      passport: "CA987654321"
    },
    {
      id: "t003",
      name: "Wang Wei",
      country: "China",
      age: 42,
      gender: "Male"
    }
  ],
  guideCount: 1,
  driverCount: 1,
  totalAmount: 450000,
  currency: "MNT",
  vehicleNumber: "УБ1234",
  vehicleType: "4WD",
  guideName: "Batbayar",
  notes: "Group tour to Flaming Cliffs"
};

async function testTouristCountry() {
  try {
    console.log('Testing tourist registration with country data...');
    console.log('Request payload:', JSON.stringify(testRegistration, null, 2));
    
    // Test the registration endpoint
    const response = await axios.post(`${baseURL}/registrations`, testRegistration);
    
    console.log('\n✅ Registration successful!');
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
    // Verify the data structure
    const registration = response.data;
    
    console.log('\n📊 Verification:');
    console.log(`- Tourist Count: ${registration.touristCount}`);
    console.log(`- Countries: ${registration.countries.join(', ')}`);
    console.log(`- Tourists with countries:`, registration.tourists.map(t => `${t.name} (${t.country})`).join(', '));
    
    return registration.id;
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    throw error;
  }
}

// Run the test
if (require.main === module) {
  testTouristCountry()
    .then(registrationId => {
      console.log(`\n🎉 Test completed successfully! Registration ID: ${registrationId}`);
    })
    .catch(error => {
      console.error('Test failed:', error.message);
      process.exit(1);
    });
}

module.exports = { testTouristCountry };

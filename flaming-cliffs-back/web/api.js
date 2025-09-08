// API Base Configuration
const API_BASE_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:3000/api'  // Local development
  : '/api';                      // Production (same domain)

// API Helper Functions
class TouristRegistrationAPI {

  // Create a new tourist registration
  static async createRegistration(registrationData) {
    try {
      const response = await fetch(`${API_BASE_URL}/registrations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registrationData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return { success: true, data: result };
    } catch (error) {
      console.error('Error creating registration:', error);
      return { success: false, error: error.message };
    }
  }

  // Get all registrations with optional filters
  static async getRegistrations(filters = {}) {
    try {
      const queryParams = new URLSearchParams(filters);
      const response = await fetch(`${API_BASE_URL}/registrations?${queryParams}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return { success: true, data: result };
    } catch (error) {
      console.error('Error fetching registrations:', error);
      return { success: false, error: error.message };
    }
  }

  // Get registration by ID
  static async getRegistrationById(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/registrations/${id}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      return { success: true, data: result };
    } catch (error) {
      console.error('Error fetching registration:', error);
      return { success: false, error: error.message };
    }
  }

  // Update registration
  static async updateRegistration(id, updateData) {
    try {
      const response = await fetch(`${API_BASE_URL}/registrations/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      return { success: true, data: result };
    } catch (error) {
      console.error('Error updating registration:', error);
      return { success: false, error: error.message };
    }
  }

  // Delete registration
  static async deleteRegistration(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/registrations/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error deleting registration:', error);
      return { success: false, error: error.message };
    }
  }

  // Get statistics
  static async getStatistics(period = 'today') {
    try {
      const response = await fetch(`${API_BASE_URL}/statistics?period=${period}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      return { success: true, data: result };
    } catch (error) {
      console.error('Error fetching statistics:', error);
      return { success: false, error: error.message };
    }
  }

  // Export data to Excel
  static async exportToExcel(filters = {}) {
    try {
      const queryParams = new URLSearchParams(filters);
      const response = await fetch(`${API_BASE_URL}/export/excel?${queryParams}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tourist_registrations_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      return { success: true };
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      return { success: false, error: error.message };
    }
  }

  // Export data to PDF (falls back to server-side PDF export if available)
  static async exportToPDF(filters = {}) {
    try {
      const queryParams = new URLSearchParams(filters);
      const response = await fetch(`${API_BASE_URL}/export/pdf?${queryParams}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tourist_registrations_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      return { success: true };
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      return { success: false, error: error.message };
    }
  }

  // Get country statistics
  static async getCountryStats(period = 'all') {
    try {
      const response = await fetch(`${API_BASE_URL}/country-stats?period=${period}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return { success: true, data: result };
    } catch (error) {
      console.error('Error fetching country statistics:', error);
      return { success: false, error: error.message };
    }
  }

  // Get driver/guide statistics
  static async getDriverGuideStats(period = 'all') {
    try {
      const response = await fetch(`${API_BASE_URL}/driver-guide-stats?period=${period}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return { success: true, data: result };
    } catch (error) {
      console.error('Error fetching driver/guide statistics:', error);
      return { success: false, error: error.message };
    }
  }

  // Get tour operator statistics
  static async getTourOperatorStats(period = 'all') {
    try {
      const response = await fetch(`${API_BASE_URL}/tour-operator-stats?period=${period}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return { success: true, data: result };
    } catch (error) {
      console.error('Error fetching tour operator statistics:', error);
      return { success: false, error: error.message };
    }
  }

  // Get visitor statistics
  static async getVisitorStats(period = 'week') {
    try {
      const response = await fetch(`${API_BASE_URL}/visitor-stats?period=${period}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return { success: true, data: result };
    } catch (error) {
      console.error('Error fetching visitor statistics:', error);
      return { success: false, error: error.message };
    }
  }

  // Get visitor trends
  static async getVisitorTrends(months = 12) {
    try {
      const response = await fetch(`${API_BASE_URL}/visitor-stats/trends?months=${months}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return { success: true, data: result };
    } catch (error) {
      console.error('Error fetching visitor trends:', error);
      return { success: false, error: error.message };
    }
  }

  // Get today's visitor statistics
  static async getTodayStats() {
    try {
      const response = await fetch(`${API_BASE_URL}/visitor-stats/today`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return { success: true, data: result };
    } catch (error) {
      console.error('Error fetching today\'s statistics:', error);
      return { success: false, error: error.message };
    }
  }

  // Get hourly visitor statistics
  static async getHourlyStats(period = 'week') {
    try {
      const response = await fetch(`${API_BASE_URL}/visitor-stats/hourly?period=${period}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return { success: true, data: result };
    } catch (error) {
      console.error('Error fetching hourly statistics:', error);
      return { success: false, error: error.message };
    }
  }
}

// Utility functions for form validation
const ValidationUtils = {
  validateRegistrationForm(formData) {
    const errors = [];
    
    // At least one of driver or guide must be present
    if ((!formData.driverCount || formData.driverCount < 1) && 
        (!formData.guideCount || formData.guideCount < 1)) {
      errors.push('Жолооч эсвэл хөтчийн тоо оруулна уу');
    }
    
    // If guide count is provided, guide name is required
    if (formData.guideCount > 0 && (!formData.guideName || formData.guideName.trim() === '')) {
      errors.push('Хөтчийн нэр оруулна уу');
    }
    
    if (!formData.vehicleNumber || formData.vehicleNumber.trim() === '') {
      errors.push('Машины дугаар оруулна уу');
    }
    
    if (!formData.tourOperator || formData.tourOperator.trim() === '') {
      errors.push('Тур оператор компани сонгоно уу');
    }
    
    if (!formData.vehicleType || formData.vehicleType.trim() === '') {
      errors.push('Тээврийн хэрэгсэл сонгоно уу');
    }
    
    if (!formData.touristCount || formData.touristCount < 1) {
      errors.push('Жуулчдын тоо 1-ээс багагүй байх ёстой');
    }
    
    if (!formData.countries || formData.countries.length === 0) {
      errors.push('Жуулчдын улс сонгоно уу');
    }
    
    if (formData.totalAmount < 0) {
      errors.push('Төлбөрийн дүн сөрөг байж болохгүй');
    }
    
    // Validate vehicle number format (basic check)
    if (formData.vehicleNumber && !/^[A-Za-z0-9\s\-]+$/.test(formData.vehicleNumber)) {
      errors.push('Машины дугаарын формат буруу байна');
    }
    
    // Validate guide name (basic check)
    if (formData.guideName && formData.guideName.length > 100) {
      errors.push('Хөтчийн нэр хэт урт байна');
    }
    
    return {
      isValid: errors.length === 0,
      errors: errors
    };
  }
};

// Export for use in other files
window.TouristRegistrationAPI = TouristRegistrationAPI;
window.ValidationUtils = ValidationUtils;

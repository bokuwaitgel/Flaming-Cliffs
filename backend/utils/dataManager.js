const fs = require('fs').promises;
const path = require('path');
const moment = require('moment');

// JSON file fallback when MongoDB is not available
class JSONDataManager {
  constructor() {
    this.dataFile = path.join(__dirname, '../data/registrations.json');
    this.ensureDataDir();
  }

  async ensureDataDir() {
    const dataDir = path.dirname(this.dataFile);
    try {
      await fs.access(dataDir);
    } catch {
      await fs.mkdir(dataDir, { recursive: true });
    }
    
    // Initialize data file if it doesn't exist
    try {
      await fs.access(this.dataFile);
    } catch {
      await fs.writeFile(this.dataFile, JSON.stringify([], null, 2));
    }
  }

  async readData() {
    try {
      const data = await fs.readFile(this.dataFile, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error reading data:', error);
      return [];
    }
  }

  async writeData(data) {
    try {
      await fs.writeFile(this.dataFile, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('Error writing data:', error);
      throw error;
    }
  }

  async getRegistrations(query = {}) {
    const registrations = await this.readData();
    let filteredData = registrations.filter(reg => reg.status !== 'cancelled');

    if (query.period) {
      const now = moment();
      let startDate;
      
      switch (query.period) {
        case 'today':
          startDate = now.clone().startOf('day');
          break;
        case 'week':
          startDate = now.clone().subtract(7, 'days');
          break;
        case 'month':
          startDate = now.clone().subtract(1, 'month');
          break;
        default:
          startDate = now.clone().startOf('day');
      }
      
      filteredData = filteredData.filter(reg => {
        const regDate = moment(reg.registrationDate);
        return regDate.isAfter(startDate);
      });
    }

    return filteredData.sort((a, b) => new Date(b.registrationDate) - new Date(a.registrationDate));
  }

  async getRegistrationById(id) {
    const registrations = await this.readData();
    return registrations.find(reg => reg.id === id);
  }

  async createRegistration(data) {
    const registrations = await this.readData();
    const { v4: uuidv4 } = require('uuid');
    
    const newRegistration = {
      id: uuidv4(),
      ...data,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    registrations.push(newRegistration);
    await this.writeData(registrations);
    
    return newRegistration;
  }

  async updateRegistration(id, data) {
    const registrations = await this.readData();
    const index = registrations.findIndex(reg => reg.id === id);
    
    if (index === -1) {
      throw new Error('Registration not found');
    }
    
    registrations[index] = {
      ...registrations[index],
      ...data,
      updatedAt: new Date().toISOString()
    };
    
    await this.writeData(registrations);
    return registrations[index];
  }

  async deleteRegistration(id) {
    const registrations = await this.readData();
    const index = registrations.findIndex(reg => reg.id === id);
    
    if (index === -1) {
      throw new Error('Registration not found');
    }
    
    registrations[index].status = 'cancelled';
    registrations[index].updatedAt = new Date().toISOString();
    
    await this.writeData(registrations);
    return { message: 'Registration cancelled successfully' };
  }

  async getStatistics(period = 'today') {
    const registrations = await this.getRegistrations({ period });
    
    return {
      totalRegistrations: registrations.length,
      totalTourists: registrations.reduce((sum, reg) => sum + (reg.touristCount || 0), 0),
      totalRevenue: registrations.reduce((sum, reg) => sum + (reg.totalAmount || 0), 0),
      totalGuides: registrations.reduce((sum, reg) => sum + (reg.guideCount || 0), 0),
      totalDrivers: registrations.reduce((sum, reg) => sum + (reg.driverCount || 0), 0),
      period: period
    };
  }

  async getCountryStats(period = 'all') {
    const registrations = await this.getRegistrations(period !== 'all' ? { period } : {});
    
    const countryStats = {};
    
    registrations.forEach(reg => {
      if (reg.countries && Array.isArray(reg.countries)) {
        reg.countries.forEach(country => {
          const countryName = country.trim();
          if (countryStats[countryName]) {
            countryStats[countryName] += reg.touristCount || 0;
          } else {
            countryStats[countryName] = reg.touristCount || 0;
          }
        });
      }
    });
    
    return Object.entries(countryStats)
      .map(([country, value]) => ({ country, value }))
      .sort((a, b) => b.value - a.value);
  }

  async getDriverGuideStats(period = 'all') {
    const registrations = await this.getRegistrations(period !== 'all' ? { period } : {});
    
    const totalDrivers = registrations.reduce((sum, reg) => sum + (reg.driverCount || 0), 0);
    const totalGuides = registrations.reduce((sum, reg) => sum + (reg.guideCount || 0), 0);
    
    return {
      drivers: totalDrivers,
      guides: totalGuides,
      total: totalDrivers + totalGuides
    };
  }

  async getTourOperatorStats(period = 'all') {
    const registrations = await this.getRegistrations(period !== 'all' ? { period } : {});
    
    const operatorStats = {};
    
    registrations.forEach(reg => {
      const operator = reg.tourOperator || 'Unknown';
      if (operatorStats[operator]) {
        operatorStats[operator] += reg.touristCount || 0;
      } else {
        operatorStats[operator] = reg.touristCount || 0;
      }
    });
    
    return Object.entries(operatorStats)
      .map(([operator, count]) => ({ operator, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }
}

module.exports = { JSONDataManager };

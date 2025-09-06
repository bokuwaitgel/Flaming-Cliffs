const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const moment = require('moment');
require('dotenv').config();

// MongoDB connection and models
const connectDB = require('./config/database');
const Registration = require('./models/Registration');
const VisitorStats = require('./models/VisitorStats');
const { JSONDataManager } = require('./utils/dataManager');

// Global variables for data management
let useMongoDb = false;
let jsonDataManager = null;

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from web folder
app.use(express.static(path.join(__dirname, '../web')));

// Helper function to get country codes (moved from bottom)
function getCountryCode(countryName) {
  const countryMap = {
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
    'Australia': 'au',
    'Canada': 'ca',
    'Poland': 'pl',
    'Turkey': 'tr',
    'Switzerland': 'ch'
  };
  
  return countryMap[countryName] || countryName.toLowerCase().substring(0, 2);
}

// API Routes

// Get all registrations with optional filters
app.get('/api/registrations', async (req, res) => {
  try {
    const { period } = req.query;
    
    let registrations;
    if (useMongoDb) {
      let query = { status: 'active' };
      
      if (period) {
        const now = moment();
        let startDate;
        
        switch (period) {
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
        
        query.registrationDate = { $gte: startDate.toDate() };
      }
      
      registrations = await Registration.find(query).sort({ registrationDate: -1 });
    } else {
      registrations = await jsonDataManager.getRegistrations({ period });
    }
    
    res.json(registrations);
  } catch (error) {
    console.error('Error fetching registrations:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get registration by ID
app.get('/api/registrations/:id', async (req, res) => {
  try {
    let registration;
    if (useMongoDb) {
      registration = await Registration.findById(req.params.id);
    } else {
      registration = await jsonDataManager.getRegistrationById(req.params.id);
    }
    
    if (!registration) {
      return res.status(404).json({ error: 'Registration not found' });
    }
    
    res.json(registration);
  } catch (error) {
    console.error('Error fetching registration:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new registration
app.post('/api/registrations', async (req, res) => {
  try {
    let registration;
    if (useMongoDb) {
      // Transform form data to match Registration schema
      const registrationData = {
        tourOperator: req.body.tourOperator || 'Unknown',
        registrationDate: req.body.registrationDate ? new Date(req.body.registrationDate) : new Date(),
        touristCount: req.body.touristCount || 1,
        countries: req.body.countries || [],
        guideCount: req.body.guideCount || 0,
        driverCount: req.body.driverCount || 0,
        totalAmount: req.body.totalAmount || 0,
        currency: 'MNT',
        notes: `Guide: ${req.body.guideName || 'N/A'}, Vehicle: ${req.body.vehicleNumber || 'N/A'}, Type: ${req.body.vehicleType || 'N/A'}, Status: ${req.body.status || 'saved'}`,
        status: 'active'
      };
      
      registration = new Registration(registrationData);
      await registration.save();
      
      // Update daily visitor stats
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      let dailyStats = await VisitorStats.findOne({ date: today });
      if (!dailyStats) {
        dailyStats = new VisitorStats({ date: today });
      }
      
      // Determine if domestic or international based on countries
      const isDomestic = registration.countries.some(country => 
        ['Mongolia', 'Монгол', 'MN'].includes(country)
      );
      
      if (isDomestic) {
        dailyStats.domesticVisitors += registration.touristCount;
        dailyStats.domesticRevenue += registration.totalAmount;
      } else {
        dailyStats.internationalVisitors += registration.touristCount;
        dailyStats.internationalRevenue += registration.totalAmount;
      }
      
      await dailyStats.save();
    } else {
      registration = await jsonDataManager.createRegistration(req.body);
    }
    
    res.status(201).json(registration);
  } catch (error) {
    console.error('Error creating registration:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update registration
app.put('/api/registrations/:id', async (req, res) => {
  try {
    let registration;
    if (useMongoDb) {
      registration = await Registration.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      );
    } else {
      registration = await jsonDataManager.updateRegistration(req.params.id, req.body);
    }
    
    if (!registration) {
      return res.status(404).json({ error: 'Registration not found' });
    }
    
    res.json(registration);
  } catch (error) {
    console.error('Error updating registration:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete registration
app.delete('/api/registrations/:id', async (req, res) => {
  try {
    let result;
    if (useMongoDb) {
      const registration = await Registration.findByIdAndUpdate(
        req.params.id,
        { status: 'cancelled' },
        { new: true }
      );
      
      if (!registration) {
        return res.status(404).json({ error: 'Registration not found' });
      }
      result = { message: 'Registration cancelled successfully' };
    } else {
      result = await jsonDataManager.deleteRegistration(req.params.id);
    }
    
    res.json(result);
  } catch (error) {
    console.error('Error deleting registration:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get statistics
app.get('/api/statistics', async (req, res) => {
  try {
    const { period = 'today' } = req.query;
    
    let result;
    if (useMongoDb) {
      const now = moment();
      let startDate;
      
      switch (period) {
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
      
      const query = {
        registrationDate: { $gte: startDate.toDate() },
        status: 'active'
      };
      
      const stats = await Registration.aggregate([
        { $match: query },
        {
          $group: {
            _id: null,
            totalRegistrations: { $sum: 1 },
            totalTourists: { $sum: '$touristCount' },
            totalRevenue: { $sum: '$totalAmount' },
            totalGuides: { $sum: '$guideCount' },
            totalDrivers: { $sum: '$driverCount' }
          }
        }
      ]);
      
      result = stats[0] || {
        totalRegistrations: 0,
        totalTourists: 0,
        totalRevenue: 0,
        totalGuides: 0,
        totalDrivers: 0
      };
      result.period = period;
    } else {
      result = await jsonDataManager.getStatistics(period);
    }
    
    res.json(result);
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get country statistics for charts
app.get('/api/country-stats', async (req, res) => {
  try {
    const { period = 'all' } = req.query;
    
    let countryStats;
    if (useMongoDb) {
      countryStats = await Registration.getCountryStats(period);
    } else {
      countryStats = await jsonDataManager.getCountryStats(period);
    }
    
    // Add country codes for frontend display
    const countryArray = countryStats.map(stat => ({
      country: stat.country,
      code: getCountryCode(stat.country),
      value: stat.value
    }));
    
    res.json(countryArray);
  } catch (error) {
    console.error('Error fetching country statistics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get driver/guide statistics for donut charts
app.get('/api/driver-guide-stats', async (req, res) => {
  try {
    const { period = 'all' } = req.query;
    
    let result;
    if (useMongoDb) {
      let query = { status: 'active' };
      
      if (period !== 'all') {
        const now = moment();
        let startDate;
        
        switch (period) {
          case 'today':
            startDate = now.clone().startOf('day');
            break;
          case 'week':
            startDate = now.clone().subtract(7, 'days');
            break;
          case 'month':
            startDate = now.clone().subtract(1, 'month');
            break;
          case 'year':
            startDate = now.clone().subtract(1, 'year');
            break;
          default:
            startDate = now.clone().startOf('day');
        }
        
        query.registrationDate = { $gte: startDate.toDate() };
      }
      
      const stats = await Registration.aggregate([
        { $match: query },
        {
          $group: {
            _id: null,
            totalDrivers: { $sum: '$driverCount' },
            totalGuides: { $sum: '$guideCount' }
          }
        }
      ]);
      
      const mongoResult = stats[0] || { totalDrivers: 0, totalGuides: 0 };
      
      result = {
        drivers: mongoResult.totalDrivers,
        guides: mongoResult.totalGuides,
        total: mongoResult.totalDrivers + mongoResult.totalGuides
      };
    } else {
      result = await jsonDataManager.getDriverGuideStats(period);
    }
    
    res.json(result);
  } catch (error) {
    console.error('Error fetching driver/guide statistics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get tour operator statistics for bar chart
app.get('/api/tour-operator-stats', async (req, res) => {
  try {
    const { period = 'all' } = req.query;
    
    let operatorStats;
    if (useMongoDb) {
      let query = { status: 'active' };
      
      if (period !== 'all') {
        const now = moment();
        let startDate;
        
        switch (period) {
          case 'today':
            startDate = now.clone().startOf('day');
            break;
          case 'week':
            startDate = now.clone().subtract(7, 'days');
            break;
          case 'month':
            startDate = now.clone().subtract(1, 'month');
            break;
          case 'year':
            startDate = now.clone().subtract(1, 'year');
            break;
          default:
            startDate = now.clone().startOf('day');
        }
        
        query.registrationDate = { $gte: startDate.toDate() };
      }
      
      operatorStats = await Registration.aggregate([
        { $match: query },
        {
          $group: {
            _id: '$tourOperator',
            count: { $sum: '$touristCount' }
          }
        },
        { $sort: { count: -1 } },
        { $limit: 10 },
        {
          $project: {
            operator: '$_id',
            count: 1,
            _id: 0
          }
        }
      ]);
    } else {
      operatorStats = await jsonDataManager.getTourOperatorStats(period);
    }
    
    res.json(operatorStats);
  } catch (error) {
    console.error('Error fetching tour operator statistics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add visitor statistics endpoints
app.get('/api/visitor-stats', async (req, res) => {
  try {
    const { period = 'week' } = req.query;
    let stats;
    
    if (useMongoDb) {
      stats = await VisitorStats.getPeriodStats(period);
    } else {
      // For JSON fallback, use registration statistics
      stats = await jsonDataManager.getStatistics(period);
      // Transform to match visitor stats format
      stats = {
        totalVisitors: stats.totalTourists,
        domesticVisitors: Math.floor(stats.totalTourists * 0.3), // Estimate
        internationalVisitors: Math.floor(stats.totalTourists * 0.7), // Estimate
        totalRevenue: stats.totalRevenue,
        avgDailyVisitors: Math.floor(stats.totalTourists / 7), // Estimate for week
        maxDailyVisitors: Math.floor(stats.totalTourists / 3), // Estimate
        minDailyVisitors: Math.floor(stats.totalTourists / 10) // Estimate
      };
    }
    
    res.json(stats);
  } catch (error) {
    console.error('Error fetching visitor statistics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/visitor-stats/trends', async (req, res) => {
  try {
    const { months = 12 } = req.query;
    let trends;
    
    if (useMongoDb) {
      trends = await VisitorStats.getMonthlyTrends(parseInt(months));
    } else {
      // For JSON fallback, return basic trend data
      trends = [];
      const now = new Date();
      for (let i = parseInt(months) - 1; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        trends.push({
          month: date.getMonth() + 1,
          year: date.getFullYear(),
          totalVisitors: Math.floor(Math.random() * 100) + 50, // Mock data
          totalRevenue: Math.floor(Math.random() * 500000) + 100000,
          avgDailyVisitors: Math.floor(Math.random() * 20) + 10
        });
      }
    }
    
    res.json(trends);
  } catch (error) {
    console.error('Error fetching visitor trends:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/visitor-stats/today', async (req, res) => {
  try {
    let todayStats;
    
    if (useMongoDb) {
      todayStats = await VisitorStats.getTodayStats();
    } else {
      // For JSON fallback, get today's registration stats
      const stats = await jsonDataManager.getStatistics('today');
      todayStats = {
        date: new Date(),
        domesticVisitors: Math.floor(stats.totalTourists * 0.3),
        internationalVisitors: Math.floor(stats.totalTourists * 0.7),
        totalVisitors: stats.totalTourists,
        domesticRevenue: Math.floor(stats.totalRevenue * 0.3),
        internationalRevenue: Math.floor(stats.totalRevenue * 0.7),
        totalRevenue: stats.totalRevenue,
        lastUpdated: new Date()
      };
    }
    
    res.json(todayStats);
  } catch (error) {
    console.error('Error fetching today\'s visitor statistics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/visitor-stats/hourly', async (req, res) => {
  try {
    const { period = 'week' } = req.query;
    let hourlyStats;
    
    if (useMongoDb) {
      hourlyStats = await VisitorStats.getHourlyStats(period);
    } else {
      // For JSON fallback, return mock hourly data
      hourlyStats = [];
      const mockData = [0, 6, 11, 16, 22, 22, 33, 38, 22, 22, 18, 16, 16, 10, 9, 7, 2];
      for (let hour = 7; hour <= 23; hour++) {
        hourlyStats.push({
          hour,
          totalVisitors: mockData[hour - 7] || 0,
          avgVisitors: mockData[hour - 7] || 0
        });
      }
    }
    
    res.json(hourlyStats);
  } catch (error) {
    console.error('Error fetching hourly visitor statistics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Export routes
const exportRoutes = require('./routes/export');
app.use('/api/export', exportRoutes);

// Serve HTML files
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../web/index.html'));
});

app.get('/registration', (req, res) => {
  res.sendFile(path.join(__dirname, '../web/juulchid bvrtgel.html'));
});

app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, '../web/bvrtgel.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Initialize and start server
const startServer = async () => {
  try {
    // Try to connect to MongoDB first
    try {
      await connectDB();
      useMongoDb = true;
      console.log('🗄️  Using MongoDB for data storage');
    } catch (mongoError) {
      console.log('⚠️  MongoDB not available, falling back to JSON file storage');
      useMongoDb = false;
      jsonDataManager = new JSONDataManager();
      console.log('📄 Using JSON file storage');
    }
    
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📊 Dashboard: http://localhost:${PORT}/dashboard`);
      console.log(`📝 Registration: http://localhost:${PORT}/registration`);
      if (useMongoDb) {
        console.log(`🗄️  Database: MongoDB`);
      } else {
        console.log(`📄 Database: JSON Files`);
      }
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

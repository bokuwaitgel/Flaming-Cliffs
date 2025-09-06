const mongoose = require('mongoose');
require('dotenv').config();

// Import the VisitorStats model
const VisitorStats = require('./models/VisitorStats');

async function populateHourlyData() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/flaming-cliffs';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Create sample hourly data for the past few days
    const today = new Date();
    const sampleData = [];

    for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
      const date = new Date(today);
      date.setDate(today.getDate() - dayOffset);
      date.setHours(0, 0, 0, 0);

      // Create hourly breakdown for each day (7 AM to 11 PM)
      const hourlyBreakdown = [];
      const peakHours = [10, 11, 12, 13, 14, 15, 16]; // Peak visitor hours
      
      for (let hour = 7; hour <= 23; hour++) {
        let visitors;
        if (peakHours.includes(hour)) {
          // Peak hours have more visitors
          visitors = Math.floor(Math.random() * 30) + 20; // 20-50 visitors
        } else if (hour >= 17 && hour <= 19) {
          // Evening hours moderate visitors
          visitors = Math.floor(Math.random() * 20) + 10; // 10-30 visitors
        } else {
          // Early morning and late evening fewer visitors
          visitors = Math.floor(Math.random() * 10) + 2; // 2-12 visitors
        }
        
        hourlyBreakdown.push({
          hour: hour,
          visitors: visitors
        });
      }

      // Calculate totals from hourly data
      const totalVisitors = hourlyBreakdown.reduce((sum, h) => sum + h.visitors, 0);
      
      const visitorStats = {
        date: date,
        domesticVisitors: Math.floor(totalVisitors * 0.4),
        internationalVisitors: Math.floor(totalVisitors * 0.6),
        totalVisitors: totalVisitors,
        domesticRevenue: Math.floor(totalVisitors * 0.4 * 15000), // 15,000 MNT per domestic visitor
        internationalRevenue: Math.floor(totalVisitors * 0.6 * 25000), // 25,000 MNT per international visitor
        hourlyBreakdown: hourlyBreakdown
      };

      sampleData.push(visitorStats);
    }

    // Insert or update the data
    for (const data of sampleData) {
      await VisitorStats.findOneAndUpdate(
        { date: data.date },
        data,
        { upsert: true, new: true }
      );
      console.log(`Created/updated visitor stats for ${data.date.toDateString()}`);
    }

    console.log('✅ Sample hourly data populated successfully!');
    console.log(`📊 Created data for ${sampleData.length} days`);
    
  } catch (error) {
    console.error('❌ Error populating hourly data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the script
populateHourlyData();

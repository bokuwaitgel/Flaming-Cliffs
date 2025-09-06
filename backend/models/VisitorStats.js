const mongoose = require('mongoose');

const visitorStatsSchema = new mongoose.Schema({
  // Date tracking
  date: {
    type: Date,
    required: true,
    unique: true
  },
  
  // Daily visitor counts
  domesticVisitors: {
    type: Number,
    default: 0,
    min: 0
  },
  internationalVisitors: {
    type: Number,
    default: 0,
    min: 0
  },
  totalVisitors: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // Revenue tracking
  domesticRevenue: {
    type: Number,
    default: 0,
    min: 0
  },
  internationalRevenue: {
    type: Number,
    default: 0,
    min: 0
  },
  totalRevenue: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // Tour operator breakdown
  tourOperators: [{
    name: String,
    touristCount: Number,
    revenue: Number
  }],
  
  // Country breakdown
  countryBreakdown: [{
    country: String,
    count: Number
  }],
  
  // Weather and conditions (optional)
  weather: {
    temperature: Number,
    condition: String,
    windSpeed: Number
  },
  
  // Hourly visitor breakdown (7 AM to 11 PM)
  hourlyBreakdown: [{
    hour: {
      type: Number,
      min: 7,
      max: 23,
      required: true
    },
    visitors: {
      type: Number,
      default: 0,
      min: 0
    }
  }],
  
  // Special events or notes
  events: [{
    type: String,
    description: String
  }],
  
  // System tracking
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  collection: 'visitor_stats'
});

// Indexes for better performance
visitorStatsSchema.index({ date: -1 });
visitorStatsSchema.index({ totalVisitors: -1 });
visitorStatsSchema.index({ totalRevenue: -1 });

// Pre-save middleware to calculate totals
visitorStatsSchema.pre('save', function(next) {
  this.totalVisitors = this.domesticVisitors + this.internationalVisitors;
  this.totalRevenue = this.domesticRevenue + this.internationalRevenue;
  this.lastUpdated = new Date();
  next();
});

// Static method to get or create today's stats
visitorStatsSchema.statics.getTodayStats = async function() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  let stats = await this.findOne({ date: today });
  
  if (!stats) {
    stats = new this({ date: today });
    await stats.save();
  }
  
  return stats;
};

// Static method to get period statistics
visitorStatsSchema.statics.getPeriodStats = async function(period = 'week') {
  const now = new Date();
  let startDate;
  
  switch (period) {
    case 'today':
      startDate = new Date(now);
      startDate.setHours(0, 0, 0, 0);
      break;
    case 'week':
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 7);
      break;
    case 'month':
      startDate = new Date(now);
      startDate.setMonth(now.getMonth() - 1);
      break;
    case 'year':
      startDate = new Date(now);
      startDate.setFullYear(now.getFullYear() - 1);
      break;
    default:
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 7);
  }
  
  const stats = await this.aggregate([
    {
      $match: {
        date: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: null,
        totalVisitors: { $sum: '$totalVisitors' },
        domesticVisitors: { $sum: '$domesticVisitors' },
        internationalVisitors: { $sum: '$internationalVisitors' },
        totalRevenue: { $sum: '$totalRevenue' },
        domesticRevenue: { $sum: '$domesticRevenue' },
        internationalRevenue: { $sum: '$internationalRevenue' },
        avgDailyVisitors: { $avg: '$totalVisitors' },
        maxDailyVisitors: { $max: '$totalVisitors' },
        minDailyVisitors: { $min: '$totalVisitors' }
      }
    }
  ]);
  
  return stats[0] || {
    totalVisitors: 0,
    domesticVisitors: 0,
    internationalVisitors: 0,
    totalRevenue: 0,
    domesticRevenue: 0,
    internationalRevenue: 0,
    avgDailyVisitors: 0,
    maxDailyVisitors: 0,
    minDailyVisitors: 0
  };
};

// Static method to get monthly trends
visitorStatsSchema.statics.getMonthlyTrends = async function(months = 12) {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setMonth(endDate.getMonth() - months);
  
  const trends = await this.aggregate([
    {
      $match: {
        date: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$date' },
          month: { $month: '$date' }
        },
        totalVisitors: { $sum: '$totalVisitors' },
        totalRevenue: { $sum: '$totalRevenue' },
        avgDailyVisitors: { $avg: '$totalVisitors' }
      }
    },
    {
      $sort: { '_id.year': 1, '_id.month': 1 }
    },
    {
      $project: {
        _id: 0,
        year: '$_id.year',
        month: '$_id.month',
        totalVisitors: 1,
        totalRevenue: 1,
        avgDailyVisitors: { $round: ['$avgDailyVisitors', 0] }
      }
    }
  ]);
  
  return trends;
};

// Static method to get hourly visitor data
visitorStatsSchema.statics.getHourlyStats = async function(period = 'week') {
  const now = new Date();
  let startDate;
  
  switch (period) {
    case 'today':
      startDate = new Date(now);
      startDate.setHours(0, 0, 0, 0);
      break;
    case 'week':
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 7);
      break;
    case 'month':
      startDate = new Date(now);
      startDate.setMonth(now.getMonth() - 1);
      break;
    default:
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 7);
  }
  
  const hourlyData = await this.aggregate([
    {
      $match: {
        date: { $gte: startDate, $lte: now },
        hourlyBreakdown: { $exists: true, $ne: [] }
      }
    },
    {
      $unwind: '$hourlyBreakdown'
    },
    {
      $group: {
        _id: '$hourlyBreakdown.hour',
        totalVisitors: { $sum: '$hourlyBreakdown.visitors' },
        avgVisitors: { $avg: '$hourlyBreakdown.visitors' }
      }
    },
    {
      $sort: { '_id': 1 }
    },
    {
      $project: {
        _id: 0,
        hour: '$_id',
        totalVisitors: 1,
        avgVisitors: { $round: ['$avgVisitors', 0] }
      }
    }
  ]);
  
  // Fill in missing hours with 0 visitors (7 AM to 11 PM)
  const completeHourlyData = [];
  for (let hour = 7; hour <= 23; hour++) {
    const existingData = hourlyData.find(data => data.hour === hour);
    completeHourlyData.push({
      hour,
      totalVisitors: existingData ? existingData.totalVisitors : 0,
      avgVisitors: existingData ? existingData.avgVisitors : 0
    });
  }
  
  return completeHourlyData;
};

module.exports = mongoose.model('VisitorStats', visitorStatsSchema);

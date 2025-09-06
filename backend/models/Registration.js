const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema({
  // Basic registration info
  tourOperator: {
    type: String,
    required: true,
    trim: true
  },
  registrationDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  
  // Tourist information
  touristCount: {
    type: Number,
    required: true,
    min: 1
  },
  countries: [{
    type: String,
    trim: true
  }],
  
  // Staff information
  guideCount: {
    type: Number,
    default: 0,
    min: 0
  },
  driverCount: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // Financial information
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'MNT',
    enum: ['MNT', 'USD', 'EUR', 'CNY']
  },
  
  // Additional details
  notes: {
    type: String,
    trim: true
  },
  contactInfo: {
    phone: String,
    email: String
  },
  
  // System fields
  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled'],
    default: 'active'
  }
}, {
  timestamps: true, // Adds createdAt and updatedAt automatically
  collection: 'registrations'
});

// Indexes for better query performance
registrationSchema.index({ registrationDate: -1 });
registrationSchema.index({ tourOperator: 1 });
registrationSchema.index({ countries: 1 });
registrationSchema.index({ status: 1 });

// Virtual for formatted registration date
registrationSchema.virtual('formattedDate').get(function() {
  return this.registrationDate.toLocaleDateString('mn-MN');
});

// Method to calculate daily statistics
registrationSchema.statics.getDailyStats = async function(date) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  
  const stats = await this.aggregate([
    {
      $match: {
        registrationDate: {
          $gte: startOfDay,
          $lte: endOfDay
        },
        status: 'active'
      }
    },
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
  
  return stats[0] || {
    totalRegistrations: 0,
    totalTourists: 0,
    totalRevenue: 0,
    totalGuides: 0,
    totalDrivers: 0
  };
};

// Method to get country statistics
registrationSchema.statics.getCountryStats = async function(period = 'all') {
  let matchCondition = { status: 'active' };
  
  if (period !== 'all') {
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
    }
    
    if (startDate) {
      matchCondition.registrationDate = { $gte: startDate };
    }
  }
  
  return await this.aggregate([
    { $match: matchCondition },
    { $unwind: '$countries' },
    {
      $group: {
        _id: '$countries',
        count: { $sum: '$touristCount' }
      }
    },
    { $sort: { count: -1 } },
    {
      $project: {
        country: '$_id',
        value: '$count',
        _id: 0
      }
    }
  ]);
};

module.exports = mongoose.model('Registration', registrationSchema);

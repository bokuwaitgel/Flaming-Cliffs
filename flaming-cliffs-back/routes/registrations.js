const express = require('express');
const { PrismaClient } = require('@prisma/client');
const moment = require('moment-timezone');

const router = express.Router();
const prisma = new PrismaClient();

// Set default timezone to Mongolia (Ulaanbaatar)
const MONGOLIA_TZ = 'Asia/Ulaanbaatar';
moment.tz.setDefault(MONGOLIA_TZ);

// Helper function to get country codes
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

/**
 * @swagger
 * /registrations:
 *   get:
 *     summary: Get all registrations
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [today, week, month]
 *         description: Filter registrations by period
 *     responses:
 *       200:
 *         description: List of registrations
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Registration'
 */
router.get('/registrations', async (req, res) => {
  try {
    const { period } = req.query;

    let where = { status: 'active' };

    if (period) {
      const now = moment.tz(MONGOLIA_TZ);
      let startDate;

      switch (period) {
        case 'today':
          startDate = now.clone().startOf('day');
          break;
        case 'week':
          startDate = now.clone().subtract(7, 'days').startOf('day');
          break;
        case 'month':
          startDate = now.clone().subtract(1, 'month').startOf('day');
          break;
        default:
          startDate = now.clone().startOf('day');
      }

      where.registrationDate = { gte: startDate.toDate() };
    }

    const registrations = await prisma.registration.findMany({
      where,
      orderBy: { registrationDate: 'desc' }
    });

    res.json(registrations);
  } catch (error) {
    console.error('Error fetching registrations:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /registrations/{id}:
 *   get:
 *     summary: Get registration by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Registration details
 *       404:
 *         description: Registration not found
 */
router.get('/registrations/:id', async (req, res) => {
  try {
    const registration = await prisma.registration.findUnique({
      where: { id: req.params.id }
    });

    if (!registration) {
      return res.status(404).json({ error: 'Registration not found' });
    }

    res.json(registration);
  } catch (error) {
    console.error('Error fetching registration:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /registrations:
 *   post:
 *     summary: Create new registration
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegistrationInput'
 *     responses:
 *       201:
 *         description: Registration created
 *       400:
 *         description: Bad request
 */
router.post('/registrations', async (req, res) => {
  try {
    // Process tourists data - new format: [{country, count}]
    const touristsData = req.body.tourists || [];
    let processedTourists = [];
    let totalTouristCount = 0;
    let allCountries = [];

    if (Array.isArray(touristsData) && touristsData.length > 0) {
      // Check if it's the new format {country, count}
      if (touristsData[0].hasOwnProperty('count')) {
        processedTourists = touristsData.map(item => ({
          country: item.country || 'Unknown',
          count: parseInt(item.count) || 1
        }));
        totalTouristCount = processedTourists.reduce((sum, item) => sum + item.count, 0);
        allCountries = processedTourists.map(item => item.country).filter(c => c && c !== 'Unknown');
      } else {
        // Handle old individual tourist format - convert to new format
        const countryGroups = {};
        touristsData.forEach(tourist => {
          const country = tourist.country || 'Unknown';
          countryGroups[country] = (countryGroups[country] || 0) + 1;
        });
        
        processedTourists = Object.entries(countryGroups).map(([country, count]) => ({
          country,
          count
        }));
        totalTouristCount = touristsData.length;
        allCountries = Object.keys(countryGroups).filter(c => c !== 'Unknown');
      }
    } else {
      // Fallback: use touristCount and countries from old format
      const countries = req.body.countries || [];
      const touristCount = req.body.touristCount || 1;
      
      if (countries.length > 0) {
        const countPerCountry = Math.ceil(touristCount / countries.length);
        processedTourists = countries.map(country => ({
          country,
          count: countPerCountry
        }));
      } else {
        processedTourists = [{ country: 'Unknown', count: touristCount }];
      }
      
      totalTouristCount = touristCount;
      allCountries = countries;
    }

    const registrationData = {
      tourOperator: req.body.tourOperator || 'Unknown',
      registrationDate: req.body.registrationDate ? 
        moment.tz(req.body.registrationDate, MONGOLIA_TZ).toDate() : 
        moment.tz(MONGOLIA_TZ).toDate(),
      touristCount: totalTouristCount,
      countries: allCountries,
      tourists: processedTourists,
      guideCount: req.body.guideCount || 0,
      driverCount: req.body.driverCount || 0,
      totalAmount: req.body.totalAmount || 0,
      currency: req.body.currency || 'MNT',
      notes: `Guide: ${req.body.guideName || 'N/A'}, Vehicle: ${req.body.vehicleNumber || 'N/A'}, Type: ${req.body.vehicleType || 'N/A'}, Status: ${req.body.status || 'saved'}`,
      status: 'active',
      vehicleNumber: req.body.vehicleNumber,
      vehicleType: req.body.vehicleType,
      guideName: req.body.guideName
    };

    const registration = await prisma.registration.create({
      data: registrationData
    });

    // Update daily visitor stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);


    // date may not be a unique field in the schema; use findFirst and update by id
    let dailyStats = await prisma.visitorStats.findFirst({
      where: { date: today }
    });

    if (!dailyStats) {
      dailyStats = await prisma.visitorStats.create({
        data: { date: today }
      });
    }

    // Determine if domestic or international based on countries
    const isDomestic = registration.countries.some(country =>
      ['Mongolia', 'Монгол', 'MN'].includes(country)
    );

    const updateData = {
      lastUpdated: new Date()
    };

    if (isDomestic) {
      updateData.domesticVisitors = { increment: registration.touristCount };
      updateData.domesticRevenue = { increment: registration.totalAmount };
    } else {
      updateData.internationalVisitors = { increment: registration.touristCount };
      updateData.internationalRevenue = { increment: registration.totalAmount };
    }

    // Update by primary id to avoid using non-unique fields in the where clause
    await prisma.visitorStats.update({
      where: { id: dailyStats.id },
      data: updateData
    });

    res.status(201).json(registration);
  } catch (error) {
    console.error('Error creating registration:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /registrations/{id}:
 *   put:
 *     summary: Update registration
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegistrationInput'
 *     responses:
 *       200:
 *         description: Registration updated
 *       404:
 *         description: Registration not found
 */
router.put('/registrations/:id', async (req, res) => {
  try {
    const registration = await prisma.registration.update({
      where: { id: req.params.id },
      data: req.body
    });

    res.json(registration);
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Registration not found' });
    }
    console.error('Error updating registration:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /registrations/{id}:
 *   delete:
 *     summary: Cancel registration
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Registration cancelled
 *       404:
 *         description: Registration not found
 */
router.delete('/registrations/:id', async (req, res) => {
  try {
    const registration = await prisma.registration.update({
      where: { id: req.params.id },
      data: { status: 'cancelled' }
    });

    res.json({ message: 'Registration cancelled successfully' });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Registration not found' });
    }
    console.error('Error deleting registration:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /statistics:
 *   get:
 *     summary: Get statistics
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [today, week, month]
 *           default: today
 *     responses:
 *       200:
 *         description: Statistics data
 */
router.get('/statistics', async (req, res) => {
  try {
    const { period = 'today' } = req.query;

    const now = moment.tz(MONGOLIA_TZ);
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

    const stats = await prisma.registration.aggregate({
      where: {
        registrationDate: { gte: startDate.toDate() },
        status: 'active'
      },
      _count: { id: true },
      _sum: {
        touristCount: true,
        totalAmount: true,
        guideCount: true,
        driverCount: true
      }
    });

    const result = {
      totalRegistrations: stats._count.id,
      totalTourists: stats._sum.touristCount || 0,
      totalRevenue: stats._sum.totalAmount || 0,
      totalGuides: stats._sum.guideCount || 0,
      totalDrivers: stats._sum.driverCount || 0,
      period: period
    };

    res.json(result);
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /country-stats:
 *   get:
 *     summary: Get country statistics
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [all, today, week, month, year]
 *           default: all
 *     responses:
 *       200:
 *         description: Country statistics
 */
router.get('/country-stats', async (req, res) => {
  try {
    const { period = 'all' } = req.query;

    let whereConditions = [`status = 'active'`];
    let queryParams = [];

    if (period !== 'all') {
      const now = moment.tz(MONGOLIA_TZ);
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
      }

      if (startDate) {
        whereConditions.push(`"registrationDate" >= $${queryParams.length + 1}`);
        queryParams.push(startDate.toDate());
      }
    }

    const whereClause = whereConditions.join(' AND ');

    const countryStats = await prisma.$queryRawUnsafe(
      `SELECT
        unnest(countries) as country,
        SUM("touristCount") as value
      FROM registrations
      WHERE ${whereClause}
      GROUP BY unnest(countries)
      ORDER BY value DESC`,
      ...queryParams
    );

    const countryArray = countryStats.map(stat => ({
      country: stat.country,
      code: getCountryCode(stat.country),
      value: Number(stat.value)
    }));

    res.json(countryArray);
  } catch (error) {
    console.error('Error fetching country statistics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /driver-guide-stats:
 *   get:
 *     summary: Get driver/guide statistics
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [all, today, week, month, year]
 *           default: all
 *     responses:
 *       200:
 *         description: Driver/guide statistics
 */
router.get('/driver-guide-stats', async (req, res) => {
  try {
    const { period = 'all' } = req.query;

    let where = { status: 'active' };

    if (period !== 'all') {
      const now = moment.tz(MONGOLIA_TZ);
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
      }

      if (startDate) {
        where.registrationDate = { gte: startDate.toDate() };
      }
    }

    const stats = await prisma.registration.aggregate({
      where,
      _sum: {
        driverCount: true,
        guideCount: true
      }
    });

    const result = {
      drivers: stats._sum.driverCount || 0,
      guides: stats._sum.guideCount || 0,
      total: (stats._sum.driverCount || 0) + (stats._sum.guideCount || 0)
    };

    res.json(result);
  } catch (error) {
    console.error('Error fetching driver/guide statistics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /tour-operator-stats:
 *   get:
 *     summary: Get tour operator statistics
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [all, today, week, month, year]
 *           default: all
 *     responses:
 *       200:
 *         description: Tour operator statistics
 */
router.get('/tour-operator-stats', async (req, res) => {
  try {
    const { period = 'all' } = req.query;

    let where = { status: 'active' };

    if (period !== 'all') {
      const now = moment.tz(MONGOLIA_TZ);
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
      }

      if (startDate) {
        where.registrationDate = { gte: startDate.toDate() };
      }
    }

    const operatorStats = await prisma.registration.groupBy({
      by: ['tourOperator'],
      where,
      _sum: {
        touristCount: true
      },
      orderBy: {
        _sum: {
          touristCount: 'desc'
        }
      },
      take: 10
    });

    const result = operatorStats.map(stat => ({
      operator: stat.tourOperator,
      count: stat._sum.touristCount || 0
    }));

    res.json(result);
  } catch (error) {
    console.error('Error fetching tour operator statistics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /tour-guides-and-drivers:
 *   get:
 *     summary: Get tour guides and drivers statistics
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [all, today, week, month, year]
 *           default: all
 *     responses:
 *       200:
 *         description: Tour guides and drivers statistics
 */
router.get('/tour-guides-and-drivers', async (req, res) => {
  try {
    const { period = 'all' } = req.query;

    let where = { status: 'active' };

    if (period !== 'all') {
      const now = moment.tz(MONGOLIA_TZ);
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
      }

      if (startDate) {
        where.registrationDate = { gte: startDate.toDate() };
      }
    }

    const stats = await prisma.registration.aggregate({
      where,
      _sum: {
        driverCount: true,
        guideCount: true
      }
    });

    const result = {
      drivers: stats._sum.driverCount || 0,
      guides: stats._sum.guideCount || 0,
      total: (stats._sum.driverCount || 0) + (stats._sum.guideCount || 0)
    };

    res.json(result);
  } catch (error) {
    console.error('Error fetching driver/guide statistics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /visitor-stats:
 *   get:
 *     summary: Get visitor statistics
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [today, week, month, year]
 *           default: week
 *     responses:
 *       200:
 *         description: Visitor statistics
 */
router.get('/visitor-stats', async (req, res) => {
  try {
    const { period = 'week' } = req.query;

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

    //get stats from registration
    const registrations = await prisma.registration.findMany({
      where: {
        createdAt: { gte: startDate }
      },
    });

    // compute totals first to avoid referencing 'stats' before initialization
    const totalTouristCount = registrations.reduce((sum, reg) => sum + (reg.touristCount || 0), 0);
    const totalDomesticCount = registrations.reduce((sum, reg) => sum + (reg.countries.includes("Domestic") ? reg.touristCount || 0 : 0), 0);
    const totalInternationalCount = registrations.reduce((sum, reg) => sum + (reg.countries.includes("International") ? reg.touristCount || 0 : 0), 0);
    const totalRevenue = registrations.reduce((sum, reg) => sum + (reg.totalAmount || 0), 0);
    const totalDomesticRevenue = registrations.reduce((sum, reg) => sum + (reg.countries.includes("Domestic") ? reg.totalAmount || 0 : 0), 0);
    const totalInternationalRevenue = registrations.reduce((sum, reg) => sum + (reg.countries.includes("International") ? reg.totalAmount || 0 : 0), 0);
    const maxDaily = registrations.length > 0 ? Math.max(...registrations.map(reg => reg.touristCount || 0)) : 0;
    const minDaily = registrations.length > 0 ? Math.min(...registrations.map(reg => reg.touristCount || 0)) : 0;
    const avgDaily = registrations.length > 0 ? Math.round(totalTouristCount / registrations.length) : 0;

    const stats = {
      touristCount: totalTouristCount,
      domesticCount: totalDomesticCount,
      internationalCount: totalInternationalCount,
      totalRevenue: totalRevenue,
      domesticRevenue: totalDomesticRevenue,
      internationalRevenue: totalInternationalRevenue,
      avgDailyVisitors: avgDaily,
      maxDailyVisitors: maxDaily,
      minDailyVisitors: minDaily
    };

    const result = {
      totalVisitors: stats.touristCount || 0,
      domesticVisitors: stats.domesticCount || 0,
      internationalVisitors: stats.internationalCount || 0,
      totalRevenue: stats.totalRevenue || 0,
      domesticRevenue: stats.domesticRevenue || 0,
      internationalRevenue: stats.internationalRevenue || 0,
      avgDailyVisitors: stats.avgDailyVisitors || 0,
      maxDailyVisitors: stats.maxDailyVisitors || 0,
      minDailyVisitors: stats.minDailyVisitors || 0
    };

    res.json(result);
  } catch (error) {
    console.error('Error fetching visitor statistics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /daily-visitor-stats:
 *  get:
 *    summary: Get daily visitor statistics /last 7 days
 *
 *    responses:
 *      200:
 *        description: Daily visitor statistics
 */
router.get('/daily-visitor-stats', async (req, res) => {
  try {

    const now = new Date();
    let startDate = new Date(now);
    startDate.setDate(now.getDate() - 6);
    startDate.setHours(0, 0, 0, 0);

    // Aggregate registrations by day using a raw query to avoid groupBy limitations.
    // We sum touristCount and totalAmount and also compute domestic/international totals
    const rows = await prisma.$queryRawUnsafe(
      `SELECT
         date_trunc('day', "registrationDate")::date as day,
         SUM("touristCount") as total_visitors,
         SUM(CASE WHEN 'Domestic' = ANY(countries) THEN "touristCount" ELSE 0 END) as domestic_visitors,
         SUM(CASE WHEN 'International' = ANY(countries) THEN "touristCount" ELSE 0 END) as international_visitors,
         SUM("totalAmount") as revenue
       FROM registrations
       WHERE "registrationDate" >= $1 AND "registrationDate" < $2 AND status = 'active'
       GROUP BY day
       ORDER BY day ASC`,
      startDate,
      now
    );

    // Build continuous daily series from startDate to today, filling missing days with 0s
    const dayMs = 24 * 60 * 60 * 1000;
    const endDate = new Date(now);
    endDate.setHours(0,0,0,0);

    const series = [];
    for (let d = new Date(startDate); d <= endDate; d = new Date(d.getTime() + dayMs)) {
      const iso = d.toISOString().split('T')[0];
      const row = rows.find(r => (r.day instanceof Date ? r.day.toISOString().split('T')[0] : r.day) === iso);
      series.push({
        date: d.toISOString(),
        totalVisitors: row ? Number(row.total_visitors || 0) : 0,
        domesticVisitors: row ? Number(row.domestic_visitors || 0) : 0,
        internationalVisitors: row ? Number(row.international_visitors || 0) : 0,
        revenue: row ? Number(row.revenue || 0) : 0
      });
    }

    res.json(series);
  } catch (error) {
    console.error('Error fetching daily visitor statistics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /visitor-by-country-and-vehicle:
 *   get:
 *     summary: Get visitor statistics
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [today, week, month, year]
 *           default: week
 *     responses:
 *       200:
 *         description: Visitor statistics
 */

router.get('/visitor-by-country-and-vehicle', async (req, res) => {
  try {
    const { period = 'week' } = req.query;

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

    //get stats from registration
    const registrations = await prisma.registration.findMany({
      where: {
        createdAt: { gte: startDate }
      },
    });

    // Get tourists from registrations
    const countryCounts = {};
    const vehicleTypeCounts = {};

    registrations.forEach(reg => {
      // Count tourists by country
      (reg.countries || []).forEach(country => {
        countryCounts[country] = (countryCounts[country] || 0) + (reg.touristCount || 0);
      });

      // Count registrations by vehicle type
      vehicleTypeCounts[reg.vehicleType || 'unknown'] = (vehicleTypeCounts[reg.vehicleType || 'unknown'] || 0) + 1;
    });

    const result = {
      tourists: countryCounts,
      vehicleTypes: vehicleTypeCounts
    };

    res.json(result);
  } catch (error) {
    console.error('Error fetching visitor statistics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /visitor-stats/hourly:
 *   get:
 *     summary: Get hourly visitor statistics
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [today, week, month]
 *           default: week
 *     responses:
 *       200:
 *         description: Hourly visitor statistics
 */
router.get('/visitor-stats/hourly', async (req, res) => {
  try {
    const { period = 'week' } = req.query;

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

    // Get hourly data from visitor stats
    const hourlyData = await prisma.visitorStats.findMany({
      where: {
        date: { gte: startDate }
      },
      orderBy: {
        date: 'asc'
      }
    });

    // Group by hour and calculate averages
    const hourlyStats = {};
    hourlyData.forEach(stat => {
      const hour = stat.date.getHours();
      if (!hourlyStats[hour]) {
        hourlyStats[hour] = {
          hour: hour,
          totalVisitors: 0,
          domesticVisitors: 0,
          internationalVisitors: 0,
          count: 0
        };
      }
      hourlyStats[hour].totalVisitors += stat.totalVisitors || 0;
      hourlyStats[hour].domesticVisitors += stat.domesticVisitors || 0;
      hourlyStats[hour].internationalVisitors += stat.internationalVisitors || 0;
      hourlyStats[hour].count += 1;
    });

    // Calculate averages
    const result = Object.values(hourlyStats).map(stat => ({
      hour: stat.hour,
      totalVisitors: Math.round(stat.totalVisitors / stat.count),
      domesticVisitors: Math.round(stat.domesticVisitors / stat.count),
      internationalVisitors: Math.round(stat.internationalVisitors / stat.count)
    })).sort((a, b) => a.hour - b.hour);

    res.json(result);
  } catch (error) {
    console.error('Error fetching hourly statistics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * components:
 *   schemas:
 *     Registration:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         tourOperator:
 *           type: string
 *         registrationDate:
 *           type: string
 *           format: date-time
 *         touristCount:
 *           type: integer
 *         countries:
 *           type: array
 *           items:
 *             type: string
 *         guideCount:
 *           type: integer
 *         driverCount:
 *           type: integer
 *         totalAmount:
 *           type: number
 *         currency:
 *           type: string
 *         notes:
 *           type: string
 *         status:
 *           type: string
 *         vehicleNumber:
 *           type: string
 *         vehicleType:
 *           type: string
 *         guideName:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     RegistrationInput:
 *       type: object
 *       required:
 *         - tourOperator
 *         - totalAmount
 *       properties:
 *         tourOperator:
 *           type: string
 *         registrationDate:
 *           type: string
 *           format: date-time
 *         touristCount:
 *           type: integer
 *           description: Optional - will be calculated from tourists array if provided
 *         tourists:
 *           type: array
 *           description: Array of tourist objects with country and count
 *           items:
 *             type: object
 *             required:
 *               - country
 *               - count
 *             properties:
 *               country:
 *                 type: string
 *                 description: Country name (required)
 *               count:
 *                 type: integer
 *                 description: Number of tourists from this country (required)
 *                 minimum: 1
 *         countries:
 *           type: array
 *           description: Additional countries (will be merged with countries from tourists)
 *           items:
 *             type: string
 *         guideCount:
 *           type: integer
 *         driverCount:
 *           type: integer
 *         totalAmount:
 *           type: number
 *         currency:
 *           type: string
 *         vehicleNumber:
 *           type: string
 *         vehicleType:
 *           type: string
 *         guideName:
 *           type: string
 *         status:
 *           type: string
 */

module.exports = router;

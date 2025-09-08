const express = require('express');
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');
const { PrismaClient } = require('@prisma/client');
const moment = require('moment');

const router = express.Router();
const prisma = new PrismaClient();

// Filter data by period
const filterDataByPeriod = (registrations, period) => {
  if (!period) return registrations;

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
      return registrations;
  }

  return registrations.filter(reg => {
    const regDate = moment(reg.registrationDate);
    return regDate.isAfter(startDate);
  });
};

/**
 * @swagger
 * /export/excel:
 *   get:
 *     summary: Export registrations to Excel
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [today, week, month]
 *         description: Filter data by period
 *     responses:
 *       200:
 *         description: Excel file download
 *         content:
 *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
 *             schema:
 *               type: string
 *               format: binary
 */
router.get('/excel', async (req, res) => {
  try {
    const { period } = req.query;

    let where = { status: 'active' };

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
      }

      if (startDate) {
        where.registrationDate = { gte: startDate.toDate() };
      }
    }

    const registrations = await prisma.registration.findMany({
      where,
      orderBy: { registrationDate: 'desc' }
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Tourist Registrations');

    // Add headers
    worksheet.columns = [
      { header: 'Date', key: 'registrationDate', width: 15 },
      { header: 'Vehicle Number', key: 'vehicleNumber', width: 15 },
      { header: 'Vehicle Type', key: 'vehicleType', width: 20 },
      { header: 'Guide Count', key: 'guideCount', width: 10 },
      { header: 'Driver Count', key: 'driverCount', width: 10 },
      { header: 'Tour Operator', key: 'tourOperator', width: 20 },
      { header: 'Tourist Count', key: 'touristCount', width: 10 },
      { header: 'Countries', key: 'countries', width: 30 },
      { header: 'Total Amount', key: 'totalAmount', width: 15 },
      { header: 'Currency', key: 'currency', width: 10 }
    ];

    // Style the header row
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE6E6FA' }
    };

    // Add data rows
    registrations.forEach(registration => {
      worksheet.addRow({
        registrationDate: moment(registration.registrationDate).format('YYYY-MM-DD HH:mm'),
        vehicleNumber: registration.vehicleNumber || '',
        vehicleType: registration.vehicleType || '',
        guideCount: registration.guideCount || 0,
        driverCount: registration.driverCount || 0,
        tourOperator: registration.tourOperator,
        touristCount: registration.touristCount,
        countries: Array.isArray(registration.countries) ? registration.countries.join(', ') : '',
        totalAmount: registration.totalAmount,
        currency: registration.currency || 'MNT'
      });
    });

    // Add totals row
    const totalRow = worksheet.addRow({
      registrationDate: '',
      vehicleNumber: '',
      vehicleType: 'TOTAL',
      guideCount: registrations.reduce((sum, reg) => sum + (reg.guideCount || 0), 0),
      driverCount: registrations.reduce((sum, reg) => sum + (reg.driverCount || 0), 0),
      tourOperator: '',
      touristCount: registrations.reduce((sum, reg) => sum + (reg.touristCount || 0), 0),
      countries: '',
      totalAmount: registrations.reduce((sum, reg) => sum + (reg.totalAmount || 0), 0),
      currency: ''
    });

    // Style totals row
    totalRow.font = { bold: true };
    totalRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFCCCCCC' }
    };

    // Set response headers
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=tourist-registrations-${moment().format('YYYY-MM-DD')}.xlsx`);

    // Write to response
    await workbook.xlsx.write(res);
    res.end();

  } catch (error) {
    console.error('Error exporting to Excel:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /export/pdf:
 *   get:
 *     summary: Export registrations to PDF
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [today, week, month]
 *         description: Filter data by period
 *     responses:
 *       200:
 *         description: PDF file download
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 */
router.get('/pdf', async (req, res) => {
  try {
    const { period } = req.query;

    let where = { status: 'active' };

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
      }

      if (startDate) {
        where.registrationDate = { gte: startDate.toDate() };
      }
    }

    const registrations = await prisma.registration.findMany({
      where,
      orderBy: { registrationDate: 'desc' }
    });

    // Create PDF document
    const doc = new PDFDocument();
    const filename = `tourist-registrations-${moment().format('YYYY-MM-DD')}.pdf`;

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);

    // Pipe PDF to response
    doc.pipe(res);

    // Add title
    doc.fontSize(20).text('Flaming Cliffs Tourist Registrations', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Generated on: ${moment().format('YYYY-MM-DD HH:mm:ss')}`, { align: 'center' });
    doc.moveDown();

    if (period) {
      doc.fontSize(12).text(`Period: ${period}`, { align: 'center' });
      doc.moveDown();
    }

    // Add summary
    const totalTourists = registrations.reduce((sum, reg) => sum + reg.touristCount, 0);
    const totalRevenue = registrations.reduce((sum, reg) => sum + reg.totalAmount, 0);
    const totalGuides = registrations.reduce((sum, reg) => sum + (reg.guideCount || 0), 0);
    const totalDrivers = registrations.reduce((sum, reg) => sum + (reg.driverCount || 0), 0);

    doc.fontSize(14).text('Summary:', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(10)
      .text(`Total Registrations: ${registrations.length}`)
      .text(`Total Tourists: ${totalTourists}`)
      .text(`Total Revenue: ${totalRevenue.toLocaleString()} MNT`)
      .text(`Total Guides: ${totalGuides}`)
      .text(`Total Drivers: ${totalDrivers}`);
    doc.moveDown();

    // Add table header
    const tableTop = doc.y + 10;
    const colWidths = [80, 60, 60, 40, 40, 80, 50, 80];

    doc.fontSize(8);
    doc.text('Date', 50, tableTop);
    doc.text('Operator', 130, tableTop);
    doc.text('Tourists', 210, tableTop);
    doc.text('Guides', 250, tableTop);
    doc.text('Drivers', 290, tableTop);
    doc.text('Countries', 330, tableTop);
    doc.text('Amount', 410, tableTop);
    doc.text('Currency', 460, tableTop);

    // Draw header line
    doc.moveTo(50, tableTop + 15).lineTo(500, tableTop + 15).stroke();

    let y = tableTop + 25;

    // Add table rows
    registrations.forEach((reg, index) => {
      if (y > 700) { // New page if needed
        doc.addPage();
        y = 50;
      }

      const date = moment(reg.registrationDate).format('MM/DD HH:mm');
      const countries = Array.isArray(reg.countries) ? reg.countries.join(', ') : '';

      doc.text(date, 50, y);
      doc.text(reg.tourOperator.substring(0, 15), 130, y);
      doc.text(reg.touristCount.toString(), 210, y);
      doc.text((reg.guideCount || 0).toString(), 250, y);
      doc.text((reg.driverCount || 0).toString(), 290, y);
      doc.text(countries.substring(0, 20), 330, y);
      doc.text(reg.totalAmount.toLocaleString(), 410, y);
      doc.text(reg.currency || 'MNT', 460, y);

      y += 15;
    });

    // Finalize PDF
    doc.end();

  } catch (error) {
    console.error('Error exporting to PDF:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

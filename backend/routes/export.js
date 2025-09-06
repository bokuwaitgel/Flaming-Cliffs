const express = require('express');
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');
const moment = require('moment');
const fs = require('fs').promises;
const path = require('path');

const router = express.Router();
const DATA_FILE = path.join(__dirname, '..', 'data', 'registrations.json');

// Read data from file
const readData = async () => {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading data:', error);
    return [];
  }
};

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

// Export to Excel
router.get('/excel', async (req, res) => {
  try {
    const registrations = await readData();
    const { period } = req.query;
    const filteredData = filterDataByPeriod(registrations, period);
    
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Tourist Registrations');
    
    // Add headers
    worksheet.columns = [
      { header: 'Огноо', key: 'registrationDate', width: 15 },
      { header: 'Машины дугаар', key: 'vehicleNumber', width: 15 },
      { header: 'Машины марк', key: 'vehicleType', width: 20 },
      { header: 'Хөтөч', key: 'guideCount', width: 10 },
      { header: 'Жолооч', key: 'driverCount', width: 10 },
      { header: 'Тур Оператор', key: 'tourOperator', width: 20 },
      { header: 'Жуулчид', key: 'touristCount', width: 10 },
      { header: 'Улс', key: 'countries', width: 30 },
      { header: 'Төлбөр', key: 'totalAmount', width: 15 }
    ];
    
    // Style the header row
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE6E6FA' }
    };
    
    // Add data rows
    filteredData.forEach(registration => {
      worksheet.addRow({
        registrationDate: registration.registrationDate,
        vehicleNumber: registration.vehicleNumber,
        vehicleType: registration.vehicleType,
        guideCount: registration.guideCount,
        driverCount: registration.driverCount,
        tourOperator: registration.tourOperator,
        touristCount: registration.touristCount,
        countries: Array.isArray(registration.countries) ? registration.countries.join(', ') : registration.countries,
        totalAmount: registration.totalAmount
      });
    });
    
    // Add totals row
    const totalRow = worksheet.addRow({
      registrationDate: '',
      vehicleNumber: '',
      vehicleType: 'Нийт',
      guideCount: filteredData.reduce((sum, reg) => sum + (reg.guideCount || 0), 0),
      driverCount: filteredData.reduce((sum, reg) => sum + (reg.driverCount || 0), 0),
      tourOperator: '',
      touristCount: filteredData.reduce((sum, reg) => sum + (reg.touristCount || 0), 0),
      countries: '',
      totalAmount: filteredData.reduce((sum, reg) => sum + (reg.totalAmount || 0), 0)
    });
    
    totalRow.font = { bold: true };
    totalRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFF0F0F0' }
    };
    
    // Set response headers
    const filename = `tourist_registrations_${moment().format('YYYY-MM-DD')}.xlsx`;
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    
    // Write to response
    await workbook.xlsx.write(res);
    res.end();
    
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    res.status(500).json({ error: 'Failed to export to Excel' });
  }
});

// Export to PDF
router.get('/pdf', async (req, res) => {
  try {
    const registrations = await readData();
    const { period } = req.query;
    const filteredData = filterDataByPeriod(registrations, period);
    
    const doc = new PDFDocument({ margin: 50 });
    const filename = `tourist_registrations_${moment().format('YYYY-MM-DD')}.pdf`;
    
    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    
    // Pipe the PDF to the response
    doc.pipe(res);
    
    // Add title
    doc.fontSize(20).text('Жуулчны бүртгэлийн хүснэгт', { align: 'center' });
    doc.moveDown();
    
    // Add generation date
    doc.fontSize(12).text(`Огноо: ${moment().format('YYYY-MM-DD HH:mm')}`, { align: 'right' });
    doc.moveDown();
    
    // Table headers
    const headers = ['Огноо', 'Машины дугаар', 'Машины марк', 'Хөтөч', 'Жолооч', 'Тур Оператор', 'Жуулчид', 'Улс', 'Төлбөр'];
    const startX = 50;
    let currentY = doc.y;
    const columnWidth = 60;
    
    // Draw header row
    doc.fontSize(10).font('Helvetica-Bold');
    headers.forEach((header, index) => {
      doc.text(header, startX + (index * columnWidth), currentY, { width: columnWidth - 5 });
    });
    
    currentY += 20;
    doc.moveTo(startX, currentY).lineTo(startX + (headers.length * columnWidth), currentY).stroke();
    currentY += 5;
    
    // Draw data rows
    doc.font('Helvetica').fontSize(8);
    filteredData.forEach(registration => {
      const rowData = [
        registration.registrationDate || '',
        registration.vehicleNumber || '',
        registration.vehicleType || '',
        registration.guideCount?.toString() || '',
        registration.driverCount?.toString() || '',
        registration.tourOperator || '',
        registration.touristCount?.toString() || '',
        Array.isArray(registration.countries) ? registration.countries.join(', ') : (registration.countries || ''),
        registration.totalAmount?.toLocaleString() + '₮' || ''
      ];
      
      rowData.forEach((data, index) => {
        doc.text(data, startX + (index * columnWidth), currentY, { width: columnWidth - 5 });
      });
      
      currentY += 15;
      
      // Add new page if needed
      if (currentY > 700) {
        doc.addPage();
        currentY = 50;
      }
    });
    
    // Add totals row
    currentY += 10;
    doc.moveTo(startX, currentY).lineTo(startX + (headers.length * columnWidth), currentY).stroke();
    currentY += 5;
    
    const totals = [
      '',
      '',
      'Нийт',
      filteredData.reduce((sum, reg) => sum + (reg.guideCount || 0), 0).toString(),
      filteredData.reduce((sum, reg) => sum + (reg.driverCount || 0), 0).toString(),
      '',
      filteredData.reduce((sum, reg) => sum + (reg.touristCount || 0), 0).toString(),
      '',
      filteredData.reduce((sum, reg) => sum + (reg.totalAmount || 0), 0).toLocaleString() + '₮'
    ];
    
    doc.font('Helvetica-Bold');
    totals.forEach((total, index) => {
      doc.text(total, startX + (index * columnWidth), currentY, { width: columnWidth - 5 });
    });
    
    // Finalize the PDF
    doc.end();
    
  } catch (error) {
    console.error('Error exporting to PDF:', error);
    res.status(500).json({ error: 'Failed to export to PDF' });
  }
});

module.exports = router;

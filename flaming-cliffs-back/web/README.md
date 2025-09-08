# Flaming Cliffs Web Interface

This directory contains the frontend web interface for the Flaming Cliffs Tourist Registration System.

## 🚀 Quick Start

1. **Start the Backend Server** (from `/flaming-cliffs-back` directory):
   ```bash
   cd ../flaming-cliffs-back
   npm start
   ```

2. **Open the Web Interface**:
   - **System Status**: Open `system-status.html` in your browser
      - **Registration Form**: Open `juulchid-bvrtgel.html`
   - **Enhanced Dashboard**: Open `bvrtgel-enhanced.html`
   - **Basic Dashboard**: Open `bvrtgel.html`

## 📁 Files Overview

### Core Files
- `api.js` - API client for backend communication
- `script.js` - Basic dashboard functionality
- `juulchid.js` - Registration form logic
- `dashboard-enhanced.js` - Advanced dashboard with charts

### HTML Pages
- `index.html` - Main landing page
 - `juulchid-bvrtgel.html` - Tourist registration form
- `bvrtgel.html` - Basic dashboard
- `bvrtgel-enhanced.html` - Advanced dashboard with analytics
- `system-status.html` - System health check page

### Features

#### 📝 Registration Form (`juulchid-bvrtgel.html`)
- Tourist count selection with +/- buttons
- Driver and guide count inputs
- Vehicle information (number, type)
- Tour operator selection
- Country selection with flag indicators
- Real-time form validation
- Automatic submission to backend API

#### 📊 Enhanced Dashboard (`bvrtgel-enhanced.html`)
- **Statistics Cards**: Total tourists, revenue, registrations, guides
- **Interactive Charts**:
  - Country distribution (pie chart)
  - Tour operator performance (bar chart)
  - Hourly visitor patterns (line chart)
  - Driver/guide distribution (doughnut chart)
- **Dynamic Data Table**: Real-time registration data
- **Period Filtering**: Today, week, month, year
- **Export Functions**: Excel and PDF downloads

#### 🔧 System Status (`system-status.html`)
- Backend API connectivity check
- Database connection status
- API endpoint testing
- Quick navigation links
- Real-time health monitoring

## 🎨 UI/UX Features

### Design System
- **Tailwind CSS** for responsive design
- **Chart.js** for data visualization
- **Font Awesome** icons
- **Responsive grid layouts**
- **Modern card-based design**

### User Experience
- **Real-time Updates**: Auto-refresh every 5 minutes
- **Loading States**: Visual feedback during API calls
- **Error Handling**: User-friendly error messages
- **Form Validation**: Client-side validation with feedback
- **Mobile Responsive**: Works on all device sizes

## 🔌 API Integration

### Backend Connection
- **Base URL**: `http://localhost:3000/api`
- **Authentication**: None required (for demo)
- **Error Handling**: Comprehensive error responses
- **Data Validation**: Server-side validation

### Available Endpoints
```javascript
// Registration Management
POST   /api/registrations              // Create registration
GET    /api/registrations              // List with filters
GET    /api/registrations/:id          // Get by ID
PUT    /api/registrations/:id          // Update
DELETE /api/registrations/:id          // Delete

// Statistics & Analytics
GET    /api/statistics                 // General stats
GET    /api/country-stats              // Country breakdown
GET    /api/driver-guide-stats         // Staff stats
GET    /api/tour-operator-stats        // Operator stats
GET    /api/visitor-stats              // Visitor analytics
GET    /api/visitor-stats/trends       // Trends over time
GET    /api/visitor-stats/today        // Today's stats
GET    /api/visitor-stats/hourly       // Hourly patterns

// Export Functions
GET    /api/export/excel               // Excel export
GET    /api/export/pdf                 // PDF export
```

## 📊 Dashboard Features

### Statistics Cards
- **Total Tourists**: Sum of all tourist counts
- **Total Revenue**: Sum of all registration amounts
- **Total Registrations**: Number of registration records
- **Total Guides**: Sum of guide counts

### Chart Visualizations
1. **Country Distribution**: Pie chart showing tourist origins
2. **Tour Operator Performance**: Bar chart of operator rankings
3. **Hourly Patterns**: Line chart of visitor activity by hour
4. **Staff Distribution**: Doughnut chart of drivers vs guides

### Data Table
- **Sortable Columns**: Click headers to sort
- **Period Filtering**: Filter by time periods
- **Real-time Updates**: Auto-refresh data
- **Export Options**: Excel/PDF downloads

## 🛠️ Development

### File Structure
```
web/
├── api.js                    # API client
├── script.js                 # Basic dashboard
├── juulchid.js              # Registration form
├── dashboard-enhanced.js     # Advanced dashboard
├── index.html               # Landing page
├── juulchid-bvrtgel.html    # Registration form
├── bvrtgel.html             # Basic dashboard
├── bvrtgel-enhanced.html    # Enhanced dashboard
├── system-status.html       # Status checker
└── img/                     # Images and assets
```

### Adding New Features
1. **Update API Client** (`api.js`): Add new API methods
2. **Create UI Components**: Add HTML elements
3. **Add JavaScript Logic**: Handle user interactions
4. **Update Styling**: Use Tailwind classes
5. **Test Integration**: Verify with backend API

### Customization
- **Colors**: Modify Tailwind color classes
- **Charts**: Update Chart.js configurations
- **Layout**: Adjust grid and flex layouts
- **API**: Change base URL in `api.js`

## 🔍 Troubleshooting

### Common Issues
1. **Backend Not Connected**
   - Check if backend server is running on port 3000
   - Verify API_BASE_URL in `api.js`

2. **Charts Not Loading**
   - Ensure Chart.js library is loaded
   - Check console for JavaScript errors

3. **Form Not Submitting**
   - Verify form validation requirements
   - Check network connectivity
   - Review browser console for errors

4. **Data Not Updating**
   - Check API endpoint responses
   - Verify database connectivity
   - Clear browser cache

### Debug Mode
- Open browser Developer Tools (F12)
- Check Console tab for error messages
- Check Network tab for API requests
- Use `system-status.html` for connectivity testing

## 📈 Performance

### Optimization Features
- **Lazy Loading**: Charts load only when visible
- **Debounced Updates**: Prevent excessive API calls
- **Caching**: Browser caching for static assets
- **Minified Libraries**: Use CDN versions of libraries

### Monitoring
- **API Response Times**: Monitor in Network tab
- **Memory Usage**: Check browser Task Manager
- **Error Rates**: Review console error logs

## 🔐 Security Notes

- **HTTPS**: Use HTTPS in production
- **Input Validation**: Both client and server validation
- **XSS Protection**: Sanitize user inputs
- **CSRF Protection**: Implement CSRF tokens for forms

## 📞 Support

For issues or questions:
1. Check the `system-status.html` page
2. Review browser console errors
3. Verify backend server status
4. Check API documentation at `/api-docs`

---

**Last Updated**: September 8, 2025
**Version**: 2.0.0
**Backend**: Node.js + Express + PostgreSQL + Prisma

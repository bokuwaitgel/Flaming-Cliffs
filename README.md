# Flaming Cliffs Tourist Registration System

A complete web application for managing tourist registrations at Flaming Cliffs with separated Node.js backend and modern frontend architecture.

## Features

- **Tourist Registration Form** - Interactive form for registering new tourists
- **Dashboard** - View and manage all registrations with filtering options
- **Export Functionality** - Export data to Excel and PDF formats
- **Real-time Updates** - Dynamic data loading and table updates
- **Responsive Design** - Works on desktop and mobile devices

## Project Structure

```
├── backend/                    # Node.js Backend
│   ├── server.js              # Main Express server
│   ├── package.json           # Backend dependencies
│   └── web/                       # Frontend Web Application
│      ├── index.html             # Main page
│      ├── bvrtgel.html          # Dashboard page
│      ├── juulchid-bvrtgel.html # Registration form page
│      ├── api.js                 # Frontend API client
│      ├── script.js              # Dashboard JavaScript
│      ├── juulchid.js           # Registration form JavaScript
│      ├── global.css            # Global styles
│      ├── img/                  # Images and assets
│      └── font/                 # Font files
├── data/                      # Shared data directory
│   ├── .env                   # Environment variables
│   ├── routes/
│   │   └── export.js          # Export functionality routes
│   ├── data/
│   │   └── registrations.json # Data storage (auto-created)
│   └── node_modules/          # Backend dependencies
└── README.md                  # This file
```

## Setup Instructions

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Start the Server**
   ```bash
   # Development mode with auto-restart
   npm run dev
   
   # Production mode
   npm start
   ```

### Frontend Access

Once the backend is running, access the application at:
- **Main Page**: http://localhost:3000/
- **Dashboard**: http://localhost:3000/dashboard
- **Registration Form**: http://localhost:3000/registration
- **API Endpoints**: http://localhost:3000/api

## Backend API

### Endpoints

- `GET /api/registrations` - Get all registrations (with optional period filter)
- `POST /api/registrations` - Create new registration
- `GET /api/registrations/:id` - Get registration by ID
- `PUT /api/registrations/:id` - Update registration
- `DELETE /api/registrations/:id` - Delete registration
- `GET /api/statistics` - Get statistics by period
- `GET /api/export/excel` - Export to Excel
- `GET /api/export/pdf` - Export to PDF

## Data Format

Registration objects contain:
- `id` - Unique identifier
- `driverCount` - Number of drivers
- `guideCount` - Number of guides
- `guideName` - Guide name
- `vehicleNumber` - Vehicle registration number
- `tourOperator` - Tour operator company
- `vehicleType` - Type of vehicle
- `touristCount` - Number of tourists
- `countries` - Array of countries
- `totalAmount` - Total payment amount
- `registrationDate` - Date of registration
- `createdAt` - Creation timestamp
- `updatedAt` - Last update timestamp

## Environment Variables

Located in `backend/.env`:
- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment (development/production)
- `DATA_FILE_PATH` - Path to data file

## Technologies Used

- **Backend**: Node.js, Express.js, ExcelJS, PDFKit, Moment.js
- **Frontend**: HTML, CSS (Tailwind), Vanilla JavaScript
- **Data Storage**: JSON file
- **Architecture**: Separated frontend/backend with REST API

## Development

The project follows a clean separation of concerns:
- **Backend** (`/backend`) - Handles API, data storage, and file exports
- **Frontend** (`/web`) - Contains all HTML, CSS, JavaScript, and assets
- **Static Serving** - Backend serves frontend files automatically

This structure makes it easy to:
- Deploy backend and frontend separately if needed
- Maintain and update each part independently
- Scale the application architecture

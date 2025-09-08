const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const app = express();

// Initialize Prisma Client with better error handling
let prisma;
try {
  prisma = new PrismaClient();
} catch (error) {
  console.error('Failed to initialize Prisma Client:', error);
  console.log('Attempting to regenerate Prisma Client...');
  // This will fail gracefully and provide better error messaging
  throw new Error('Prisma Client initialization failed. Please ensure Prisma Client is properly generated.');
}

const PORT = process.env.PORT || 3000;

// Swagger definition
const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Flaming Cliffs Tourist Registration API',
    version: '1.0.0',
    description: 'Comprehensive API for Flaming Cliffs Tourist Registration System with JWT Authentication',
  },
  servers: [
    {
      url: `http://localhost:${PORT}/api`,
      description: 'Development server',
    },
    {
      url: '/api',
      description: 'Production server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
  security: [
    {
      bearerAuth: [],
    },
  ],
};

// Swagger options
const options = {
  swaggerDefinition,
  apis: ['./routes/*.js'], // Path to the API docs
};

// Initialize swagger-jsdoc
const swaggerSpec = swaggerJsdoc(options);

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Serve static web files
app.use(express.static(path.join(__dirname, 'web')));

// Routes
const userRoutes = require('./routes/users');
const registrationRoutes = require('./routes/registrations');
const exportRoutes = require('./routes/export');

app.use('/api', userRoutes);
app.use('/api', registrationRoutes);
app.use('/api/export', exportRoutes);

// Serve HTML pages
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'web', 'index.html'));
});

app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'web', 'system-status.html'));
});

app.get('/registration', (req, res) => {
  res.sendFile(path.join(__dirname, 'web', 'bvrtgel-enhanced.html'));
});

app.get('/about', (req, res) => {
  res.sendFile(path.join(__dirname, 'web', 'about.html'));
});

app.get('/gallery', (req, res) => {
  res.sendFile(path.join(__dirname, 'web', 'photo_gallery.html'));
});

//Authentication pages
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'web', 'login.html'));
});

app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'web', 'register.html'));
});

app.get('/auth-login.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'web', 'login.html'));
});

app.get('/register.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'web', 'register.html'));
});

// Role selection page (original login.html functionality)
app.get('/login.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'web', 'role-selection.html'));
});

app.get('/role-selection', (req, res) => {
  res.sendFile(path.join(__dirname, 'web', 'role-selection.html'));
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
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

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

// Start server
// Connect to the database with retry/backoff to tolerate transient network issues
const wait = (ms) => new Promise((res) => setTimeout(res, ms));

async function connectWithRetry(maxRetries = 5, initialDelayMs = 500) {
  let attempt = 0;
  let delay = initialDelayMs;

  while (attempt < maxRetries) {
    try {
      await prisma.$connect();
      console.log('🗄️  Database connected successfully');
      return true;
    } catch (err) {
      attempt += 1;
      console.warn(`Prisma connect attempt ${attempt} failed: ${err.code || err.message}`);
      if (attempt >= maxRetries) {
        console.error('Max retries reached for Prisma connect.');
        return false;
      }
      console.log(`Retrying in ${delay}ms...`);
      await wait(delay);
      delay *= 2; // exponential backoff
    }
  }
  return false;
}

const startServer = async () => {
  const ok = await connectWithRetry(5, 500);
  if (!ok) {
    console.error('Failed to connect to database after retries. Keeping process alive for investigation.');
    // Do not exit immediately; keep process running so platform logs show ongoing info.
    return;
  }

  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📊 Dashboard: http://localhost:${PORT}/dashboard`);
    console.log(`📝 Registration: http://localhost:${PORT}/registration`);
    console.log(`📚 API Docs: http://localhost:${PORT}/api-docs`);
    console.log(`💾 Database: PostgreSQL with Prisma`);
  });
};

startServer();

// Graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

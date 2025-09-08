# Flaming Cliffs Backend

A Node.js backend application with Prisma ORM and Swagger documentation.

## Features

- Express.js server
- Prisma ORM with SQLite database
- Swagger API documentation
- User management endpoints

## Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Generate Prisma client:
   ```bash
   npx prisma generate
   ```

3. Run database migrations:
   ```bash
   npx prisma migrate dev
   ```

## Running the Application

### Development
```bash
npm run dev
```

### Production
```bash
npm start
```

The server will start on `http://localhost:3000`.

## API Documentation

Swagger documentation is available at `http://localhost:3000/api-docs`.

## Available Scripts

- `npm start`: Start the server
- `npm run dev`: Start the server with nodemon
- `npm run prisma:generate`: Generate Prisma client
- `npm run prisma:migrate`: Run Prisma migrations
- `npm run prisma:studio`: Open Prisma Studio

## Database

The application uses SQLite for simplicity. The database file is `prisma/dev.db`.

To view and edit the database, run:
```bash
npx prisma studio
```

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "registrations" (
    "id" TEXT NOT NULL,
    "tourOperator" TEXT NOT NULL,
    "registrationDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "touristCount" INTEGER NOT NULL,
    "countries" TEXT[],
    "guideCount" INTEGER DEFAULT 0,
    "driverCount" INTEGER DEFAULT 0,
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT DEFAULT 'MNT',
    "notes" TEXT,
    "contactInfo" JSONB,
    "status" TEXT DEFAULT 'active',
    "vehicleNumber" TEXT,
    "vehicleType" TEXT,
    "guideName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "registrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "visitor_stats" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "domesticVisitors" INTEGER DEFAULT 0,
    "internationalVisitors" INTEGER DEFAULT 0,
    "totalVisitors" INTEGER DEFAULT 0,
    "domesticRevenue" DOUBLE PRECISION DEFAULT 0,
    "internationalRevenue" DOUBLE PRECISION DEFAULT 0,
    "totalRevenue" DOUBLE PRECISION DEFAULT 0,
    "tourOperators" JSONB[],
    "countryBreakdown" JSONB[],
    "weather" JSONB,
    "hourlyBreakdown" JSONB[],
    "events" JSONB[],
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "visitor_stats_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "visitor_stats_date_key" ON "visitor_stats"("date");

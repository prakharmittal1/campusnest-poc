-- AlterTable
ALTER TABLE "Property" ADD COLUMN     "isDemo" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE "RentBenchmark" (
    "id" SERIAL NOT NULL,
    "cityId" INTEGER NOT NULL,
    "lowPrice" INTEGER NOT NULL,
    "highPrice" INTEGER,
    "period" TEXT NOT NULL,
    "sourceName" TEXT NOT NULL,
    "sourceUrl" TEXT NOT NULL,
    "note" TEXT NOT NULL,
    "asOf" TEXT NOT NULL,

    CONSTRAINT "RentBenchmark_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RentBenchmark_cityId_key" ON "RentBenchmark"("cityId");

-- AddForeignKey
ALTER TABLE "RentBenchmark" ADD CONSTRAINT "RentBenchmark_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateEnum
CREATE TYPE "ReadinessStatus" AS ENUM ('READY', 'IN_USE', 'MAINTENANCE_DUE', 'OUT_OF_SERVICE');

-- AlterTable
ALTER TABLE "Equipment" ADD COLUMN     "readinessStatus" "ReadinessStatus" NOT NULL DEFAULT 'READY';

-- CreateTable
CREATE TABLE "ServiceRequestStatusHistory" (
    "id" TEXT NOT NULL,
    "serviceRequestId" TEXT NOT NULL,
    "fromStatus" "ServiceRequestStatus",
    "toStatus" "ServiceRequestStatus" NOT NULL,
    "changedByUserId" TEXT,
    "notes" TEXT,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ServiceRequestStatusHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EquipmentStatusHistory" (
    "id" TEXT NOT NULL,
    "equipmentId" TEXT NOT NULL,
    "fromStatus" "ReadinessStatus",
    "toStatus" "ReadinessStatus" NOT NULL,
    "changedByUserId" TEXT,
    "notes" TEXT,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EquipmentStatusHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ServiceRequestStatusHistory_serviceRequestId_changedAt_idx" ON "ServiceRequestStatusHistory"("serviceRequestId", "changedAt");

-- CreateIndex
CREATE INDEX "EquipmentStatusHistory_equipmentId_changedAt_idx" ON "EquipmentStatusHistory"("equipmentId", "changedAt");

-- AddForeignKey
ALTER TABLE "ServiceRequestStatusHistory" ADD CONSTRAINT "ServiceRequestStatusHistory_serviceRequestId_fkey" FOREIGN KEY ("serviceRequestId") REFERENCES "ServiceRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceRequestStatusHistory" ADD CONSTRAINT "ServiceRequestStatusHistory_changedByUserId_fkey" FOREIGN KEY ("changedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EquipmentStatusHistory" ADD CONSTRAINT "EquipmentStatusHistory_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EquipmentStatusHistory" ADD CONSTRAINT "EquipmentStatusHistory_changedByUserId_fkey" FOREIGN KEY ("changedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

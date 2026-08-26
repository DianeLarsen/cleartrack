-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('TECHNICIAN', 'SUPERVISOR', 'SYSTEM_ADMIN');

-- CreateEnum
CREATE TYPE "CalibrationResult" AS ENUM ('PASSED', 'FAILED');

-- CreateEnum
CREATE TYPE "MeasurementResult" AS ENUM ('PASSED', 'FAILED');

-- CreateEnum
CREATE TYPE "ServiceRequestOrigin" AS ENUM ('CLINIC_CONTACT', 'CLEARTRACK_USER', 'SYSTEM');

-- CreateEnum
CREATE TYPE "ServiceRequestReason" AS ENUM ('CUSTOMER_REPAIR_REQUEST', 'FAILED_CALIBRATION', 'EOL_UPDATE', 'PREVENTIVE_MAINTENANCE', 'INSPECTION_FAILURE', 'OTHER');

-- CreateEnum
CREATE TYPE "ServiceRequestStatus" AS ENUM ('AWAITING_SHIPMENT', 'RECEIVED', 'IN_REPAIR', 'AWAITING_QA', 'READY_TO_SHIP', 'SHIPPED', 'ON_HOLD', 'CLOSED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ShipmentDirection" AS ENUM ('INBOUND', 'OUTBOUND');

-- CreateEnum
CREATE TYPE "ShipmentStatus" AS ENUM ('EXPECTED', 'IN_TRANSIT', 'DELIVERED', 'EXCEPTION', 'CANCELLED');

-- CreateEnum
CREATE TYPE "StorageLocationType" AS ENUM ('RECEIVING', 'REPAIR_QUEUE', 'REPAIR_BENCH', 'QA_STATION', 'SHIPPING_RACK', 'QUARANTINE');

-- CreateEnum
CREATE TYPE "CustodyEventType" AS ENUM ('RECEIVED_AT_WAREHOUSE', 'MOVED', 'CHECKED_OUT_FOR_SERVICE', 'CHECKED_IN_FROM_SERVICE', 'STAGED_FOR_SHIPMENT', 'RELEASED_TO_CARRIER');

-- CreateEnum
CREATE TYPE "InspectionType" AS ENUM ('INTAKE', 'POST_REPAIR', 'FINAL_QA');

-- CreateEnum
CREATE TYPE "InspectionOutcome" AS ENUM ('PASSED', 'FAILED');

-- CreateEnum
CREATE TYPE "InspectionCheckResult" AS ENUM ('PASSED', 'FAILED', 'NOT_APPLICABLE');

-- CreateTable
CREATE TABLE "Clinic" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "addressLine1" TEXT NOT NULL,
    "addressLine2" TEXT,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "postalCode" TEXT NOT NULL,
    "country" TEXT NOT NULL DEFAULT 'US',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Clinic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClinicContact" (
    "id" TEXT NOT NULL,
    "clinicId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClinicContact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "entraSubject" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'TECHNICIAN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EquipmentType" (
    "id" TEXT NOT NULL,
    "manufacturer" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "defaultCalibrationIntervalDays" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EquipmentType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Equipment" (
    "id" TEXT NOT NULL,
    "clinicId" TEXT NOT NULL,
    "equipmentTypeId" TEXT NOT NULL,
    "serialNumber" TEXT NOT NULL,
    "clinicAssetTag" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastCalibratedAt" TIMESTAMP(3),
    "nextCalibrationDueAt" TIMESTAMP(3),

    CONSTRAINT "Equipment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Calibration" (
    "id" TEXT NOT NULL,
    "equipmentId" TEXT NOT NULL,
    "serviceRequestId" TEXT,
    "performedById" TEXT NOT NULL,
    "performedAt" TIMESTAMP(3) NOT NULL,
    "result" "CalibrationResult" NOT NULL,
    "notes" TEXT,
    "certificateNumber" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Calibration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CalibrationRequirement" (
    "id" TEXT NOT NULL,
    "equipmentTypeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "targetValue" DECIMAL(12,3),
    "minimumValue" DECIMAL(12,3),
    "maximumValue" DECIMAL(12,3),
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isRequired" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CalibrationRequirement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CalibrationMeasurement" (
    "id" TEXT NOT NULL,
    "calibrationId" TEXT NOT NULL,
    "requirementId" TEXT NOT NULL,
    "targetValue" DECIMAL(12,3),
    "measuredValue" DECIMAL(12,3) NOT NULL,
    "result" "MeasurementResult" NOT NULL,
    "testName" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "minimumValue" DECIMAL(12,3),
    "maximumValue" DECIMAL(12,3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CalibrationMeasurement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceRequest" (
    "id" TEXT NOT NULL,
    "rmaNumber" TEXT NOT NULL,
    "clinicId" TEXT NOT NULL,
    "clinicContactId" TEXT,
    "initiatedByUserId" TEXT,
    "origin" "ServiceRequestOrigin" NOT NULL,
    "reason" "ServiceRequestReason" NOT NULL,
    "reasonDetails" TEXT,
    "equipmentId" TEXT,
    "currentLocationId" TEXT,
    "currentCustodianUserId" TEXT,
    "reportedSerialNumber" TEXT NOT NULL,
    "reportedAssetTag" TEXT,
    "issueDescription" TEXT NOT NULL,
    "status" "ServiceRequestStatus" NOT NULL DEFAULT 'AWAITING_SHIPMENT',
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "receivedAt" TIMESTAMP(3),
    "closedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServiceRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Shipment" (
    "id" TEXT NOT NULL,
    "clinicId" TEXT NOT NULL,
    "direction" "ShipmentDirection" NOT NULL,
    "status" "ShipmentStatus" NOT NULL DEFAULT 'EXPECTED',
    "carrier" TEXT,
    "trackingNumber" TEXT,
    "shippedAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Shipment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShipmentItem" (
    "id" TEXT NOT NULL,
    "shipmentId" TEXT NOT NULL,
    "serviceRequestId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ShipmentItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StorageLocation" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "StorageLocationType" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StorageLocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustodyEvent" (
    "id" TEXT NOT NULL,
    "serviceRequestId" TEXT NOT NULL,
    "shipmentId" TEXT,
    "fromLocationId" TEXT,
    "toLocationId" TEXT,
    "performedById" TEXT NOT NULL,
    "custodianUserId" TEXT,
    "eventType" "CustodyEventType" NOT NULL,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CustodyEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StatusHistory" (
    "id" TEXT NOT NULL,
    "serviceRequestId" TEXT NOT NULL,
    "fromStatus" "ServiceRequestStatus",
    "toStatus" "ServiceRequestStatus" NOT NULL,
    "changedByUserId" TEXT,
    "notes" TEXT,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StatusHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InspectionRequirement" (
    "id" TEXT NOT NULL,
    "equipmentTypeId" TEXT NOT NULL,
    "inspectionType" "InspectionType" NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isRequired" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InspectionRequirement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Inspection" (
    "id" TEXT NOT NULL,
    "serviceRequestId" TEXT NOT NULL,
    "equipmentId" TEXT NOT NULL,
    "inspectionType" "InspectionType" NOT NULL,
    "outcome" "InspectionOutcome" NOT NULL,
    "performedById" TEXT NOT NULL,
    "performedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Inspection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InspectionCheck" (
    "id" TEXT NOT NULL,
    "inspectionId" TEXT NOT NULL,
    "requirementId" TEXT NOT NULL,
    "requirementName" TEXT NOT NULL,
    "result" "InspectionCheckResult" NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InspectionCheck_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Clinic_code_key" ON "Clinic"("code");

-- CreateIndex
CREATE UNIQUE INDEX "ClinicContact_email_key" ON "ClinicContact"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_entraSubject_key" ON "User"("entraSubject");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "EquipmentType_manufacturer_model_key" ON "EquipmentType"("manufacturer", "model");

-- CreateIndex
CREATE UNIQUE INDEX "Equipment_serialNumber_key" ON "Equipment"("serialNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Equipment_clinicId_clinicAssetTag_key" ON "Equipment"("clinicId", "clinicAssetTag");

-- CreateIndex
CREATE UNIQUE INDEX "Calibration_certificateNumber_key" ON "Calibration"("certificateNumber");

-- CreateIndex
CREATE UNIQUE INDEX "CalibrationRequirement_equipmentTypeId_name_key" ON "CalibrationRequirement"("equipmentTypeId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceRequest_rmaNumber_key" ON "ServiceRequest"("rmaNumber");

-- CreateIndex
CREATE INDEX "ServiceRequest_clinicId_status_idx" ON "ServiceRequest"("clinicId", "status");

-- CreateIndex
CREATE INDEX "ServiceRequest_status_submittedAt_idx" ON "ServiceRequest"("status", "submittedAt");

-- CreateIndex
CREATE INDEX "ServiceRequest_reportedSerialNumber_idx" ON "ServiceRequest"("reportedSerialNumber");

-- CreateIndex
CREATE INDEX "Shipment_clinicId_direction_status_idx" ON "Shipment"("clinicId", "direction", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Shipment_carrier_trackingNumber_key" ON "Shipment"("carrier", "trackingNumber");

-- CreateIndex
CREATE INDEX "ShipmentItem_serviceRequestId_idx" ON "ShipmentItem"("serviceRequestId");

-- CreateIndex
CREATE UNIQUE INDEX "ShipmentItem_shipmentId_serviceRequestId_key" ON "ShipmentItem"("shipmentId", "serviceRequestId");

-- CreateIndex
CREATE UNIQUE INDEX "StorageLocation_code_key" ON "StorageLocation"("code");

-- CreateIndex
CREATE INDEX "CustodyEvent_serviceRequestId_occurredAt_idx" ON "CustodyEvent"("serviceRequestId", "occurredAt");

-- CreateIndex
CREATE INDEX "CustodyEvent_shipmentId_idx" ON "CustodyEvent"("shipmentId");

-- CreateIndex
CREATE INDEX "CustodyEvent_toLocationId_idx" ON "CustodyEvent"("toLocationId");

-- CreateIndex
CREATE INDEX "StatusHistory_serviceRequestId_changedAt_idx" ON "StatusHistory"("serviceRequestId", "changedAt");

-- CreateIndex
CREATE UNIQUE INDEX "InspectionRequirement_equipmentTypeId_inspectionType_name_key" ON "InspectionRequirement"("equipmentTypeId", "inspectionType", "name");

-- CreateIndex
CREATE INDEX "Inspection_serviceRequestId_performedAt_idx" ON "Inspection"("serviceRequestId", "performedAt");

-- CreateIndex
CREATE INDEX "Inspection_equipmentId_performedAt_idx" ON "Inspection"("equipmentId", "performedAt");

-- CreateIndex
CREATE UNIQUE INDEX "InspectionCheck_inspectionId_requirementId_key" ON "InspectionCheck"("inspectionId", "requirementId");

-- AddForeignKey
ALTER TABLE "ClinicContact" ADD CONSTRAINT "ClinicContact_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "Clinic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Equipment" ADD CONSTRAINT "Equipment_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "Clinic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Equipment" ADD CONSTRAINT "Equipment_equipmentTypeId_fkey" FOREIGN KEY ("equipmentTypeId") REFERENCES "EquipmentType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Calibration" ADD CONSTRAINT "Calibration_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Calibration" ADD CONSTRAINT "Calibration_serviceRequestId_fkey" FOREIGN KEY ("serviceRequestId") REFERENCES "ServiceRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Calibration" ADD CONSTRAINT "Calibration_performedById_fkey" FOREIGN KEY ("performedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CalibrationRequirement" ADD CONSTRAINT "CalibrationRequirement_equipmentTypeId_fkey" FOREIGN KEY ("equipmentTypeId") REFERENCES "EquipmentType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CalibrationMeasurement" ADD CONSTRAINT "CalibrationMeasurement_calibrationId_fkey" FOREIGN KEY ("calibrationId") REFERENCES "Calibration"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CalibrationMeasurement" ADD CONSTRAINT "CalibrationMeasurement_requirementId_fkey" FOREIGN KEY ("requirementId") REFERENCES "CalibrationRequirement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceRequest" ADD CONSTRAINT "ServiceRequest_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "Clinic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceRequest" ADD CONSTRAINT "ServiceRequest_clinicContactId_fkey" FOREIGN KEY ("clinicContactId") REFERENCES "ClinicContact"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceRequest" ADD CONSTRAINT "ServiceRequest_initiatedByUserId_fkey" FOREIGN KEY ("initiatedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceRequest" ADD CONSTRAINT "ServiceRequest_currentLocationId_fkey" FOREIGN KEY ("currentLocationId") REFERENCES "StorageLocation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceRequest" ADD CONSTRAINT "ServiceRequest_currentCustodianUserId_fkey" FOREIGN KEY ("currentCustodianUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceRequest" ADD CONSTRAINT "ServiceRequest_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Shipment" ADD CONSTRAINT "Shipment_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "Clinic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShipmentItem" ADD CONSTRAINT "ShipmentItem_shipmentId_fkey" FOREIGN KEY ("shipmentId") REFERENCES "Shipment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShipmentItem" ADD CONSTRAINT "ShipmentItem_serviceRequestId_fkey" FOREIGN KEY ("serviceRequestId") REFERENCES "ServiceRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustodyEvent" ADD CONSTRAINT "CustodyEvent_serviceRequestId_fkey" FOREIGN KEY ("serviceRequestId") REFERENCES "ServiceRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustodyEvent" ADD CONSTRAINT "CustodyEvent_shipmentId_fkey" FOREIGN KEY ("shipmentId") REFERENCES "Shipment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustodyEvent" ADD CONSTRAINT "CustodyEvent_fromLocationId_fkey" FOREIGN KEY ("fromLocationId") REFERENCES "StorageLocation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustodyEvent" ADD CONSTRAINT "CustodyEvent_toLocationId_fkey" FOREIGN KEY ("toLocationId") REFERENCES "StorageLocation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustodyEvent" ADD CONSTRAINT "CustodyEvent_performedById_fkey" FOREIGN KEY ("performedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustodyEvent" ADD CONSTRAINT "CustodyEvent_custodianUserId_fkey" FOREIGN KEY ("custodianUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StatusHistory" ADD CONSTRAINT "StatusHistory_serviceRequestId_fkey" FOREIGN KEY ("serviceRequestId") REFERENCES "ServiceRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StatusHistory" ADD CONSTRAINT "StatusHistory_changedByUserId_fkey" FOREIGN KEY ("changedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InspectionRequirement" ADD CONSTRAINT "InspectionRequirement_equipmentTypeId_fkey" FOREIGN KEY ("equipmentTypeId") REFERENCES "EquipmentType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inspection" ADD CONSTRAINT "Inspection_serviceRequestId_fkey" FOREIGN KEY ("serviceRequestId") REFERENCES "ServiceRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inspection" ADD CONSTRAINT "Inspection_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inspection" ADD CONSTRAINT "Inspection_performedById_fkey" FOREIGN KEY ("performedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InspectionCheck" ADD CONSTRAINT "InspectionCheck_inspectionId_fkey" FOREIGN KEY ("inspectionId") REFERENCES "Inspection"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InspectionCheck" ADD CONSTRAINT "InspectionCheck_requirementId_fkey" FOREIGN KEY ("requirementId") REFERENCES "InspectionRequirement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

/*
  Warnings:

  - The values [INTAKE,POST_REPAIR,FINAL_QA] on the enum `InspectionType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the `ServiceRequestStatusHistory` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
BEGIN;

ALTER TYPE "InspectionType" RENAME VALUE 'INTAKE' TO 'DIAGNOSTIC';
ALTER TYPE "InspectionType" RENAME VALUE 'FINAL_QA' TO 'FINAL_RELEASE';

UPDATE "InspectionRequirement"
SET "inspectionType" = 'FINAL_RELEASE'
WHERE "inspectionType" = 'POST_REPAIR';

UPDATE "Inspection"
SET "inspectionType" = 'FINAL_RELEASE'
WHERE "inspectionType" = 'POST_REPAIR';

CREATE TYPE "InspectionType_new" AS ENUM ('DIAGNOSTIC', 'ROUTINE', 'FINAL_RELEASE');

ALTER TABLE "InspectionRequirement"
ALTER COLUMN "inspectionType" TYPE "InspectionType_new"
USING ("inspectionType"::text::"InspectionType_new");

ALTER TABLE "Inspection"
ALTER COLUMN "inspectionType" TYPE "InspectionType_new"
USING ("inspectionType"::text::"InspectionType_new");

ALTER TYPE "InspectionType" RENAME TO "InspectionType_old";
ALTER TYPE "InspectionType_new" RENAME TO "InspectionType";
DROP TYPE "public"."InspectionType_old";

COMMIT;

-- DropForeignKey
ALTER TABLE "Inspection" DROP CONSTRAINT "Inspection_serviceRequestId_fkey";

-- DropForeignKey
ALTER TABLE "ServiceRequestStatusHistory" DROP CONSTRAINT "ServiceRequestStatusHistory_changedByUserId_fkey";

-- DropForeignKey
ALTER TABLE "ServiceRequestStatusHistory" DROP CONSTRAINT "ServiceRequestStatusHistory_serviceRequestId_fkey";

-- AlterTable
ALTER TABLE "EquipmentType" ADD COLUMN     "requiresCalibration" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Inspection" ALTER COLUMN "serviceRequestId" DROP NOT NULL;

-- DropTable
DROP TABLE "ServiceRequestStatusHistory";

-- AddForeignKey
ALTER TABLE "Inspection" ADD CONSTRAINT "Inspection_serviceRequestId_fkey" FOREIGN KEY ("serviceRequestId") REFERENCES "ServiceRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;

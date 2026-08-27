/*
  Warnings:

  - The values [IN_USE] on the enum `ReadinessStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ReadinessStatus_new" AS ENUM ('READY', 'MAINTENANCE_DUE', 'OUT_OF_SERVICE');
ALTER TABLE "public"."Equipment" ALTER COLUMN "readinessStatus" DROP DEFAULT;
ALTER TABLE "Equipment" ALTER COLUMN "readinessStatus" TYPE "ReadinessStatus_new" USING ("readinessStatus"::text::"ReadinessStatus_new");
ALTER TABLE "EquipmentStatusHistory" ALTER COLUMN "fromStatus" TYPE "ReadinessStatus_new" USING ("fromStatus"::text::"ReadinessStatus_new");
ALTER TABLE "EquipmentStatusHistory" ALTER COLUMN "toStatus" TYPE "ReadinessStatus_new" USING ("toStatus"::text::"ReadinessStatus_new");
ALTER TYPE "ReadinessStatus" RENAME TO "ReadinessStatus_old";
ALTER TYPE "ReadinessStatus_new" RENAME TO "ReadinessStatus";
DROP TYPE "public"."ReadinessStatus_old";
ALTER TABLE "Equipment" ALTER COLUMN "readinessStatus" SET DEFAULT 'READY';
COMMIT;

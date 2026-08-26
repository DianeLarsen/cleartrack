-- AlterTable
ALTER TABLE "ServiceRequestStatusHistory" RENAME CONSTRAINT "StatusHistory_pkey" TO "ServiceRequestStatusHistory_pkey";

-- RenameForeignKey
ALTER TABLE "ServiceRequestStatusHistory" RENAME CONSTRAINT "StatusHistory_changedByUserId_fkey" TO "ServiceRequestStatusHistory_changedByUserId_fkey";

-- RenameForeignKey
ALTER TABLE "ServiceRequestStatusHistory" RENAME CONSTRAINT "StatusHistory_serviceRequestId_fkey" TO "ServiceRequestStatusHistory_serviceRequestId_fkey";

-- RenameIndex
ALTER INDEX "StatusHistory_serviceRequestId_changedAt_idx" RENAME TO "ServiceRequestStatusHistory_serviceRequestId_changedAt_idx";

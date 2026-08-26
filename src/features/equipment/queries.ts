import { prisma } from "@/db/client";
import { ReadinessStatus } from "@/prisma/generated/prisma/client";

export async function updateReadinessStatus(
  id: { id: string },
  readinessStatus: ReadinessStatus,
) {
  return prisma.equipment.update({
    where: { id: id.id },
    data: {
      readinessStatus: readinessStatus,
    },
  });
}

export async function recordInspection() {}

export async function createEquipment() {}

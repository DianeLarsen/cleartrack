import { prisma } from "@/db/client";

export async function listEquipment() {
  return prisma.equipment.findMany({
    orderBy: { nextCalibrationDueAt: "asc" },
    select: {
      id: true,
      nextCalibrationDueAt: true,
      serialNumber: true,
      clinicAssetTag: true,
      equipmentType: true,
    },
    take: 5,
  });
}

export async function getEquipmentById(id: string) {
  return prisma.equipment.findUnique({
    where: { id },
  });
}

export async function getEquipmentDueForCalibration() {
  return prisma.equipment.findMany({
    where: {
      nextCalibrationDueAt: {
        lte: new Date(),
      },
    },
    orderBy: { nextCalibrationDueAt: "asc" },
  });
}
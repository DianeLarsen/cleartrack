import { prisma } from "@/db/client";

export async function listEquipmentDueForCalibration(limit?: number) {
  return prisma.equipment.findMany({
    orderBy: { nextCalibrationDueAt: "asc" },
    select: {
      id: true,
      nextCalibrationDueAt: true,
      serialNumber: true,
      clinicAssetTag: true,
      equipmentType: true,
    },
    ...(limit ? { take: limit } : {}),
  });
}

export async function getEquipmentBySerialNumber(serialNumber: string) {
  return prisma.equipment.findUnique({
    where: { serialNumber },
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

export async function getDashboardStats() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(today);
  endOfWeek.setDate(today.getDate() + 7);
  endOfWeek.setHours(23, 59, 59, 999);

  const [openRequests, dueThisWeek, outOfService, maintenanceDue] =
    await Promise.all([
      prisma.serviceRequest.count({
        where: {
          status: {
            notIn: ["SHIPPED", "CLOSED", "CANCELLED"],
          },
        },
      }),
      prisma.equipment.count({
        where: {
          nextCalibrationDueAt: {
            gte: today,
            lte: endOfWeek,
          },
        },
      }),
      prisma.equipment.count({
        where: { readinessStatus: "OUT_OF_SERVICE" },
      }),
      prisma.equipment.count({
        where: { readinessStatus: "MAINTENANCE_DUE" },
      }),
    ]);

  return {
    openRequests,
    dueThisWeek,
    outOfService,
    maintenanceDue,
  };
}

export async function listOpenServiceRequests(limit = 4) {
  return prisma.serviceRequest.findMany({
    where: {
      status: {
        notIn: ["SHIPPED", "CLOSED", "CANCELLED"],
      },
    },
    orderBy: { submittedAt: "asc" },
    take: limit,
    select: {
      id: true,
      rmaNumber: true,
      issueDescription: true,
      status: true,
      submittedAt: true,
      equipment: {
        select: {
          serialNumber: true,
          clinicAssetTag: true,
          equipmentType: {
            select: {
              manufacturer: true,
              model: true,
            },
          },
        },
      },
      currentCustodianUser: {
        select: {
          name: true,
        },
      },
    },
  });
}
import { prisma } from "@/db/client";
import {
  ReadinessStatus,
  ServiceRequestStatus,
  Prisma
} from "@/prisma/generated/prisma/client";

type EquipmentListFilters = {
  search?: string;
  readinessStatus?: ReadinessStatus;
  clinicId?: string;
  technicianId?: string;
  location?: string;
  calibrationDueFrom?: string;
  calibrationDueTo?: string;
  serviceStatus?: ServiceRequestStatus;
};

const activeServiceStatuses: ServiceRequestStatus[] = [
  "AWAITING_SHIPMENT",
  "RECEIVED",
  "IN_REPAIR",
  "AWAITING_QA",
  "READY_TO_SHIP",
  "ON_HOLD",
];

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
    include: {
      clinic: {
        select: {
          name: true,
          code: true,
        },
      },
      equipmentType: {
        select: {
          manufacturer: true,
          model: true,
          category: true,
          requiresCalibration: true,
          defaultCalibrationIntervalDays: true,
        },
      },
      serviceRequests: {
        where: {
          status: {
            notIn: ["CLOSED", "CANCELLED", "SHIPPED"],
          },
        },
        orderBy: {
          submittedAt: "desc",
        },
        take: 1,
        include: {
          currentLocation: {
            select: {
              name: true,
              code: true,
            },
          },
          currentCustodianUser: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      },
      inspections: {
        orderBy: {
          performedAt: "desc",
        },
        take: 10,
        include: {
          performedBy: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      },
      calibrations: {
        orderBy: {
          performedAt: "desc",
        },
        take: 1,
        select: {
          id: true,
          performedAt: true,
          result: true,
          certificateNumber: true,
        },
      },
      statusHistory: {
        orderBy: {
          changedAt: "desc",
        },
        take: 10,
        include: {
          changedByUser: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      },
    },
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

export async function listEquipment(filters: EquipmentListFilters = {}) {
  const {
    search,
    readinessStatus,
    clinicId,
    technicianId,
    location,
    serviceStatus,
    calibrationDueFrom,
    calibrationDueTo,
  } = filters;

  const conditions: Prisma.EquipmentWhereInput[] = [{ isActive: true }];

  if (readinessStatus) {
    conditions.push({ readinessStatus });
  }

  if (clinicId) {
    conditions.push({ clinicId });
  }

  if (search) {
    conditions.push({
      OR: [
        { serialNumber: { contains: search, mode: "insensitive" } },
        { clinicAssetTag: { contains: search, mode: "insensitive" } },
        {
          equipmentType: {
            model: { contains: search, mode: "insensitive" },
          },
        },
        {
          clinic: {
            name: { contains: search, mode: "insensitive" },
          },
        },
      ],
    });
  }

  if (location === "AT_SHOP") {
    conditions.push({
      serviceRequests: {
        some: {
          status: { in: activeServiceStatuses },
          currentLocationId: { not: null },
        },
      },
    });
  }

  if (location === "AT_CLINIC") {
    conditions.push({
      serviceRequests: {
        none: {
          status: { in: activeServiceStatuses },
          currentLocationId: { not: null },
        },
      },
    });
  }

  if (location && location !== "AT_SHOP" && location !== "AT_CLINIC") {
    conditions.push({
      serviceRequests: {
        some: {
          status: { in: activeServiceStatuses },
          currentLocationId: location,
        },
      },
    });
  }

  if (technicianId) {
    conditions.push({
      serviceRequests: {
        some: {
          status: { in: activeServiceStatuses },
          currentCustodianUserId: technicianId,
        },
      },
    });
  }

  if (serviceStatus) {
    conditions.push({
      serviceRequests: {
        some: {
          status: serviceStatus,
        },
      },
    });
  }

  if (calibrationDueFrom || calibrationDueTo) {
    const calibrationDateFilter: {
      gte?: Date;
      lt?: Date;
    } = {};

    if (calibrationDueFrom) {
      calibrationDateFilter.gte = new Date(
        `${calibrationDueFrom}T00:00:00.000Z`,
      );
    }

    if (calibrationDueTo) {
      const dayAfterEndDate = new Date(`${calibrationDueTo}T00:00:00.000Z`);
      dayAfterEndDate.setUTCDate(dayAfterEndDate.getUTCDate() + 1);

      calibrationDateFilter.lt = dayAfterEndDate;
    }

    conditions.push({
      nextCalibrationDueAt: calibrationDateFilter,
    });
  }

  return prisma.equipment.findMany({
    where: {
      AND: conditions,
    },

    include: {
      clinic: {
        select: {
          name: true,
          code: true,
        },
      },
      equipmentType: {
        select: {
          manufacturer: true,
          model: true,
          category: true,
          requiresCalibration: true,
        },
      },
      serviceRequests: {
        where: {
          status: { in: activeServiceStatuses },
        },
        orderBy: {
          submittedAt: "desc",
        },
        take: 1,
        include: {
          currentLocation: {
            select: {
              name: true,
              code: true,
            },
          },
          currentCustodianUser: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      },
    },

    orderBy: [{ nextCalibrationDueAt: "asc" }, { serialNumber: "asc" }],
  });
}

export async function getEquipmentFilterOptions() {
  const [clinics, technicians, locations] = await Promise.all([
    prisma.clinic.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        code: true,
      },
    }),
    prisma.user.findMany({
      where: {
        role: {
          in: ["TECHNICIAN", "SUPERVISOR"],
        },
      },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        email: true,
      },
    }),
    prisma.storageLocation.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        code: true,
      },
    }),
  ]);

  return { clinics, technicians, locations };
}
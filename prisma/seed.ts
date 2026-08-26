import { PrismaClient } from "../src/prisma/generated/prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set.");
}

const prisma = new PrismaClient({
  adapter: new PrismaNeon({ connectionString }),
});

const daysFromNow = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
};

async function main() {
  // Keep this data obviously fictional. It is safe to run repeatedly because
  // the records with unique keys are upserted rather than blindly recreated.
  const clinic = await prisma.clinic.upsert({
    where: { code: "EVERGREEN-001" },
    update: {},
    create: {
      name: "Evergreen Regional Medical Center",
      code: "EVERGREEN-001",
      addressLine1: "14500 Health Park Drive",
      city: "Evergreen",
      state: "WA",
      postalCode: "98290",
    },
  });

  await prisma.user.upsert({
    where: { email: "diane.larsen@outlook.com" },
    update: { name: "Diane Larsen", role: "SYSTEM_ADMIN" },
    create: {
      entraSubject: "demo-entra-diane-admin",
      email: "diane.larsen@outlook.com",
      name: "Diane Larsen",
      role: "SYSTEM_ADMIN",
    },
  });

  const supervisor = await prisma.user.upsert({
    where: { email: "morgan.lee@evergreen-demo.example" },
    update: {},
    create: {
      entraSubject: "demo-entra-morgan-supervisor",
      email: "morgan.lee@evergreen-demo.example",
      name: "Morgan Lee",
      role: "SUPERVISOR",
    },
  });

  const technician = await prisma.user.upsert({
    where: { email: "alex.rivera@cleartrack-demo.example" },
    update: {},
    create: {
      entraSubject: "demo-entra-alex-technician",
      email: "alex.rivera@cleartrack-demo.example",
      name: "Alex Rivera",
      role: "TECHNICIAN",
    },
  });

  const contact = await prisma.clinicContact.upsert({
    where: { email: "biomed@evergreen-demo.example" },
    update: {},
    create: {
      clinicId: clinic.id,
      name: "Jamie Chen",
      email: "biomed@evergreen-demo.example",
      phone: "555-010-2040",
    },
  });

  const lifepak15 = await prisma.equipmentType.upsert({
    where: {
      manufacturer_model: { manufacturer: "Stryker", model: "LIFEPAK 15" },
    },
    update: {},
    create: {
      manufacturer: "Stryker",
      model: "LIFEPAK 15",
      category: "Monitor/Defibrillator",
      defaultCalibrationIntervalDays: 365,
      requiresCalibration: true,
    },
  });

  const cr2 = await prisma.equipmentType.upsert({
    where: {
      manufacturer_model: { manufacturer: "Stryker", model: "LIFEPAK CR2" },
    },
    update: {},
    create: {
      manufacturer: "Stryker",
      model: "LIFEPAK CR2",
      category: "Automated External Defibrillator",
      defaultCalibrationIntervalDays: 365,
      requiresCalibration: false,
    },
  });

  const calibrationRequirements = [
    {
      name: "Energy output",
      unit: "J",
      targetValue: "200",
      minimumValue: "190",
      maximumValue: "210",
      sortOrder: 1,
    },
    {
      name: "ECG amplitude",
      unit: "mV",
      targetValue: "1",
      minimumValue: "0.95",
      maximumValue: "1.05",
      sortOrder: 2,
    },
  ];

  for (const requirement of calibrationRequirements) {
    await prisma.calibrationRequirement.upsert({
      where: {
        equipmentTypeId_name: {
          equipmentTypeId: lifepak15.id,
          name: requirement.name,
        },
      },
      update: requirement,
      create: { equipmentTypeId: lifepak15.id, ...requirement },
    });
  }

  const inspectionRequirements = [
    {
      inspectionType: "DIAGNOSTIC" as const,
      name: "Exterior condition",
      description: "Document visible shipping, impact, or cosmetic damage.",
      sortOrder: 1,
    },
    {
      inspectionType: "DIAGNOSTIC" as const,
      name: "Reported issue verified",
      description: "Confirm and document the reported device issue.",
      sortOrder: 2,
    },
    {
      inspectionType: "ROUTINE" as const,
      name: "Functional readiness check",
      description: "Unit completes the applicable routine readiness check.",
      sortOrder: 1,
    },
    {
      inspectionType: "ROUTINE" as const,
      name: "Required accessories present",
      description: "Required cables and accessories are present and usable.",
      sortOrder: 2,
    },
    {
      inspectionType: "FINAL_RELEASE" as const,
      name: "Functional test",
      description: "Unit completes the applicable final functional test.",
      sortOrder: 1,
    },
    {
      inspectionType: "FINAL_RELEASE" as const,
      name: "Final cosmetic inspection",
      description: "Unit is clean and free of visible damage.",
      sortOrder: 2,
    },
  ];

  for (const requirement of inspectionRequirements) {
    await prisma.inspectionRequirement.upsert({
      where: {
        equipmentTypeId_inspectionType_name: {
          equipmentTypeId: lifepak15.id,
          inspectionType: requirement.inspectionType,
          name: requirement.name,
        },
      },
      update: requirement,
      create: { equipmentTypeId: lifepak15.id, ...requirement },
    });
  }

  const repairBench = await prisma.storageLocation.upsert({
    where: { code: "BENCH-02" },
    update: {},
    create: { code: "BENCH-02", name: "Repair Bench 2", type: "REPAIR_BENCH" },
  });
  const qaStation = await prisma.storageLocation.upsert({
    where: { code: "QA-01" },
    update: {},
    create: {
      code: "QA-01",
      name: "Quality Assurance Station",
      type: "QA_STATION",
    },
  });

  const equipmentSeeds = [
    {
      serialNumber: "LP15-DEMO-1001",
      clinicAssetTag: "ED-001",
      equipmentTypeId: lifepak15.id,
      lastCalibratedAt: daysFromNow(-280),
      nextCalibrationDueAt: daysFromNow(85),
    },
    {
      serialNumber: "LP15-DEMO-1002",
      clinicAssetTag: "ED-002",
      equipmentTypeId: lifepak15.id,
      lastCalibratedAt: daysFromNow(-350),
      nextCalibrationDueAt: daysFromNow(15),
    },
    {
      serialNumber: "LP15-DEMO-1003",
      clinicAssetTag: "ED-003",
      equipmentTypeId: lifepak15.id,
      lastCalibratedAt: daysFromNow(-390),
      nextCalibrationDueAt: daysFromNow(-25),
    },
    {
      serialNumber: "LP15-DEMO-1004",
      clinicAssetTag: "ED-004",
      equipmentTypeId: lifepak15.id,
      lastCalibratedAt: daysFromNow(-120),
      nextCalibrationDueAt: daysFromNow(245),
    },
    {
      serialNumber: "LP15-DEMO-1005",
      clinicAssetTag: "ED-005",
      equipmentTypeId: lifepak15.id,
      lastCalibratedAt: daysFromNow(-360),
      nextCalibrationDueAt: daysFromNow(5),
    },
    {
      serialNumber: "CR2-DEMO-2001",
      clinicAssetTag: "AED-001",
      equipmentTypeId: cr2.id,
      lastCalibratedAt: daysFromNow(-190),
      nextCalibrationDueAt: daysFromNow(175),
    },
    {
      serialNumber: "CR2-DEMO-2002",
      clinicAssetTag: "AED-002",
      equipmentTypeId: cr2.id,
      lastCalibratedAt: daysFromNow(-330),
      nextCalibrationDueAt: daysFromNow(35),
    },
    {
      serialNumber: "CR2-DEMO-2003",
      clinicAssetTag: "AED-003",
      equipmentTypeId: cr2.id,
      lastCalibratedAt: daysFromNow(-370),
      nextCalibrationDueAt: daysFromNow(-10),
    },
  ];

  const equipment = await Promise.all(
    equipmentSeeds.map((item) =>
      prisma.equipment.upsert({
        where: { serialNumber: item.serialNumber },
        update: item,
        create: { clinicId: clinic.id, ...item },
      }),
    ),
  );

  // These requests provide non-perfect dashboard states: in repair, awaiting
  // QA, ready to ship, plus a completed history record.
  const requests = [
    {
      rmaNumber: "CT-2026-0001",
      equipment: equipment[2],
      status: "IN_REPAIR" as const,
      reason: "FAILED_CALIBRATION" as const,
      description:
        "Energy output measured below the allowable range during scheduled calibration.",
      locationId: repairBench.id,
      custodianId: technician.id,
    },
    {
      rmaNumber: "CT-2026-0002",
      equipment: equipment[4],
      status: "AWAITING_QA" as const,
      reason: "INSPECTION_FAILURE" as const,
      description:
        "Intermittent ECG lead disconnect reported during clinical readiness inspection.",
      locationId: qaStation.id,
      custodianId: supervisor.id,
    },
    {
      rmaNumber: "CT-2026-0003",
      equipment: equipment[7],
      status: "AWAITING_SHIPMENT" as const,
      reason: "CUSTOMER_REPAIR_REQUEST" as const,
      description:
        "Clinic reported cosmetic damage after shipment and requested evaluation.",
      locationId: null,
      custodianId: null,
    },
  ];

  for (const item of requests) {
    const existing = await prisma.serviceRequest.findUnique({
      where: { rmaNumber: item.rmaNumber },
    });
    if (existing) continue;

    const request = await prisma.serviceRequest.create({
      data: {
        rmaNumber: item.rmaNumber,
        clinicId: clinic.id,
        clinicContactId: contact.id,
        initiatedByUserId: supervisor.id,
        origin: "CLEARTRACK_USER",
        reason: item.reason,
        equipmentId: item.equipment.id,
        currentLocationId: item.locationId,
        currentCustodianUserId: item.custodianId,
        reportedSerialNumber: item.equipment.serialNumber,
        reportedAssetTag: item.equipment.clinicAssetTag,
        issueDescription: item.description,
        status: item.status,
        submittedAt: daysFromNow(-7),
      },
    });

    await prisma.serviceRequestStatusHistory.create({
      data: {
        serviceRequestId: request.id,
        fromStatus: null,
        toStatus: "AWAITING_SHIPMENT",
        changedByUserId: supervisor.id,
        notes: "Service request submitted.",
        changedAt: daysFromNow(-7),
      },
    });

    if (item.status !== "AWAITING_SHIPMENT") {
      await prisma.serviceRequestStatusHistory.create({
        data: {
          serviceRequestId: request.id,
          fromStatus: "AWAITING_SHIPMENT",
          toStatus: item.status,
          changedByUserId: technician.id,
          notes: "Unit received and routed for service.",
          changedAt: daysFromNow(-3),
        },
      });
    }
  }

  console.log(
    `Seeded ${clinic.name}, ${equipment.length} equipment records, and ${requests.length} service requests.`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

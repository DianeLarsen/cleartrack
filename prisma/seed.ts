import { PrismaClient } from "../src/prisma/generated/prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set.");
}

const prisma = new PrismaClient({
  adapter: new PrismaNeon({ connectionString }),
});

type DeviceKind = "monitor" | "aed";
type ReadinessStatus =
  | "READY"
  | "IN_USE"
  | "MAINTENANCE_DUE"
  | "OUT_OF_SERVICE";

type EquipmentPlan = {
  clinicCode: string;
  serialNumber: string;
  clinicAssetTag: string;
  deviceKind: DeviceKind;
  readinessStatus: ReadinessStatus;
  lastCalibratedDaysAgo?: number;
  nextCalibrationDueInDays?: number;
};

const daysFromNow = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
};

async function main() {
  const clinicPlans = [
    {
      code: "CASCADE-001",
      name: "Cascade Valley Medical Center",
      addressLine1: "1200 Cedar Point Drive",
      city: "Cedar Falls",
      state: "WA",
      postalCode: "98011",
      contactName: "Jordan Kim",
      contactEmail: "biomed@cascadevalley-demo.example",
      contactPhone: "555-010-1001",
    },
    {
      code: "NORTHSOUND-001",
      name: "Northsound Community Hospital",
      addressLine1: "88 Harbor View Avenue",
      city: "Port Haven",
      state: "WA",
      postalCode: "98126",
      contactName: "Avery Patel",
      contactEmail: "biomed@northsound-demo.example",
      contactPhone: "555-010-1002",
    },
    {
      code: "PINECREST-001",
      name: "Pinecrest Regional Hospital",
      addressLine1: "410 Summit Ridge Road",
      city: "Pinecrest",
      state: "WA",
      postalCode: "98215",
      contactName: "Casey Morgan",
      contactEmail: "biomed@pinecrest-demo.example",
      contactPhone: "555-010-1003",
    },
  ];

  const clinics = new Map<string, { id: string }>();
  const contacts = new Map<string, { id: string }>();

  for (const plan of clinicPlans) {
    const clinic = await prisma.clinic.upsert({
      where: { code: plan.code },
      update: {
        name: plan.name,
        addressLine1: plan.addressLine1,
        city: plan.city,
        state: plan.state,
        postalCode: plan.postalCode,
        isActive: true,
      },
      create: {
        code: plan.code,
        name: plan.name,
        addressLine1: plan.addressLine1,
        city: plan.city,
        state: plan.state,
        postalCode: plan.postalCode,
      },
    });

    const contact = await prisma.clinicContact.upsert({
      where: { email: plan.contactEmail },
      update: {
        clinicId: clinic.id,
        name: plan.contactName,
        phone: plan.contactPhone,
        isActive: true,
      },
      create: {
        clinicId: clinic.id,
        name: plan.contactName,
        email: plan.contactEmail,
        phone: plan.contactPhone,
      },
    });

    clinics.set(plan.code, clinic);
    contacts.set(plan.code, contact);
  }

  await prisma.user.upsert({
    where: { email: "diane.larsen@outlook.com" },
    update: {
      name: "Diane Larsen",
      role: "SYSTEM_ADMIN",
    },
    create: {
      entraSubject: "demo-entra-diane-admin",
      email: "diane.larsen@outlook.com",
      name: "Diane Larsen",
      role: "SYSTEM_ADMIN",
    },
  });

  const supervisor = await prisma.user.upsert({
    where: { email: "morgan.lee@cleartrack-demo.example" },
    update: {
      name: "Morgan Lee",
      role: "SUPERVISOR",
    },
    create: {
      entraSubject: "demo-entra-morgan-supervisor",
      email: "morgan.lee@cleartrack-demo.example",
      name: "Morgan Lee",
      role: "SUPERVISOR",
    },
  });

  const technician = await prisma.user.upsert({
    where: { email: "alex.rivera@cleartrack-demo.example" },
    update: {
      name: "Alex Rivera",
      role: "TECHNICIAN",
    },
    create: {
      entraSubject: "demo-entra-alex-technician",
      email: "alex.rivera@cleartrack-demo.example",
      name: "Alex Rivera",
      role: "TECHNICIAN",
    },
  });

  const monitorData = {
    manufacturer: "Aegis Medical",
    model: "PulseSafe Pro",
    category: "Monitor/Defibrillator",
    defaultCalibrationIntervalDays: 365,
    requiresCalibration: true,
  };

  const aedData = {
    manufacturer: "Aegis Medical",
    model: "PulseSafe AED",
    category: "Automated External Defibrillator",
    defaultCalibrationIntervalDays: null,
    requiresCalibration: false,
  };

  const monitor = await prisma.equipmentType.upsert({
    where: {
      manufacturer_model: {
        manufacturer: monitorData.manufacturer,
        model: monitorData.model,
      },
    },
    update: monitorData,
    create: monitorData,
  });

  const aed = await prisma.equipmentType.upsert({
    where: {
      manufacturer_model: {
        manufacturer: aedData.manufacturer,
        model: aedData.model,
      },
    },
    update: aedData,
    create: aedData,
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
          equipmentTypeId: monitor.id,
          name: requirement.name,
        },
      },
      update: requirement,
      create: {
        equipmentTypeId: monitor.id,
        ...requirement,
      },
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

  for (const equipmentType of [monitor, aed]) {
    for (const requirement of inspectionRequirements) {
      await prisma.inspectionRequirement.upsert({
        where: {
          equipmentTypeId_inspectionType_name: {
            equipmentTypeId: equipmentType.id,
            inspectionType: requirement.inspectionType,
            name: requirement.name,
          },
        },
        update: requirement,
        create: {
          equipmentTypeId: equipmentType.id,
          ...requirement,
        },
      });
    }
  }

  const repairBench = await prisma.storageLocation.upsert({
    where: { code: "BENCH-02" },
    update: {
      name: "Repair Bench 2",
      type: "REPAIR_BENCH",
    },
    create: {
      code: "BENCH-02",
      name: "Repair Bench 2",
      type: "REPAIR_BENCH",
    },
  });

  const qaStation = await prisma.storageLocation.upsert({
    where: { code: "QA-01" },
    update: {
      name: "Quality Assurance Station",
      type: "QA_STATION",
    },
    create: {
      code: "QA-01",
      name: "Quality Assurance Station",
      type: "QA_STATION",
    },
  });

  const equipmentPlans: EquipmentPlan[] = [
    {
      clinicCode: "CASCADE-001",
      serialNumber: "PSP-CV-1001",
      clinicAssetTag: "CV-DEF-001",
      deviceKind: "monitor",
      readinessStatus: "READY",
      lastCalibratedDaysAgo: 210,
      nextCalibrationDueInDays: 155,
    },
    {
      clinicCode: "CASCADE-001",
      serialNumber: "PSP-CV-1002",
      clinicAssetTag: "CV-DEF-002",
      deviceKind: "monitor",
      readinessStatus: "MAINTENANCE_DUE",
      lastCalibratedDaysAgo: 350,
      nextCalibrationDueInDays: 15,
    },
    {
      clinicCode: "CASCADE-001",
      serialNumber: "PSP-CV-1003",
      clinicAssetTag: "CV-DEF-003",
      deviceKind: "monitor",
      readinessStatus: "OUT_OF_SERVICE",
      lastCalibratedDaysAgo: 390,
      nextCalibrationDueInDays: -25,
    },
    {
      clinicCode: "CASCADE-001",
      serialNumber: "PSP-CV-1004",
      clinicAssetTag: "CV-DEF-004",
      deviceKind: "monitor",
      readinessStatus: "IN_USE",
      lastCalibratedDaysAgo: 120,
      nextCalibrationDueInDays: 245,
    },
    {
      clinicCode: "CASCADE-001",
      serialNumber: "PSP-CV-1005",
      clinicAssetTag: "CV-DEF-005",
      deviceKind: "monitor",
      readinessStatus: "READY",
      lastCalibratedDaysAgo: 275,
      nextCalibrationDueInDays: 90,
    },
    {
      clinicCode: "CASCADE-001",
      serialNumber: "PSA-CV-2001",
      clinicAssetTag: "CV-AED-001",
      deviceKind: "aed",
      readinessStatus: "READY",
    },
    {
      clinicCode: "CASCADE-001",
      serialNumber: "PSA-CV-2002",
      clinicAssetTag: "CV-AED-002",
      deviceKind: "aed",
      readinessStatus: "READY",
    },
    {
      clinicCode: "CASCADE-001",
      serialNumber: "PSA-CV-2003",
      clinicAssetTag: "CV-AED-003",
      deviceKind: "aed",
      readinessStatus: "IN_USE",
    },
    {
      clinicCode: "CASCADE-001",
      serialNumber: "PSA-CV-2004",
      clinicAssetTag: "CV-AED-004",
      deviceKind: "aed",
      readinessStatus: "OUT_OF_SERVICE",
    },
    {
      clinicCode: "CASCADE-001",
      serialNumber: "PSA-CV-2005",
      clinicAssetTag: "CV-AED-005",
      deviceKind: "aed",
      readinessStatus: "READY",
    },

    {
      clinicCode: "NORTHSOUND-001",
      serialNumber: "PSP-NS-1001",
      clinicAssetTag: "NS-DEF-001",
      deviceKind: "monitor",
      readinessStatus: "READY",
      lastCalibratedDaysAgo: 190,
      nextCalibrationDueInDays: 175,
    },
    {
      clinicCode: "NORTHSOUND-001",
      serialNumber: "PSP-NS-1002",
      clinicAssetTag: "NS-DEF-002",
      deviceKind: "monitor",
      readinessStatus: "MAINTENANCE_DUE",
      lastCalibratedDaysAgo: 360,
      nextCalibrationDueInDays: 5,
    },
    {
      clinicCode: "NORTHSOUND-001",
      serialNumber: "PSP-NS-1003",
      clinicAssetTag: "NS-DEF-003",
      deviceKind: "monitor",
      readinessStatus: "READY",
      lastCalibratedDaysAgo: 250,
      nextCalibrationDueInDays: 110,
    },
    {
      clinicCode: "NORTHSOUND-001",
      serialNumber: "PSP-NS-1004",
      clinicAssetTag: "NS-DEF-004",
      deviceKind: "monitor",
      readinessStatus: "OUT_OF_SERVICE",
      lastCalibratedDaysAgo: 320,
      nextCalibrationDueInDays: 45,
    },
    {
      clinicCode: "NORTHSOUND-001",
      serialNumber: "PSP-NS-1005",
      clinicAssetTag: "NS-DEF-005",
      deviceKind: "monitor",
      readinessStatus: "IN_USE",
      lastCalibratedDaysAgo: 135,
      nextCalibrationDueInDays: 230,
    },
    {
      clinicCode: "NORTHSOUND-001",
      serialNumber: "PSA-NS-2001",
      clinicAssetTag: "NS-AED-001",
      deviceKind: "aed",
      readinessStatus: "READY",
    },
    {
      clinicCode: "NORTHSOUND-001",
      serialNumber: "PSA-NS-2002",
      clinicAssetTag: "NS-AED-002",
      deviceKind: "aed",
      readinessStatus: "MAINTENANCE_DUE",
    },
    {
      clinicCode: "NORTHSOUND-001",
      serialNumber: "PSA-NS-2003",
      clinicAssetTag: "NS-AED-003",
      deviceKind: "aed",
      readinessStatus: "READY",
    },
    {
      clinicCode: "NORTHSOUND-001",
      serialNumber: "PSA-NS-2004",
      clinicAssetTag: "NS-AED-004",
      deviceKind: "aed",
      readinessStatus: "READY",
    },
    {
      clinicCode: "NORTHSOUND-001",
      serialNumber: "PSA-NS-2005",
      clinicAssetTag: "NS-AED-005",
      deviceKind: "aed",
      readinessStatus: "READY",
    },

    {
      clinicCode: "PINECREST-001",
      serialNumber: "PSP-PC-1001",
      clinicAssetTag: "PC-DEF-001",
      deviceKind: "monitor",
      readinessStatus: "READY",
      lastCalibratedDaysAgo: 175,
      nextCalibrationDueInDays: 190,
    },
    {
      clinicCode: "PINECREST-001",
      serialNumber: "PSP-PC-1002",
      clinicAssetTag: "PC-DEF-002",
      deviceKind: "monitor",
      readinessStatus: "MAINTENANCE_DUE",
      lastCalibratedDaysAgo: 374,
      nextCalibrationDueInDays: -9,
    },
    {
      clinicCode: "PINECREST-001",
      serialNumber: "PSP-PC-1003",
      clinicAssetTag: "PC-DEF-003",
      deviceKind: "monitor",
      readinessStatus: "READY",
      lastCalibratedDaysAgo: 280,
      nextCalibrationDueInDays: 85,
    },
    {
      clinicCode: "PINECREST-001",
      serialNumber: "PSP-PC-1004",
      clinicAssetTag: "PC-DEF-004",
      deviceKind: "monitor",
      readinessStatus: "READY",
      lastCalibratedDaysAgo: 340,
      nextCalibrationDueInDays: 25,
    },
    {
      clinicCode: "PINECREST-001",
      serialNumber: "PSA-PC-2001",
      clinicAssetTag: "PC-AED-001",
      deviceKind: "aed",
      readinessStatus: "READY",
    },
    {
      clinicCode: "PINECREST-001",
      serialNumber: "PSA-PC-2002",
      clinicAssetTag: "PC-AED-002",
      deviceKind: "aed",
      readinessStatus: "READY",
    },
    {
      clinicCode: "PINECREST-001",
      serialNumber: "PSA-PC-2003",
      clinicAssetTag: "PC-AED-003",
      deviceKind: "aed",
      readinessStatus: "IN_USE",
    },
    {
      clinicCode: "PINECREST-001",
      serialNumber: "PSA-PC-2004",
      clinicAssetTag: "PC-AED-004",
      deviceKind: "aed",
      readinessStatus: "OUT_OF_SERVICE",
    },
    {
      clinicCode: "PINECREST-001",
      serialNumber: "PSA-PC-2005",
      clinicAssetTag: "PC-AED-005",
      deviceKind: "aed",
      readinessStatus: "READY",
    },
    {
      clinicCode: "PINECREST-001",
      serialNumber: "PSA-PC-2006",
      clinicAssetTag: "PC-AED-006",
      deviceKind: "aed",
      readinessStatus: "READY",
    },
  ];

  const equipmentBySerial = new Map<
    string,
    { id: string; serialNumber: string; clinicAssetTag: string | null }
  >();

  for (const plan of equipmentPlans) {
    const clinic = clinics.get(plan.clinicCode);

    if (!clinic) {
      throw new Error(`Clinic "${plan.clinicCode}" was not seeded.`);
    }

    const equipmentType = plan.deviceKind === "monitor" ? monitor : aed;

    const equipmentData = {
      clinicId: clinic.id,
      equipmentTypeId: equipmentType.id,
      serialNumber: plan.serialNumber,
      clinicAssetTag: plan.clinicAssetTag,
      readinessStatus: plan.readinessStatus,
      lastCalibratedAt: plan.lastCalibratedDaysAgo
        ? daysFromNow(-plan.lastCalibratedDaysAgo)
        : null,
      nextCalibrationDueAt: plan.nextCalibrationDueInDays
        ? daysFromNow(plan.nextCalibrationDueInDays)
        : null,
      isActive: true,
    };

    const equipment = await prisma.equipment.upsert({
      where: { serialNumber: plan.serialNumber },
      update: equipmentData,
      create: equipmentData,
    });

    equipmentBySerial.set(plan.serialNumber, equipment);
  }

  const serviceRequestPlans = [
    {
      rmaNumber: "CT-2026-1001",
      clinicCode: "CASCADE-001",
      equipmentSerialNumber: "PSP-CV-1003",
      status: "IN_REPAIR" as const,
      reason: "FAILED_CALIBRATION" as const,
      issueDescription:
        "Scheduled calibration found energy output below the acceptable range.",
      currentLocationId: repairBench.id,
      currentCustodianUserId: technician.id,
      submittedDaysAgo: 6,
    },
    {
      rmaNumber: "CT-2026-1002",
      clinicCode: "CASCADE-001",
      equipmentSerialNumber: "PSA-CV-2004",
      status: "AWAITING_QA" as const,
      reason: "INSPECTION_FAILURE" as const,
      issueDescription:
        "Routine readiness inspection identified an intermittent electrode connection fault.",
      currentLocationId: qaStation.id,
      currentCustodianUserId: supervisor.id,
      submittedDaysAgo: 4,
    },
    {
      rmaNumber: "CT-2026-1003",
      clinicCode: "NORTHSOUND-001",
      equipmentSerialNumber: "PSP-NS-1004",
      status: "AWAITING_SHIPMENT" as const,
      reason: "CUSTOMER_REPAIR_REQUEST" as const,
      issueDescription:
        "Clinic reported a damaged enclosure latch and requested evaluation.",
      currentLocationId: null,
      currentCustodianUserId: null,
      submittedDaysAgo: 2,
    },
    {
      rmaNumber: "CT-2026-1004",
      clinicCode: "NORTHSOUND-001",
      equipmentSerialNumber: "PSP-NS-1002",
      status: "READY_TO_SHIP" as const,
      reason: "PREVENTIVE_MAINTENANCE" as const,
      issueDescription:
        "Preventive maintenance and required calibration were completed.",
      currentLocationId: qaStation.id,
      currentCustodianUserId: supervisor.id,
      submittedDaysAgo: 9,
    },
    {
      rmaNumber: "CT-2026-1005",
      clinicCode: "PINECREST-001",
      equipmentSerialNumber: "PSA-PC-2004",
      status: "ON_HOLD" as const,
      reason: "CUSTOMER_REPAIR_REQUEST" as const,
      issueDescription:
        "Device failed to power on during the clinic's daily readiness check.",
      currentLocationId: repairBench.id,
      currentCustodianUserId: technician.id,
      submittedDaysAgo: 5,
    },
  ];

  for (const plan of serviceRequestPlans) {
    const clinic = clinics.get(plan.clinicCode);
    const contact = contacts.get(plan.clinicCode);
    const equipment = equipmentBySerial.get(plan.equipmentSerialNumber);

    if (!clinic || !contact || !equipment) {
      throw new Error(`Unable to seed service request "${plan.rmaNumber}".`);
    }

    const submittedAt = daysFromNow(-plan.submittedDaysAgo);

    const request = await prisma.serviceRequest.upsert({
      where: { rmaNumber: plan.rmaNumber },
      update: {
        clinicId: clinic.id,
        clinicContactId: contact.id,
        initiatedByUserId: supervisor.id,
        origin: "CLEARTRACK_USER",
        reason: plan.reason,
        equipmentId: equipment.id,
        currentLocationId: plan.currentLocationId,
        currentCustodianUserId: plan.currentCustodianUserId,
        reportedSerialNumber: equipment.serialNumber,
        reportedAssetTag: equipment.clinicAssetTag,
        issueDescription: plan.issueDescription,
        status: plan.status,
        submittedAt,
      },
      create: {
        rmaNumber: plan.rmaNumber,
        clinicId: clinic.id,
        clinicContactId: contact.id,
        initiatedByUserId: supervisor.id,
        origin: "CLEARTRACK_USER",
        reason: plan.reason,
        equipmentId: equipment.id,
        currentLocationId: plan.currentLocationId,
        currentCustodianUserId: plan.currentCustodianUserId,
        reportedSerialNumber: equipment.serialNumber,
        reportedAssetTag: equipment.clinicAssetTag,
        issueDescription: plan.issueDescription,
        status: plan.status,
        submittedAt,
      },
    });

    await prisma.serviceRequestStatusHistory.deleteMany({
      where: { serviceRequestId: request.id },
    });

    await prisma.serviceRequestStatusHistory.create({
      data: {
        serviceRequestId: request.id,
        fromStatus: null,
        toStatus: "AWAITING_SHIPMENT",
        changedByUserId: supervisor.id,
        notes: "Service request submitted.",
        changedAt: submittedAt,
      },
    });

    if (plan.status !== "AWAITING_SHIPMENT") {
      await prisma.serviceRequestStatusHistory.create({
        data: {
          serviceRequestId: request.id,
          fromStatus: "AWAITING_SHIPMENT",
          toStatus: plan.status,
          changedByUserId: technician.id,
          notes: "Device received and routed for the current service stage.",
          changedAt: daysFromNow(-Math.max(1, plan.submittedDaysAgo - 1)),
        },
      });
    }
  }

  console.log(
    `Seeded ${clinics.size} clinics, ${equipmentPlans.length} equipment records, and ${serviceRequestPlans.length} service requests.`,
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

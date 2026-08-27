import {
  getEquipmentFilterOptions,
  listEquipment,
} from "@/features/equipment/queries";
import { ReadinessStatus } from "@/prisma/generated/prisma/client";
import EquipmentTable from "@/components/EquipmentTable";

export default async function EquipmentList({
  searchParams,
}: {
  searchParams: Promise<{
    search?: string;
    clinicId?: string;
    readinessStatus?: string;
    technicianId?: string;
    location?: string;
    calibrationDueFrom?: string;
    calibrationDueTo?: string;
  }>;
}) {
  const params = await searchParams;

  const readinessStatus = Object.values(ReadinessStatus).includes(
    params.readinessStatus as ReadinessStatus,
  )
    ? (params.readinessStatus as ReadinessStatus)
    : undefined;

  const [equipment, filterOptions] = await Promise.all([
    listEquipment({
      search: params.search,
      clinicId: params.clinicId,
      readinessStatus,
      technicianId: params.technicianId,
      location: params.location,
      calibrationDueFrom: params.calibrationDueFrom,
      calibrationDueTo: params.calibrationDueTo,
    }),
    getEquipmentFilterOptions(),
  ]);

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-medium text-muted-foreground">
            Equipment management
          </p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight">Equipment</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {equipment.length} active equipment record
            {equipment.length === 1 ? "" : "s"}
          </p>
        </div>
      </div>

      <section className="mt-8 overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <EquipmentTable
            equipment={equipment}
            clinics={filterOptions.clinics}
            technicians={filterOptions.technicians}
            locations={filterOptions.locations}
          />
        </div>
      </section>
    </main>
  );
}

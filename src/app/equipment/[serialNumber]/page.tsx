import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { getEquipmentBySerialNumber } from "@/features/equipment/queries";


const dateFormatter = new Intl.DateTimeFormat("en-US", { dateStyle: "medium" });
const dateTimeFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
});

const statusLabel = {
  READY: "Ready",
  MAINTENANCE_DUE: "Maintenance due",
  OUT_OF_SERVICE: "Out of service",
} as const;

const statusClass = {
  READY: "bg-teal-100 text-teal-800",
  MAINTENANCE_DUE: "bg-amber-100 text-amber-900",
  OUT_OF_SERVICE: "bg-red-100 text-red-800",
} as const;

function formatDate(value: Date | null | undefined) {
  return value ? dateFormatter.format(value) : "Not recorded";
}

function formatDateTime(value: Date | null | undefined) {
  return value ? dateTimeFormatter.format(value) : "Not recorded";
}

function Detail({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-1 text-sm font-medium text-foreground">{value}</dd>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <h2 className="text-base font-semibold text-foreground">{title}</h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}

export default async function EquipmentPage({
  params,
}: {
  params: Promise<{ serialNumber: string }>;
}) {
  const { serialNumber } = await params;
  const equipment = await getEquipmentBySerialNumber(serialNumber);

  if (!equipment) notFound();

  // The query should return the newest open service request first.
  const activeServiceRequest = equipment.serviceRequests[0] ?? null;
  const latestCalibration = equipment.calibrations[0] ?? null;

  return (
    <main className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <Link
        href="/equipment"
        className="inline-flex text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        ← All equipment
      </Link>

      <header className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-start">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              {equipment.equipmentType.manufacturer}{" "}
              {equipment.equipmentType.category}
            </p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-foreground">
              {equipment.equipmentType.model}
            </h1>
            <p className="mt-2 font-mono text-sm text-muted-foreground">
              Serial number: {equipment.serialNumber}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 md:justify-end">
            <span
              className={`rounded-full px-3 py-1.5 text-sm font-semibold ${statusClass[equipment.readinessStatus]}`}
            >
              {statusLabel[equipment.readinessStatus]}
            </span>
            {!equipment.isActive && (
              <span className="rounded-full bg-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-700">
                Inactive record
              </span>
            )}
          </div>
        </div>

        <dl className="mt-6 grid gap-5 border-t border-border pt-5 sm:grid-cols-2 lg:grid-cols-4">
          <Detail
            label="Asset tag"
            value={equipment.clinicAssetTag ?? "Not assigned"}
          />
          <Detail
            label="Owning clinic"
            value={`${equipment.clinic.name} (${equipment.clinic.code})`}
          />
          <Detail
            label="Next calibration"
            value={formatDate(equipment.nextCalibrationDueAt)}
          />
          <Detail
            label="Record updated"
            value={formatDateTime(equipment.updatedAt)}
          />
        </dl>
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Section title="Equipment details">
            <dl className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
              <Detail
                label="Manufacturer"
                value={equipment.equipmentType.manufacturer}
              />
              <Detail label="Model" value={equipment.equipmentType.model} />
              <Detail
                label="Category"
                value={equipment.equipmentType.category}
              />
              <Detail
                label="Calibration required"
                value={
                  equipment.equipmentType.requiresCalibration ? "Yes" : "No"
                }
              />
              <Detail
                label="Standard calibration interval"
                value={
                  equipment.equipmentType.defaultCalibrationIntervalDays
                    ? `${equipment.equipmentType.defaultCalibrationIntervalDays} days`
                    : "Not configured"
                }
              />
              <Detail
                label="Added to ClearTrack"
                value={formatDate(equipment.createdAt)}
              />
            </dl>
          </Section>

          <Section title="Current service workflow">
            {activeServiceRequest ? (
              <dl className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
                <Detail label="RMA" value={activeServiceRequest.rmaNumber} />
                <Detail
                  label="Service status"
                  value={activeServiceRequest.status.replaceAll("_", " ")}
                />
                <Detail
                  label="Reason"
                  value={activeServiceRequest.reason.replaceAll("_", " ")}
                />
                <Detail
                  label="Received"
                  value={formatDate(activeServiceRequest.receivedAt)}
                />
                <Detail
                  label="Current location"
                  value={
                    activeServiceRequest.currentLocation
                      ? `${activeServiceRequest.currentLocation.name} (${activeServiceRequest.currentLocation.code})`
                      : "Not assigned"
                  }
                />
                <Detail
                  label="Current custodian"
                  value={
                    activeServiceRequest.currentCustodianUser?.name ??
                    "Not assigned"
                  }
                />
                <div className="sm:col-span-2">
                  <Detail
                    label="Reported issue"
                    value={activeServiceRequest.issueDescription}
                  />
                </div>
              </dl>
            ) : (
              <p className="text-sm text-muted-foreground">
                No active service request. This equipment is not currently in
                the repair workflow.
              </p>
            )}
          </Section>

          <Section title="Inspection history">
            {equipment.inspections.length ? (
              <div className="divide-y divide-border">
                {equipment.inspections.map((inspection) => (
                  <article
                    key={inspection.id}
                    className="py-4 first:pt-0 last:pb-0"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-medium text-foreground">
                        {inspection.inspectionType.replaceAll("_", " ")}
                      </p>
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${inspection.outcome === "PASSED" ? "bg-teal-100 text-teal-800" : "bg-red-100 text-red-800"}`}
                      >
                        {inspection.outcome}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {formatDateTime(inspection.performedAt)} ·{" "}
                      {inspection.performedBy.name ??
                        inspection.performedBy.email}
                    </p>
                    {inspection.notes && (
                      <p className="mt-2 text-sm text-foreground">
                        {inspection.notes}
                      </p>
                    )}
                  </article>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No inspections recorded.
              </p>
            )}
          </Section>
        </div>

        <div className="space-y-6">
          <Section title="Calibration">
            <dl className="space-y-5">
              <Detail
                label="Last calibrated"
                value={formatDate(equipment.lastCalibratedAt)}
              />
              <Detail
                label="Next due"
                value={formatDate(equipment.nextCalibrationDueAt)}
              />
              <Detail
                label="Latest result"
                value={latestCalibration?.result ?? "No calibration recorded"}
              />
              {latestCalibration && (
                <Detail
                  label="Certificate"
                  value={latestCalibration.certificateNumber ?? "Not recorded"}
                />
              )}
            </dl>
          </Section>

          <Section title="Readiness history">
            {equipment.statusHistory.length ? (
              <ol className="space-y-4 border-l border-border pl-4">
                {equipment.statusHistory.map((change) => (
                  <li key={change.id} className="relative text-sm">
                    <span className="absolute -left-[21px] top-1.5 size-2.5 rounded-full bg-primary" />
                    <p className="font-medium text-foreground">
                      {statusLabel[change.toStatus]}
                    </p>
                    <p className="mt-1 text-muted-foreground">
                      {formatDateTime(change.changedAt)}
                    </p>
                    {change.changedByUser && (
                      <p className="text-muted-foreground">
                        by{" "}
                        {change.changedByUser.name ??
                          change.changedByUser.email}
                      </p>
                    )}
                    {change.notes && (
                      <p className="mt-1 text-foreground">{change.notes}</p>
                    )}
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-sm text-muted-foreground">
                No status changes recorded.
              </p>
            )}
          </Section>
        </div>
      </div>
    </main>
  );
}

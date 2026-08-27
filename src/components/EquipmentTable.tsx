"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import CalibrationDateRangeFilter from "@/components/calibration-date-range-filter";
import { CalendarIcon } from "lucide-react";

type EquipmentRow = {
  id: string;
  serialNumber: string;
  clinicAssetTag: string | null;
  readinessStatus: "READY" | "MAINTENANCE_DUE" | "OUT_OF_SERVICE";
  nextCalibrationDueAt: Date | null;
  clinic: {
    name: string;
    code: string;
  };
  equipmentType: {
    manufacturer: string;
    model: string;
    requiresCalibration: boolean;
  };
  serviceRequests: {
    currentLocation: {
      name: string;
      code: string;
    } | null;
    currentCustodianUser: {
      name: string | null;
      email: string;
    } | null;
  }[];
};

type EquipmentTableProps = {
  equipment: EquipmentRow[];
  clinics: {
    id: string;
    name: string;
    code: string;
  }[];
  technicians: {
    id: string;
    name: string | null;
    email: string;
  }[];
  locations: {
    id: string;
    name: string;
    code: string;
  }[];
};

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

function formatDate(date: Date | null) {
  if (!date) return "Not scheduled";

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
  }).format(date);
}

function getCalibrationDateClass(date: Date | null) {
  if (!date) return "text-slate-500";

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dueDate = new Date(date);
  dueDate.setHours(0, 0, 0, 0);

  const dueSoon = new Date(today);
  dueSoon.setDate(today.getDate() + 30);

  if (dueDate < today) return "font-semibold text-red-700";
  if (dueDate <= dueSoon) return "font-semibold text-amber-700";

  return "font-medium text-teal-700";
}

export default function EquipmentTable({
  equipment,
  clinics,
  technicians,
  locations,
}: EquipmentTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function updateFilter(name: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());

    if (value) {
      params.set(name, value);
    } else {
      params.delete(name);
    }

    router.replace(`${pathname}?${params.toString()}`);
  }

  return (
    <table className="w-full min-w-240 text-left text-sm">
      <thead className="border-b border-border bg-muted/40">
        <tr className="text-xs uppercase tracking-wide text-muted-foreground">
          <th className="px-5 py-3 font-medium">Equipment</th>
          <th className="px-5 py-3 font-medium">Clinic</th>
          <th className="px-5 py-3 font-medium">Readiness</th>
          <th className="px-5 py-3 font-medium">Location</th>
          <th className="px-5 py-3 font-medium">Assigned to</th>
          <th className="w-45 px-5 py-3 font-medium">Calibration due</th>
        </tr>

        <tr className="border-t border-border">
          <th className="px-5 py-2">
            <button
              type="button"
              onClick={() => router.replace(pathname)}
              className="text-sm font-semibold text-primary hover:underline"
            >
              Reset Filters
            </button>
          </th>

          <th className="px-5 py-2">
            <select
              value={searchParams.get("clinicId") ?? ""}
              onChange={(event) => updateFilter("clinicId", event.target.value)}
              className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm font-normal"
            >
              <option value="">All clinics</option>
              {clinics.map((clinic) => (
                <option key={clinic.id} value={clinic.id}>
                  {clinic.name}
                </option>
              ))}
            </select>
          </th>

          <th className="px-5 py-2">
            <select
              value={searchParams.get("readinessStatus") ?? ""}
              onChange={(event) =>
                updateFilter("readinessStatus", event.target.value)
              }
              className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm font-normal"
            >
              <option value="">All states</option>
              <option value="READY">Ready</option>
              <option value="MAINTENANCE_DUE">Maintenance due</option>
              <option value="OUT_OF_SERVICE">Out of service</option>
            </select>
          </th>

          <th className="px-5 py-2">
            <select
              value={searchParams.get("location") ?? ""}
              onChange={(event) => updateFilter("location", event.target.value)}
              className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm font-normal"
            >
              <option value="">All locations</option>
              <option value="AT_SHOP">At shop</option>
              <option value="AT_CLINIC">At clinic</option>

              {locations.map((location) => (
                <option key={location.id} value={location.id}>
                  {location.name} ({location.code})
                </option>
              ))}
            </select>
          </th>

          <th className="px-5 py-2">
            <select
              value={searchParams.get("technicianId") ?? ""}
              onChange={(event) =>
                updateFilter("technicianId", event.target.value)
              }
              className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm font-normal"
            >
              <option value="">Anyone</option>
              {technicians.map((technician) => (
                <option key={technician.id} value={technician.id}>
                  {technician.name ?? technician.email}
                </option>
              ))}
            </select>
          </th>

          <th className="w-45 px-5 py-2">
            <CalibrationDateRangeFilter />
          </th>
        </tr>
      </thead>

      <tbody className="divide-y divide-border">
        {equipment.length === 0 ? (
          <tr>
            <td
              colSpan={6}
              className="px-5 py-10 text-center text-muted-foreground"
            >
              No equipment matches these filters.
            </td>
          </tr>
        ) : (
          equipment.map((item) => {
            const activeRequest = item.serviceRequests[0] ?? null;

            return (
              <tr key={item.id} className="hover:bg-muted/30">
                <td className="px-5 py-4">
                  <Link
                    href={`/equipment/${item.serialNumber}`}
                    className="font-semibold text-primary hover:underline"
                  >
                    {item.serialNumber}
                  </Link>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {item.equipmentType.manufacturer} {item.equipmentType.model}
                    {item.clinicAssetTag
                      ? ` · Asset ${item.clinicAssetTag}`
                      : ""}
                  </p>
                </td>

                <td className="px-5 py-4">
                  <p className="font-medium">{item.clinic.name}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {item.clinic.code}
                  </p>
                </td>

                <td className="px-5 py-4">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                      statusClass[item.readinessStatus]
                    }`}
                  >
                    {statusLabel[item.readinessStatus]}
                  </span>
                </td>

                <td className="px-5 py-4">
                  {activeRequest?.currentLocation ? (
                    <>
                      <p className="font-medium">
                        {activeRequest.currentLocation.name}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {activeRequest.currentLocation.code}
                      </p>
                    </>
                  ) : (
                    <span className="text-muted-foreground">At clinic</span>
                  )}
                </td>

                <td className="px-5 py-4">
                  {activeRequest?.currentCustodianUser ? (
                    (activeRequest.currentCustodianUser.name ??
                    activeRequest.currentCustodianUser.email)
                  ) : (
                    <span className="text-muted-foreground">Unassigned</span>
                  )}
                </td>

                <td
                  className={`px-5 py-4 ${getCalibrationDateClass(
                    item.nextCalibrationDueAt,
                  )}`}
                >
                  {item.equipmentType.requiresCalibration
                    ? formatDate(item.nextCalibrationDueAt)
                    : "Not required"}
                </td>
              </tr>
            );
          })
        )}
      </tbody>
    </table>
  );
}

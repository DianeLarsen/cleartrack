import { auth } from "@/auth";
import { redirect } from "next/navigation";
import {
  Bell,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  FileText,
  LayoutDashboard,
  Monitor,
  Plus,
  Users,
  Wrench,
} from "lucide-react";
import EquipmentStatusChart from "@/components/EquipmentStatusChart";
import { listEquipment } from "../../features/equipment/actions";

const stats = [
  {
    label: "Open requests",
    value: 18,
    Icon: FileText,
    iconColor: "text-[#256dcc]",
    iconBackground: "bg-blue-50",
  },
  {
    label: "Due this week",
    value: 7,
    Icon: CalendarDays,
    iconColor: "text-[#087b84]",
    iconBackground: "bg-teal-50",
  },
  {
    label: "Out of service",
    value: 4,
    Icon: Wrench,
    iconColor: "text-[#dc3c36]",
    iconBackground: "bg-rose-50",
  },
  {
    label: "Maintenance due",
    value: 12,
    Icon: Bell,
    iconColor: "text-[#c77800]",
    iconBackground: "bg-amber-50",
  },
];

const requests = [
  {
    id: "REQ-1047",
    request: "Battery not holding charge",
    equipment: "LIFEPAK 15",
    unit: "Unit 1157",
    priority: "High",
    priorityClass: "bg-rose-100 text-rose-700",
    due: "May 21, 2026",
    dueHint: "Tomorrow",
    tech: "DL",
  },
  {
    id: "REQ-1043",
    request: "Device self-test failure",
    equipment: "AED Pro",
    unit: "Unit 2381",
    priority: "Medium",
    priorityClass: "bg-amber-100 text-amber-800",
    due: "May 22, 2026",
    dueHint: "In 2 days",
    tech: "AC",
  },
  {
    id: "REQ-1041",
    request: "Leads replacement",
    equipment: "ProCare Monitor",
    unit: "Unit 3090",
    priority: "Medium",
    priorityClass: "bg-amber-100 text-amber-800",
    due: "May 23, 2026",
    dueHint: "In 3 days",
    tech: "SP",
  },
  {
    id: "REQ-1038",
    request: "Annual preventive maintenance",
    equipment: "Infusion Pump",
    unit: "Unit 4522",
    priority: "Low",
    priorityClass: "bg-emerald-100 text-emerald-800",
    due: "May 24, 2026",
    dueHint: "In 4 days",
    tech: "AM",
  },
];


export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/");
  }
const maintenanceItems = await listEquipment();


  const firstName = session.user.name?.split(" ")[0] ?? "there";
  const initials =
    session.user.name
      ?.split(" ")
      .map((name) => name[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() ?? "CT";

  const today = new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date());

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <div className="grid min-h-screen lg:grid-cols-[275px_1fr]">
        <aside className="flex flex-col bg-[var(--sidebar)] px-4 py-8 text-[var(--sidebar-foreground)]">
          <div className="px-3">
            <p className="text-3xl font-semibold tracking-tight">ClearTrack</p>
          </div>

          <nav className="mt-8 space-y-2">
            <a
              href="/dashboard"
              className="flex items-center gap-4 rounded-md bg-[var(--sidebar-active)] px-4 py-3 text-sm font-medium"
            >
              <LayoutDashboard className="h-5 w-5" />
              Dashboard
            </a>

            <span className="flex items-center gap-4 rounded-md px-4 py-3 text-sm text-[var(--sidebar-muted)]">
              <Monitor className="h-5 w-5" />
              Equipment
            </span>

            <span className="flex items-center gap-4 rounded-md px-4 py-3 text-sm text-[var(--sidebar-muted)]">
              <ClipboardList className="h-5 w-5" />
              Service Requests
            </span>

            <span className="flex items-center gap-4 rounded-md px-4 py-3 text-sm text-[var(--sidebar-muted)]">
              <Users className="h-5 w-5" />
              Team
            </span>
          </nav>

          <div className="mt-auto border-t border-white/25 px-3 pt-5">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-full bg-[var(--accent)] font-medium">
                {initials}
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-medium">
                  {session.user.name}
                </p>
                <p className="text-sm text-[var(--sidebar-muted)]">
                  Coordinator
                </p>
              </div>

              <ChevronDown className="ml-auto h-4 w-4" />
            </div>
          </div>
        </aside>

        <section className="p-6 lg:p-10">
          <div className="mx-auto max-w-7xl">
            <header className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h1 className="text-3xl font-semibold tracking-tight lg:text-4xl">
                  Good morning, {firstName}
                </h1>
                <p className="mt-2 text-[var(--muted-foreground)]">{today}</p>
              </div>

              <button
                type="button"
                className="inline-flex items-center justify-center gap-2 rounded-md bg-[var(--accent)] px-5 py-3 font-medium text-white shadow-sm transition hover:opacity-90"
              >
                <Plus className="h-5 w-5" />
                New request
              </button>
            </header>

            <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {stats.map((stat) => (
                <article
                  key={stat.label}
                  className="flex items-center gap-5 rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm"
                >
                  <div
                    className={`grid h-16 w-16 place-items-center rounded-full ${stat.iconBackground} ${stat.iconColor}`}
                  >
                    <stat.Icon className="h-8 w-8" strokeWidth={1.8} />
                  </div>

                  <div>
                    <p className="text-sm font-medium">{stat.label}</p>
                    <p
                      className={`mt-1 text-4xl font-semibold ${stat.iconColor}`}
                    >
                      {stat.value}
                    </p>
                  </div>
                </article>
              ))}
            </section>

            <section className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.95fr]">
              <article className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-sm">
                <div className="p-6">
                  <h2 className="text-xl font-semibold">
                    Requests needing attention
                  </h2>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[650px] text-left text-sm">
                    <thead className="border-b border-[var(--border)] text-[var(--muted-foreground)]">
                      <tr>
                        <th className="px-6 py-4 font-medium">Request</th>
                        <th className="px-4 py-4 font-medium">Equipment</th>
                        <th className="px-4 py-4 font-medium">Priority</th>
                        <th className="px-4 py-4 font-medium">Due date</th>
                        <th className="px-6 py-4 font-medium">Tech</th>
                      </tr>
                    </thead>

                    <tbody>
                      {requests.map((request) => (
                        <tr
                          key={request.id}
                          className="border-b border-[var(--border)] last:border-0"
                        >
                          <td className="px-6 py-5">
                            <p className="font-medium">{request.id}</p>
                            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                              {request.request}
                            </p>
                          </td>

                          <td className="px-4 py-5">
                            <p className="font-medium">{request.equipment}</p>
                            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                              {request.unit}
                            </p>
                          </td>

                          <td className="px-4 py-5">
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-medium ${request.priorityClass}`}
                            >
                              {request.priority}
                            </span>
                          </td>

                          <td className="px-4 py-5">
                            <p className="font-medium">{request.due}</p>
                            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                              {request.dueHint}
                            </p>
                          </td>

                          <td className="px-6 py-5">
                            <span className="grid h-9 w-9 place-items-center rounded-full bg-[var(--secondary)] text-xs font-medium text-[var(--secondary-foreground)]">
                              {request.tech}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="border-t border-[var(--border)] p-6">
                  <button className="inline-flex items-center gap-1 font-medium text-[var(--accent)]">
                    View all requests
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </article>

              <article className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
                <h2 className="text-xl font-semibold">Equipment status</h2>

                <div className="mt-6 flex flex-col items-center gap-8 sm:flex-row xl:flex-col 2xl:flex-row">
                  <EquipmentStatusChart />

                  <div className="w-full space-y-4 text-sm">
                    <StatusRow
                      color="var(--chart-ready)"
                      label="In service"
                      value="78 (63%)"
                    />
                    <StatusRow
                      color="var(--chart-in-use)"
                      label="In use"
                      value="22 (18%)"
                    />
                    <StatusRow
                      color="var(--chart-maintenance)"
                      label="Maintenance due"
                      value="12 (10%)"
                    />
                    <StatusRow
                      color="var(--chart-out-of-service)"
                      label="Out of service"
                      value="12 (10%)"
                    />
                  </div>
                </div>

                <div className="mt-6 border-t border-[var(--border)] pt-6">
                  <div className="mb-4 flex justify-between">
                    <h3 className="font-semibold">Maintenance due</h3>
                    <span className="text-sm text-[var(--muted-foreground)]">
                      Due date
                    </span>
                  </div>

                  <div className="space-y-4">
                    {maintenanceItems.map(
                      ({ id, serialNumber, nextCalibrationDueAt }) => (
                        <div
                          key={id}
                          className="flex justify-between gap-4 text-sm"
                        >
                          <span>{serialNumber}</span>
                          <span className="whitespace-nowrap font-medium text-[var(--out-of-service)]">
                            {nextCalibrationDueAt?.toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            }) ?? "Not scheduled"}
                          </span>
                        </div>
                      ),
                    )}
                  </div>
                </div>

                <button className="mt-6 inline-flex items-center gap-1 font-medium text-[var(--accent)]">
                  View all equipment
                  <ChevronRight className="h-4 w-4" />
                </button>
              </article>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}

function StatusRow({
  color,
  label,
  value,
}: {
  color: string;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span
        className="h-3 w-3 rounded-full"
        style={{ backgroundColor: color }}
      />
      <span>{label}</span>
      <span className="ml-auto font-medium">{value}</span>
    </div>
  );
}

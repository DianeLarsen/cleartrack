"use client";

import { Pie, PieChart, Sector, type PieSectorShapeProps } from "recharts";

const chartData = [
  { name: "In service", value: 78, color: "#108c8c" },
  { name: "In use", value: 22, color: "#256dcc" },
  { name: "Maintenance due", value: 12, color: "#f59e0b" },
  { name: "Out of service", value: 12, color: "#dc3c36" },
];

const chartColors = ["#108c8c", "#256dcc", "#f59e0b", "#dc3c36"];

function EquipmentStatusSlice(props: PieSectorShapeProps) {
  return (
    <Sector
      {...props}
      fill={chartColors[props.index % chartColors.length]}
      stroke="var(--card)"
      strokeWidth={1}
    />
  );
}

export default function EquipmentStatusChart() {
  return (
    <div className="relative h-52 w-52 shrink-0">
      <PieChart
        width={208}
        height={208}
        margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
      >
        <Pie
          data={chartData}
          dataKey="value"
          cx={104}
          cy={104}
          innerRadius={61}
          outerRadius={92}
          startAngle={90}
          endAngle={-270}
          shape={EquipmentStatusSlice}
        />
      </PieChart>

      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
        <p className="text-[32px] font-semibold leading-none">124</p>
        <p className="mt-1 text-sm leading-none text-[var(--muted-foreground)]">
          Total devices
        </p>
      </div>
    </div>
  );
}

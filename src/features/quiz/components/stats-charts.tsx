"use client";

import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export interface AccuracyDatum {
  label: string;
  accuracy: number;
  attempts: number;
}

function barColor(accuracy: number): string {
  if (accuracy >= 80) return "#10b981"; // emerald
  if (accuracy >= 50) return "#f59e0b"; // amber
  return "#ef4444"; // red
}

export function AccuracyByCourseChart({ data }: { data: AccuracyDatum[] }) {
  if (data.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        Chưa có dữ liệu — hãy làm một bài quiz để xem thống kê.
      </p>
    );
  }

  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, bottom: 8, left: -16 }}>
          <XAxis
            dataKey="label"
            tick={{ fontSize: 12, fill: "currentColor" }}
            className="text-muted-foreground"
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fontSize: 12, fill: "currentColor" }}
            className="text-muted-foreground"
            axisLine={false}
            tickLine={false}
            width={40}
            unit="%"
          />
          <Tooltip
            cursor={{ fill: "rgba(127,127,127,0.1)" }}
            contentStyle={{
              fontSize: 12,
              borderRadius: 8,
              border: "1px solid rgba(127,127,127,0.25)",
              background: "var(--popover, #1c1c1c)",
              color: "var(--popover-foreground, #fff)",
            }}
            formatter={(value) => [`${value}%`, "Độ chính xác"]}
          />
          <Bar dataKey="accuracy" radius={[6, 6, 0, 0]} maxBarSize={64}>
            {data.map((d) => (
              <Cell key={d.label} fill={barColor(d.accuracy)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

"use client";

import { WeightEntry } from "@/lib/types";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useTheme } from "next-themes";
import { format } from "date-fns";

interface WeightChartProps {
  weights: WeightEntry[];
}

export function WeightChart({ weights }: WeightChartProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  if (weights.length === 0) {
    return (
      <div className="flex items-center justify-center h-[250px] md:h-[400px] border rounded-lg bg-muted/20">
        <div className="text-center p-4 md:p-6">
          <p className="text-sm md:text-base text-muted-foreground">No weight data available</p>
          <p className="text-xs md:text-sm text-muted-foreground mt-2">
            Add your first weight entry to see the progress chart
          </p>
        </div>
      </div>
    );
  }

  // Sort weights by date (oldest first for chart)
  const chartData = [...weights]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map(entry => ({
      date: entry.date,
      weight: entry.weight,
      displayDate: format(new Date(entry.date), "MMM dd"),
    }));

  const gridColor = isDark ? "#374151" : "#e5e7eb";
  const textColor = isDark ? "#9ca3af" : "#6b7280";
  const lineColor = "#9333ea"; // purple-600

  return (
    <div className="w-full h-[250px] md:h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{ top: 5, right: 5, left: -20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
          <XAxis
            dataKey="displayDate"
            stroke={textColor}
            fontSize={10}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            stroke={textColor}
            fontSize={10}
            tickLine={false}
            axisLine={false}
            domain={['dataMin - 2', 'dataMax + 2']}
            tickFormatter={(value) => `${value}`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: isDark ? "#1f2937" : "#ffffff",
              border: `1px solid ${gridColor}`,
              borderRadius: "6px",
              fontSize: "14px",
            }}
            labelStyle={{ color: textColor }}
            formatter={(value: number) => [`${value} kg`, "Weight"]}
            labelFormatter={(label) => {
              const entry = chartData.find(d => d.displayDate === label);
              return entry ? format(new Date(entry.date), "PPP") : label;
            }}
          />
          <Line
            type="monotone"
            dataKey="weight"
            stroke={lineColor}
            strokeWidth={2}
            dot={{ fill: lineColor, r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}


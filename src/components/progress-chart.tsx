"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateBR } from "@/lib/date-utils";

interface ProgressChartProps {
  data: {
    date: string;
    total: number;
    limit: number;
  }[];
}

export function ProgressChart({ data }: ProgressChartProps) {
  const chartData = data.map((d) => ({
    ...d,
    dateLabel: formatDateBR(d.date),
  }));

  const avgLimit =
    chartData.length > 0
      ? chartData.reduce((acc, d) => acc + d.limit, 0) / chartData.length
      : 3.5;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Últimos 14 dias</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <XAxis
                dataKey="dateLabel"
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                domain={[0, "auto"]}
              />
              <Tooltip
                formatter={(value: number) => [
                  value.toFixed(1).replace(".", ","),
                  "Cigarros",
                ]}
                labelFormatter={(label) => `Dia ${label}`}
                contentStyle={{
                  borderRadius: "12px",
                  border: "1px solid hsl(var(--border))",
                }}
              />
              <ReferenceLine
                y={avgLimit}
                stroke="hsl(var(--muted-foreground))"
                strokeDasharray="5 5"
                label={{
                  value: "Meta",
                  position: "right",
                  fontSize: 11,
                  fill: "hsl(var(--muted-foreground))",
                }}
              />
              <Bar dataKey="total" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      entry.total > entry.limit
                        ? "hsl(0, 84%, 60%)"
                        : "hsl(var(--primary))"
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-2 flex items-center justify-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <div className="h-3 w-3 rounded bg-primary" />
            <span>Dentro da meta</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-3 w-3 rounded bg-red-500" />
            <span>Acima da meta</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

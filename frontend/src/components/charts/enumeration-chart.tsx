"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { OutcomePayout } from "@/types";
import { ChartConfig, ChartContainer } from "@/components/ui/chart";

interface EnumerationChartProps {
  outcomePayouts: OutcomePayout[];
}

const chartConfig = {
  offer: {
    label: "Your Payout",
    color: "#3b82f6" // blue
  },
  accept: {
    label: "Their Payout",
    color: "#ef4444" // red
  }
} satisfies ChartConfig;

export function EnumerationChart({ outcomePayouts }: EnumerationChartProps) {
  const data = outcomePayouts.map(op => ({
    name: op.outcome,
    offer: op.payout.offer,
    accept: op.payout.accept
  }));

  return (
    <ChartContainer config={chartConfig} className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 60
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="name"
            angle={-45}
            textAnchor="end"
            height={60}
            tick={{ fontSize: 12 }}
          />
          <YAxis
            label={{ value: 'Payout (sats)', angle: -90, position: 'insideLeft' }}
            tick={{ fontSize: 12 }}
          />
          <Tooltip
            formatter={(value) => `${value} sats`}
            contentStyle={{
              borderRadius: '8px',
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
              border: '1px solid #e5e7eb'
            }}
          />
          <Legend wrapperStyle={{ paddingTop: '20px' }} />
          <Bar
            dataKey="offer"
            stackId="a"
            fill={chartConfig.offer.color}
            name="Your Payout"
            radius={[4, 4, 0, 0]}
          />
          <Bar
            dataKey="accept"
            stackId="a"
            fill={chartConfig.accept.color}
            name="Their Payout"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
} 
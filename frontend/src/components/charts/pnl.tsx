import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"
import { ChartConfig, ChartContainer } from "@/components/ui/chart"
import { SolBalanceType } from "@/types"
import { formatAmount } from "@/lib/utils"

interface RevenueCardProps {
  title: string
  amount: SolBalanceType
  percentage: number
  data: Array<{ value: number }>
  height?: string
}

const chartConfig = {
  value: {
    label: "Profit & Loss",
    color: "white",
  },
} satisfies ChartConfig;

// TODO: Get the historical data from the API for the percentage change
export function Pnl({ title, amount, percentage, data, height }: RevenueCardProps) {
  return (
    <div className="py-4">
      <div className="mb-2">
        <p className="text-sm font-medium leading-none">{title}</p>
        <p className="text-4xl font-bold">{formatAmount(amount)}</p>
        <p className={`text-sm ${percentage >= 0 ? "text-green-500" : "text-red-500"}`}>
          {percentage >= 0 ? "+" : ""}
          {percentage}% from last month
        </p>
      </div>
      <div className="w-full" style={{ height: height ?? "100%" }}>
        <ChartContainer config={chartConfig} className="w-full h-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <XAxis
                dataKey="value"
                stroke="white"
                fontSize={12}
              />
              <YAxis
                stroke="white"
                fontSize={12}
                domain={['dataMin', 'auto']}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#000',
                  border: '1px solid #333',
                  borderRadius: '4px',
                  color: 'white'
                }}
                formatter={(value: number) => [`${value} sats`, 'Value']}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="currentColor"
                strokeWidth={2}
                dot={{ r: 4 }}
                isAnimationActive={true}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>
    </div>
  )
}


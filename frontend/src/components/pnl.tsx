"use client"

import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"
import { Card, CardContent } from "@/components/ui/card"
import { ChartContainer } from "@/components/ui/chart"

interface RevenueCardProps {
  title: string
  amount: number
  percentage: number
  data: Array<{ value: number }>
  className?: string
}

// TODO: Get the historical data from the API for the percentage change
export function Pnl({ title, amount, percentage, data, className }: RevenueCardProps) {
  const formattedAmount = `${amount} sats`

  const isPositive = percentage > 0

  return (
    // <Card className={`${className || ""} bg-black text-white overflow-hidden h-2/5`}>
    <div className="p-6 h-full w-full">
      <div className={`space-y-2`}>
        <p className="text-sm font-medium leading-none">{title}</p>
        <p className="text-4xl font-bold">{formattedAmount}</p>
        <p className={`text-sm ${isPositive ? "text-green-500" : "text-red-500"}`}>
          {isPositive ? "+" : ""}
          {percentage}% from last month
        </p>
      </div>


      <ChartContainer
        className="h-[150px] w-full"
        config={{
          value: {
            label: "Value",
            color: "white",
          },
        }}
      >
        <ResponsiveContainer width="100%">
          <LineChart data={data}>
            {/* <XAxis
                dataKey="value"
                stroke="white"
                fontSize={12}
              />
              <YAxis
                stroke="white"
                fontSize={12}
                domain={['dataMin', 'auto']}
              /> */}
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


      {/* </CardContent> */}
    </div>
  )
}


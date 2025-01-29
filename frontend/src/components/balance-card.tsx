"use client"

import { Line, LineChart, ResponsiveContainer } from "recharts"
import { Card, CardContent } from "@/components/ui/card"
import { ChartContainer } from "@/components/ui/chart"

interface RevenueCardProps {
  title: string
  amount: number
  percentage: number
  data?: Array<{ value: number }>
  className?: string
}

// TODO: Get the historical data from the API for the percentage change
export function BalanceCard({ title, amount, percentage, data, className }: RevenueCardProps) {
  // const formattedAmount = new Intl.NumberFormat("en-US", {
  //   style: "currency",
  //   currency: "BTC",
  // }).format(amount)
  const formattedAmount = `${amount} sats`

  const isPositive = percentage > 0

  return (
    <Card className={`${className || ""} bg-black text-white overflow-hidden`}>
      <CardContent className="p-6">
        <div className={`space-y-2`}>
          <p className="text-sm font-medium leading-none">{title}</p>
          <p className="text-4xl font-bold">{formattedAmount}</p>
          <p className={`text-sm ${isPositive ? "text-green-500" : "text-red-500"}`}>
            {isPositive ? "+" : ""}
            {percentage}% from last month
          </p>
        </div>
        {data && (
          <div className="h-[50px]">
            <ChartContainer
              config={{
                value: {
                  label: "Value",
                  color: "white",
                },
              }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="currentColor"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}


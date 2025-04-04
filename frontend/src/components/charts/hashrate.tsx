import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"
import { Card, CardContent } from "@/components/ui/card"
import { ChartConfig, ChartContainer } from "@/components/ui/chart"
import { useNavigate } from "@tanstack/react-router"
import { useEffect, useState } from "react"
import { useSol } from "@/hooks"

interface HashrateChartProps {
  className?: string
}

const chartConfig = {
  value: {
    label: "Hashrate",
    color: "white",
  },
} satisfies ChartConfig;

// TODO: Get the historical data from the API for the percentage change
export function HashrateChart({ className }: HashrateChartProps) {
  const navigate = useNavigate()
  const { getMarketStats } = useSol()
  const [data, setData] = useState<{ id: number, value: number }[]>([])

  useEffect(() => {
    getMarketStats().then((stats) => {
      let data = stats.map((stat) => {
        return {
          id: stat.id,
          value: stat.hashrate,
        }
      })
      data.slice(0, 30)
      setData(data)
    })
  }, [])

  return (
    <Card className={`${className || ""} bg-black text-white overflow-hidden h-2/5 my-2 cursor-pointer hover:bg-gray-900 transition-colors duration-200`} onClick={() => navigate({ to: `/` })}>
      <CardContent className="p-6 h-full w-full">
        <div className={`space-y-2`}>
          <h2 className="text-2xl font-medium leading-none pb-2">Hashrate</h2>
        </div>

        <ChartContainer
          className="h-full w-full"
          config={chartConfig}
        >
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
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}


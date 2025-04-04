import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"
import { Card, CardContent } from "@/components/ui/card"
import { ChartConfig, ChartContainer } from "@/components/ui/chart"
import { useNavigate } from "@tanstack/react-router"

export enum MarketChartType {
  Price = "price",
  Hashrate = "hashrate",
  Difficulty = "difficulty",
  TransactionFee = "transaction-fee",
  BlockSubsidy = "block-subsidy",
  BlockSize = "block-size",
  MempoolTransactions = "mempool-transactions",
  UtxoSetSize = "utxo-set-size",
}

interface MarketChartProps {
  title: string
  type: MarketChartType
  className?: string
}

const chartConfig = {
  value: {
    label: "Price",
    color: "white",
  },
} satisfies ChartConfig;

// TODO: Get the historical data from the API for the percentage change
export function MarketChart({ title, type, className }: MarketChartProps) {
  const navigate = useNavigate()
  const data = [
    { value: 100 },
    { value: 120 },
    { value: 110 },
    { value: 105 },
    { value: 100 },
    { value: 110 },
    { value: 115 },
    { value: 150 },
  ]

  return (
    <Card className={`${className || ""} bg-black text-white overflow-hidden h-2/5 my-2 cursor-pointer hover:bg-gray-900 transition-colors duration-200`} onClick={() => navigate({ to: `/create?type=${type}` })}>
      <CardContent className="p-6 h-full w-full">
        <div className={`space-y-2`}>
          <h2 className="text-2xl font-medium leading-none pb-2">{title}</h2>
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


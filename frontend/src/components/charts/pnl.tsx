import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"
import { ChartConfig, ChartContainer } from "@/components/ui/chart"
import { format } from "date-fns"
import { useState, useEffect, useMemo } from "react"
import { useSol } from "@/hooks/useSol"
import { BalanceHistory, SolBalanceType, TimePeriod } from "@/types"
import { formatAmount } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CalendarIcon, RefreshCcw } from "lucide-react"

interface PnLProps {
  title: string
  height?: string
}

const chartConfig = {
  value: {
    label: "Profit & Loss",
    color: "white",
  },
} satisfies ChartConfig;

const DEFAULT_DATE = new Date();

const TIME_PERIOD_LABELS = {
  [TimePeriod.Day]: "24 hours",
  [TimePeriod.Week]: "1 week",
  [TimePeriod.Month]: "1 month",
  [TimePeriod.Year]: "1 year",
};

export function Pnl({ title, height }: PnLProps) {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>(TimePeriod.Month);
  const [date, setDate] = useState<Date | undefined>(DEFAULT_DATE);
  const [history, setHistory] = useState<BalanceHistory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [percentage, setPercentage] = useState(0);
  const [latestPnl, setLatestPnl] = useState<SolBalanceType>({ sats: 0, btc: 0 });

  const sol = useSol();

  const fetchBalanceHistory = async () => {
    setIsLoading(true);
    try {
      const data = await sol.getBalanceHistory(timePeriod, date);
      setHistory(data);

      if (data.length > 0) {
        // Set the latest PnL from the most recent data point
        const latest = data[data.length - 1];
        setLatestPnl({
          sats: latest.pnl_sats,
          btc: latest.pnl_sats / 100000000 // Convert sats to BTC
        });

        // Calculate percentage change if there are at least 2 data points
        if (data.length > 1) {
          const firstValue = data[0].pnl_sats;
          const lastValue = data[data.length - 1].pnl_sats;

          if (firstValue !== 0) {
            const percentChange = ((lastValue - firstValue) / Math.abs(firstValue)) * 100;
            setPercentage(parseFloat(percentChange.toFixed(2)));
          } else {
            setPercentage(0);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching balance history:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBalanceHistory();
  }, [timePeriod, date]);

  const resetToCurrentDate = () => {
    setDate(new Date());
  };

  const chartData = history.map((item) => ({
    timestamp: item.created_at,
    value: item.pnl_sats,
    btcValue: item.pnl_sats / 100000000, // Convert sats to BTC
    usdValue: parseFloat(item.pnl_usd.toString()),
    btcPrice: parseFloat(item.bitcoin_price.toString()),
    bitcoinBalance: {
      sats: item.bitcoin_balance_sats,
      btc: item.bitcoin_balance_sats / 100000000,
      usd: parseFloat(item.bitcoin_balance_usd.toString())
    },
    contractBalance: {
      sats: item.contract_balance_sats,
      btc: item.contract_balance_sats / 100000000,
      usd: parseFloat(item.contract_balance_usd.toString())
    },
    numContracts: item.num_contracts,
    networkName: item.name
  }));

  // Determine Y-axis domain based on data values
  const yAxisDomain = useMemo(() => {
    if (!chartData.length) return [0, 'auto'] as [number, string];

    // Check if we have any negative values
    const hasNegativeValues = chartData.some(item => item.value < 0);

    // If we have negative values, use dataMin, otherwise start at 0
    return hasNegativeValues ? ['dataMin', 'dataMax'] as [string, string] : [0, 'dataMax'] as [number, string];
  }, [chartData]);

  // Format for X-axis timestamps based on time period
  const formatXAxis = (timestamp: string) => {
    const date = new Date(timestamp);
    if (timePeriod === TimePeriod.Day) {
      return format(date, "HH:mm");
    } else if (timePeriod === TimePeriod.Week) {
      return format(date, "EEE");
    } else {
      return format(date, "MMM dd");
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-black border border-gray-800 p-3 rounded">
          <p className="text-sm">{format(new Date(data.timestamp), "PPpp")}</p>
          <p className="text-sm font-bold text-white">
            {formatAmount({ sats: data.value, btc: data.btcValue })}
          </p>
          <p className="text-xs text-gray-400">${data.usdValue.toFixed(2)} USD</p>
          <p className="text-xs text-gray-400">BTC: ${data.btcPrice.toFixed(2)}</p>
          <div className="border-t border-gray-800 mt-2 pt-2">
            <p className="text-xs">
              <span className="text-gray-400">Bitcoin Balance:</span> {formatAmount(data.bitcoinBalance)}
              <span className="text-gray-400 ml-1">(${data.bitcoinBalance.usd.toFixed(2)})</span>
            </p>
            <p className="text-xs">
              <span className="text-gray-400">Contract Balance:</span> {formatAmount(data.contractBalance)}
              <span className="text-gray-400 ml-1">(${data.contractBalance.usd.toFixed(2)})</span>
            </p>
            <p className="text-xs">
              <span className="text-gray-400">Contracts:</span> {data.numContracts}
            </p>
            <p className="text-xs">
              <span className="text-gray-400">Network:</span> {data.networkName}
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="py-4">
      <div className="flex justify-between items-center mb-4">
        <div>
          <p className="text-sm font-medium leading-none">{title}</p>
          <p className="text-4xl font-bold">{formatAmount(latestPnl)}</p>
          <p className={`text-sm ${percentage >= 0 ? "text-green-500" : "text-red-500"}`}>
            {percentage >= 0 ? "+" : ""}
            {percentage}% from {TIME_PERIOD_LABELS[timePeriod]} ago
          </p>
        </div>

        <div className="flex space-x-2 items-center">
          <Select
            value={timePeriod}
            onValueChange={(value) => setTimePeriod(value as TimePeriod)}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Time Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={TimePeriod.Day}>{TIME_PERIOD_LABELS[TimePeriod.Day]}</SelectItem>
              <SelectItem value={TimePeriod.Week}>{TIME_PERIOD_LABELS[TimePeriod.Week]}</SelectItem>
              <SelectItem value={TimePeriod.Month}>{TIME_PERIOD_LABELS[TimePeriod.Month]}</SelectItem>
              <SelectItem value={TimePeriod.Year}>{TIME_PERIOD_LABELS[TimePeriod.Year]}</SelectItem>
            </SelectContent>
          </Select>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-[180px] justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          <Button variant="ghost" size="icon" onClick={resetToCurrentDate}>
            <RefreshCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="w-full" style={{ height: height ?? "350px" }}>
        {isLoading ? (
          <div className="flex items-center justify-center h-full">Loading...</div>
        ) : history.length > 0 ? (
          <ChartContainer config={chartConfig} className="w-full h-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <XAxis
                  dataKey="timestamp"
                  tickFormatter={formatXAxis}
                  stroke="white"
                  fontSize={12}
                />
                <YAxis
                  stroke="white"
                  fontSize={12}
                  domain={yAxisDomain}
                />
                <Tooltip content={<CustomTooltip />} />
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
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            No data available
          </div>
        )}
      </div>
    </div>
  )
}


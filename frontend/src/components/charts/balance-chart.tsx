import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"
import { ChartConfig, ChartContainer } from "@/components/ui/chart"
import { format } from "date-fns"
import { useState, useEffect, useMemo } from "react"
import { useSol } from "@/hooks/useSol"
import { BalanceHistory, BalanceMetricType, SolBalanceType, TimePeriod } from "@/types"
import { formatAmount } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CalendarIcon, RefreshCcw } from "lucide-react"

interface BalanceChartProps {
  title: string
  metricType: BalanceMetricType
  height?: string
  showUsd?: boolean
}

const chartConfig = {
  value: {
    label: "Balance",
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

// Labels for different metric types
const METRIC_LABELS = {
  [BalanceMetricType.WalletBalanceSats]: "Wallet Balance (sats)",
  [BalanceMetricType.WalletBalanceUsd]: "Wallet Balance (USD)",
  [BalanceMetricType.ContractBalanceSats]: "Contract Balance (sats)",
  [BalanceMetricType.ContractBalanceUsd]: "Contract Balance (USD)",
  [BalanceMetricType.PnlSats]: "Profit & Loss (sats)",
  [BalanceMetricType.PnlUsd]: "Profit & Loss (USD)",
};

export function BalanceChart({ title, metricType, height, showUsd = true }: BalanceChartProps) {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>(TimePeriod.Month);
  const [date, setDate] = useState<Date | undefined>(DEFAULT_DATE);
  const [history, setHistory] = useState<BalanceHistory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [percentage, setPercentage] = useState(0);
  const [latestValue, setLatestValue] = useState<number>(0);
  const [latestBtcValue, setLatestBtcValue] = useState<number>(0);

  const sol = useSol();

  const fetchBalanceHistory = async () => {
    setIsLoading(true);
    try {
      const data = await sol.getBalanceHistory(timePeriod, date);
      setHistory(data);

      if (data.length > 0) {
        // Set the latest value from the most recent data point
        const latest = data[data.length - 1];
        const value = Number(latest[metricType] as unknown);
        setLatestValue(value);

        // For sats values, calculate BTC equivalent
        if (metricType === BalanceMetricType.WalletBalanceSats ||
          metricType === BalanceMetricType.ContractBalanceSats ||
          metricType === BalanceMetricType.PnlSats) {
          setLatestBtcValue(value / 100000000);
        }

        // Calculate percentage change if there are at least 2 data points
        if (data.length > 1) {
          const firstValue = Number(data[0][metricType] as unknown);
          const lastValue = Number(data[data.length - 1][metricType] as unknown);

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
  }, [timePeriod, date, metricType]);

  const resetToCurrentDate = () => {
    setDate(new Date());
  };

  const chartData = history.map((item) => {
    const value = Number(item[metricType] as unknown);

    return {
      timestamp: item.created_at,
      value,
      // Only calculate BTC value for SATS metrics
      btcValue: metricType.includes('sats') ? value / 100000000 : undefined,
      btcPrice: Number(item.bitcoin_price),
      bitcoinBalance: {
        sats: Number(item.bitcoin_balance_sats),
        btc: Number(item.bitcoin_balance_sats) / 100000000,
        usd: Number(item.bitcoin_balance_usd)
      },
      contractBalance: {
        sats: Number(item.contract_balance_sats),
        btc: Number(item.contract_balance_sats) / 100000000,
        usd: Number(item.contract_balance_usd)
      },
      pnl: {
        sats: Number(item.pnl_sats),
        btc: Number(item.pnl_sats) / 100000000,
        usd: Number(item.pnl_usd)
      },
      numContracts: Number(item.num_contracts),
      networkName: item.name
    };
  });

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

  // Format the latest value for display
  const formatLatestValue = () => {
    if (metricType.includes('usd')) {
      return `$${Number(latestValue).toFixed(2)}`;
    } else if (metricType.includes('sats')) {
      const btcAmount = { sats: Number(latestValue), btc: Number(latestBtcValue) };
      return formatAmount(btcAmount);
    }
    return String(latestValue);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-black border border-gray-800 p-3 rounded">
          <p className="text-sm">{format(new Date(data.timestamp), "PPpp")}</p>
          <p className="text-sm font-bold text-white">
            {metricType.includes('usd')
              ? `$${Number(data.value).toFixed(2)}`
              : metricType.includes('sats') && data.btcValue !== undefined
                ? formatAmount({ sats: Number(data.value), btc: data.btcValue })
                : String(data.value)
            }
          </p>
          {metricType.includes('sats') && showUsd && (
            <p className="text-xs text-gray-400">
              ${Number(metricType === BalanceMetricType.WalletBalanceSats
                ? data.bitcoinBalance.usd
                : metricType === BalanceMetricType.ContractBalanceSats
                  ? data.contractBalance.usd
                  : data.pnl.usd).toFixed(2)} USD
            </p>
          )}
          <p className="text-xs text-gray-400">BTC: ${Number(data.btcPrice).toFixed(2)}</p>
          <div className="border-t border-gray-800 mt-2 pt-2">
            <p className="text-xs">
              <span className="text-gray-400">Bitcoin Balance:</span> {formatAmount({
                sats: Number(data.bitcoinBalance.sats),
                btc: Number(data.bitcoinBalance.btc)
              })}
              <span className="text-gray-400 ml-1">(${Number(data.bitcoinBalance.usd).toFixed(2)})</span>
            </p>
            <p className="text-xs">
              <span className="text-gray-400">Contract Balance:</span> {formatAmount({
                sats: Number(data.contractBalance.sats),
                btc: Number(data.contractBalance.btc)
              })}
              <span className="text-gray-400 ml-1">(${Number(data.contractBalance.usd).toFixed(2)})</span>
            </p>
            <p className="text-xs">
              <span className="text-gray-400">PnL:</span> {formatAmount({
                sats: Number(data.pnl.sats),
                btc: Number(data.pnl.btc)
              })}
              <span className="text-gray-400 ml-1">(${Number(data.pnl.usd).toFixed(2)})</span>
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
          <p className="text-4xl font-bold">{formatLatestValue()}</p>
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
          <ChartContainer config={{
            ...chartConfig,
            value: {
              ...chartConfig.value,
              label: METRIC_LABELS[metricType] || "Balance"
            }
          }} className="w-full h-full">
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
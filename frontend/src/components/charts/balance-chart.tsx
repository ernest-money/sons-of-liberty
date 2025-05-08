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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface BalanceChartProps {
  title: string
  initialMetricType?: 'wallet' | 'contract' | 'pnl'
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
  [BalanceMetricType.WalletBalanceSats]: "Wallet Balance (BTC)",
  [BalanceMetricType.WalletBalanceUsd]: "Wallet Balance (USD)",
  [BalanceMetricType.ContractBalanceSats]: "Contract Balance (BTC)",
  [BalanceMetricType.ContractBalanceUsd]: "Contract Balance (USD)",
  [BalanceMetricType.PnlSats]: "Profit & Loss (BTC)",
  [BalanceMetricType.PnlUsd]: "Profit & Loss (USD)",
};

type MetricCategory = 'wallet' | 'contract' | 'pnl';

const getMetricTypeForCategory = (category: MetricCategory, isSats: boolean): BalanceMetricType => {
  switch (category) {
    case 'wallet':
      return isSats ? BalanceMetricType.WalletBalanceSats : BalanceMetricType.WalletBalanceUsd;
    case 'contract':
      return isSats ? BalanceMetricType.ContractBalanceSats : BalanceMetricType.ContractBalanceUsd;
    case 'pnl':
      return isSats ? BalanceMetricType.PnlSats : BalanceMetricType.PnlUsd;
  }
};

const getCategoryTitle = (category: MetricCategory): string => {
  switch (category) {
    case 'wallet':
      return "Wallet Balance";
    case 'contract':
      return "Contract Balance";
    case 'pnl':
      return "Profit & Loss";
  }
};

export function BalanceChart({ title, initialMetricType = 'wallet', height, showUsd = true }: BalanceChartProps) {
  const [currentCategory, setCurrentCategory] = useState<MetricCategory>(initialMetricType);
  const [isSats, setIsSats] = useState<boolean>(true);
  const [timePeriod, setTimePeriod] = useState<TimePeriod>(TimePeriod.Month);
  const [date, setDate] = useState<Date | undefined>(DEFAULT_DATE);
  const [history, setHistory] = useState<BalanceHistory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [percentage, setPercentage] = useState(0);
  const [latestValue, setLatestValue] = useState<number>(0);
  const [latestBtcValue, setLatestBtcValue] = useState<number>(0);

  const metricType = useMemo(() =>
    getMetricTypeForCategory(currentCategory, isSats),
    [currentCategory, isSats]
  );

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

        // Set BTC equivalent based on the selected category
        if (isSats) {
          let satValue: number;
          if (currentCategory === 'wallet') {
            satValue = Number(latest.bitcoin_balance_sats);
          } else if (currentCategory === 'contract') {
            satValue = Number(latest.contract_balance_sats);
          } else { // pnl
            satValue = Number(latest.pnl_sats);
          }
          setLatestBtcValue(satValue / 100000000);
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

    // Find min and max values
    const values = chartData.map(item => item.value);
    let min = Math.min(...values);
    let max = Math.max(...values);

    // If all values are the same, create some range
    if (min === max) {
      min = min * 0.95;
      max = max * 1.05;
      // Ensure we don't create negative values for positive-only data
      if (min < 0 && max > 0) min = 0;
      return [min, max] as [number, number];
    }

    // Calculate range and determine if we should adjust
    const range = max - min;

    // For small ranges relative to the values, adjust to focus on the trend
    if (min > 0 && range / max < 0.2) {
      // For USD values (large amounts)
      if (!isSats) {
        // Round values more nicely
        if (max >= 10000) {
          // For large values, round to thousands
          const roundToNearest = 1000;
          max = Math.ceil(max / roundToNearest) * roundToNearest;
          min = Math.floor(min * 0.9 / roundToNearest) * roundToNearest;
        } else if (max >= 1000) {
          // For medium values, round to hundreds
          const roundToNearest = 100;
          max = Math.ceil(max / roundToNearest) * roundToNearest;
          min = Math.floor(min * 0.9 / roundToNearest) * roundToNearest;
        } else {
          // For smaller values, round to tens
          const roundToNearest = 10;
          max = Math.ceil(max / roundToNearest) * roundToNearest;
          min = Math.floor(min * 0.9 / roundToNearest) * roundToNearest;
        }
      } else {
        // For BTC/sats values (often large numbers)
        if (max >= 1000000) {
          const roundToNearest = 100000;
          max = Math.ceil(max / roundToNearest) * roundToNearest;
          min = Math.floor(min * 0.9 / roundToNearest) * roundToNearest;
        } else if (max >= 100000) {
          const roundToNearest = 10000;
          max = Math.ceil(max / roundToNearest) * roundToNearest;
          min = Math.floor(min * 0.9 / roundToNearest) * roundToNearest;
        } else if (max >= 10000) {
          const roundToNearest = 1000;
          max = Math.ceil(max / roundToNearest) * roundToNearest;
          min = Math.floor(min * 0.9 / roundToNearest) * roundToNearest;
        } else {
          const roundToNearest = 100;
          max = Math.ceil(max / roundToNearest) * roundToNearest;
          min = Math.floor(min * 0.9 / roundToNearest) * roundToNearest;
        }
      }

      return [min, max] as [number, number];
    }

    // For data with negative values
    if (min < 0) {
      return ['dataMin', 'dataMax'] as [string, string];
    }

    // Default case - use 0 as min for positive values with good range
    return [0, 'dataMax'] as [number, string];
  }, [chartData, isSats]);

  // Format Y-axis ticks
  const formatYAxis = (value: number) => {
    if (!isSats) {
      // Format USD values
      if (value >= 1000000) {
        return `$${(value / 1000000).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}M`;
      } else if (value >= 1000) {
        return `$${(value / 1000).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}K`;
      } else {
        return `$${value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
      }
    } else {
      // Format BTC/sats values
      if (value >= 1000000) {
        return `${(value / 1000000).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}M`;
      } else if (value >= 1000) {
        return `${(value / 1000).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}K`;
      } else {
        return value.toLocaleString('en-US');
      }
    }
  };

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
    if (!isSats) {
      return `$${Number(latestValue).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    } else {
      const btcAmount = { sats: Number(latestValue), btc: Number(latestBtcValue) };
      return formatAmount(btcAmount);
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-black border border-gray-800 p-3 rounded">
          <p className="text-sm">{format(new Date(data.timestamp), "PPpp")}</p>
          <p className="text-sm font-bold text-white">
            {!isSats
              ? `$${Number(data.value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
              : formatAmount({ sats: Number(data.value), btc: data.btcValue })
            }
          </p>
          {isSats && showUsd && (
            <p className="text-xs text-gray-400">
              ${Number(currentCategory === 'wallet'
                ? data.bitcoinBalance.usd
                : currentCategory === 'contract'
                  ? data.contractBalance.usd
                  : data.pnl.usd).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
            </p>
          )}
          <p className="text-xs text-gray-400">BTC: ${Number(data.btcPrice).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          <div className="border-t border-gray-800 mt-2 pt-2">
            <p className="text-xs">
              <span className="text-gray-400">Bitcoin Balance:</span> {formatAmount({
                sats: Number(data.bitcoinBalance.sats),
                btc: Number(data.bitcoinBalance.btc)
              })}
              <span className="text-gray-400 ml-1">(${Number(data.bitcoinBalance.usd).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})</span>
            </p>
            <p className="text-xs">
              <span className="text-gray-400">Contract Balance:</span> {formatAmount({
                sats: Number(data.contractBalance.sats),
                btc: Number(data.contractBalance.btc)
              })}
              <span className="text-gray-400 ml-1">(${Number(data.contractBalance.usd).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})</span>
            </p>
            <p className="text-xs">
              <span className="text-gray-400">PnL:</span> {formatAmount({
                sats: Number(data.pnl.sats),
                btc: Number(data.pnl.btc)
              })}
              <span className="text-gray-400 ml-1">(${Number(data.pnl.usd).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})</span>
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

  const chartContent = (
    <div className="py-4">
      <div className="flex justify-between items-center mb-4">
        <div>
          <p className="text-sm font-medium leading-none">{getCategoryTitle(currentCategory)}</p>
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
                  tickFormatter={formatYAxis}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="currentColor"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 6, strokeWidth: 1 }}
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
  );

  return (
    <div>
      <Tabs defaultValue={initialMetricType} onValueChange={(value) => setCurrentCategory(value as MetricCategory)}>
        <div className="flex justify-between mb-4">
          <TabsList>
            <TabsTrigger value="wallet">Wallet</TabsTrigger>
            <TabsTrigger value="contract">Contract</TabsTrigger>
            <TabsTrigger value="pnl">Profit & Loss</TabsTrigger>
          </TabsList>

          <Tabs defaultValue={isSats ? "btc" : "usd"} onValueChange={(value) => setIsSats(value === "btc")}>
            <TabsList>
              <TabsTrigger value="btc">BTC</TabsTrigger>
              <TabsTrigger value="usd">USD</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <TabsContent value="wallet">{chartContent}</TabsContent>
        <TabsContent value="contract">{chartContent}</TabsContent>
        <TabsContent value="pnl">{chartContent}</TabsContent>
      </Tabs>
    </div>
  );
} 
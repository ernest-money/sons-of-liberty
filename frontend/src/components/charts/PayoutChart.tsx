import React, { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  TooltipProps,
} from "recharts";
import {
  ChartContainer,
} from "@/components/ui/chart";
import { ChartDataTypeInfo, TransformationFunction } from "@/types/chart-data-types";
import { Card } from "@/components/ui/card";

interface PayoutChartProps {
  dataType: ChartDataTypeInfo;
  threshold: number;
  range: number;
  isAboveThreshold: boolean;
  transformation: TransformationFunction;
  weight: number;
  totalCollateral: number;
  height?: string;
}

interface DataPoint {
  value: number;
  payout: number;
  normalizedValue: number;
  transformedValue: number;
  payoutAmount: number;
}

const applyTransformation = (normalizedValue: number, transformation: TransformationFunction): number => {
  switch (transformation) {
    case "linear":
      return normalizedValue;
    case "quadratic":
      return normalizedValue * normalizedValue;
    case "sqrt":
      return Math.sqrt(Math.max(0, normalizedValue));
    case "exponential":
      // Capped to avoid excessive values
      return Math.min(Math.exp(normalizedValue) - 1, 10);
    case "logarithmic":
      // Adding a small value to avoid log(0)
      return normalizedValue > 0 ? Math.log(normalizedValue + 0.01) + 4.6 : 0;
    default:
      return normalizedValue;
  }
};

// Normalize a value based on threshold and range
const normalizeValue = (
  value: number,
  threshold: number,
  range: number,
  isAboveThreshold: boolean
): number => {
  if (isAboveThreshold) {
    // Parameter must EXCEED threshold
    if (value <= threshold) {
      // Below threshold - return 0
      return 0;
    } else {
      // Above threshold - normalize based on distance
      const distance = value - threshold;
      const normalized = distance / range;
      // Cap at 1.0 for values beyond threshold + range
      return Math.min(normalized, 1.0);
    }
  } else {
    // Parameter must STAY BELOW threshold
    if (value >= threshold) {
      // Above threshold - return 0
      return 0;
    } else {
      // Below threshold - normalize based on distance
      const distance = threshold - value;
      const normalized = distance / range;
      // Cap at 1.0 for values beyond threshold - range
      return Math.min(normalized, 1.0);
    }
  }
};

// Generate data points for the chart
const generateDataPoints = (
  dataType: ChartDataTypeInfo,
  threshold: number,
  range: number,
  isAboveThreshold: boolean,
  transformation: TransformationFunction,
  weight: number,
  totalCollateral: number,
  numPoints = 100
): DataPoint[] => {
  const { lowerBound, upperBound } = dataType;
  const points: DataPoint[] = [];

  // Determine the start and end values based on the condition
  const start = Math.max(lowerBound, threshold - range * 1.5);
  const end = Math.min(upperBound, threshold + range * 1.5);

  const step = (end - start) / numPoints;

  for (let i = 0; i <= numPoints; i++) {
    const x = start + i * step;
    const normalizedValue = normalizeValue(x, threshold, range, isAboveThreshold);
    const transformedValue = applyTransformation(normalizedValue, transformation);
    const weightedValue = transformedValue * weight;
    // Calculate actual payout amount based on total collateral
    const payoutAmount = weightedValue * totalCollateral;

    points.push({
      value: x,
      payout: weightedValue,
      normalizedValue,
      transformedValue,
      payoutAmount,
    });
  }

  return points;
};

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload as DataPoint;
    return (
      <Card className="p-3 border shadow-md">
        <div className="font-medium">{data.value.toLocaleString()} {payload[0].unit}</div>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">Payout:</span>
            <span className="font-mono">{data.payoutAmount.toLocaleString()} sats</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">Normalized Value:</span>
            <span className="font-mono">{data.normalizedValue.toFixed(2)}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">Payout Factor:</span>
            <span className="font-mono">{data.payout.toFixed(2)}</span>
          </div>
        </div>
      </Card>
    );
  }
  return null;
};

export const PayoutChart: React.FC<PayoutChartProps> = ({
  dataType,
  threshold,
  range,
  isAboveThreshold,
  transformation,
  weight,
  totalCollateral,
  height = "250px"
}) => {
  const data = useMemo(
    () =>
      generateDataPoints(
        dataType,
        threshold,
        range,
        isAboveThreshold,
        transformation,
        weight,
        totalCollateral
      ),
    [dataType, threshold, range, isAboveThreshold, transformation, weight, totalCollateral]
  );

  const formatXAxis = (value: number) => {
    return value.toLocaleString(undefined, {
      maximumFractionDigits: 0
    });
  };

  const formatYAxis = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toLocaleString();
  };

  // Calculate min and max payout values for the domain
  const minPayout = Math.min(...data.map(d => d.payoutAmount));
  const maxPayout = Math.max(...data.map(d => d.payoutAmount));
  const payoutDomain = [minPayout, Math.max(maxPayout, totalCollateral * 0.1)];

  const chartConfig = {
    payoutAmount: {
      label: "Payout",
      color: "hsl(var(--primary))",
    },
    threshold: {
      label: "Threshold",
      color: "hsl(var(--destructive))",
    }
  };

  return (
    <div className="w-full" style={{ height }}>
      <ChartContainer config={chartConfig} className="w-full h-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 20, left: 20, bottom: 25 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="value"
              tickFormatter={formatXAxis}
              label={{
                value: `${dataType.label} (${dataType.unit})`,
                position: 'insideBottom',
                offset: -5
              }}
            />
            <YAxis
              tickFormatter={formatYAxis}
              domain={payoutDomain}
              label={{
                value: 'Payout (sats)',
                angle: -90,
                position: 'insideLeft',
                offset: 0,
                style: { textAnchor: 'middle' }
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine x={threshold} stroke="hsl(var(--destructive))" strokeWidth={2} strokeDasharray="3 3" />
            <Line
              type="monotone"
              dataKey="payoutAmount"
              name="Payout"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 6 }}
              unit={dataType.unit}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  );
}; 
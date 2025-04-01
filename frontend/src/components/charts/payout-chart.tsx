import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { RangePayout } from '@/hooks';

interface PayoutChartProps {
  rangePayouts: RangePayout[];
  roundingMod: number;
}

export const PayoutChart: React.FC<PayoutChartProps> = ({ rangePayouts, roundingMod }) => {
  // Transform the data for visualization
  const chartData = rangePayouts.map((range) => ({
    outcome: range.start,
    offerPayout: range.offer,
    acceptPayout: range.accept,
  }));

  // Calculate the maximum outcome for domain
  const maxOutcome = Math.max(...rangePayouts.map(range => range.start));

  // Calculate number of ticks based on maxOutcome and roundingMod
  const numTicks = Math.floor(maxOutcome / roundingMod) + 1;
  const ticks = Array.from({ length: numTicks }, (_, i) => i * roundingMod);

  return (
    <div style={{ width: '100%', height: 400 }}>
      <ResponsiveContainer>
        <LineChart
          data={chartData}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 10,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="outcome"
            label={{ value: 'Outcome', position: 'bottom' }}
            type="number"
            domain={[0, maxOutcome]}
            ticks={ticks}
          />
          <YAxis label={{ value: 'Payout', angle: -90, position: 'left' }} />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="offerPayout"
            name="Offer Payout"
            stroke="#8884d8"
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="acceptPayout"
            name="Accept Payout"
            stroke="#82ca9d"
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}; 
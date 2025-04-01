import React, { useEffect } from 'react';
import { RangePayout, usePayout, PayoutPoint } from '@/hooks';
import { PayoutChart } from '@/components/charts/payout-chart';
import { compute_payout_range } from '@dlcdevkit/ddk-wasm';
import { useParams } from '@tanstack/react-router';
import { createContractRoute } from '@/router';
export const CreateContract: React.FC = () => {
  const { payoutPoints, setPayoutPoints, roundingInterval, setRoundingInterval } = usePayout();
  const [rangePayouts, setRangePayouts] = React.useState<RangePayout[]>([]);
  const { contractType } = useParams({ from: createContractRoute.id });

  useEffect(() => {
    if (payoutPoints.length === 0) {
      const initialPoints: PayoutPoint[] = [
        { eventOutcome: 0, outcomePayout: 0, extraPrecision: 0 },
        { eventOutcome: 1_000, outcomePayout: 1_000, extraPrecision: 0 },
      ];

      const secondPoints: PayoutPoint[] = [
        { eventOutcome: 1_000, outcomePayout: 1_000, extraPrecision: 0 },
        { eventOutcome: 2_000, outcomePayout: 2_000, extraPrecision: 0 },
      ];

      const thirdPoints: PayoutPoint[] = [
        { eventOutcome: 2_000, outcomePayout: 2_000, extraPrecision: 0 },
        { eventOutcome: 3_000, outcomePayout: 3_000, extraPrecision: 0 },
      ];

      setPayoutPoints([initialPoints, secondPoints, thirdPoints]);
      setRoundingInterval([{ beginInterval: 0, roundingMod: 100 }]);
    }
  }, [payoutPoints.length, setPayoutPoints, setRoundingInterval]);

  // Update range payouts whenever payout points change
  useEffect(() => {
    const loadWasm = async () => {
      if (compute_payout_range && payoutPoints.length >= 1) {
        try {
          const newRangePayouts = compute_payout_range(BigInt(3_000), payoutPoints, roundingInterval);
          setRangePayouts(newRangePayouts);
        } catch (error) {
          console.error('Error computing range payouts:', error);
        }
      }
    };

    loadWasm();
  }, [payoutPoints, roundingInterval]);

  // Log payoutPoints whenever they change
  useEffect(() => {
    console.log("Current payoutPoints:", payoutPoints);
  }, [payoutPoints]);

  return (
    <div style={{ padding: '20px', width: '100%' }}>
      {/* @ts-ignore */}
      <h1 className='text-4xl font-bold'>{contractType?.charAt(0).toUpperCase() + contractType?.slice(1) ?? "Create Contract"}</h1>
      <div>
        <h2>Payout Distribution</h2>
        {rangePayouts.length > 0 ? (
          <PayoutChart rangePayouts={rangePayouts} roundingMod={roundingInterval[0].roundingMod} />
        ) : (
          <p>Add at least two payout points to see the distribution.</p>
        )}
      </div>
    </div>
  );
};

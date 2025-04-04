import { useState } from 'react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Scatter, ScatterChart, ZAxis } from 'recharts';

export const HeatMap = () => {
  // Contract Parameters
  const [hashRateThreshold, setHashRateThreshold] = useState(50000);
  const [priceThreshold, setPriceThreshold] = useState(100000);
  const [currentHashRate, setCurrentHashRate] = useState(78000);
  const [currentPrice, setCurrentPrice] = useState(32000);
  const [maxPayout, setMaxPayout] = useState(1000);
  const [payoutFunction, setPayoutFunction] = useState('linear');

  // Calculation constants
  const hashRateRange = 100000;
  const priceRange = 200000;

  // Calculate normalized distances from thresholds (0 to 1)
  const calculateHashRateScore = (value: number) => {
    if (value <= hashRateThreshold) return 0;
    const maxDistance = hashRateRange - hashRateThreshold;
    const distance = Math.min(value - hashRateThreshold, maxDistance);
    return distance / maxDistance;
  };

  const calculatePriceScore = (value: number) => {
    if (value >= priceThreshold) return 0;
    const maxDistance = priceThreshold;
    const distance = Math.min(priceThreshold - value, maxDistance);
    return distance / maxDistance;
  };

  // Apply different payout functions
  const applyPayoutFunction = (normalizedValue: number) => {
    switch (payoutFunction) {
      case 'linear':
        return normalizedValue;
      case 'quadratic':
        return Math.pow(normalizedValue, 2);
      case 'sqrt':
        return Math.sqrt(normalizedValue);
      case 'exponential':
        // Scale to range 0-1
        return (Math.exp(3 * normalizedValue) - 1) / (Math.exp(3) - 1);
      case 'logarithmic':
        if (normalizedValue === 0) return 0;
        // Scale to range 0-1
        return Math.log(1 + 9 * normalizedValue) / Math.log(10);
      default:
        return normalizedValue;
    }
  };

  // Calculate combined score with selected function
  const hashRateScore = applyPayoutFunction(calculateHashRateScore(currentHashRate));
  const priceScore = applyPayoutFunction(calculatePriceScore(currentPrice));

  // Different combination methods
  const [combinationMethod, setCombinationMethod] = useState('multiply');

  // Generate data for 2D heatmap
  const heatmapData = [];
  const steps = 20;
  for (let h = 0; h <= hashRateRange; h += hashRateRange / steps) {
    for (let p = 0; p <= priceRange; p += priceRange / steps) {
      const hScore = applyPayoutFunction(calculateHashRateScore(h));
      const pScore = applyPayoutFunction(calculatePriceScore(p));
      let combinedScore;

      switch (combinationMethod) {
        case 'multiply':
          combinedScore = hScore * pScore;
          break;
        case 'average':
          combinedScore = (hScore + pScore) / 2;
          break;
        case 'minimum':
          combinedScore = Math.min(hScore, pScore);
          break;
        case 'maximum':
          combinedScore = Math.max(hScore, pScore);
          break;
        case 'weighted':
          combinedScore = 0.6 * hScore + 0.4 * pScore;
          break;
        default:
          combinedScore = hScore * pScore;
      }

      heatmapData.push({
        hashRate: h,
        price: p,
        payout: combinedScore * maxPayout,
        size: 100
      });
    }
  }

  return (
    <div className="flex flex-col">
      {/* Combined Payout Heatmap */}
      <ResponsiveContainer width="100%" height={400}>
        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
          <CartesianGrid />
          <XAxis
            type="number"
            dataKey="hashRate"
            name="Hash Rate"
            domain={[0, hashRateRange]}
            tickFormatter={(value) => (value / 1000).toFixed(0) + 'k'}
            label={{ value: 'Hash Rate', position: 'bottom', offset: 0 }}
          />
          <YAxis
            type="number"
            dataKey="price"
            name="Price"
            domain={[0, priceRange]}
            tickFormatter={(value) => (value / 1000).toFixed(0) + 'k'}
            label={{ value: 'Price', angle: -90, position: 'left', offset: -5 }}
          />
          <ZAxis
            type="number"
            dataKey="payout"
            range={[0, 100]}
            name="Payout"
          />
          <Tooltip
            cursor={{ strokeDasharray: '3 3' }}
            formatter={(value: number, name: string) => {
              if (name === 'Payout') return ['$' + value.toFixed(2), name];
              return [value.toLocaleString(), name];
            }}
          />
          <Scatter
            data={heatmapData}
            fill="#fff"
            fillOpacity={0.5}
          />
          <ReferenceLine
            x={hashRateThreshold}
            stroke="red"
            strokeDasharray="3 3"
          />
          <ReferenceLine
            y={priceThreshold}
            stroke="red"
            strokeDasharray="3 3"
          />
          <ReferenceLine
            x={currentHashRate}
            stroke="blue"
            strokeDasharray="3 3"
          />
          <ReferenceLine
            y={currentPrice}
            stroke="blue"
            strokeDasharray="3 3"
          />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
};
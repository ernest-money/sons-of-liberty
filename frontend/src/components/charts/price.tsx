import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine, Scatter, ScatterChart, ZAxis, Label } from 'recharts';

export const Price = () => {
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

  const getCombinedScore = () => {
    switch (combinationMethod) {
      case 'multiply':
        return hashRateScore * priceScore;
      case 'average':
        return (hashRateScore + priceScore) / 2;
      case 'minimum':
        return Math.min(hashRateScore, priceScore);
      case 'maximum':
        return Math.max(hashRateScore, priceScore);
      case 'weighted':
        return 0.6 * hashRateScore + 0.4 * priceScore;
      default:
        return hashRateScore * priceScore;
    }
  };

  const finalPayout = maxPayout * getCombinedScore();

  // Generate data for hash rate payout curve
  const hashRateData = [];
  for (let i = 0; i <= hashRateRange; i += hashRateRange / 50) {
    hashRateData.push({
      hashRate: i,
      payout: applyPayoutFunction(calculateHashRateScore(i)) * maxPayout
    });
  }

  // Generate data for price payout curve
  const priceData = [];
  for (let i = 0; i <= priceRange; i += priceRange / 50) {
    priceData.push({
      price: i,
      payout: applyPayoutFunction(calculatePriceScore(i)) * maxPayout
    });
  }

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


      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={priceData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="price"
            tickFormatter={(value) => (value / 1000).toFixed(0) + 'k'}
          >
            <Label value="Price" position="bottom" offset={0} />
          </XAxis>
          <YAxis
            tickFormatter={(value) => '$' + value.toLocaleString()}
          >
            <Label value="Payout" angle={-90} position="left" offset={-15} />
          </YAxis>
          <Tooltip
            formatter={(value: number) => ['$' + value.toFixed(2), 'Payout']}
            labelFormatter={(value: number) => 'Price: ' + value.toLocaleString()}
          />
          <ReferenceLine
            x={priceThreshold}
            stroke="red"
            label={{ value: 'Threshold', position: 'top' }}
            strokeDasharray="3 3"
          />
          <ReferenceLine
            x={currentPrice}
            stroke="blue"
            label={{ value: 'Current', position: 'bottom' }}
            strokeDasharray="3 3"
          />
          <Line type="monotone" dataKey="payout" stroke="#82ca9d" activeDot={{ r: 8 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
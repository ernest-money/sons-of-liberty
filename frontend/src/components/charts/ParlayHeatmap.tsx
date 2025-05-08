import { useMemo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ParlayParameter } from '@/types/sol';
import { CombinationMethod, CHART_DATA_TYPES } from '@/types/chart-data-types';
import { Scatter, ScatterChart, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceDot } from 'recharts';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

interface ParlayHeatmapProps {
  parameters: ParlayParameter[];
  combinationMethod: CombinationMethod;
  totalCollateral: number;
}

interface HeatmapPoint {
  x: number;
  y: number;
  value: number;
  xValue: number;
  yValue: number;
  dataType1: string;
  dataType2: string;
  payout: number;
  allParameters?: Array<{ name: string, value: number }>;
}

// Define props type for HeatMapCell
interface HeatMapCellProps {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  color?: string;
  index?: number;
  payload?: HeatmapPoint;
}

// Custom cell component for the heatmap
const HeatMapCell = (props: HeatMapCellProps) => {
  const { x = 0, y = 0, width = 0, height = 0, color = '#000', payload } = props;

  if (!payload) return null;

  // Calculate size based on payout (min 5, max 25)
  const size = 5 + (20 * payload.value);
  // Calculate opacity based on payout (min 0.2, max 0.9)
  const opacity = 0.2 + (0.7 * payload.value);

  // Use a single color with varying opacity instead of red/green
  const fillColor = '#6366f1'; // Indigo color

  return (
    <circle
      cx={x + width / 2}
      cy={y + height / 2}
      r={size}
      fill={fillColor}
      fillOpacity={opacity}
    />
  );
};

// Custom tooltip props type
interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: HeatmapPoint;
  }>;
}

// Custom tooltip component
const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-background border rounded-md shadow-md p-3 z-10">
        <div className="text-sm">
          <div><strong>{data.dataType1}:</strong> {data.xValue.toLocaleString()}</div>
          <div><strong>{data.dataType2}:</strong> {data.yValue.toLocaleString()}</div>
          <div><strong>Combined Score:</strong> {(data.value * 100).toFixed(2)}%</div>
          <div><strong>Payout:</strong> {data.payout.toLocaleString()} sats</div>
        </div>
      </div>
    );
  }
  return null;
};

// New component for inputting custom values
interface InputValueMarkerProps {
  parameters: ParlayParameter[];
  combinationMethod: CombinationMethod;
  totalCollateral: number;
  gridSize: number;
  onValueCalculated: (point: HeatmapPoint | null) => void;
}

const InputValueMarker: React.FC<InputValueMarkerProps> = ({
  parameters,
  combinationMethod,
  totalCollateral,
  gridSize,
  onValueCalculated
}) => {
  const [values, setValues] = useState<Record<string, string>>({});

  // Get data types for visualization (using first two parameters)
  const dataType1 = parameters.length > 0 ? CHART_DATA_TYPES.find(dt => dt.id === parameters[0].dataType) : null;
  const dataType2 = parameters.length > 1 ? CHART_DATA_TYPES.find(dt => dt.id === parameters[1].dataType) : null;

  if (parameters.length === 0) return null;

  const handleInputChange = (paramIndex: number, value: string) => {
    setValues(prev => ({
      ...prev,
      [paramIndex]: value
    }));
  };

  const calculatePoint = () => {
    // Check if we have valid inputs for at least the first two parameters
    if (parameters.length < 2) {
      onValueCalculated(null);
      return;
    }

    const inputValues = parameters.map((param, index) => {
      const value = parseFloat(values[index] || '0');
      return isNaN(value) ? null : value;
    });

    // If any input is missing or invalid, don't calculate
    if (inputValues.some(v => v === null)) {
      onValueCalculated(null);
      return;
    }

    // Process all parameters
    const normalizedValues = parameters.map((param, index) => {
      return normalizeParameter(param, inputValues[index]!);
    });

    const transformedValues = parameters.map((param, index) => {
      return applyTransformation(param, normalizedValues[index]);
    });

    // Calculate the combined score using all parameters
    const scores = transformedValues;
    const weights = parameters.map(param => param.weight);
    const combinedScore = combineScores(scores, weights, combinationMethod);

    // Calculate the payout
    const payout = combinedScore * totalCollateral;

    // For visualization, we only use the first two parameters' values
    if (!dataType1 || !dataType2) {
      onValueCalculated(null);
      return;
    }

    // Convert actual values to grid coordinates for the first two parameters (for visualization)
    const xValue = inputValues[0]!;
    const yValue = inputValues[1]!;

    const xRatio = (xValue - dataType1.lowerBound) / (dataType1.upperBound - dataType1.lowerBound);
    const yRatio = (yValue - dataType2.lowerBound) / (dataType2.upperBound - dataType2.lowerBound);

    const x = Math.max(0, Math.min(gridSize - 1, Math.round(xRatio * (gridSize - 1))));
    const y = Math.max(0, Math.min(gridSize - 1, Math.round(yRatio * (gridSize - 1))));

    // Create data for all parameters to display
    const paramDetails = parameters.map((param, index) => {
      const dataType = CHART_DATA_TYPES.find(dt => dt.id === param.dataType);
      return {
        name: dataType?.label || `Parameter ${index + 1}`,
        value: inputValues[index]!
      };
    });

    const point: HeatmapPoint = {
      x,
      y,
      value: combinedScore,
      xValue,
      yValue,
      dataType1: dataType1.label,
      dataType2: dataType2.label,
      payout,
      allParameters: paramDetails
    };

    onValueCalculated(point);
  };

  // Create grid layout based on number of parameters
  const gridCols = Math.min(parameters.length, 3); // Max 3 columns
  const gridClass = `grid grid-cols-1 md:grid-cols-${gridCols} gap-4 mb-4`;

  return (
    <div className="mb-6">
      <div className={gridClass}>
        {parameters.map((param, index) => {
          const dataType = CHART_DATA_TYPES.find(dt => dt.id === param.dataType);
          if (!dataType) return null;

          return (
            <div key={index}>
              <Label htmlFor={`value-${index}`}>{dataType.label}</Label>
              <div className="flex gap-2">
                <Input
                  id={`value-${index}`}
                  type="number"
                  placeholder={`${dataType.lowerBound} - ${dataType.upperBound}`}
                  value={values[index] || ''}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                />
              </div>
            </div>
          );
        })}
      </div>
      <Button onClick={calculatePoint} className="w-full mt-2">Calculate Payout</Button>
    </div>
  );
};

// Helper functions used by InputValueMarker
const normalizeParameter = (parameter: ParlayParameter, value: number): number => {
  const { threshold, range, isAboveThreshold } = parameter;

  if (isAboveThreshold) {
    if (value <= threshold) {
      return 0;
    } else {
      const distance = value - threshold;
      const normalized = distance / range;
      return Math.min(normalized, 1.0);
    }
  } else {
    if (value >= threshold) {
      return 0;
    } else {
      const distance = threshold - value;
      const normalized = distance / range;
      return Math.min(normalized, 1.0);
    }
  }
};

const applyTransformation = (parameter: ParlayParameter, normalizedValue: number): number => {
  switch (parameter.transformation) {
    case 'linear':
      return normalizedValue;
    case 'quadratic':
      return normalizedValue * normalizedValue;
    case 'sqrt':
      return Math.sqrt(normalizedValue);
    case 'exponential':
      return Math.exp(normalizedValue) - 1;
    case 'logarithmic':
      return normalizedValue > 0 ? Math.log(normalizedValue + 1) : 0;
    default:
      return normalizedValue;
  }
};

const combineScores = (scores: number[], weights: number[], method: CombinationMethod): number => {
  switch (method) {
    case 'multiply':
      return scores.reduce((acc, score) => acc * score, 1);
    case 'weightedAverage': {
      const weightSum = weights.reduce((sum, w) => sum + w, 0);
      return scores.reduce((acc, score, i) => acc + score * weights[i], 0) / weightSum;
    }
    case 'geometricMean': {
      const product = scores.reduce((acc, score) => acc * Math.max(score, 0.00001), 1);
      return Math.pow(product, 1 / scores.length);
    }
    case 'min':
      return Math.min(...scores);
    case 'max':
      return Math.max(...scores);
    default:
      return scores.reduce((acc, score) => acc * score, 1);
  }
};

export const ParlayHeatmap: React.FC<ParlayHeatmapProps> = ({
  parameters,
  combinationMethod,
  totalCollateral
}) => {
  // Only generate heatmap if we have at least 2 parameters
  const canGenerateHeatmap = parameters.length >= 2;
  const [customPoint, setCustomPoint] = useState<HeatmapPoint | null>(null);
  const gridSize = 15; // Grid size for heatmap

  // Calculate axis ranges and labels
  const axisInfo = useMemo(() => {
    if (parameters.length < 2) {
      return {
        xLabel: '',
        yLabel: '',
        xDomain: [0, 10] as [number, number],
        yDomain: [0, 10] as [number, number]
      };
    }

    const param1 = parameters[0];
    const param2 = parameters[1];
    const dataType1 = CHART_DATA_TYPES.find(dt => dt.id === param1.dataType);
    const dataType2 = CHART_DATA_TYPES.find(dt => dt.id === param2.dataType);

    return {
      xLabel: dataType1?.label || '',
      yLabel: dataType2?.label || '',
      xDomain: [0, 14] as [number, number], // Grid size - 1
      yDomain: [0, 14] as [number, number]  // Grid size - 1
    };
  }, [parameters]);

  // Generate heatmap data
  const heatmapData = useMemo(() => {
    if (!canGenerateHeatmap) return [];

    // For simplicity, we'll use the first two parameters
    const param1 = parameters[0];
    const param2 = parameters[1];

    // Get data types info
    const dataType1 = CHART_DATA_TYPES.find(dt => dt.id === param1.dataType);
    const dataType2 = CHART_DATA_TYPES.find(dt => dt.id === param2.dataType);

    if (!dataType1 || !dataType2) return [];

    const points: HeatmapPoint[] = [];

    // Generate a grid of values
    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        // Calculate the actual value at this point for each parameter
        const xValue = dataType1.lowerBound + (i / (gridSize - 1)) * (dataType1.upperBound - dataType1.lowerBound);
        const yValue = dataType2.lowerBound + (j / (gridSize - 1)) * (dataType2.upperBound - dataType2.lowerBound);

        // Normalize the values based on parameter settings
        const normalizedX = normalizeParameter(param1, xValue);
        const normalizedY = normalizeParameter(param2, yValue);

        // Apply transformations
        const transformedX = applyTransformation(param1, normalizedX);
        const transformedY = applyTransformation(param2, normalizedY);

        // Calculate the combined score
        const scores = [transformedX, transformedY];
        const weights = [param1.weight, param2.weight];
        const combinedScore = combineScores(scores, weights, combinationMethod);

        // Calculate the payout based on the combined score
        const payout = combinedScore * totalCollateral;

        // Only add points with non-zero payout
        if (payout > 0) {
          // Use grid positions as x,y for the scatter plot
          points.push({
            x: i,
            y: j,
            value: combinedScore,
            xValue,
            yValue,
            dataType1: dataType1.label,
            dataType2: dataType2.label,
            payout
          });
        }
      }
    }

    return points;
  }, [parameters, combinationMethod, totalCollateral, canGenerateHeatmap]);

  if (!canGenerateHeatmap) {
    return (
      <Card>
        <CardContent className="py-6">
          <div className="flex items-center justify-center h-48 text-muted-foreground">
            Add at least two parameters to generate a heatmap
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="py-6">
        {canGenerateHeatmap && (
          <InputValueMarker
            parameters={parameters}
            combinationMethod={combinationMethod}
            totalCollateral={totalCollateral}
            gridSize={gridSize}
            onValueCalculated={setCustomPoint}
          />
        )}

        {customPoint && (
          <div className="mb-4 p-3 border rounded-md bg-muted/50">
            <p className="font-medium">Payout for your inputs:</p>
            <div className="grid grid-cols-2 gap-x-4 text-sm mt-1">
              {customPoint.allParameters ? (
                // Display all parameters if available
                customPoint.allParameters.map((param, index) => (
                  <div key={index}><span className="text-muted-foreground">{param.name}:</span> {param.value.toLocaleString()}</div>
                ))
              ) : (
                // Fallback to original display
                <>
                  <div><span className="text-muted-foreground">{customPoint.dataType1}:</span> {customPoint.xValue.toLocaleString()}</div>
                  <div><span className="text-muted-foreground">{customPoint.dataType2}:</span> {customPoint.yValue.toLocaleString()}</div>
                </>
              )}
              <div><span className="text-muted-foreground">Score:</span> {(customPoint.value * 100).toFixed(2)}%</div>
              <div><span className="text-muted-foreground">Payout:</span> {customPoint.payout.toLocaleString()} sats</div>
            </div>
          </div>
        )}

        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart
              margin={{
                top: 20,
                right: 20,
                bottom: 40,
                left: 40,
              }}
            >
              <XAxis
                type="number"
                dataKey="x"
                name={axisInfo.xLabel}
                domain={axisInfo.xDomain}
                label={{ value: axisInfo.xLabel, position: "bottom", offset: 10 }}
                tick={false}
              />
              <YAxis
                type="number"
                dataKey="y"
                name={axisInfo.yLabel}
                domain={axisInfo.yDomain}
                label={{ value: axisInfo.yLabel, angle: -90, position: "left", offset: -10 }}
                tick={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Scatter
                data={heatmapData}
                shape={(cellProps: HeatMapCellProps) => <HeatMapCell {...cellProps} />}
              />

              {/* Show reference dot for custom input point */}
              {customPoint && (
                <ReferenceDot
                  x={customPoint.x}
                  y={customPoint.y}
                  r={8}
                  fill="#10b981"
                  stroke="#fff"
                  strokeWidth={2}
                />
              )}
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}; 
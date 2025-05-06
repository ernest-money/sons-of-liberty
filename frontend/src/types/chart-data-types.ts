export type ChartDataType = "price" | "hashrate" | "difficulty";

export interface ChartDataTypeInfo {
  id: ChartDataType;
  label: string;
  description: string;
  lowerBound: number;
  upperBound: number;
  defaultValue: number;
  unit: string;
}

export const CHART_DATA_TYPES: ChartDataTypeInfo[] = [
  {
    id: "price",
    label: "Price",
    description: "Bitcoin price data in USD",
    lowerBound: 10000,
    upperBound: 100000,
    defaultValue: 50000,
    unit: "USD",
  },
  {
    id: "hashrate",
    label: "Hash Rate",
    description: "Network hash rate measured in exahashes per second (EH/s)",
    lowerBound: 100,
    upperBound: 500,
    defaultValue: 300,
    unit: "EH/s",
  },
  {
    id: "difficulty",
    label: "Difficulty",
    description: "Bitcoin mining difficulty changes over time",
    lowerBound: 20000000000000,
    upperBound: 60000000000000,
    defaultValue: 40000000000000,
    unit: "",
  },
];

export type TransformationFunction =
  | "linear"
  | "quadratic"
  | "sqrt"
  | "exponential"
  | "logarithmic";

export interface TransformationFunctionInfo {
  id: TransformationFunction;
  label: string;
  description: string;
}

export const TRANSFORMATION_FUNCTIONS: TransformationFunctionInfo[] = [
  {
    id: "linear",
    label: "Linear",
    description: "Direct proportion (y = x)",
  },
  {
    id: "quadratic",
    label: "Quadratic",
    description: "Squared output (y = x²)",
  },
  {
    id: "sqrt",
    label: "Square Root",
    description: "Square root of input (y = √x)",
  },
  {
    id: "exponential",
    label: "Exponential",
    description: "Natural exponential (y = eˣ)",
  },
  {
    id: "logarithmic",
    label: "Logarithmic",
    description: "Natural logarithm (y = ln(x))",
  },
];

export type CombinationMethod =
  | "multiply"
  | "weightedAverage"
  | "geometricMean"
  | "min"
  | "max";

export interface CombinationMethodInfo {
  id: CombinationMethod;
  label: string;
  description: string;
}

export const COMBINATION_METHODS: CombinationMethodInfo[] = [
  {
    id: "multiply",
    label: "Multiply",
    description: "Multiply all values together",
  },
  {
    id: "weightedAverage",
    label: "Weighted Average",
    description: "Average values using their respective weights",
  },
  {
    id: "geometricMean",
    label: "Geometric Mean",
    description: "Nth root of the product of n values",
  },
  {
    id: "min",
    label: "Minimum",
    description: "Use the smallest value among all parameters",
  },
  {
    id: "max",
    label: "Maximum",
    description: "Use the largest value among all parameters",
  },
];

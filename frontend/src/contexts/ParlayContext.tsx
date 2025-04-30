import { createContext, useContext, useReducer, ReactNode } from 'react';
import { ChartDataType, TransformationFunction, CombinationMethod } from '@/types/chart-data-types';

export interface ParlayParameter {
  dataType: ChartDataType;
  threshold: number;
  range: number;
  isAboveThreshold: boolean;
  transformation: TransformationFunction;
  weight: number;
}

interface ParlayState {
  parameters: ParlayParameter[];
  combinationMethod: CombinationMethod;
  totalCollateral: number;
  yourCollateral: number;
  counterpartyCollateral: number;
}

type ParlayAction =
  | { type: 'ADD_PARAMETER'; parameter: ParlayParameter }
  | { type: 'UPDATE_PARAMETER'; index: number; parameter: ParlayParameter }
  | { type: 'REMOVE_PARAMETER'; index: number }
  | { type: 'SET_COMBINATION_METHOD'; method: CombinationMethod }
  | { type: 'SET_YOUR_COLLATERAL'; amount: number }
  | { type: 'SET_COUNTERPARTY_COLLATERAL'; amount: number };

const parlayReducer = (state: ParlayState, action: ParlayAction): ParlayState => {
  switch (action.type) {
    case 'ADD_PARAMETER':
      return {
        ...state,
        parameters: [...state.parameters, action.parameter]
      };
    case 'UPDATE_PARAMETER':
      return {
        ...state,
        parameters: state.parameters.map((param, index) =>
          index === action.index ? action.parameter : param
        )
      };
    case 'REMOVE_PARAMETER':
      return {
        ...state,
        parameters: state.parameters.filter((_, index) => index !== action.index)
      };
    case 'SET_COMBINATION_METHOD':
      return {
        ...state,
        combinationMethod: action.method
      };
    case 'SET_YOUR_COLLATERAL':
      return {
        ...state,
        yourCollateral: action.amount,
        totalCollateral: action.amount + state.counterpartyCollateral
      };
    case 'SET_COUNTERPARTY_COLLATERAL':
      return {
        ...state,
        counterpartyCollateral: action.amount,
        totalCollateral: state.yourCollateral + action.amount
      };
    default:
      return state;
  }
};

const initialState: ParlayState = {
  parameters: [],
  combinationMethod: 'multiply',
  totalCollateral: 200000,
  yourCollateral: 100000,
  counterpartyCollateral: 100000
};

interface ParlayContextType extends ParlayState {
  addParameter: (parameter: ParlayParameter) => void;
  updateParameter: (index: number, parameter: ParlayParameter) => void;
  removeParameter: (index: number) => void;
  setCombinationMethod: (method: CombinationMethod) => void;
  setYourCollateral: (amount: number) => void;
  setCounterpartyCollateral: (amount: number) => void;
}

const ParlayContext = createContext<ParlayContextType | undefined>(undefined);

export const ParlayProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(parlayReducer, initialState);

  const addParameter = (parameter: ParlayParameter) => {
    dispatch({ type: 'ADD_PARAMETER', parameter });
  };

  const updateParameter = (index: number, parameter: ParlayParameter) => {
    dispatch({ type: 'UPDATE_PARAMETER', index, parameter });
  };

  const removeParameter = (index: number) => {
    dispatch({ type: 'REMOVE_PARAMETER', index });
  };

  const setCombinationMethod = (method: CombinationMethod) => {
    dispatch({ type: 'SET_COMBINATION_METHOD', method });
  };

  const setYourCollateral = (amount: number) => {
    dispatch({ type: 'SET_YOUR_COLLATERAL', amount });
  };

  const setCounterpartyCollateral = (amount: number) => {
    dispatch({ type: 'SET_COUNTERPARTY_COLLATERAL', amount });
  };

  const value = {
    ...state,
    addParameter,
    updateParameter,
    removeParameter,
    setCombinationMethod,
    setYourCollateral,
    setCounterpartyCollateral
  };

  return <ParlayContext.Provider value={value}>{children}</ParlayContext.Provider>;
};

export const useParlayContext = () => {
  const context = useContext(ParlayContext);
  if (context === undefined) {
    throw new Error('useParlayContext must be used within a ParlayProvider');
  }
  return context;
}; 
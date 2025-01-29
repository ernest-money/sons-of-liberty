import { useState } from "react";
import { compute_payout_range } from "@dlcdevkit/ddk-wasm"

interface PayoutFunction {
  payoutPoints: PayoutPoint[][];
}

export interface PayoutPoint {
  eventOutcome: number;
  outcomePayout: number;
  extraPrecision: number;
}

interface DigitDecompositionDescriptor {
  payoutFunction: PayoutFunction;
  roundingInterval: RoundingInterval[];
  differenceParams: null
  oracleNumericInfo: OracleNumericInfo;
}

interface RoundingInterval {
  beginInterval: number;
  roundingMod: number;
}

interface OracleNumericInfo {
  // The base in which the oracle will represent the outcome value.
  base: number,
  // The number of digits that each oracle will use to represent the outcome value.
  nbDigits: number[],
}

interface OracleInput {
  publicKeys: string[];
  eventId: string;
  threshold: number;
}

interface ContractInput {
  /// The collateral for the offering party.
  offerCollateral: number,
  /// The collateral for the accepting party.
  acceptCollateral: number,
  /// The fee rate used to construct the transactions.
  feeRate: number,
  contractInfos: ContractInputInfo[],
}

export interface RangePayout {
  start: number;
  count: number;
  offer: number;
  accept: number;

}

export interface PayoutHookType {
  payoutPoints: PayoutPoint[][];
  setPayoutPoints: (payoutPoints: PayoutPoint[][]) => void;
  roundingInterval: RoundingInterval[];
  setRoundingInterval: (rounding: RoundingInterval[]) => void;
  addOracleInput: (oracleInput: OracleInput) => void;
  buildContractInput: (offer: number, accept: number, feeRate?: number) => ContractInput;
}

export interface ContractInputInfo {
  oracleInput: OracleInput;
  contractDescriptor: DigitDecompositionDescriptor;
}

export const usePayout = (): PayoutHookType => {
  const [payoutPoints, setPayoutPoints] = useState<PayoutPoint[][]>([]);
  const [roundingInterval, setRoundingInterval] = useState<RoundingInterval[]>([]);
  const [oracleInput, setOracleInput] = useState<OracleInput | null>(null);

  const addOracleInput = (oracleInput: OracleInput) => {
    setOracleInput(oracleInput);
  };

  const getPayoutDescriptor = (): DigitDecompositionDescriptor => {
    return {
      payoutFunction: { payoutPoints },
      roundingInterval,
      differenceParams: null,
      oracleNumericInfo: {
        base: 2,
        nbDigits: [20],
      },
    };
  }

  const buildContractInput = (offerCollateral: number, acceptCollateral: number, feeRate?: number): ContractInput => {
    if (!oracleInput) {
      throw new Error("Oracle input is not set");
    }

    const contractDescriptor = getPayoutDescriptor();

    const contractInputInfo: ContractInputInfo = {
      oracleInput,
      contractDescriptor
    };

    const contractInput: ContractInput = {
      offerCollateral,
      acceptCollateral,
      feeRate: feeRate || 0,
      contractInfos: [contractInputInfo],
    };

    return contractInput;
  }

  return { payoutPoints, setPayoutPoints, roundingInterval, setRoundingInterval, addOracleInput, buildContractInput };
};

function validatePayoutPoints(payoutPoints: PayoutPoint[]): boolean {
  return payoutPoints.length > 1 &&
    payoutPoints.slice(1).every((next, i) => {
      console.log("payoutPoints[i]", payoutPoints[i]);
      console.log("next", next);
      return payoutPoints[i].eventOutcome < next.eventOutcome;
    }
    );
}

// function getCurRange(
//   payoutPoints: PayoutPoint[],
//   firstOutcome: number,
//   rangePayouts: RangePayout[],
//   totalCollateral: number,
//   roundingIntervals: RoundingInterval[]
// ): RangePayout {
//   const cur = rangePayouts.pop();
//   if (cur) return cur;

//   let firstPayout = 0;
//   try {
//     firstPayout = getRoundedPayout(payoutPoints, firstOutcome, roundingIntervals, totalCollateral);
//   } catch (error) {
//     console.error("Error computing first payout", error);
//     throw error;
//   }

//   return {
//     start: firstOutcome,
//     count: 1,
//     payout: {
//       offer: firstPayout,
//       accept: totalCollateral - firstPayout
//     }
//   };
// }

// function computeRangePayoutsInner(
//   lastOutcome: number,
//   firstOutcome: number,
//   payoutPoints: PayoutPoint[],
//   roundingIntervals: RoundingInterval[],
//   totalCollateral: number,
// ): RangePayout[] {
//   let rangePayouts: RangePayout[] = [];
//   let curRange = getCurRange(payoutPoints, firstOutcome, rangePayouts, totalCollateral, roundingIntervals);
//   const rangeEnd = Math.min(lastOutcome + 1, Number.MAX_SAFE_INTEGER);

//   // Push first range
//   if (curRange.payout.offer === 0) {
//     rangePayouts.push(curRange);
//   }

//   for (let outcome = firstOutcome + 1; outcome < rangeEnd; outcome++) {
//     const payout = getRoundedPayout(payoutPoints, outcome, roundingIntervals, totalCollateral);

//     if (payout > totalCollateral) {
//       throw new Error("Computed payout is greater than total collateral.");
//     }

//     // New range if payout changes or if payout is same
//     if (curRange.payout.offer === payout) {
//       curRange.count += 1;
//     } else {
//       // Only push if there's a previous range
//       if (curRange.start !== outcome) {
//         rangePayouts.push(curRange);
//       }
//       curRange = {
//         start: outcome,
//         count: 1,
//         payout: {
//           offer: payout,
//           accept: totalCollateral - payout
//         }
//       };
//     }
//   }

//   // Push final range
//   rangePayouts.push(curRange);

//   return rangePayouts;
// }

// function getRoundedPayout(
//   payoutPoints: PayoutPoint[],
//   outcome: number,
//   roundingIntervals: RoundingInterval[],
//   totalCollateral: number,
// ): number {
//   const payoutDouble = evaluate(payoutPoints, outcome);

//   if (payoutDouble < 0 || (payoutDouble !== 0 && !Number.isFinite(payoutDouble))) {
//     throw new Error(`Could not evaluate function for outcome ${outcome}, result was: ${payoutDouble}`);
//   }

//   if (Math.round(payoutDouble) > totalCollateral) {
//     throw new Error("Computed payout is greater than total collateral");
//   }

//   // Helper function to round based on intervals
//   const roundByIntervals = (value: number): number => {
//     for (const interval of roundingIntervals) {
//       if (outcome >= interval.beginInterval) {
//         return Math.round(value / interval.roundingMod) * interval.roundingMod;
//       }
//     }
//     return Math.round(value);
//   };

//   return Math.min(roundByIntervals(payoutDouble), totalCollateral);
// }

// function getOutcomePayout(self: PayoutPoint): number {
//   return self.outcomePayout + (self.extraPrecision / (1 << 16));
// }

// function evaluate(payoutPoints: PayoutPoint[], outcome: number): number {
//   const nbPoints = payoutPoints.length;

//   // Constant and linear cases optimization
//   if (nbPoints === 2) {
//     const [leftPoint, rightPoint] = [payoutPoints[0], payoutPoints[1]];

//     if (leftPoint.outcomePayout === rightPoint.outcomePayout) {
//       return rightPoint.outcomePayout;
//     }

//     const slope = (rightPoint.outcomePayout - leftPoint.outcomePayout) /
//       (rightPoint.eventOutcome - leftPoint.eventOutcome);

//     return (outcome - leftPoint.eventOutcome) * slope + leftPoint.outcomePayout;
//   }

//   let result = 0;

//   for (let i = 0; i < nbPoints; i++) {
//     let l = getOutcomePayout(payoutPoints[i]);
//     for (let j = 0; j < nbPoints; j++) {
//       if (i !== j) {
//         console.log("payoutPoints[i]", payoutPoints[i]);
//         console.log("payoutPoints[j]", payoutPoints[j]);
//         // if (payoutPoints[i].eventOutcome !== payoutPoints[j].eventOutcome) {
//         //   throw new Error("Invalid payout points");
//         // }
//         const iOutcome = payoutPoints[i].eventOutcome;
//         const jOutcome = payoutPoints[j].eventOutcome;
//         const denominator = iOutcome - jOutcome;
//         const numerator = outcome - jOutcome;
//         l *= numerator / denominator;
//       }
//     }
//     result += l;
//   }

//   return result;
// }
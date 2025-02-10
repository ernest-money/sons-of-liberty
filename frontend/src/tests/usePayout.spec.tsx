// import { renderHook, act } from "@testing-library/react";
// import { usePayout } from "@/hooks";

// describe("usePayout", () => {
//   it("should initialize with empty payout points and rounding intervals", () => {
//     const { result } = renderHook(() => usePayout());

//     expect(result.current.payoutPoints).toEqual([]);
//     expect(result.current.roundingInterval).toEqual([]);
//   });

//   it("should add payout points", () => {
//     const { result } = renderHook(() => usePayout());
//     const payoutPoint = {
//       eventOutcome: 100,
//       outcomePayout: 200,
//       extraPrecision: 0,
//     };

//     const payoutPoint2 = {
//       eventOutcome: 200,
//       outcomePayout: 300,
//       extraPrecision: 0,
//     };

//     act(() => {
//       result.current.payoutPoints.push(payoutPoint);
//     });

//     act(() => {
//       result.current.payoutPoints.push(payoutPoint2);
//     });

//     expect(result.current.payoutPoints).toEqual([payoutPoint, payoutPoint2]);
//   });

//   it("should add rounding interval", () => {
//     const { result } = renderHook(() => usePayout());
//     const roundingInterval = {
//       beginInterval: 0,
//       roundingMod: 10,
//     };

//     act(() => {
//       result.current.addRoundingInterval(roundingInterval);
//     });

//     expect(result.current.roundingInterval).toEqual([
//       roundingInterval,
//     ]);
//   });

//   it("should throw error when getting descriptor with invalid payout points", () => {
//     const { result } = renderHook(() => usePayout());
//     const invalidPoints = [
//       { eventOutcome: 200, outcomePayout: 100, extraPrecision: 0 },
//       { eventOutcome: 100, outcomePayout: 200, extraPrecision: 0 },
//     ];

//     act(() => {
//       invalidPoints.forEach((point) => result.current.addPayoutPoint(point));
//     });

//     act(() => {
//       result.current.addOracleInput({
//         publicKeys: [],
//         eventId: "",
//         threshold: 0,
//       });
//     });

//     expect(() => result.current.buildContractInput(100, 200, 0.01)).toThrow(
//       "Invalid payout points"
//     );
//   });

//   it("should successfully create descriptor with valid payout points", () => {
//     const { result } = renderHook(() => usePayout());

//     const payoutPoint1 = { eventOutcome: 100, outcomePayout: 200, extraPrecision: 0 };
//     const payoutPoint2 = { eventOutcome: 200, outcomePayout: 300, extraPrecision: 0 };


//     act(() => {
//       result.current.addPayoutPoint(payoutPoint1);
//     });

//     act(() => {
//       result.current.addPayoutPoint(payoutPoint2);
//     });

//     act(() => {
//       result.current.addOracleInput({
//         publicKeys: [],
//         eventId: "",
//         threshold: 0,
//       });
//     });

//     const contractInput = result.current.buildContractInput(100, 200, 1);
//     console.log(result.current.computeRangePayouts(1000));
//   });
// });

import { SolBalanceType } from "@/types/sol";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatAmount(satAmount: number) {
  let amount = {
    sats: satAmount,
    btc: satAmount / 100_000_000,
  };

  console.log(amount);
  return amount.sats > 10_000_000
    ? amount.btc.toLocaleString() + " BTC"
    : amount.sats.toLocaleString() + " sats";
}

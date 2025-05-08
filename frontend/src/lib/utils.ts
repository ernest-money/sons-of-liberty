import { SolBalanceType } from "@/types/sol";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatAmount(balance: SolBalanceType) {
  return balance.sats > 10_000_000
    ? balance.btc.toLocaleString() + " BTC"
    : balance.sats.toLocaleString() + " sats";
}

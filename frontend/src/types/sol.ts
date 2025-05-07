import {
  ChartDataType,
  CombinationMethod,
  TransformationFunction,
} from "./chart-data-types";

export interface SolBalanceType {
  sats: number;
  btc?: number;
}

export interface SolBalance {
  confirmed: SolBalanceType;
  unconfirmed: SolBalanceType;
  contract: SolBalanceType;
  contractPnl: SolBalanceType;
}

export const defaultBalance: SolBalance = {
  confirmed: { sats: 0, btc: 0 },
  unconfirmed: { sats: 0, btc: 0 },
  contract: { sats: 0, btc: 0 },
  contractPnl: { sats: 0, btc: 0 },
};

export enum ContractFilter {
  All = "all",
  Active = "active",
  Closed = "closed",
  Failed = "failed",
}

export interface StoredContract {
  state: number;
  id: string;
  counter_party: string;
  collateral: number;
  is_offer_party: boolean;
  offer_collateral: number;
  accept_collateral: number;
  fee_rate_per_vb: number;
  cet_locktime: number;
  refund_locktime: number;
  pnl: number | null;
}

export const convertState = (state: number) => {
  switch (state) {
    case 1:
      return "Offer";
    case 2:
      return "Accept";
    case 3:
      return "Signed";
    case 4:
      return "Confirmed";
    case 5:
      return "Pre-Closed";
    case 6:
      return "Closed";
    case 7:
      return "Failed Accept";
    case 8:
      return "Failed Sign";
    case 9:
      return "Refunded";
    case 10:
      return "Rejected";
    default:
      return "unknown";
  }
};

export interface Offer {
  id: string;
  state: number;
  is_offer_party: boolean;
  counter_party: string;
  offer_collateral: number;
  total_collateral: number;
  accept_collateral: number;
  fee_rate_per_vb: number;
  cet_locktime: number;
  refund_locktime: number;
  pnl: number | null;
}

export interface Transaction {
  version: number;
  lock_time: number;
  input: TxIn[];
  output: TxOut[];
}

export interface TxIn {
  prvious_output: string;
  script_sig: string;
  sequence: number;
  witness: string[];
}

export interface TxOut {
  value: number;
  script_pubkey: string;
}

type ChainPosition = "Confirmed" | "Unconfirmed" | "Mempool" | "Unknown";

export interface LocalOutput {
  outpoint: string;
  txout: TxOut;
  keychain: string;
  is_spent: boolean;
  derivation_index: number;
  chain_position: {
    [key in ChainPosition]: {
      anchor: {
        block_id: {
          height: number;
          hash: string;
        };
        confirmation_time: number;
      };
      transitively: null;
    };
  };
}

export interface OutcomePayout {
  outcome: string;
  payout: {
    offer: number;
    accept: number;
  };
}

export interface ParlayParameter {
  dataType: ChartDataType;
  threshold: number;
  range: number;
  isAboveThreshold: boolean;
  transformation: TransformationFunction;
  weight: number;
}

export interface ParlayState {
  parameters: ParlayParameter[];
  combinationMethod: CombinationMethod;
  totalCollateral: number;
  yourCollateral: number;
  counterpartyCollateral: number;
}

export interface CreateParlayContractParams {
  parlayParameters: ParlayParameter[];
  combinationMethod: CombinationMethod;
  eventMaturityEpoch: number;
  counterparty: string;
  offerCollateral: number;
  acceptCollateral: number;
  feeRate: number;
}

export interface SendOfferBody {
  contract_input: any; // Replace with actual contract input type
  counter_party: string;
  oracle_announcements: any[]; // Replace with actual oracle announcement type
}

export interface AcceptOfferBody {
  offer_id: string;
}

export interface AcceptOfferResponse {
  contract_id: string;
  counter_party: string;
  accept_dlc: any; // Replace with actual accept dlc type
}

export interface CreateParlayContractResponse {
  id: string;
}

export interface EnumerationContractParams {
  counterparty: string;
  offer_collateral: number;
  accept_collateral: number;
  fee_rate: number;
  descriptor: {
    outcomePayouts: OutcomePayout[];
  };
  maturity: number;
}

export interface CreateEnumerationContractResponse {
  id: string;
  oracle_event_id: string;
}

export interface NostrCounterparty {
  pubkey: string;
  name: string;
  about: string;
  picture: string;
  website: string;
}

export interface ApiErrorResponse {
  error: string;
  description: string;
}

export interface InfoResponse {
  version: string;
  environment: string;
}

export interface MarketStats {
  id: number;
  hashrate: number;
  difficulty: number;
}

export interface Peer {
  id: string;
  address: string;
  connected: boolean;
}

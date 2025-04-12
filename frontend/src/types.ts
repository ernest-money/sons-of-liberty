export interface SolBalanceType {
  sats: number;
  btc: number;
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

export interface Contract {
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
  // Add TxIn fields as needed
}

export interface TxOut {
  // Add TxOut fields as needed
}

export interface LocalOutput {
  outpoint: {
    txid: string;
    vout: number;
  };
  txout: TxOut;
  keychain: string;
  is_spent: boolean;
  derivation_index: number;
  chain_position: any; // We can type this more specifically if needed
}

export interface OutcomePayout {
  outcome: string;
  payout: {
    offer: number;
    accept: number;
  };
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

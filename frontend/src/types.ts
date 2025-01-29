export interface Balance {
  confirmed: number;
  change_unconfirmed: number;
  foreign_unconfirmed: number;
  contract: number;
  contract_pnl: number;
}

export const defaultBalance: Balance = {
  confirmed: 0,
  change_unconfirmed: 0,
  foreign_unconfirmed: 0,
  contract: 0,
  contract_pnl: 0,
};

export interface Contract {
  state: string;
  contract_id: string;
  counterparty: string;
  collateral: number;
  event_ids: string[];
  funding_txid?: string;
  is_offer_party?: boolean;
  offer_amount?: number;
  accept_amount?: number;
  num_cets?: number;
  refund_txid?: string;
  pnl?: number;
  signed_cet?: any;
  attestations?: any;
  signed_cet_txid?: string;
  error_message?: string;
}

export interface Offer {
  state: string;
  contract_id: string;
  is_offer_party: boolean;
  counter_party: string;
  collateral: number;
  offer_amount: number;
  event_ids: string[];
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

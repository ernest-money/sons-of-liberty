export enum ContractFilter {
  All = "all",
  Active = "active",
  Closed = "closed",
  Failed = "failed",
}

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

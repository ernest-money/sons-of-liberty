export interface WalletAddress {
  address: string;
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

export interface UTXO {
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

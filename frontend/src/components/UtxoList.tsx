import React, { useEffect, useState } from 'react';
import { LocalOutput } from '../types';
import { useSol } from '../lib/hooks/useSol';

export const UtxoList: React.FC = () => {
  const [utxos, setUtxos] = useState<LocalOutput[]>([]);
  const [error, setError] = useState<string | null>(null);
  const client = useSol();

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const data = await client.getUtxos();
        setUtxos(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch offers');
      }
    };

    fetchOffers();
  }, [client]);

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!utxos.length) {
    return <div>No UTXOs found</div>;
  }

  return (
    <div>
      {utxos.map((utxo, index) => (
        <div key={`${utxo.outpoint.txid}-${utxo.outpoint.vout}`}>
          <h3>UTXO {index + 1}</h3>
          <div>Transaction ID: {utxo.outpoint.txid}</div>
          <div>Output Index: {utxo.outpoint.vout}</div>
          <div>Keychain: {utxo.keychain}</div>
          <div>Status: {utxo.is_spent ? 'Spent' : 'Unspent'}</div>
          <div>Derivation Index: {utxo.derivation_index}</div>
        </div>
      ))}
    </div>
  );
};


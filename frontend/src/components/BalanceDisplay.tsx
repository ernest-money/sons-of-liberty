import React, { useEffect, useState } from 'react';
import { Balance } from '../types';
import { useSol } from '../lib/hooks/useSol';

export const BalanceDisplay: React.FC = () => {
  const [balance, setBalance] = useState<Balance | null>(null);
  const [error, setError] = useState<string | null>(null);
  const sol = useSol();

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const data = await sol.getBalance();
        setBalance(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch balance');
      }
    };

    fetchBalance();
  }, [sol]);

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!balance) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div>Confirmed: {balance.confirmed}</div>
      <div>Change Unconfirmed: {balance.change_unconfirmed}</div>
      <div>Foreign Unconfirmed: {balance.foreign_unconfirmed}</div>
      <div>Contract: {balance.contract}</div>
      <div>Contract PnL: {balance.contract_pnl}</div>
    </div>
  );
}; 
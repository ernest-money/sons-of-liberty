import React, { useEffect, useState } from 'react';
import { Transaction } from '../types';
import { useSol } from '../lib/hooks/useSol';

export const TransactionList: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [error, setError] = useState<string | null>(null);
  const client = useSol();

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const data = await client.getTransactions();
        setTransactions(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch transactions');
      }
    };

    fetchTransactions();
  }, [client]);

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!transactions.length) {
    return <div>No transactions found</div>;
  }

  return (
    <div>
      {transactions.map((tx, index) => (
        <div key={index}>
          <h3>Transaction {index + 1}</h3>
          <div>Version: {tx.version}</div>
          <div>Lock Time: {tx.lock_time}</div>
          <div>Inputs: {tx.input.length}</div>
          <div>Outputs: {tx.output.length}</div>
        </div>
      ))}
    </div>
  );
}; 
import React from 'react';
import { useAuth } from '../lib/hooks/useAuth';
import { BalanceDisplay } from '../components/BalanceDisplay';
import { ContractList } from '../components/ContractList';
import { OfferList } from '../components/OfferList';
import { WalletInfo } from '../components/WalletInfo';
import { TransactionList } from '../components/TransactionList';
import { UtxoList } from '../components/UtxoList';

export const Dashboard: React.FC = () => {
  return (
    <div style={{ marginTop: "6rem", marginLeft: '2rem' }}>
      <section>
        <h2>Balance</h2>
        <BalanceDisplay />
      </section>

      <section>
        <h2>Contracts</h2>
        <ContractList />
      </section>

      <section>
        <h2>Offers</h2>
        <OfferList />
      </section>

      <section>
        <h2>Wallet</h2>
        <WalletInfo />
      </section>

      <section>
        <h2>Transactions</h2>
        <TransactionList />
      </section>

      <section>
        <h2>UTXOs</h2>
        <UtxoList />
      </section>
    </div>
  );
};
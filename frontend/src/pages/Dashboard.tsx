import React, { useEffect, useState } from 'react';
import { useAuth } from '../lib/hooks/useAuth';
import { BalanceDisplay } from '../components/BalanceDisplay';
import { ContractList } from '../components/ContractList';
import { OfferList } from '../components/OfferList';
import { WalletInfo } from '../components/WalletInfo';
import { TransactionList } from '../components/TransactionList';
import { UtxoList } from '../components/UtxoList';
import { BalanceCard } from '@/components/balance-card';
import { useSol } from '@/lib/hooks/useSol';
import { Balance, defaultBalance } from '@/types';

const data = [
  { value: 100 },
  { value: 120 },
  { value: 110 },
  { value: 105 },
  { value: 100 },
  { value: 110 },
  { value: 115 },
  { value: 150 },
]

export const Dashboard: React.FC = () => {
  const { user } = useAuth()
  const { getBalance } = useSol()
  const [balance, setBalance] = useState<Balance>(defaultBalance)
  useEffect(() => {
    const balance = async () => {
      const balance = await getBalance()
      setBalance(balance)
    }
    balance()
  }, [])

  return (
    <div className='flex flex-col gap-4 sm:w-full'>
      <h1>Hello, {user?.email}</h1>
      <div>
        <BalanceCard className='w-3/4 h-full' title="Profit & Loss" amount={balance.contract_pnl} percentage={10} data={data} />

        <div className="flex flex-row gap-4">
          <BalanceCard title="Contract Balance" amount={balance.contract} percentage={10} />
          <BalanceCard title="Confirmed Balance" amount={balance.confirmed} percentage={10} />
          <BalanceCard title="Unconfirmed Balance" amount={balance.change_unconfirmed + balance.foreign_unconfirmed} percentage={10} />
        </div>

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
    </div>
  );
};
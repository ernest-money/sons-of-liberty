import React, { useEffect, useState } from 'react';
import { useAuth, useSol } from '@/hooks';
import { BalanceCard } from '@/components/balance-card';
import { SolBalance, defaultBalance } from '@/types';
import { Pnl } from '@/components/charts/pnl';
import { ContractList } from '@/components/contract-list';

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
  const [balance, setBalance] = useState<SolBalance>(defaultBalance)
  useEffect(() => {
    const balance = async () => {
      const balance = await getBalance()
      console.log(balance)
      setBalance(balance)
    }
    balance()
  }, [])

  return (
    <div className='flex flex-col margin-auto gap-4 sm:w-full'>
      <h1 className='text-4xl pt-6 font-bold'>Hello, {user?.name ?? "anon"}</h1>
      <div>
        <div className="flex flex-row justify-between gap-4">
          <div className='w-1/2'>
            <BalanceCard title="Confirmed Balance" amount={balance.confirmed} percentage={10} />
          </div>
          <div className='w-1/2'>
            <BalanceCard title="Contract Balance" amount={balance.contract} percentage={10} />
          </div>
        </div>
        <Pnl className='w-full h-full' title="Profit & Loss" amount={balance.contractPnl} percentage={10} data={data} />
        <ContractList />
      </div>
    </div>
  );
};
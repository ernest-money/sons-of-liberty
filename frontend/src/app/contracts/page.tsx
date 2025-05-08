import { BalanceChart } from "@/components/charts/balance-chart"
import { ContractList } from "@/components/contract-list"
import { ContractFilter } from "@/lib/sol/contracts"
import { BalanceMetricType } from "@/types"

export function Contracts() {
  return (
    <div className="flex flex-col gap-4">
      <BalanceChart title='Contract Balance' initialMetricType="contract" />
      <ContractList defaultFilter={ContractFilter.All} />
    </div>
  )
}
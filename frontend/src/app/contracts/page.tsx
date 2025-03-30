import { ContractList } from "@/components/contract-list"
import { ContractFilter } from "@/lib/sol/contracts"

export function Contracts() {
  return <ContractList defaultFilter={ContractFilter.All} showFilter={false} />
}
import { ContractList } from "@/components/contract-list"
import { ContractFilter } from "@/lib/sol/contracts"

export function ClosedContracts() {
  return <ContractList defaultFilter={ContractFilter.Closed} showFilter={false} />
}
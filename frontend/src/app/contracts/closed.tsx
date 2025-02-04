import { ContractList } from "@/components/ContractList"
import { ContractFilter } from "@/lib/sol/contracts"

export function ClosedContracts() {
  return <ContractList defaultFilter={ContractFilter.Preclosed} showFilter={false} />
}
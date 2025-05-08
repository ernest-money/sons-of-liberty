import { ContractList } from "@/components/contract-list"
import { ContractFilter } from "@/types/sol"

export function ClosedContracts() {
  return <ContractList defaultFilter={ContractFilter.Closed} />
}
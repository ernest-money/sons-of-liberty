import { ContractList } from "@/components/contract-list"
import { ContractFilter } from "@/types/sol"

export function ActiveContracts() {
  return <ContractList defaultFilter={ContractFilter.Active} />
}
import { ContractList } from "@/components/contract-list"
import { ContractFilter } from "@/lib/sol/contracts"

export function ActiveContracts() {
  return <ContractList defaultFilter={ContractFilter.Confirmed} showFilter={false} />
}
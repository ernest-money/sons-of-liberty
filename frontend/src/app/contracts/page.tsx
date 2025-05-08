import { ContractList } from "@/components/contract-list"
import { ContractFilter } from "@/types/sol"

export function Contracts() {
  return <ContractList defaultFilter={ContractFilter.All} />
}
import { contractRoute } from "@/router"
import { useParams } from "@tanstack/react-router"

export function ContractPage() {
  const { contractId } = useParams({ from: contractRoute.id })
  return <div>Contract {contractId}</div>
}
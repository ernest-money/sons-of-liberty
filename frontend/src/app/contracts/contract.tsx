import { contractRoute } from "@/router"
import { useParams } from "@tanstack/react-router"
import { useEffect, useState } from "react"
import { useSol } from "@/hooks"
import { Contract } from "@/types"
import { Skeleton } from "@/components/ui/skeleton"
import { ContractDetails } from "@/components/contract-details"

export function ContractPage() {
  const { contractId } = useParams({ from: contractRoute.id })
  const [contract, setContract] = useState<Contract | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const client = useSol()

  useEffect(() => {
    const fetchContract = async () => {
      try {
        const data = await client.getContract(contractId)
        setContract(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch contract')
      } finally {
        setLoading(false)
      }
    }

    fetchContract()
  }, [client, contractId])

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-[200px]" />
        <Skeleton className="h-4 w-[300px]" />
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-[200px]" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="rounded-lg bg-destructive/15 p-4 text-destructive">
          {error}
        </div>
      </div>
    )
  }

  if (!contract) {
    return (
      <div className="p-6">
        <div className="rounded-lg bg-muted p-4">
          Contract not found
        </div>
      </div>
    )
  }

  return (
    <ContractDetails
      contract={contract}
      title="Contract Details"
      description="View and manage your DLC contract"
    />
  )
}
import { Contract } from "@/types"

export const ContractModal = ({ contract }: { contract: Contract }) => {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Contract Details</h2>
      <div className="grid gap-2">
        <div>
          <label className="font-semibold">Contract ID:</label>
          <p className="break-all">{contract.contract_id}</p>
        </div>
        <div>
          <label className="font-semibold">State:</label>
          <p>{contract.state}</p>
        </div>
        <div>
          <label className="font-semibold">Counterparty:</label>
          <p className="break-all">{contract.counterparty}</p>
        </div>
        <div>
          <label className="font-semibold">Collateral:</label>
          <p>{contract.collateral}</p>
        </div>
        <div>
          <label className="font-semibold">Amount:</label>
          <p>{contract.is_offer_party ? contract.offer_amount || '-' : contract.accept_amount || '-'}</p>
        </div>
        <div>
          <label className="font-semibold">PnL:</label>
          <p>{contract.pnl !== undefined ? contract.pnl : '-'}</p>
        </div>
      </div>
    </div>
  )
} 
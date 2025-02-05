import { Offer } from "@/types"

export const OfferModal = ({ offer }: { offer: Offer }) => {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Offer Details</h2>
      <div className="grid gap-2">
        <div>
          <label className="font-semibold">Contract ID:</label>
          <p className="break-all">{offer.contract_id}</p>
        </div>
        <div>
          <label className="font-semibold">State:</label>
          <p>{offer.state}</p>
        </div>
        <div>
          <label className="font-semibold">Counter Party:</label>
          <p className="break-all">{offer.counter_party}</p>
        </div>
        <div>
          <label className="font-semibold">Collateral:</label>
          <p>{offer.collateral}</p>
        </div>
        <div>
          <label className="font-semibold">Offer Amount:</label>
          <p>{offer.offer_amount}</p>
        </div>
        <div>
          <label className="font-semibold">Role:</label>
          <p>{offer.is_offer_party ? 'Offering' : 'Accepting'}</p>
        </div>
      </div>
    </div>
  )
} 
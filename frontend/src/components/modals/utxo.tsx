import { LocalOutput } from "@/types/sol"

export const UtxoModal = ({ utxo }: { utxo: LocalOutput }) => {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">UTXO Details</h2>
      <div className="grid gap-2">
        <div>
          <label className="font-semibold">Transaction ID:</label>
          <p className="break-all">{utxo.outpoint.split(':')[0]}</p>
        </div>
        <div>
          <label className="font-semibold">Output Index:</label>
          <p>{utxo.outpoint.split(':')[1]}</p>
        </div>
        <div>
          <label className="font-semibold">Keychain:</label>
          <p>{utxo.keychain}</p>
        </div>
        <div>
          <label className="font-semibold">Status:</label>
          <p>{utxo.is_spent ? 'Spent' : 'Unspent'}</p>
        </div>
        <div>
          <label className="font-semibold">Derivation Index:</label>
          <p>{utxo.derivation_index}</p>
        </div>
      </div>
    </div>
  )
} 
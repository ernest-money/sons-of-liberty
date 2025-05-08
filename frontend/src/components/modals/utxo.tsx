import { LocalOutput } from "@/types/sol"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { formatAmount } from "@/lib/utils"

export const UtxoModal = ({ utxo }: { utxo: LocalOutput }) => {
  // Split transaction ID and output index
  const txId = utxo.outpoint.split(':')[0]
  const outputIndex = utxo.outpoint.split(':')[1]

  return (
    <ScrollArea className="h-full max-h-[80vh]">
      <Card className="border-0 shadow-none">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">UTXO Details</CardTitle>
          <CardDescription>
            Information about this Unspent Transaction Output
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Transaction ID</p>
            <p className="font-medium break-all">{txId}</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Output Index</p>
              <p className="font-medium">{outputIndex}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Status</p>
              <Badge variant={utxo.is_spent ? "destructive" : "green"}>
                {utxo.is_spent ? 'Spent' : 'Unspent'}
              </Badge>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Keychain</p>
              <p className="font-medium">{utxo.keychain}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Derivation Index</p>
              <p className="font-medium">{utxo.derivation_index}</p>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Output Details</p>
            <Card>
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div>
                    <p className="text-sm font-medium">Value</p>
                    <p className="font-medium">{formatAmount(utxo.txout.value)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Script Pubkey</p>
                    <p className="text-sm text-muted-foreground break-all">{utxo.txout.script_pubkey}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {utxo.chain_position && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Chain Position</p>
              <Card>
                <CardContent className="p-4">
                  {Object.entries(utxo.chain_position).map(([position, data]) => (
                    <div key={position} className="space-y-2">
                      <p className="font-medium">{position}</p>
                      {data.anchor && (
                        <div>
                          <p className="text-sm">Block Height: {data.anchor.block_id.height}</p>
                          <p className="text-sm break-all">Block Hash: {data.anchor.block_id.hash}</p>
                          <p className="text-sm">Confirmation Time: {new Date(data.anchor.confirmation_time * 1000).toLocaleString()}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>
    </ScrollArea>
  )
} 
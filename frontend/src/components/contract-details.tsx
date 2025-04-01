import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ContractStateBadge } from "@/components/contract-state-badge"
import { Contract } from "@/types"

function formatSats(sats: number): string {
  return sats.toLocaleString() + " sats";
}

interface ContractDetailsProps {
  contract: Contract;
  title: string;
  description: string;
}

export function ContractDetails({ contract, title, description }: ContractDetailsProps) {
  return (
    <ScrollArea className="h-full">
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold">{title}</h1>
          {contract && <ContractStateBadge state={contract.state} />}
          <p className="text-muted-foreground">{description}</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Contract identification and status</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Contract ID</p>
                <p className="font-mono text-sm break-all">{contract.id}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">State</p>
                <ContractStateBadge state={contract.state} />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Role</p>
                <p className="font-medium">{contract.is_offer_party ? 'Offer Party' : 'Accept Party'}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Counterparty</CardTitle>
              <CardDescription>Details about the other party in the contract</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Public Key</p>
                <p className="font-mono text-sm break-all">{contract.counter_party}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Collateral Details</CardTitle>
              <CardDescription>Contract collateral information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Total Collateral</p>
                <p className="font-medium">{formatSats(contract.total_collateral)}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Your Collateral</p>
                <p className="font-medium">
                  {formatSats(contract.is_offer_party ? contract.offer_collateral : contract.accept_collateral)}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Counterparty Collateral</p>
                <p className="font-medium">
                  {formatSats(contract.is_offer_party ? contract.accept_collateral : contract.offer_collateral)}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contract Parameters</CardTitle>
              <CardDescription>Technical details and timelocks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Fee Rate</p>
                <p className="font-medium">{contract.fee_rate_per_vb} sats/vB</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">CET Locktime</p>
                <p className="font-medium">
                  {new Date(contract.cet_locktime * 1000).toLocaleString()}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Refund Locktime</p>
                <p className="font-medium">
                  {new Date(contract.refund_locktime * 1000).toLocaleString()}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Profit/Loss</CardTitle>
            <CardDescription>Current contract PnL</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Current PnL</p>
              <p className={`font-medium ${contract.pnl !== null ? (contract.pnl >= 0 ? 'text-green-500' : 'text-red-500') : ''}`}>
                {contract.pnl !== null ? formatSats(contract.pnl) : 'Not available'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </ScrollArea>
  )
} 
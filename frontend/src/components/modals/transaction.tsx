import { Transaction } from "@/types/sol"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { formatAmount } from "@/lib/utils"

export const TransactionModal = ({ transaction }: { transaction: Transaction }) => {
  return (
    <ScrollArea className="h-full max-h-[80vh]">
      <Card className="border-0 shadow-none">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Transaction Details</CardTitle>
          <CardDescription>
            Information about this Bitcoin transaction
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Version</p>
              <p className="font-medium">{transaction.version}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Lock Time</p>
              <p className="font-medium">{transaction.lock_time}</p>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Inputs</p>
            <Card>
              <CardContent className="p-4">
                <div className="space-y-2">
                  <p className="font-medium">Count: {transaction.input.length}</p>
                  {transaction.input.map((input, index) => (
                    <div key={index} className="border-t pt-2 mt-2 first:border-t-0 first:pt-0 first:mt-0">
                      <p className="text-sm font-medium">Input #{index + 1}</p>
                      <p className="text-sm text-muted-foreground break-all">
                        Previous Output: {input.prvious_output}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Sequence: {input.sequence}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Outputs</p>
            <Card>
              <CardContent className="p-4">
                <div className="space-y-2">
                  <p className="font-medium">Count: {transaction.output.length}</p>
                  {transaction.output.map((output, index) => (
                    <div key={index} className="border-t pt-2 mt-2 first:border-t-0 first:pt-0 first:mt-0">
                      <p className="text-sm font-medium">Output #{index + 1}</p>
                      <p className="text-sm text-muted-foreground">
                        Value: {formatAmount(output.value)}
                      </p>
                      <p className="text-sm text-muted-foreground break-all">
                        Script: {output.script_pubkey}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </ScrollArea>
  )
}
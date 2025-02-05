import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TransactionList } from "./TransactionList"
import { UtxoList } from "./UtxoList"
import { useSol } from "@/lib/hooks/useSol"
import { useState } from "react"
import { Copy } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@radix-ui/react-tooltip"
import { useModal } from "@/hooks/use-modal"

export function WalletSection() {
  const [address, setAddress] = useState<string>("")
  const { isOpen, open, close } = useModal()
  const client = useSol()
  const { toast } = useToast()

  const generateNewAddress = async () => {
    try {
      const { address } = await client.getNewAddress()
      setAddress(address)
    } catch (error) {
      console.error('Failed to generate address:', error)
    }
  }

  const copyAddress = () => {
    navigator.clipboard.writeText(address)
    toast({
      title: "Address copied",
      description: "The address has been copied to your clipboard",
    })
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className='text-4xl pl-6 pt-6 font-bold'>Wallet</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 p-6">
        <Card>
          <CardHeader>
            <CardTitle>Wallet Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0.00 BTC</div>
          </CardContent>
        </Card>

        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Receive Address</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-4">
            <div className="flex-1 font-mono">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <p className={`max-w-[200px] truncate`}>
                      {address || "No address"}
                    </p>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="p-1 rounded-md border bg-white text-black">{address}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={copyAddress}
                disabled={!address}
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button onClick={generateNewAddress}>
                Generate New Address
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Wallet Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="transactions">
            <TabsList>
              <TabsTrigger value="transactions">Transactions</TabsTrigger>
              <TabsTrigger value="utxos">UTXOs</TabsTrigger>
            </TabsList>
            <TabsContent value="transactions">
              <TransactionList />
            </TabsContent>
            <TabsContent value="utxos">
              <UtxoList />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
} 
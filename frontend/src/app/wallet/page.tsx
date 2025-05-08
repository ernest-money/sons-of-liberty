import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TransactionList } from "../../components/transaction-list"
import { UtxoList } from "../../components/utxo-list"
import { useSol, useToast } from "@/hooks"
import { useEffect, useState } from "react"
import { Copy } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@radix-ui/react-tooltip"
import { SolBalance, defaultBalance } from "@/types/sol"
import { BalanceCard } from "../../components/balance-card"

export function WalletSection() {
  const [balance, setBalance] = useState<SolBalance>(defaultBalance)
  const { getBalance } = useSol()

  useEffect(() => {
    const fetchBalance = async () => {
      const balance = await getBalance()
      setBalance(balance)
    }
    fetchBalance()
  }, [])

  return (
    <div className="flex flex-col gap-6">
      <h1 className='text-4xl pt-6 font-bold'>Wallet</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <BalanceCard title="Wallet Balance" amount={balance.confirmed} percentage={10} />
        <GenerateAddressCard />
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

function GenerateAddressCard() {
  const [address, setAddress] = useState<string>("")
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
  )
}
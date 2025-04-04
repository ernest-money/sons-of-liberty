import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Link } from "@tanstack/react-router"
import { ChartColumnStacked, ChartLine, ChartScatter } from "lucide-react"

interface ContractType {
  type: string
  title: string
  description: string
  chart: React.ReactNode
}

const contractTypes: ContractType[] = [
  {
    type: "parlay",
    title: "Continuous Parlay",
    description: "Build a contract composing multiple data points",
    chart: <ChartScatter width={50} height={50} />
  },
  {
    type: "price-feed",
    title: "Price Feed Contract",
    description: "Create a contract based on the future Bitcoin price",
    chart: <ChartLine width={50} height={50} />
  },
  {
    type: "enumeration",
    title: "Enumeration Contract",
    description: "Create a contract with a fixed set of outcomes",
    chart: <ChartColumnStacked width={50} height={50} />
  }
]

export function CreateContract() {
  return (
    <div className="container mx-auto py-8 px-6">
      <h1 className="text-3xl font-bold mb-8">Create New Contract</h1>
      <div className="flex flex-col gap-6">
        {contractTypes.map((contract) => (
          <Link key={contract.type} to="/create/$contractType" params={{ contractType: contract.type }}>
            <Card className="w-full hover:bg-accent/50 transition-colors cursor-pointer flex flex-row gap-4 justify-between items-center">
              <CardHeader>
                <div>
                  <CardTitle className="text-2xl font-bold">{contract.title}</CardTitle>
                  <CardDescription>{contract.description}</CardDescription>
                </div>
              </CardHeader>
              <div className="pr-12">
                {contract.chart}
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
